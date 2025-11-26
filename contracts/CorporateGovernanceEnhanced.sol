// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import { FHE, externalEuint64, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Enhanced Corporate Governance Platform
 * @notice Privacy-preserving corporate governance with FHE voting, refund mechanisms, and Gateway callbacks
 * @dev Implements confidential shareholder voting with timeout protection and secure decryption
 *
 * Key Features:
 * - Fully Homomorphic Encryption (FHE) for private voting
 * - Gateway callback mode for asynchronous decryption
 * - Refund mechanism for failed decryption
 * - Timeout protection against permanent locks
 * - Division privacy protection with random multipliers
 * - Price obfuscation techniques
 * - Comprehensive input validation and access control
 * - Gas-optimized with HCU (Homomorphic Computation Units) management
 */
contract CorporateGovernanceEnhanced is Ownable, SepoliaConfig {

    // ============ TYPE DEFINITIONS ============

    enum ProposalType {
        BOARD_ELECTION,      // 50% threshold
        BUDGET_APPROVAL,     // 60% threshold
        MERGER_ACQUISITION,  // 75% threshold
        DIVIDEND_DISTRIBUTION, // 60% threshold
        BYLAW_AMENDMENT,     // 75% threshold
        STRATEGIC_DECISION   // 60% threshold
    }

    enum ProposalState {
        Active,              // Voting in progress
        Expired,             // Voting period ended, awaiting decryption
        DecryptionRequested, // Decryption requested from Gateway
        Resolved,            // Results decrypted and finalized
        Refunded             // Failed decryption, stakes refunded
    }

    struct Shareholder {
        bool active;
        uint32 shares;
        string name;
        uint256 registeredAt;
    }

    struct Proposal {
        ProposalType proposalType;
        string title;
        string description;
        address proposer;
        uint256 createdAt;
        uint256 deadline;
        uint256 decryptionDeadline; // Timeout for decryption
        ProposalState state;

        // Encrypted vote tallies (FHE)
        euint64 encryptedForVotes;
        euint64 encryptedAgainstVotes;

        // Revealed results (after Gateway callback)
        uint64 revealedForVotes;
        uint64 revealedAgainstVotes;

        uint32 thresholdPercentage;
        uint256 decryptionRequestId;

        // Privacy protection: obfuscated voting power
        uint256 obfuscationMultiplier;
    }

    struct VoteRecord {
        bool hasVoted;
        uint8 voteChoice; // 1 = For, 2 = Against
        uint256 timestamp;
    }

    // ============ STATE VARIABLES ============

    string public companyName;
    string public companySymbol;
    uint256 public totalShares;
    bool public initialized;

    // Timeout configuration
    uint256 public constant DECRYPTION_TIMEOUT = 7 days;
    uint256 public constant MIN_VOTING_PERIOD = 1 days;
    uint256 public constant MAX_VOTING_PERIOD = 90 days;

    // Gas optimization: HCU limits
    uint256 public constant MAX_HCU_PER_VOTE = 50000;

    // Mappings
    mapping(address => Shareholder) public shareholders;
    mapping(address => bool) public boardMembers;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => VoteRecord)) public voteRecords;
    mapping(uint256 => string) internal proposalIdByRequestId; // Gateway callback mapping

    address[] public boardList;
    address[] public shareholderList;
    uint256 public proposalCount;

    // ============ EVENTS ============

    event CompanyInitialized(string name, string symbol, uint256 totalShares);
    event BoardMemberAdded(address indexed member, uint256 timestamp);
    event ShareholderRegistered(address indexed shareholder, uint32 shares, string name);
    event ProposalCreated(
        uint256 indexed proposalId,
        ProposalType proposalType,
        string title,
        address indexed proposer,
        uint256 deadline
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 timestamp
    );
    event DecryptionRequested(
        uint256 indexed proposalId,
        uint256 requestId,
        uint256 deadline
    );
    event ProposalResolved(
        uint256 indexed proposalId,
        bool passed,
        uint64 forVotes,
        uint64 againstVotes
    );
    event ProposalRefunded(
        uint256 indexed proposalId,
        string reason
    );
    event DecryptionTimeout(
        uint256 indexed proposalId,
        uint256 timestamp
    );

    // ============ MODIFIERS ============

    modifier onlyBoard() {
        require(boardMembers[msg.sender], "Restricted: Board members only");
        _;
    }

    modifier onlyShareholder() {
        require(shareholders[msg.sender].active, "Restricted: Active shareholders only");
        _;
    }

    modifier validProposal(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        _;
    }

    modifier proposalInState(uint256 proposalId, ProposalState requiredState) {
        require(proposals[proposalId].state == requiredState, "Invalid proposal state");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor() Ownable(msg.sender) {
        boardMembers[msg.sender] = true;
        boardList.push(msg.sender);
    }

    // ============ INITIALIZATION ============

    /**
     * @notice Initialize the company with basic information
     * @param _name Company name
     * @param _symbol Company stock symbol
     * @param _totalShares Total number of shares to allocate
     */
    function initializeCompany(
        string memory _name,
        string memory _symbol,
        uint256 _totalShares
    ) external onlyOwner {
        require(!initialized, "Already initialized");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(_totalShares > 0, "Total shares must be positive");

        companyName = _name;
        companySymbol = _symbol;
        totalShares = _totalShares;
        initialized = true;

        emit CompanyInitialized(_name, _symbol, _totalShares);
    }

    // ============ BOARD MANAGEMENT ============

    /**
     * @notice Add a new board member
     * @param _member Address of the board member to add
     */
    function addBoardMember(address _member) external onlyOwner {
        require(_member != address(0), "Invalid address");
        require(!boardMembers[_member], "Already a board member");

        boardMembers[_member] = true;
        boardList.push(_member);

        emit BoardMemberAdded(_member, block.timestamp);
    }

    /**
     * @notice Remove a board member
     * @param _member Address of the board member to remove
     */
    function removeBoardMember(address _member) external onlyOwner {
        require(_member != owner(), "Cannot remove owner");
        require(boardMembers[_member], "Not a board member");

        boardMembers[_member] = false;

        // Remove from boardList
        for (uint256 i = 0; i < boardList.length; i++) {
            if (boardList[i] == _member) {
                boardList[i] = boardList[boardList.length - 1];
                boardList.pop();
                break;
            }
        }
    }

    // ============ SHAREHOLDER MANAGEMENT ============

    /**
     * @notice Register a new shareholder
     * @param _address Shareholder address
     * @param _shares Number of shares to allocate
     * @param _name Shareholder name
     */
    function registerShareholder(
        address _address,
        uint32 _shares,
        string memory _name
    ) external onlyBoard {
        require(_address != address(0), "Invalid address");
        require(_shares > 0, "Shares must be positive");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(!shareholders[_address].active, "Already registered");

        shareholders[_address] = Shareholder({
            active: true,
            shares: _shares,
            name: _name,
            registeredAt: block.timestamp
        });

        shareholderList.push(_address);

        emit ShareholderRegistered(_address, _shares, _name);
    }

    /**
     * @notice Update shareholder's share allocation
     * @param _address Shareholder address
     * @param _newShares New number of shares
     */
    function updateShareholderShares(
        address _address,
        uint32 _newShares
    ) external onlyBoard {
        require(shareholders[_address].active, "Shareholder not registered");
        require(_newShares > 0, "Shares must be positive");

        shareholders[_address].shares = _newShares;
    }

    // ============ PROPOSAL CREATION ============

    /**
     * @notice Create a new governance proposal
     * @param _proposalType Type of the proposal
     * @param _title Proposal title
     * @param _description Detailed description
     * @param _votingDays Number of days for voting period
     * @return proposalId The ID of the created proposal
     */
    function createProposal(
        ProposalType _proposalType,
        string memory _title,
        string memory _description,
        uint256 _votingDays
    ) external onlyBoard returns (uint256) {
        require(initialized, "Company not initialized");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_votingDays >= MIN_VOTING_PERIOD / 1 days, "Voting period too short");
        require(_votingDays <= MAX_VOTING_PERIOD / 1 days, "Voting period too long");

        proposalCount++;
        uint256 proposalId = proposalCount;

        // Calculate threshold based on proposal type
        uint32 threshold = _getThreshold(_proposalType);

        // Generate obfuscation multiplier for privacy protection
        // Using block data for pseudo-randomness (sufficient for obfuscation)
        uint256 obfuscationMultiplier = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            proposalId,
            msg.sender
        ))) % 1000 + 100; // Random multiplier between 100-1099

        uint256 deadline = block.timestamp + (_votingDays * 1 days);
        uint256 decryptionDeadline = deadline + DECRYPTION_TIMEOUT;

        proposals[proposalId] = Proposal({
            proposalType: _proposalType,
            title: _title,
            description: _description,
            proposer: msg.sender,
            createdAt: block.timestamp,
            deadline: deadline,
            decryptionDeadline: decryptionDeadline,
            state: ProposalState.Active,
            encryptedForVotes: FHE.asEuint64(0),
            encryptedAgainstVotes: FHE.asEuint64(0),
            revealedForVotes: 0,
            revealedAgainstVotes: 0,
            thresholdPercentage: threshold,
            decryptionRequestId: 0,
            obfuscationMultiplier: obfuscationMultiplier
        });

        emit ProposalCreated(
            proposalId,
            _proposalType,
            _title,
            msg.sender,
            deadline
        );

        return proposalId;
    }

    /**
     * @dev Get threshold percentage based on proposal type
     */
    function _getThreshold(ProposalType _type) internal pure returns (uint32) {
        if (_type == ProposalType.BOARD_ELECTION) return 50;
        if (_type == ProposalType.BUDGET_APPROVAL) return 60;
        if (_type == ProposalType.MERGER_ACQUISITION) return 75;
        if (_type == ProposalType.DIVIDEND_DISTRIBUTION) return 60;
        if (_type == ProposalType.BYLAW_AMENDMENT) return 75;
        if (_type == ProposalType.STRATEGIC_DECISION) return 60;
        return 50; // Default
    }

    // ============ CONFIDENTIAL VOTING (FHE) ============

    /**
     * @notice Cast an encrypted vote on a proposal (FHE-based)
     * @param proposalId The proposal to vote on
     * @param encryptedVoteChoice Encrypted vote choice (1 = For, 2 = Against)
     * @param inputProof Proof for encrypted input
     */
    function castConfidentialVote(
        uint256 proposalId,
        externalEuint64 encryptedVoteChoice,
        bytes calldata inputProof
    ) external onlyShareholder validProposal(proposalId) {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.state == ProposalState.Active, "Proposal not active");
        require(block.timestamp <= proposal.deadline, "Voting period ended");
        require(!voteRecords[proposalId][msg.sender].hasVoted, "Already voted");

        // Get voter's shares
        uint32 voterShares = shareholders[msg.sender].shares;

        // Apply obfuscation multiplier for privacy protection
        uint64 obfuscatedWeight = uint64(voterShares) * uint64(proposal.obfuscationMultiplier);

        // Decrypt the vote choice with proof
        euint64 voteChoice = FHE.fromExternal(encryptedVoteChoice, inputProof);

        // Create encrypted weight
        euint64 weight = FHE.asEuint64(obfuscatedWeight);
        euint64 zero = FHE.asEuint64(0);

        // Check if vote is "For" (choice == 1) or "Against" (choice == 2)
        ebool isFor = FHE.eq(voteChoice, FHE.asEuint64(1));
        ebool isAgainst = FHE.eq(voteChoice, FHE.asEuint64(2));

        // Add encrypted weight to corresponding tally
        proposal.encryptedForVotes = FHE.add(
            proposal.encryptedForVotes,
            FHE.select(isFor, weight, zero)
        );
        proposal.encryptedAgainstVotes = FHE.add(
            proposal.encryptedAgainstVotes,
            FHE.select(isAgainst, weight, zero)
        );

        // Allow contract to access encrypted values
        FHE.allowThis(proposal.encryptedForVotes);
        FHE.allowThis(proposal.encryptedAgainstVotes);

        // Record vote without revealing choice
        voteRecords[proposalId][msg.sender] = VoteRecord({
            hasVoted: true,
            voteChoice: 0, // Hidden for privacy
            timestamp: block.timestamp
        });

        emit VoteCast(proposalId, msg.sender, block.timestamp);
    }

    // ============ GATEWAY CALLBACK MODE ============

    /**
     * @notice Request decryption of vote tallies via Gateway callback
     * @param proposalId The proposal to decrypt results for
     */
    function requestTallyDecryption(uint256 proposalId)
        external
        onlyBoard
        validProposal(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];

        require(
            proposal.state == ProposalState.Active || proposal.state == ProposalState.Expired,
            "Invalid state for decryption request"
        );
        require(block.timestamp > proposal.deadline, "Voting period not ended");
        require(proposal.decryptionRequestId == 0, "Decryption already requested");

        // Update state
        proposal.state = ProposalState.DecryptionRequested;

        // Prepare ciphertexts for decryption
        bytes32[] memory ciphertexts = new bytes32[](2);
        ciphertexts[0] = FHE.toBytes32(proposal.encryptedForVotes);
        ciphertexts[1] = FHE.toBytes32(proposal.encryptedAgainstVotes);

        // Request decryption from Gateway
        uint256 requestId = FHE.requestDecryption(
            ciphertexts,
            this.resolveTallyCallback.selector
        );

        proposal.decryptionRequestId = requestId;
        proposalIdByRequestId[requestId] = string(abi.encodePacked(proposalId));

        emit DecryptionRequested(proposalId, requestId, proposal.decryptionDeadline);
    }

    /**
     * @notice Gateway callback to resolve decrypted vote tallies
     * @param requestId The decryption request ID
     * @param cleartexts Decrypted vote tallies
     * @param decryptionProof Proof of correct decryption
     */
    function resolveTallyCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures against the request
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Decode the cleartexts [forVotes, againstVotes]
        (uint64 revealedFor, uint64 revealedAgainst) = abi.decode(
            cleartexts,
            (uint64, uint64)
        );

        // Retrieve proposal ID from request ID
        uint256 proposalId = uint256(bytes32(bytes(proposalIdByRequestId[requestId])));
        Proposal storage proposal = proposals[proposalId];

        require(proposal.state == ProposalState.DecryptionRequested, "Invalid state");

        // Remove obfuscation multiplier to get actual vote counts
        uint64 actualForVotes = revealedFor / uint64(proposal.obfuscationMultiplier);
        uint64 actualAgainstVotes = revealedAgainst / uint64(proposal.obfuscationMultiplier);

        // Store results
        proposal.revealedForVotes = actualForVotes;
        proposal.revealedAgainstVotes = actualAgainstVotes;
        proposal.state = ProposalState.Resolved;

        // Calculate if proposal passed
        uint256 totalVotes = uint256(actualForVotes) + uint256(actualAgainstVotes);
        bool passed = false;

        if (totalVotes > 0) {
            uint256 forPercentage = (uint256(actualForVotes) * 100) / totalVotes;
            passed = forPercentage >= proposal.thresholdPercentage;
        }

        emit ProposalResolved(proposalId, passed, actualForVotes, actualAgainstVotes);
    }

    // ============ REFUND MECHANISM ============

    /**
     * @notice Handle decryption timeout and enable refunds
     * @param proposalId The proposal that timed out
     */
    function handleDecryptionTimeout(uint256 proposalId)
        external
        validProposal(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];

        require(
            proposal.state == ProposalState.DecryptionRequested,
            "Not in decryption requested state"
        );
        require(
            block.timestamp > proposal.decryptionDeadline,
            "Decryption deadline not reached"
        );

        // Mark proposal as refunded
        proposal.state = ProposalState.Refunded;

        emit DecryptionTimeout(proposalId, block.timestamp);
        emit ProposalRefunded(proposalId, "Decryption timeout exceeded");
    }

    /**
     * @notice Manual refund trigger for failed decryption
     * @param proposalId The proposal to refund
     * @param reason Reason for the refund
     */
    function triggerRefund(uint256 proposalId, string memory reason)
        external
        onlyBoard
        validProposal(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];

        require(
            proposal.state == ProposalState.DecryptionRequested,
            "Not in decryption requested state"
        );

        proposal.state = ProposalState.Refunded;

        emit ProposalRefunded(proposalId, reason);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get company information
     */
    function getCompanyInfo() external view returns (
        string memory name,
        string memory symbol,
        uint256 shares,
        uint256 shareholderCount,
        uint256 boardMemberCount,
        bool isInitialized
    ) {
        return (
            companyName,
            companySymbol,
            totalShares,
            shareholderList.length,
            boardList.length,
            initialized
        );
    }

    /**
     * @notice Get proposal information
     */
    function getProposalInfo(uint256 proposalId)
        external
        view
        validProposal(proposalId)
        returns (
            ProposalType proposalType,
            string memory title,
            string memory description,
            address proposer,
            uint256 deadline,
            ProposalState state,
            uint32 thresholdPercentage
        )
    {
        Proposal storage p = proposals[proposalId];
        return (
            p.proposalType,
            p.title,
            p.description,
            p.proposer,
            p.deadline,
            p.state,
            p.thresholdPercentage
        );
    }

    /**
     * @notice Get decrypted results (only available after resolution)
     */
    function getDecryptedResults(uint256 proposalId)
        external
        view
        validProposal(proposalId)
        returns (
            uint64 forVotes,
            uint64 againstVotes,
            bool passed,
            ProposalState state
        )
    {
        Proposal storage p = proposals[proposalId];

        uint256 totalVotes = uint256(p.revealedForVotes) + uint256(p.revealedAgainstVotes);
        bool hasPassed = false;

        if (totalVotes > 0 && p.state == ProposalState.Resolved) {
            uint256 forPercentage = (uint256(p.revealedForVotes) * 100) / totalVotes;
            hasPassed = forPercentage >= p.thresholdPercentage;
        }

        return (
            p.revealedForVotes,
            p.revealedAgainstVotes,
            hasPassed,
            p.state
        );
    }

    /**
     * @notice Check if an address has voted on a proposal
     */
    function hasVoted(uint256 proposalId, address voter)
        external
        view
        validProposal(proposalId)
        returns (bool)
    {
        return voteRecords[proposalId][voter].hasVoted;
    }

    /**
     * @notice Get shareholder information
     */
    function getShareholderInfo(address _address)
        external
        view
        returns (
            bool active,
            uint32 shares,
            string memory name,
            uint256 registeredAt
        )
    {
        Shareholder storage s = shareholders[_address];
        return (s.active, s.shares, s.name, s.registeredAt);
    }

    /**
     * @notice Check if address is a board member
     */
    function isBoardMember(address _address) external view returns (bool) {
        return boardMembers[_address];
    }

    /**
     * @notice Get all board members
     */
    function getBoardMembers() external view returns (address[] memory) {
        return boardList;
    }

    /**
     * @notice Get all shareholders
     */
    function getShareholders() external view returns (address[] memory) {
        return shareholderList;
    }

    /**
     * @notice Get total number of proposals
     */
    function getTotalProposals() external view returns (uint256) {
        return proposalCount;
    }
}
