// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CorporateGovernanceSimple
 * @dev 企业股东投票系统 - 公司治理投票合约 (简化版，可升级为FHE版本)
 * @notice 支持不同类型的公司决策投票，为FHE集成做准备
 */
contract CorporateGovernanceSimple is Ownable {
    
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
    
    // 股东信息结构
    struct Shareholder {
        bool isRegistered;
        uint32 shares;
        string companyId;
        string name;
        bool isActive;
    }
    
    // 提案信息结构
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
        string attachmentHash; // IPFS hash for documents
        
        // 投票统计
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 participationCount;
        uint256 requiredThreshold; // 通过所需的百分比阈值
    }
    
    // 公司信息结构
    struct CompanyInfo {
        string name;
        string stockSymbol;
        string registrationNumber;
        uint256 totalShares;
        uint256 totalShareholders;
        bool isInitialized;
    }
    
    // 状态变量
    CompanyInfo public companyInfo;
    mapping(address => Shareholder) public shareholders;
    mapping(address => bool) public boardMembers;
    address[] public shareholdersList;
    address[] public boardMembersList;
    
    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => VoteChoice)) public votes; // For transparency in simple version
    
    // 不同提案类型的通过阈值 (百分比)
    mapping(ProposalType => uint256) public thresholds;
    
    // 事件定义
    event CompanyInitialized(string name, string symbol, string regNumber, uint256 totalShares);
    event ShareholderRegistered(address indexed shareholder, string companyId, string name, uint32 shares);
    event BoardMemberAdded(address indexed member);
    event BoardMemberRemoved(address indexed member);
    event ProposalCreated(uint256 indexed proposalId, ProposalType proposalType, string title, address indexed proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, VoteChoice choice, uint32 shares);
    event ProposalFinalized(uint256 indexed proposalId, bool passed, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes);
    
    // 修饰器
    modifier onlyBoardMember() {
        require(boardMembers[msg.sender], "Only board members can perform this action");
        _;
    }
    
    modifier onlyVerifiedShareholder() {
        require(shareholders[msg.sender].isRegistered && shareholders[msg.sender].isActive, "Only verified shareholders can vote");
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
        // 初始化默认阈值
        thresholds[ProposalType.BOARD_ELECTION] = 50;    // >50%
        thresholds[ProposalType.BUDGET_APPROVAL] = 60;   // >60%
        thresholds[ProposalType.MERGER_DECISION] = 75;   // >75%
        thresholds[ProposalType.DIVIDEND_DISTRIBUTION] = 50; // >50%
        thresholds[ProposalType.BYLAW_AMENDMENT] = 75;   // >75%
        thresholds[ProposalType.STRATEGIC_DECISION] = 60; // >60%
        
        // 合约部署者自动成为董事会成员
        boardMembers[msg.sender] = true;
        boardMembersList.push(msg.sender);
    }
    
    /**
     * @dev 初始化公司信息 (仅一次)
     */
    function initializeCompany(
        string memory _name,
        string memory _stockSymbol,
        string memory _registrationNumber,
        uint256 _totalShares
    ) external onlyOwner {
        require(!companyInfo.isInitialized, "Company already initialized");
        require(_totalShares > 0, "Total shares must be greater than 0");
        
        companyInfo = CompanyInfo({
            name: _name,
            stockSymbol: _stockSymbol,
            registrationNumber: _registrationNumber,
            totalShares: _totalShares,
            totalShareholders: 0,
            isInitialized: true
        });
        
        emit CompanyInitialized(_name, _stockSymbol, _registrationNumber, _totalShares);
    }
    
    /**
     * @dev 注册新股东 (明文版本)
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
            name: _name,
            isActive: true
        });
        
        shareholdersList.push(_shareholder);
        companyInfo.totalShareholders++;
        
        emit ShareholderRegistered(_shareholder, _companyId, _name, _shares);
    }
    
    /**
     * @dev 添加董事会成员
     */
    function addBoardMember(address _member) external onlyOwner {
        require(_member != address(0), "Invalid member address");
        require(!boardMembers[_member], "Already a board member");
        
        boardMembers[_member] = true;
        boardMembersList.push(_member);
        
        emit BoardMemberAdded(_member);
    }
    
    /**
     * @dev 移除董事会成员
     */
    function removeBoardMember(address _member) external onlyOwner {
        require(boardMembers[_member], "Not a board member");
        require(_member != owner(), "Cannot remove contract owner");
        
        boardMembers[_member] = false;
        
        // 从数组中移除
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
     * @dev 创建新提案
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
        
        ProposalType pType = ProposalType(_type);
        uint256 pId = proposals.length + 1;
        
        proposals.push(Proposal({
            id: pId,
            proposalType: pType,
            title: _title,
            description: _description,
            proposer: msg.sender,
            creationTime: block.timestamp,
            deadline: block.timestamp + (_durationDays * 1 days),
            isActive: true,
            isFinalized: false,
            attachmentHash: _attachmentHash,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            participationCount: 0,
            requiredThreshold: thresholds[pType]
        }));
        
        emit ProposalCreated(pId, pType, _title, msg.sender);
        return pId;
    }
    
    /**
     * @dev 投票 (明文版本)
     */
    function castVotePlain(uint256 _proposalId, uint8 _choice) 
        external 
        validProposal(_proposalId) 
        proposalActive(_proposalId)
        onlyVerifiedShareholder 
    {
        require(_choice <= uint8(VoteChoice.AGAINST), "Invalid vote choice");
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");
        
        VoteChoice choice = VoteChoice(_choice);
        Proposal storage proposal = proposals[_proposalId - 1];
        Shareholder storage voter = shareholders[msg.sender];
        
        // 记录投票
        hasVoted[_proposalId][msg.sender] = true;
        votes[_proposalId][msg.sender] = choice;
        
        // 统计票数 (按股份权重)
        if (choice == VoteChoice.FOR) {
            proposal.forVotes += voter.shares;
        } else if (choice == VoteChoice.AGAINST) {
            proposal.againstVotes += voter.shares;
        } else {
            proposal.abstainVotes += voter.shares;
        }
        
        proposal.participationCount++;
        
        emit VoteCast(_proposalId, msg.sender, choice, voter.shares);
    }
    
    /**
     * @dev 结束提案并统计结果
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
        
        // 计算是否通过
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        bool passed = false;
        
        if (totalVotes > 0) {
            uint256 forPercentage = (proposal.forVotes * 100) / totalVotes;
            passed = forPercentage > proposal.requiredThreshold;
        }
        
        emit ProposalFinalized(_proposalId, passed, proposal.forVotes, proposal.againstVotes, proposal.abstainVotes);
    }
    
    /**
     * @dev 获取提案结果 (仅董事会成员)
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
        
        return (
            uint32(proposal.forVotes),
            uint32(proposal.againstVotes), 
            uint32(proposal.abstainVotes),
            passed
        );
    }
    
    /**
     * @dev 获取提案基本信息
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
     * @dev 检查地址是否投票
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
     * @dev 获取总提案数
     */
    function getTotalProposals() external view returns (uint256) {
        return proposals.length;
    }
    
    /**
     * @dev 检查是否为董事会成员
     */
    function isBoardMember(address _member) external view returns (bool) {
        return boardMembers[_member];
    }
    
    /**
     * @dev 获取公司信息
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
            companyInfo.name,
            companyInfo.stockSymbol,
            companyInfo.registrationNumber,
            companyInfo.totalShares,
            companyInfo.totalShareholders,
            boardMembersList
        );
    }
    
    /**
     * @dev 获取股东信息
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
            sh.isActive
        );
    }
}