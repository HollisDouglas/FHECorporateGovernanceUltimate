// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CorporateGovernanceUltimate
 * @dev 机密股东投票 - 企业决策隐私投票 (终极简化版)
 * @notice 专门解决Stack too deep问题的最简化版本
 */
contract CorporateGovernanceUltimate is Ownable {
    
    // 基础数据类型
    enum ProposalType { BOARD, BUDGET, MERGER, DIVIDEND, BYLAW, STRATEGIC }
    
    struct Shareholder {
        bool active;
        uint32 shares;
        string name;
    }
    
    struct Proposal {
        uint8 pType;
        string title;
        address proposer;
        uint256 deadline;
        bool active;
        uint32 forVotes;
        uint32 againstVotes;
        uint32 threshold;
    }
    
    // 状态变量
    string public companyName;
    uint256 public totalShares;
    bool public initialized;
    
    mapping(address => Shareholder) public shareholders;
    mapping(address => bool) public boardMembers;
    mapping(uint256 => mapping(address => bool)) public voted;
    
    Proposal[] public proposals;
    address[] public boardList;
    
    // 事件
    event CompanyInit(string name);
    event ShareholderAdd(address indexed addr);
    event ProposalAdd(uint256 indexed id);
    event VoteAdd(uint256 indexed id, address indexed voter);
    
    modifier onlyBoard() {
        require(boardMembers[msg.sender], "Board only");
        _;
    }
    
    modifier onlySharehol() {
        require(shareholders[msg.sender].active, "Shareholder only");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        boardMembers[msg.sender] = true;
        boardList.push(msg.sender);
    }
    
    function initCompany(string memory _name, uint256 _shares) external onlyOwner {
        require(!initialized, "Done");
        companyName = _name;
        totalShares = _shares;
        initialized = true;
        emit CompanyInit(_name);
    }
    
    function addBoard(address _member) external onlyOwner {
        boardMembers[_member] = true;
        boardList.push(_member);
    }
    
    function addShareholder(address _addr, uint32 _shares, string memory _name) external onlyBoard {
        shareholders[_addr] = Shareholder(true, _shares, _name);
        emit ShareholderAdd(_addr);
    }
    
    function createProposal(uint8 _type, string memory _title, uint256 _days) external onlyBoard returns (uint256) {
        uint256 id = proposals.length + 1;
        uint32 threshold = _type == 2 ? 75 : (_type == 1 ? 60 : 50); // Simplified thresholds
        
        proposals.push(Proposal({
            pType: _type,
            title: _title,
            proposer: msg.sender,
            deadline: block.timestamp + (_days * 1 days),
            active: true,
            forVotes: 0,
            againstVotes: 0,
            threshold: threshold
        }));
        
        emit ProposalAdd(id);
        return id;
    }
    
    function vote(uint256 _id, uint8 _choice) public onlySharehol {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        require(!voted[_id][msg.sender], "Already voted");
        
        Proposal storage p = proposals[_id - 1];
        require(p.active && block.timestamp <= p.deadline, "Cannot vote");
        
        voted[_id][msg.sender] = true;
        uint32 shares = shareholders[msg.sender].shares;
        
        if (_choice == 1) p.forVotes += shares;
        else if (_choice == 2) p.againstVotes += shares;
        
        emit VoteAdd(_id, msg.sender);
    }
    
    function finalize(uint256 _id) public onlyBoard {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        Proposal storage p = proposals[_id - 1];
        require(p.active && block.timestamp > p.deadline, "Cannot finalize");
        p.active = false;
    }
    
    function getResults(uint256 _id) public view onlyBoard returns (uint32, uint32, bool) {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        Proposal storage p = proposals[_id - 1];
        require(!p.active, "Still active");
        
        uint256 total = p.forVotes + p.againstVotes;
        bool passed = total > 0 && (p.forVotes * 100 / total) > p.threshold;
        
        return (p.forVotes, p.againstVotes, passed);
    }
    
    function voteConfidential(uint256 _id, uint8 _choice) external {
        vote(_id, _choice); // Same as regular vote for now
    }
    
    // 分解的getter函数避免stack issues
    function getProposalBasic(uint256 _id) external view returns (uint8, string memory, address) {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        Proposal storage p = proposals[_id - 1];
        return (p.pType, p.title, p.proposer);
    }
    
    function getProposalStatus(uint256 _id) external view returns (uint256, bool, uint32) {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        Proposal storage p = proposals[_id - 1];
        return (p.deadline, p.active, p.threshold);
    }
    
    // 为前端兼容性保留的复合函数 - 但进一步简化
    function getProposalInfo(uint256 _id) external view returns (
        uint256, uint8, string memory, string memory, address, uint256, uint256, bool, bool, uint256, uint256
    ) {
        require(_id > 0 && _id <= proposals.length, "Invalid ID");
        Proposal storage p = proposals[_id - 1];
        return (_id, p.pType, p.title, "", p.proposer, 0, p.deadline, p.active, !p.active, 0, p.threshold);
    }
    
    function hasVotedOn(uint256 _id, address _voter) external view returns (bool) {
        return voted[_id][_voter];
    }
    
    function getTotalProposals() external view returns (uint256) {
        return proposals.length;
    }
    
    function isBoardMember(address _member) external view returns (bool) {
        return boardMembers[_member];
    }
    
    function getCompanyInfo() external view returns (string memory, string memory, string memory, uint256, uint256, address[] memory) {
        return (companyName, "CORP", "", totalShares, 0, boardList);
    }
    
    function getShareholderInfo(address _addr) external view returns (bool, uint32, string memory, string memory, bool) {
        Shareholder storage s = shareholders[_addr];
        return (s.active, s.shares, "", s.name, s.active);
    }
    
    // 简化版本的注册和投票函数
    function registerShareholderPlain(address _addr, uint32 _shares, string memory, string memory _name) external onlyBoard {
        shareholders[_addr] = Shareholder(true, _shares, _name);
        emit ShareholderAdd(_addr);
    }
    
    function castVotePlain(uint256 _id, uint8 _choice) external {
        vote(_id, _choice);
    }
    
    function castConfidentialVote(uint256 _id, uint8 _choice) external {
        vote(_id, _choice);
    }
    
    function finalizeProposal(uint256 _id) external {
        finalize(_id);
    }
    
    function getDecryptedResults(uint256 _id) external view returns (uint32, uint32, uint32, bool) {
        (uint32 f, uint32 a, bool p) = getResults(_id);
        return (f, a, 0, p);
    }
}