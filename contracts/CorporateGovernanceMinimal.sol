// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CorporateGovernanceMinimal
 * @dev 企业股东投票系统 - 最小化版本确保编译成功
 */
contract CorporateGovernanceMinimal is Ownable {
    
    enum ProposalType { BOARD_ELECTION, BUDGET_APPROVAL, MERGER_DECISION, DIVIDEND_DISTRIBUTION, BYLAW_AMENDMENT, STRATEGIC_DECISION }
    enum VoteChoice { ABSTAIN, FOR, AGAINST }
    
    struct Shareholder {
        bool isRegistered;
        uint32 shares;
        string companyId;
        string name;
    }
    
    struct Proposal {
        uint256 id;
        ProposalType proposalType;
        string title;
        address proposer;
        uint256 deadline;
        bool isActive;
        bool isFinalized;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 requiredThreshold;
    }
    
    // Basic company info
    string public companyName;
    string public stockSymbol;
    uint256 public totalShares;
    uint256 public totalShareholders;
    bool public isInitialized;
    
    // Mappings
    mapping(address => Shareholder) public shareholders;
    mapping(address => bool) public boardMembers;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(ProposalType => uint256) public thresholds;
    
    // Arrays
    Proposal[] public proposals;
    address[] public shareholdersList;
    address[] public boardMembersList;
    
    // Events
    event CompanyInitialized(string name, string symbol);
    event ShareholderRegistered(address indexed shareholder, uint32 shares);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, VoteChoice choice);
    event ProposalFinalized(uint256 indexed proposalId, bool passed);
    
    modifier onlyBoardMember() {
        require(boardMembers[msg.sender], "Only board members");
        _;
    }
    
    modifier onlyVerifiedShareholder() {
        require(shareholders[msg.sender].isRegistered, "Only verified shareholders");
        _;
    }
    
    modifier validProposal(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposals.length, "Invalid proposal");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        thresholds[ProposalType.BOARD_ELECTION] = 50;
        thresholds[ProposalType.BUDGET_APPROVAL] = 60;
        thresholds[ProposalType.MERGER_DECISION] = 75;
        thresholds[ProposalType.DIVIDEND_DISTRIBUTION] = 50;
        thresholds[ProposalType.BYLAW_AMENDMENT] = 75;
        thresholds[ProposalType.STRATEGIC_DECISION] = 60;
        
        boardMembers[msg.sender] = true;
        boardMembersList.push(msg.sender);
    }
    
    function initializeCompany(
        string memory _name,
        string memory _symbol,
        string memory _regNumber,
        uint256 _totalShares
    ) external onlyOwner {
        require(!isInitialized, "Already initialized");
        companyName = _name;
        stockSymbol = _symbol;
        totalShares = _totalShares;
        isInitialized = true;
        emit CompanyInitialized(_name, _symbol);
    }
    
    function registerShareholderPlain(
        address _shareholder,
        uint32 _shares,
        string memory _companyId,
        string memory _name
    ) external onlyBoardMember {
        require(!shareholders[_shareholder].isRegistered, "Already registered");
        
        shareholders[_shareholder] = Shareholder(true, _shares, _companyId, _name);
        shareholdersList.push(_shareholder);
        totalShareholders++;
        
        emit ShareholderRegistered(_shareholder, _shares);
    }
    
    function addBoardMember(address _member) external onlyOwner {
        require(!boardMembers[_member], "Already board member");
        boardMembers[_member] = true;
        boardMembersList.push(_member);
    }
    
    function removeBoardMember(address _member) external onlyOwner {
        require(boardMembers[_member] && _member != owner(), "Cannot remove");
        boardMembers[_member] = false;
    }
    
    function createProposal(
        uint8 _type,
        string memory _title,
        string memory _description,
        string memory _attachmentHash,
        uint256 _durationDays
    ) external onlyBoardMember returns (uint256) {
        require(_type <= 5 && bytes(_title).length > 0, "Invalid input");
        
        uint256 proposalId = proposals.length + 1;
        ProposalType pType = ProposalType(_type);
        
        proposals.push(Proposal({
            id: proposalId,
            proposalType: pType,
            title: _title,
            proposer: msg.sender,
            deadline: block.timestamp + (_durationDays * 1 days),
            isActive: true,
            isFinalized: false,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            requiredThreshold: thresholds[pType]
        }));
        
        emit ProposalCreated(proposalId, msg.sender);
        return proposalId;
    }
    
    function castVotePlain(uint256 _proposalId, uint8 _choice) 
        external 
        validProposal(_proposalId) 
        onlyVerifiedShareholder 
    {
        require(_choice <= 2, "Invalid choice");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(proposals[_proposalId - 1].isActive, "Not active");
        require(block.timestamp <= proposals[_proposalId - 1].deadline, "Ended");
        
        hasVoted[_proposalId][msg.sender] = true;
        VoteChoice choice = VoteChoice(_choice);
        Proposal storage proposal = proposals[_proposalId - 1];
        uint32 voterShares = shareholders[msg.sender].shares;
        
        if (choice == VoteChoice.FOR) {
            proposal.forVotes += voterShares;
        } else if (choice == VoteChoice.AGAINST) {
            proposal.againstVotes += voterShares;
        } else {
            proposal.abstainVotes += voterShares;
        }
        
        emit VoteCast(_proposalId, msg.sender, choice);
    }
    
    function finalizeProposal(uint256 _proposalId) external validProposal(_proposalId) onlyBoardMember {
        Proposal storage proposal = proposals[_proposalId - 1];
        require(proposal.isActive && block.timestamp > proposal.deadline, "Cannot finalize");
        
        proposal.isActive = false;
        proposal.isFinalized = true;
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        bool passed = totalVotes > 0 && (proposal.forVotes * 100 / totalVotes) > proposal.requiredThreshold;
        
        emit ProposalFinalized(_proposalId, passed);
    }
    
    function getDecryptedResults(uint256 _proposalId) 
        external 
        view 
        validProposal(_proposalId)
        onlyBoardMember
        returns (uint32, uint32, uint32, bool) 
    {
        Proposal storage proposal = proposals[_proposalId - 1];
        require(proposal.isFinalized, "Not finalized");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        bool passed = totalVotes > 0 && (proposal.forVotes * 100 / totalVotes) > proposal.requiredThreshold;
        
        return (uint32(proposal.forVotes), uint32(proposal.againstVotes), uint32(proposal.abstainVotes), passed);
    }
    
    // Simple getters
    function getProposalInfo(uint256 _proposalId) external view validProposal(_proposalId) returns (
        uint256, uint8, string memory, string memory, address, uint256, uint256, bool, bool, uint256, uint256
    ) {
        Proposal storage p = proposals[_proposalId - 1];
        return (p.id, uint8(p.proposalType), p.title, "", p.proposer, 0, p.deadline, p.isActive, p.isFinalized, 0, p.requiredThreshold);
    }
    
    function hasVotedOn(uint256 _proposalId, address _voter) external view returns (bool) {
        return hasVoted[_proposalId][_voter];
    }
    
    function getTotalProposals() external view returns (uint256) {
        return proposals.length;
    }
    
    function isBoardMember(address _member) external view returns (bool) {
        return boardMembers[_member];
    }
    
    function getCompanyInfo() external view returns (string memory, string memory, string memory, uint256, uint256, address[] memory) {
        return (companyName, stockSymbol, "", totalShares, totalShareholders, boardMembersList);
    }
    
    function getShareholderInfo(address _shareholder) external view returns (bool, uint32, string memory, string memory, bool) {
        Shareholder storage sh = shareholders[_shareholder];
        return (sh.isRegistered, sh.shares, sh.companyId, sh.name, true);
    }
}