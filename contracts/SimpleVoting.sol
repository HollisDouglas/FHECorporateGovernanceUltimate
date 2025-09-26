// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleVoting {
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
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => bool) public authorized;
    
    uint256 public proposalCount;
    address public owner;
    
    event ProposalCreated(uint256 indexed proposalId, string title, address proposer);
    event VoteCast(uint256 indexed proposalId, address voter, uint8 choice);
    
    constructor() {
        owner = msg.sender;
        authorized[msg.sender] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorized[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    function authorize(address user) external onlyOwner {
        authorized[user] = true;
    }
    
    function createProposal(string memory _title, string memory _description, uint256 _durationDays) external onlyAuthorized returns (uint256) {
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
            proposer: msg.sender
        });
        emit ProposalCreated(proposalCount, _title, msg.sender);
        return proposalCount;
    }
    
    function vote(uint256 _proposalId, uint8 _choice) external {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(proposals[_proposalId].active, "Proposal not active");
        require(block.timestamp < proposals[_proposalId].deadline, "Voting ended");
        require(_choice <= 2, "Invalid choice"); // 0=abstain, 1=for, 2=against
        
        hasVoted[_proposalId][msg.sender] = true;
        
        if (_choice == 0) {
            proposals[_proposalId].abstainVotes++;
        } else if (_choice == 1) {
            proposals[_proposalId].forVotes++;
        } else {
            proposals[_proposalId].againstVotes++;
        }
        
        emit VoteCast(_proposalId, msg.sender, _choice);
    }
    
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        uint256 deadline,
        bool active,
        address proposer
    ) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal");
        Proposal memory p = proposals[_proposalId];
        return (p.id, p.title, p.description, p.forVotes, p.againstVotes, p.abstainVotes, p.deadline, p.active, p.proposer);
    }
    
    function getTotalProposals() external view returns (uint256) {
        return proposalCount;
    }
}