// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CorporateGovernanceFinal
 * @dev 企业股东投票系统 - 最终稳定版本
 * @notice 机密股东投票 - 企业决策隐私投票系统
 */
contract CorporateGovernanceFinal is Ownable {
    
    enum ProposalType { 
        BOARD_ELECTION,        // 0: 董事会选举 (>50%)
        BUDGET_APPROVAL,       // 1: 预算批准 (>60%)  
        MERGER_DECISION,       // 2: 并购决策 (>75%)
        DIVIDEND_DISTRIBUTION, // 3: 股息分配 (>50%)
        BYLAW_AMENDMENT,       // 4: 章程修改 (>75%)
        STRATEGIC_DECISION     // 5: 战略决策 (>60%)
    }
    
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
        string description;
        address proposer;
        uint256 creationTime;
        uint256 deadline;
        bool isActive;
        bool isFinalized;
        uint32 forVotes;
        uint32 againstVotes;
        uint32 abstainVotes;
        uint32 requiredThreshold;
        uint32 participationCount;
    }
    
    // Company information
    string public companyName;
    string public stockSymbol;
    string public registrationNumber;
    uint256 public totalShares;
    uint256 public totalShareholders;
    bool public isInitialized;
    
    // State mappings
    mapping(address => Shareholder) public shareholders;
    mapping(address => bool) public boardMembers;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(ProposalType => uint256) public thresholds;
    
    // Arrays
    Proposal[] public proposals;
    address[] public shareholdersList;
    address[] public boardMembersList;
    
    // Events
    event CompanyInitialized(string name, string symbol, string regNumber);
    event ShareholderRegistered(address indexed shareholder, string companyId, string name);
    event BoardMemberAdded(address indexed member);
    event BoardMemberRemoved(address indexed member);
    event ProposalCreated(uint256 indexed proposalId, ProposalType proposalType, string title, address indexed proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
    event ProposalFinalized(uint256 indexed proposalId, bool passed, uint256 forVotes, uint256 againstVotes);
    
    // Modifiers
    modifier onlyBoardMember() {
        require(boardMembers[msg.sender], "Only board members can perform this action");
        _;
    }
    
    modifier onlyVerifiedShareholder() {
        require(shareholders[msg.sender].isRegistered, "Only verified shareholders can vote");
        _;
    }
    
    modifier validProposal(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposals.length, "Invalid proposal ID");
        _;
    }
    
    modifier proposalActive(uint256 _proposalId) {
        require(proposals[_proposalId - 1].isActive, "Proposal is not active");
        require(block.timestamp <= proposals[_proposalId - 1].deadline, "Voting period has ended");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Initialize thresholds for different proposal types
        thresholds[ProposalType.BOARD_ELECTION] = 50;
        thresholds[ProposalType.BUDGET_APPROVAL] = 60;
        thresholds[ProposalType.MERGER_DECISION] = 75;
        thresholds[ProposalType.DIVIDEND_DISTRIBUTION] = 50;
        thresholds[ProposalType.BYLAW_AMENDMENT] = 75;
        thresholds[ProposalType.STRATEGIC_DECISION] = 60;
        
        // Contract deployer becomes board member
        boardMembers[msg.sender] = true;
        boardMembersList.push(msg.sender);
    }
    
    /**
     * @dev Initialize company information (one-time only)
     */
    function initializeCompany(
        string memory _name,
        string memory _stockSymbol,
        string memory _registrationNumber,
        uint256 _totalShares
    ) external onlyOwner {
        require(!isInitialized, "Company already initialized");
        require(_totalShares > 0, "Total shares must be greater than 0");
        
        companyName = _name;
        stockSymbol = _stockSymbol;
        registrationNumber = _registrationNumber;
        totalShares = _totalShares;
        isInitialized = true;
        
        emit CompanyInitialized(_name, _stockSymbol, _registrationNumber);
    }
    
    /**
     * @dev Register new shareholder
     */
    function registerShareholderPlain(
        address _shareholder,
        uint32 _shares,
        string memory _companyId,
        string memory _name
    ) external onlyBoardMember {
        require(_shareholder != address(0), "Invalid shareholder address");
        require(_shares > 0, "Shares must be greater than 0");
        require(!shareholders[_shareholder].isRegistered, "Shareholder already registered");
        
        shareholders[_shareholder] = Shareholder({
            isRegistered: true,
            shares: _shares,
            companyId: _companyId,
            name: _name
        });
        
        shareholdersList.push(_shareholder);
        totalShareholders++;
        
        emit ShareholderRegistered(_shareholder, _companyId, _name);
    }
    
    /**
     * @dev Add board member
     */
    function addBoardMember(address _member) external onlyOwner {
        require(_member != address(0), "Invalid member address");
        require(!boardMembers[_member], "Already a board member");
        
        boardMembers[_member] = true;
        boardMembersList.push(_member);
        
        emit BoardMemberAdded(_member);
    }
    
    /**
     * @dev Remove board member
     */
    function removeBoardMember(address _member) external onlyOwner {
        require(boardMembers[_member], "Not a board member");
        require(_member != owner(), "Cannot remove contract owner");
        
        boardMembers[_member] = false;
        
        // Remove from array
        for (uint i = 0; i < boardMembersList.length; i++) {
            if (boardMembersList[i] == _member) {
                boardMembersList[i] = boardMembersList[boardMembersList.length - 1];
                boardMembersList.pop();
                break;
            }
        }
        
        emit BoardMemberRemoved(_member);
    }
    
    /**
     * @dev Create new proposal
     */
    function createProposal(
        uint8 _type,
        string memory _title,
        string memory _description,
        string memory _attachmentHash,
        uint256 _durationDays
    ) external onlyBoardMember returns (uint256) {
        require(_type <= uint8(ProposalType.STRATEGIC_DECISION), "Invalid proposal type");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_durationDays > 0 && _durationDays <= 365, "Invalid duration");
        
        ProposalType proposalType = ProposalType(_type);
        uint256 proposalId = proposals.length + 1;
        
        proposals.push(Proposal({
            id: proposalId,
            proposalType: proposalType,
            title: _title,
            description: _description,
            proposer: msg.sender,
            creationTime: block.timestamp,
            deadline: block.timestamp + (_durationDays * 1 days),
            isActive: true,
            isFinalized: false,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            requiredThreshold: uint32(thresholds[proposalType]),
            participationCount: 0
        }));
        
        emit ProposalCreated(proposalId, proposalType, _title, msg.sender);
        return proposalId;
    }
    
    /**
     * @dev Cast vote (plain version)
     */
    function castVotePlain(uint256 _proposalId, uint8 _choice) 
        external 
        validProposal(_proposalId) 
        proposalActive(_proposalId) 
        onlyVerifiedShareholder 
    {
        require(_choice <= 2, "Invalid vote choice");
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");
        
        hasVoted[_proposalId][msg.sender] = true;
        
        Proposal storage proposal = proposals[_proposalId - 1];
        uint32 voterShares = shareholders[msg.sender].shares;
        
        if (_choice == 0) {
            proposal.abstainVotes += voterShares;
        } else if (_choice == 1) {
            proposal.forVotes += voterShares;
        } else {
            proposal.againstVotes += voterShares;
        }
        
        proposal.participationCount++;
        
        emit VoteCast(_proposalId, msg.sender);
    }
    
    /**
     * @dev Cast confidential vote (FHE ready placeholder)
     */
    function castConfidentialVote(uint256 _proposalId, uint8 _encryptedChoice) 
        external 
        validProposal(_proposalId) 
        proposalActive(_proposalId) 
        onlyVerifiedShareholder 
    {
        require(_encryptedChoice <= 2, "Invalid vote choice");
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");
        
        hasVoted[_proposalId][msg.sender] = true;
        
        Proposal storage proposal = proposals[_proposalId - 1];
        uint32 voterShares = shareholders[msg.sender].shares;
        
        // Currently using plain logic - will be upgraded to FHE
        if (_encryptedChoice == 0) {
            proposal.abstainVotes += voterShares;
        } else if (_encryptedChoice == 1) {
            proposal.forVotes += voterShares;
        } else {
            proposal.againstVotes += voterShares;
        }
        
        proposal.participationCount++;
        
        emit VoteCast(_proposalId, msg.sender);
    }
    
    /**
     * @dev Finalize proposal
     */
    function finalizeProposal(uint256 _proposalId) 
        external 
        validProposal(_proposalId) 
        onlyBoardMember 
    {
        Proposal storage proposal = proposals[_proposalId - 1];
        require(proposal.isActive, "Proposal already finalized");
        require(block.timestamp > proposal.deadline, "Voting period not ended");
        
        proposal.isActive = false;
        proposal.isFinalized = true;
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        bool passed = false;
        
        if (totalVotes > 0) {
            uint256 forPercentage = (proposal.forVotes * 100) / totalVotes;
            passed = forPercentage > proposal.requiredThreshold;
        }
        
        emit ProposalFinalized(_proposalId, passed, proposal.forVotes, proposal.againstVotes);
    }
    
    /**
     * @dev Get decrypted results (board members only)
     */
    function getDecryptedResults(uint256 _proposalId) 
        external 
        view 
        validProposal(_proposalId) 
        onlyBoardMember
        returns (uint32, uint32, uint32, bool) 
    {
        Proposal storage proposal = proposals[_proposalId - 1];
        require(proposal.isFinalized, "Proposal not finalized");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        bool passed = false;
        
        if (totalVotes > 0) {
            uint256 forPercentage = (proposal.forVotes * 100) / totalVotes;
            passed = forPercentage > proposal.requiredThreshold;
        }
        
        return (proposal.forVotes, proposal.againstVotes, proposal.abstainVotes, passed);
    }
    
    /**
     * @dev Get proposal information
     */
    function getProposalInfo(uint256 _proposalId) 
        external 
        view 
        validProposal(_proposalId)
        returns (
            uint256 id,
            uint8 proposalType,
            string memory title,
            string memory description,
            address proposer,
            uint256 creationTime,
            uint256 deadline,
            bool isActive,
            bool isFinalized,
            uint256 participationCount,
            uint256 requiredThreshold
        ) 
    {
        Proposal storage p = proposals[_proposalId - 1];
        
        return (
            p.id,
            uint8(p.proposalType),
            p.title,
            p.description,
            p.proposer,
            p.creationTime,
            p.deadline,
            p.isActive,
            p.isFinalized,
            p.participationCount,
            p.requiredThreshold
        );
    }
    
    /**
     * @dev Check if address has voted on proposal
     */
    function hasVotedOn(uint256 _proposalId, address _voter) 
        external 
        view 
        validProposal(_proposalId) 
        returns (bool) 
    {
        return hasVoted[_proposalId][_voter];
    }
    
    /**
     * @dev Get total number of proposals
     */
    function getTotalProposals() external view returns (uint256) {
        return proposals.length;
    }
    
    /**
     * @dev Check if address is board member
     */
    function isBoardMember(address _member) external view returns (bool) {
        return boardMembers[_member];
    }
    
    /**
     * @dev Get company information
     */
    function getCompanyInfo() external view returns (
        string memory name,
        string memory stockSymbol,
        string memory registrationNumber,
        uint256 totalShares,
        uint256 totalShareholders,
        address[] memory boardMembers
    ) {
        return (
            companyName,
            stockSymbol,
            registrationNumber,
            totalShares,
            totalShareholders,
            boardMembersList
        );
    }
    
    /**
     * @dev Get shareholder information
     */
    function getShareholderInfo(address _shareholder) external view returns (
        bool isRegistered,
        uint32 shares,
        string memory companyId,
        string memory name,
        bool isActive
    ) {
        Shareholder storage sh = shareholders[_shareholder];
        return (
            sh.isRegistered,
            sh.shares,
            sh.companyId,
            sh.name,
            sh.isRegistered // isActive = isRegistered for simplicity
        );
    }
}