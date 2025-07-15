// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CorporateGovernanceOptimized
 * @dev 企业股东投票系统 - 优化版本解决stack too deep问题
 */
contract CorporateGovernanceOptimized is Ownable {
    
    // 提案类型枚举
    enum ProposalType {
        BOARD_ELECTION,    // 0: 董事会选举
        BUDGET_APPROVAL,   // 1: 预算批准  
        MERGER_DECISION,   // 2: 并购决策
        DIVIDEND_DISTRIBUTION, // 3: 股息分配
        BYLAW_AMENDMENT,   // 4: 章程修改
        STRATEGIC_DECISION // 5: 战略决策
    }
    
    // 投票选择枚举
    enum VoteChoice {
        ABSTAIN,   // 0: 弃权
        FOR,       // 1: 赞成
        AGAINST    // 2: 反对
    }
    
    // 股东信息结构 - 简化版
    struct Shareholder {
        bool isRegistered;
        uint32 shares;
        string companyId;
        string name;
    }
    
    // 提案信息结构 - 拆分为多个更小的结构
    struct ProposalBasic {
        uint256 id;
        ProposalType proposalType;
        address proposer;
        uint256 creationTime;
        uint256 deadline;
        bool isActive;
        bool isFinalized;
    }
    
    struct ProposalContent {
        string title;
        string description;
        string attachmentHash;
    }
    
    struct ProposalVotes {
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 participationCount;
        uint256 requiredThreshold;
    }
    
    // 公司信息
    string public companyName;
    string public stockSymbol;
    string public registrationNumber;
    uint256 public totalShares;
    uint256 public totalShareholders;
    bool public isInitialized;
    
    // 状态变量
    mapping(address => Shareholder) public shareholders;
    mapping(address => bool) public boardMembers;
    address[] public shareholdersList;
    address[] public boardMembersList;
    
    // 提案数据 - 分别存储
    ProposalBasic[] public proposalBasics;
    mapping(uint256 => ProposalContent) public proposalContents;
    mapping(uint256 => ProposalVotes) public proposalVotes;
    
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => VoteChoice)) public votes;
    
    // 提案类型阈值
    mapping(ProposalType => uint256) public thresholds;
    
    // 事件定义
    event CompanyInitialized(string name, string symbol);
    event ShareholderRegistered(address indexed shareholder, string companyId, uint32 shares);
    event BoardMemberAdded(address indexed member);
    event ProposalCreated(uint256 indexed proposalId, ProposalType proposalType, address indexed proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, VoteChoice choice);
    event ProposalFinalized(uint256 indexed proposalId, bool passed);
    
    // 修饰器
    modifier onlyBoardMember() {
        require(boardMembers[msg.sender], "Only board members");
        _;
    }
    
    modifier onlyVerifiedShareholder() {
        require(shareholders[msg.sender].isRegistered, "Only verified shareholders");
        _;
    }
    
    modifier validProposal(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposalBasics.length, "Invalid proposal");
        _;
    }
    
    modifier proposalActive(uint256 _proposalId) {
        ProposalBasic storage basic = proposalBasics[_proposalId - 1];
        require(basic.isActive, "Proposal not active");
        require(block.timestamp <= basic.deadline, "Voting ended");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // 初始化阈值
        thresholds[ProposalType.BOARD_ELECTION] = 50;
        thresholds[ProposalType.BUDGET_APPROVAL] = 60;
        thresholds[ProposalType.MERGER_DECISION] = 75;
        thresholds[ProposalType.DIVIDEND_DISTRIBUTION] = 50;
        thresholds[ProposalType.BYLAW_AMENDMENT] = 75;
        thresholds[ProposalType.STRATEGIC_DECISION] = 60;
        
        boardMembers[msg.sender] = true;
        boardMembersList.push(msg.sender);
    }
    
    /**
     * @dev 初始化公司信息
     */
    function initializeCompany(
        string memory _name,
        string memory _symbol,
        string memory _regNumber,
        uint256 _totalShares
    ) external onlyOwner {
        require(!isInitialized, "Already initialized");
        
        companyName = _name;
        stockSymbol = _symbol;
        registrationNumber = _regNumber;
        totalShares = _totalShares;
        isInitialized = true;
        
        emit CompanyInitialized(_name, _symbol);
    }
    
    /**
     * @dev 注册股东
     */
    function registerShareholderPlain(
        address _shareholder,
        uint32 _shares,
        string memory _companyId,
        string memory _name
    ) external onlyBoardMember {
        require(!shareholders[_shareholder].isRegistered, "Already registered");
        
        shareholders[_shareholder] = Shareholder({
            isRegistered: true,
            shares: _shares,
            companyId: _companyId,
            name: _name
        });
        
        shareholdersList.push(_shareholder);
        totalShareholders++;
        
        emit ShareholderRegistered(_shareholder, _companyId, _shares);
    }
    
    /**
     * @dev 添加董事会成员
     */
    function addBoardMember(address _member) external onlyOwner {
        require(!boardMembers[_member], "Already board member");
        
        boardMembers[_member] = true;
        boardMembersList.push(_member);
        
        emit BoardMemberAdded(_member);
    }
    
    /**
     * @dev 移除董事会成员
     */
    function removeBoardMember(address _member) external onlyOwner {
        require(boardMembers[_member], "Not board member");
        require(_member != owner(), "Cannot remove owner");
        
        boardMembers[_member] = false;
        
        for (uint i = 0; i < boardMembersList.length; i++) {
            if (boardMembersList[i] == _member) {
                boardMembersList[i] = boardMembersList[boardMembersList.length - 1];
                boardMembersList.pop();
                break;
            }
        }
    }
    
    /**
     * @dev 创建提案 - 简化版
     */
    function createProposal(
        uint8 _type,
        string memory _title,
        string memory _description,
        string memory _attachmentHash,
        uint256 _durationDays
    ) external onlyBoardMember returns (uint256) {
        require(_type <= 5, "Invalid type");
        require(bytes(_title).length > 0, "Empty title");
        
        uint256 proposalId = proposalBasics.length + 1;
        ProposalType pType = ProposalType(_type);
        
        // 分别存储数据以避免stack too deep
        proposalBasics.push(ProposalBasic({
            id: proposalId,
            proposalType: pType,
            proposer: msg.sender,
            creationTime: block.timestamp,
            deadline: block.timestamp + (_durationDays * 1 days),
            isActive: true,
            isFinalized: false
        }));
        
        proposalContents[proposalId] = ProposalContent({
            title: _title,
            description: _description,
            attachmentHash: _attachmentHash
        });
        
        proposalVotes[proposalId] = ProposalVotes({
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            participationCount: 0,
            requiredThreshold: thresholds[pType]
        });
        
        emit ProposalCreated(proposalId, pType, msg.sender);
        return proposalId;
    }
    
    /**
     * @dev 投票
     */
    function castVotePlain(uint256 _proposalId, uint8 _choice) 
        external 
        validProposal(_proposalId) 
        proposalActive(_proposalId)
        onlyVerifiedShareholder 
    {
        require(_choice <= 2, "Invalid choice");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        
        VoteChoice choice = VoteChoice(_choice);
        hasVoted[_proposalId][msg.sender] = true;
        votes[_proposalId][msg.sender] = choice;
        
        ProposalVotes storage pVotes = proposalVotes[_proposalId];
        uint32 voterShares = shareholders[msg.sender].shares;
        
        if (choice == VoteChoice.FOR) {
            pVotes.forVotes += voterShares;
        } else if (choice == VoteChoice.AGAINST) {
            pVotes.againstVotes += voterShares;
        } else {
            pVotes.abstainVotes += voterShares;
        }
        
        pVotes.participationCount++;
        
        emit VoteCast(_proposalId, msg.sender, choice);
    }
    
    /**
     * @dev 结束提案
     */
    function finalizeProposal(uint256 _proposalId) 
        external 
        validProposal(_proposalId)
        onlyBoardMember 
    {
        ProposalBasic storage basic = proposalBasics[_proposalId - 1];
        require(basic.isActive, "Already finalized");
        require(block.timestamp > basic.deadline, "Not ended");
        
        basic.isActive = false;
        basic.isFinalized = true;
        
        ProposalVotes storage pVotes = proposalVotes[_proposalId];
        uint256 totalVotes = pVotes.forVotes + pVotes.againstVotes;
        bool passed = false;
        
        if (totalVotes > 0) {
            passed = (pVotes.forVotes * 100 / totalVotes) > pVotes.requiredThreshold;
        }
        
        emit ProposalFinalized(_proposalId, passed);
    }
    
    /**
     * @dev 获取投票结果 - 简化版
     */
    function getDecryptedResults(uint256 _proposalId) 
        external 
        view 
        validProposal(_proposalId)
        onlyBoardMember
        returns (uint32, uint32, uint32, bool) 
    {
        require(proposalBasics[_proposalId - 1].isFinalized, "Not finalized");
        
        ProposalVotes storage pVotes = proposalVotes[_proposalId];
        uint256 totalVotes = pVotes.forVotes + pVotes.againstVotes;
        bool passed = false;
        
        if (totalVotes > 0) {
            passed = (pVotes.forVotes * 100 / totalVotes) > pVotes.requiredThreshold;
        }
        
        return (
            uint32(pVotes.forVotes),
            uint32(pVotes.againstVotes),
            uint32(pVotes.abstainVotes),
            passed
        );
    }
    
    // 简化的查询函数
    function getProposalBasic(uint256 _proposalId) external view validProposal(_proposalId) returns (
        uint256, uint8, address, uint256, uint256, bool, bool
    ) {
        ProposalBasic storage basic = proposalBasics[_proposalId - 1];
        return (
            basic.id,
            uint8(basic.proposalType),
            basic.proposer,
            basic.creationTime,
            basic.deadline,
            basic.isActive,
            basic.isFinalized
        );
    }
    
    function getProposalContent(uint256 _proposalId) external view validProposal(_proposalId) returns (
        string memory, string memory, string memory
    ) {
        ProposalContent storage content = proposalContents[_proposalId];
        return (content.title, content.description, content.attachmentHash);
    }
    
    function getProposalVotes(uint256 _proposalId) external view validProposal(_proposalId) returns (
        uint256, uint256, uint256, uint256, uint256
    ) {
        ProposalVotes storage pVotes = proposalVotes[_proposalId];
        return (
            pVotes.forVotes,
            pVotes.againstVotes,
            pVotes.abstainVotes,
            pVotes.participationCount,
            pVotes.requiredThreshold
        );
    }
    
    // 组合查询函数（用于前端）
    function getProposalInfo(uint256 _proposalId) external view validProposal(_proposalId) returns (
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
    ) {
        ProposalBasic storage basic = proposalBasics[_proposalId - 1];
        ProposalContent storage content = proposalContents[_proposalId];
        ProposalVotes storage pVotes = proposalVotes[_proposalId];
        
        return (
            basic.id,
            uint8(basic.proposalType),
            content.title,
            content.description,
            basic.proposer,
            basic.creationTime,
            basic.deadline,
            basic.isActive,
            basic.isFinalized,
            pVotes.participationCount,
            pVotes.requiredThreshold
        );
    }
    
    function hasVotedOn(uint256 _proposalId, address _voter) external view validProposal(_proposalId) returns (bool) {
        return hasVoted[_proposalId][_voter];
    }
    
    function getTotalProposals() external view returns (uint256) {
        return proposalBasics.length;
    }
    
    function isBoardMember(address _member) external view returns (bool) {
        return boardMembers[_member];
    }
    
    function getCompanyInfo() external view returns (
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        address[] memory
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
    
    function getShareholderInfo(address _shareholder) external view returns (
        bool,
        uint32,
        string memory,
        string memory
    ) {
        Shareholder storage sh = shareholders[_shareholder];
        return (
            sh.isRegistered,
            sh.shares,
            sh.companyId,
            sh.name
        );
    }
}