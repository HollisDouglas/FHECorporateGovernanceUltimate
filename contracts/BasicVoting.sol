// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BasicVoting {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 deadline;
        bool active;
        address proposer;
        bool finalized;
    }

    struct Voter {
        address wallet;
        uint256 weight;
        bool authorized;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => Voter) public voters;
    mapping(address => bool) public isAuthorized;
    
    uint256 public proposalCount;
    address public owner;
    
    event ProposalCreated(uint256 indexed proposalId, string title, address proposer);
    event VoteCast(uint256 indexed proposalId, address voter, uint8 choice);
    event ProposalFinalized(uint256 indexed proposalId);
    event VoterAuthorized(address indexed voter, uint256 weight);
    
    constructor() {
        owner = msg.sender;
        isAuthorized[msg.sender] = true;
        
        voters[msg.sender] = Voter({
            wallet: msg.sender,
            weight: 1,
            authorized: true
        });
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(isAuthorized[msg.sender], "Not authorized");
        _;
    }
    
    modifier validProposal(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        _;
    }

    function authorizeVoter(address _voter, uint256 _weight) external onlyOwner {
        require(_voter != address(0), "Invalid address");
        require(!isAuthorized[_voter], "Already authorized");
        require(_weight > 0, "Weight must be positive");
        
        voters[_voter] = Voter({
            wallet: _voter,
            weight: _weight,
            authorized: true
        });
        
        isAuthorized[_voter] = true;
        emit VoterAuthorized(_voter, _weight);
    }

    function createProposal(
        string memory _title, 
        string memory _description, 
        uint256 _durationDays
    ) external onlyAuthorized returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_durationDays >= 1 && _durationDays <= 30, "Invalid duration");
        
        proposalCount++;
        
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: _title,
            description: _description,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            deadline: block.timestamp + (_durationDays * 1 days),
            active: true,
            proposer: msg.sender,
            finalized: false
        });
        
        emit ProposalCreated(proposalCount, _title, msg.sender);
        return proposalCount;
    }

    function castVote(uint256 _proposalId, uint8 _choice) external validProposal(_proposalId) onlyAuthorized {
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(proposals[_proposalId].active, "Proposal not active");
        require(block.timestamp < proposals[_proposalId].deadline, "Voting ended");
        require(_choice <= 2, "Invalid choice"); // 0=abstain, 1=for, 2=against
        
        uint256 voterWeight = voters[msg.sender].weight;
        
        if (_choice == 0) {
            proposals[_proposalId].abstainVotes += voterWeight;
        } else if (_choice == 1) {
            proposals[_proposalId].forVotes += voterWeight;
        } else {
            proposals[_proposalId].againstVotes += voterWeight;
        }
        
        hasVoted[_proposalId][msg.sender] = true;
        emit VoteCast(_proposalId, msg.sender, _choice);
    }

    function finalizeProposal(uint256 _proposalId) external validProposal(_proposalId) onlyOwner {
        require(proposals[_proposalId].active, "Proposal not active");
        require(block.timestamp >= proposals[_proposalId].deadline, "Voting period not ended");
        require(!proposals[_proposalId].finalized, "Already finalized");
        
        proposals[_proposalId].active = false;
        proposals[_proposalId].finalized = true;
        
        emit ProposalFinalized(_proposalId);
    }

    function getProposal(uint256 _proposalId) external view validProposal(_proposalId) returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        uint256 deadline,
        bool active,
        address proposer,
        bool finalized
    ) {
        Proposal storage p = proposals[_proposalId];
        return (
            p.id,
            p.title,
            p.description,
            p.forVotes,
            p.againstVotes,
            p.abstainVotes,
            p.deadline,
            p.active,
            p.proposer,
            p.finalized
        );
    }

    function hasVotedOn(uint256 _proposalId, address _voter) external view validProposal(_proposalId) returns (bool) {
        return hasVoted[_proposalId][_voter];
    }

    function getTotalProposals() external view returns (uint256) {
        return proposalCount;
    }

    function checkAuthorization(address _voter) external view returns (bool) {
        return isAuthorized[_voter];
    }

    function getVoterWeight(address _voter) external view returns (uint256) {
        return voters[_voter].weight;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}