# API Reference

Complete reference for the Enhanced Corporate Governance Platform smart contract.

## Table of Contents

- [Contract Overview](#contract-overview)
- [Initialization Functions](#initialization-functions)
- [Board Management](#board-management)
- [Shareholder Management](#shareholder-management)
- [Proposal Functions](#proposal-functions)
- [Voting Functions](#voting-functions)
- [Decryption & Gateway Functions](#decryption--gateway-functions)
- [Refund Functions](#refund-functions)
- [View Functions](#view-functions)
- [Events](#events)
- [Enums & Structs](#enums--structs)
- [Constants](#constants)

---

## Contract Overview

**Contract Name:** `CorporateGovernanceEnhanced`

**Inheritance:**
- `Ownable` (OpenZeppelin)
- `SepoliaConfig` (FHEVM)

**SPDX License:** MIT

**Solidity Version:** ^0.8.24

---

## Initialization Functions

### `initializeCompany`

Initialize the company with basic information. Can only be called once by the owner.

```solidity
function initializeCompany(
    string memory _name,
    string memory _symbol,
    uint256 _totalShares
) external onlyOwner
```

**Parameters:**
- `_name` (string): Company name
- `_symbol` (string): Company stock symbol
- `_totalShares` (uint256): Total number of shares to allocate

**Requirements:**
- Contract must not be already initialized
- Name cannot be empty
- Symbol cannot be empty
- Total shares must be positive

**Events Emitted:**
- `CompanyInitialized(string name, string symbol, uint256 totalShares)`

**Example:**
```javascript
await contract.initializeCompany("Tech Innovations Corp", "TIC", 1000000);
```

---

## Board Management

### `addBoardMember`

Add a new board member to the governance system.

```solidity
function addBoardMember(address _member) external onlyOwner
```

**Parameters:**
- `_member` (address): Address of the board member to add

**Requirements:**
- Caller must be owner
- Member address must not be zero address
- Member must not already be a board member

**Events Emitted:**
- `BoardMemberAdded(address indexed member, uint256 timestamp)`

**Example:**
```javascript
await contract.addBoardMember("0x1234567890123456789012345678901234567890");
```

### `removeBoardMember`

Remove an existing board member from the governance system.

```solidity
function removeBoardMember(address _member) external onlyOwner
```

**Parameters:**
- `_member` (address): Address of the board member to remove

**Requirements:**
- Caller must be owner
- Member cannot be the contract owner
- Member must currently be a board member

**Example:**
```javascript
await contract.removeBoardMember("0x1234567890123456789012345678901234567890");
```

---

## Shareholder Management

### `registerShareholder`

Register a new shareholder with share allocation.

```solidity
function registerShareholder(
    address _address,
    uint32 _shares,
    string memory _name
) external onlyBoard
```

**Parameters:**
- `_address` (address): Shareholder's wallet address
- `_shares` (uint32): Number of shares to allocate
- `_name` (string): Shareholder's name

**Requirements:**
- Caller must be a board member
- Address must not be zero address
- Shares must be positive
- Name cannot be empty
- Shareholder must not already be registered

**Events Emitted:**
- `ShareholderRegistered(address indexed shareholder, uint32 shares, string name)`

**Example:**
```javascript
await contract.registerShareholder(
    "0xABCDEF1234567890123456789012345678901234",
    50000,
    "Alice Johnson"
);
```

### `updateShareholderShares`

Update the share allocation for an existing shareholder.

```solidity
function updateShareholderShares(
    address _address,
    uint32 _newShares
) external onlyBoard
```

**Parameters:**
- `_address` (address): Shareholder's address
- `_newShares` (uint32): New number of shares

**Requirements:**
- Caller must be a board member
- Shareholder must be registered
- New shares must be positive

**Example:**
```javascript
await contract.updateShareholderShares(
    "0xABCDEF1234567890123456789012345678901234",
    75000
);
```

---

## Proposal Functions

### `createProposal`

Create a new governance proposal for shareholder voting.

```solidity
function createProposal(
    ProposalType _proposalType,
    string memory _title,
    string memory _description,
    uint256 _votingDays
) external onlyBoard returns (uint256)
```

**Parameters:**
- `_proposalType` (ProposalType): Type of proposal (see [ProposalType enum](#proposaltype))
- `_title` (string): Proposal title
- `_description` (string): Detailed description
- `_votingDays` (uint256): Number of days for voting period

**Returns:**
- `uint256`: The ID of the created proposal

**Requirements:**
- Caller must be a board member
- Company must be initialized
- Title cannot be empty
- Voting days must be between `MIN_VOTING_PERIOD` and `MAX_VOTING_PERIOD`

**Events Emitted:**
- `ProposalCreated(uint256 indexed proposalId, ProposalType proposalType, string title, address indexed proposer, uint256 deadline)`

**Voting Thresholds by Type:**
| Proposal Type | Threshold |
|---------------|-----------|
| BOARD_ELECTION | 50% |
| BUDGET_APPROVAL | 60% |
| MERGER_ACQUISITION | 75% |
| DIVIDEND_DISTRIBUTION | 60% |
| BYLAW_AMENDMENT | 75% |
| STRATEGIC_DECISION | 60% |

**Example:**
```javascript
const proposalId = await contract.createProposal(
    0, // ProposalType.BOARD_ELECTION
    "Elect Jane Doe as CTO",
    "Jane has 15 years of experience in blockchain technology...",
    7 // 7 days voting period
);
```

---

## Voting Functions

### `castConfidentialVote`

Cast an encrypted vote on a proposal using Fully Homomorphic Encryption.

```solidity
function castConfidentialVote(
    uint256 proposalId,
    externalEuint64 encryptedVoteChoice,
    bytes calldata inputProof
) external onlyShareholder validProposal(proposalId)
```

**Parameters:**
- `proposalId` (uint256): The ID of the proposal to vote on
- `encryptedVoteChoice` (externalEuint64): Encrypted vote choice (1 = For, 2 = Against)
- `inputProof` (bytes): Zero-knowledge proof for the encrypted input

**Requirements:**
- Caller must be an active shareholder
- Proposal must exist and be valid
- Proposal state must be Active
- Current time must be before voting deadline
- Caller must not have already voted on this proposal

**Events Emitted:**
- `VoteCast(uint256 indexed proposalId, address indexed voter, uint256 timestamp)`

**Vote Privacy:**
- Individual vote choices remain encrypted on-chain
- Only aggregated tallies are eventually decrypted
- Zero-knowledge proofs ensure vote validity without revealing content

**Client-Side Example (Frontend):**
```javascript
import { createFhevmInstance } from 'fhevmjs';

// Initialize FHEVM client
const fhevmInstance = await createFhevmInstance({
    networkUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    contractAddress: contractAddress
});

// Encrypt vote choice (1 = For, 2 = Against)
const voteChoice = 1; // Vote "For"
const encryptedVote = await fhevmInstance.encrypt64(voteChoice);

// Cast confidential vote
await contract.castConfidentialVote(
    proposalId,
    encryptedVote.encrypted,
    encryptedVote.proof
);
```

---

## Decryption & Gateway Functions

### `requestTallyDecryption`

Request decryption of encrypted vote tallies via the Gateway oracle. Can only be called after the voting period ends.

```solidity
function requestTallyDecryption(uint256 proposalId)
    external
    onlyBoard
    validProposal(proposalId)
```

**Parameters:**
- `proposalId` (uint256): The proposal to decrypt results for

**Requirements:**
- Caller must be a board member
- Proposal must exist
- Proposal state must be Active or Expired
- Current time must be after voting deadline
- Decryption must not have already been requested

**State Changes:**
- Proposal state changes to `DecryptionRequested`
- Decryption request ID is stored in the proposal

**Events Emitted:**
- `DecryptionRequested(uint256 indexed proposalId, uint256 requestId, uint256 deadline)`

**Gateway Workflow:**
1. Board member calls `requestTallyDecryption()`
2. Contract emits `DecryptionRequested` event
3. Gateway oracle listens for event
4. Gateway performs threshold decryption
5. Gateway calls back to `resolveTallyCallback()` with results

**Example:**
```javascript
// After voting period ends
await contract.requestTallyDecryption(proposalId);

// Wait for Gateway to process and callback
// (typically 1-5 minutes)
```

### `resolveTallyCallback`

Gateway callback function to receive decrypted vote tallies. **Only called by the Gateway oracle.**

```solidity
function resolveTallyCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Parameters:**
- `requestId` (uint256): The decryption request ID
- `cleartexts` (bytes): ABI-encoded decrypted vote tallies
- `decryptionProof` (bytes): Cryptographic proof of correct decryption

**Process:**
1. Verifies decryption proof using `FHE.checkSignatures()`
2. Decodes cleartexts to `(uint64 forVotes, uint64 againstVotes)`
3. Removes obfuscation multiplier
4. Calculates if proposal passed based on threshold
5. Updates proposal state to `Resolved`

**Events Emitted:**
- `ProposalResolved(uint256 indexed proposalId, bool passed, uint64 forVotes, uint64 againstVotes)`

**Note:** This function is automatically called by the Gateway. Users and board members do not call this directly.

---

## Refund Functions

### `handleDecryptionTimeout`

Handle decryption timeout when Gateway fails to respond within the timeout period. Can be called by anyone.

```solidity
function handleDecryptionTimeout(uint256 proposalId)
    external
    validProposal(proposalId)
```

**Parameters:**
- `proposalId` (uint256): The proposal that timed out

**Requirements:**
- Proposal must exist
- Proposal state must be `DecryptionRequested`
- Current time must be after decryption deadline

**State Changes:**
- Proposal state changes to `Refunded`

**Events Emitted:**
- `DecryptionTimeout(uint256 indexed proposalId, uint256 timestamp)`
- `ProposalRefunded(uint256 indexed proposalId, string reason)`

**Example:**
```javascript
// After decryption deadline passes (7 days after voting ends)
await contract.handleDecryptionTimeout(proposalId);
```

### `triggerRefund`

Manually trigger a refund for a proposal when decryption is known to have failed. Board member only.

```solidity
function triggerRefund(uint256 proposalId, string memory reason)
    external
    onlyBoard
    validProposal(proposalId)
```

**Parameters:**
- `proposalId` (uint256): The proposal to refund
- `reason` (string): Reason for the refund (for transparency)

**Requirements:**
- Caller must be a board member
- Proposal must exist
- Proposal state must be `DecryptionRequested`

**State Changes:**
- Proposal state changes to `Refunded`

**Events Emitted:**
- `ProposalRefunded(uint256 indexed proposalId, string reason)`

**Example:**
```javascript
await contract.triggerRefund(
    proposalId,
    "Gateway oracle service temporarily unavailable"
);
```

---

## View Functions

### `getCompanyInfo`

Retrieve company information.

```solidity
function getCompanyInfo() external view returns (
    string memory name,
    string memory symbol,
    uint256 shares,
    uint256 shareholderCount,
    uint256 boardMemberCount,
    bool isInitialized
)
```

**Returns:**
- `name` (string): Company name
- `symbol` (string): Company stock symbol
- `shares` (uint256): Total shares allocated
- `shareholderCount` (uint256): Number of registered shareholders
- `boardMemberCount` (uint256): Number of board members
- `isInitialized` (bool): Whether company has been initialized

**Example:**
```javascript
const [name, symbol, shares, shareholderCount, boardCount, initialized] =
    await contract.getCompanyInfo();
console.log(`${name} (${symbol}): ${shares} shares`);
```

### `getProposalInfo`

Retrieve detailed proposal information.

```solidity
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
```

**Parameters:**
- `proposalId` (uint256): The proposal ID to query

**Returns:**
- `proposalType` (ProposalType): Type of proposal
- `title` (string): Proposal title
- `description` (string): Detailed description
- `proposer` (address): Address of board member who created proposal
- `deadline` (uint256): Voting deadline timestamp
- `state` (ProposalState): Current state of proposal
- `thresholdPercentage` (uint32): Required percentage to pass

**Example:**
```javascript
const [type, title, desc, proposer, deadline, state, threshold] =
    await contract.getProposalInfo(1);
console.log(`Proposal: ${title} - State: ${state} - Threshold: ${threshold}%`);
```

### `getDecryptedResults`

Retrieve decrypted vote results. Only available after proposal is resolved.

```solidity
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
```

**Parameters:**
- `proposalId` (uint256): The proposal ID to query

**Returns:**
- `forVotes` (uint64): Total votes in favor
- `againstVotes` (uint64): Total votes against
- `passed` (bool): Whether the proposal passed
- `state` (ProposalState): Current state

**Note:** Results are only available when state is `Resolved`. Returns zeros if not yet resolved.

**Example:**
```javascript
const [forVotes, againstVotes, passed, state] =
    await contract.getDecryptedResults(proposalId);

if (state === ProposalState.Resolved) {
    console.log(`For: ${forVotes}, Against: ${againstVotes}`);
    console.log(`Result: ${passed ? 'PASSED' : 'FAILED'}`);
}
```

### `hasVoted`

Check if a specific address has voted on a proposal.

```solidity
function hasVoted(uint256 proposalId, address voter)
    external
    view
    validProposal(proposalId)
    returns (bool)
```

**Parameters:**
- `proposalId` (uint256): The proposal ID
- `voter` (address): The voter address to check

**Returns:**
- `bool`: True if the address has voted, false otherwise

**Example:**
```javascript
const voted = await contract.hasVoted(proposalId, voterAddress);
console.log(`Has voted: ${voted}`);
```

### `getShareholderInfo`

Retrieve shareholder information.

```solidity
function getShareholderInfo(address _address)
    external
    view
    returns (
        bool active,
        uint32 shares,
        string memory name,
        uint256 registeredAt
    )
```

**Parameters:**
- `_address` (address): The shareholder address to query

**Returns:**
- `active` (bool): Whether shareholder is active
- `shares` (uint32): Number of shares held
- `name` (string): Shareholder name
- `registeredAt` (uint256): Registration timestamp

**Example:**
```javascript
const [active, shares, name, registeredAt] =
    await contract.getShareholderInfo(shareholderAddress);
console.log(`${name}: ${shares} shares (${active ? 'Active' : 'Inactive'})`);
```

### `isBoardMember`

Check if an address is a board member.

```solidity
function isBoardMember(address _address) external view returns (bool)
```

**Parameters:**
- `_address` (address): The address to check

**Returns:**
- `bool`: True if address is a board member, false otherwise

**Example:**
```javascript
const isMember = await contract.isBoardMember(address);
console.log(`Is board member: ${isMember}`);
```

### `getBoardMembers`

Retrieve list of all board member addresses.

```solidity
function getBoardMembers() external view returns (address[] memory)
```

**Returns:**
- `address[]`: Array of board member addresses

**Example:**
```javascript
const boardMembers = await contract.getBoardMembers();
console.log(`Board members: ${boardMembers.join(', ')}`);
```

### `getShareholders`

Retrieve list of all shareholder addresses.

```solidity
function getShareholders() external view returns (address[] memory)
```

**Returns:**
- `address[]`: Array of shareholder addresses

**Example:**
```javascript
const shareholders = await contract.getShareholders();
console.log(`Total shareholders: ${shareholders.length}`);
```

### `getTotalProposals`

Get the total number of proposals created.

```solidity
function getTotalProposals() external view returns (uint256)
```

**Returns:**
- `uint256`: Total number of proposals

**Example:**
```javascript
const totalProposals = await contract.getTotalProposals();
console.log(`Total proposals: ${totalProposals}`);
```

---

## Events

### `CompanyInitialized`

Emitted when the company is initialized.

```solidity
event CompanyInitialized(
    string name,
    string symbol,
    uint256 totalShares
)
```

### `BoardMemberAdded`

Emitted when a board member is added.

```solidity
event BoardMemberAdded(
    address indexed member,
    uint256 timestamp
)
```

### `ShareholderRegistered`

Emitted when a shareholder is registered.

```solidity
event ShareholderRegistered(
    address indexed shareholder,
    uint32 shares,
    string name
)
```

### `ProposalCreated`

Emitted when a new proposal is created.

```solidity
event ProposalCreated(
    uint256 indexed proposalId,
    ProposalType proposalType,
    string title,
    address indexed proposer,
    uint256 deadline
)
```

### `VoteCast`

Emitted when a vote is cast (vote choice remains private).

```solidity
event VoteCast(
    uint256 indexed proposalId,
    address indexed voter,
    uint256 timestamp
)
```

### `DecryptionRequested`

Emitted when decryption is requested from the Gateway.

```solidity
event DecryptionRequested(
    uint256 indexed proposalId,
    uint256 requestId,
    uint256 deadline
)
```

### `ProposalResolved`

Emitted when a proposal is resolved with decrypted results.

```solidity
event ProposalResolved(
    uint256 indexed proposalId,
    bool passed,
    uint64 forVotes,
    uint64 againstVotes
)
```

### `ProposalRefunded`

Emitted when a proposal is refunded due to decryption failure.

```solidity
event ProposalRefunded(
    uint256 indexed proposalId,
    string reason
)
```

### `DecryptionTimeout`

Emitted when decryption times out.

```solidity
event DecryptionTimeout(
    uint256 indexed proposalId,
    uint256 timestamp
)
```

---

## Enums & Structs

### ProposalType

Enum defining types of governance proposals.

```solidity
enum ProposalType {
    BOARD_ELECTION,          // 0 - 50% threshold
    BUDGET_APPROVAL,         // 1 - 60% threshold
    MERGER_ACQUISITION,      // 2 - 75% threshold
    DIVIDEND_DISTRIBUTION,   // 3 - 60% threshold
    BYLAW_AMENDMENT,         // 4 - 75% threshold
    STRATEGIC_DECISION       // 5 - 60% threshold
}
```

### ProposalState

Enum defining proposal lifecycle states.

```solidity
enum ProposalState {
    Active,              // 0 - Voting in progress
    Expired,             // 1 - Voting ended, awaiting decryption
    DecryptionRequested, // 2 - Decryption requested from Gateway
    Resolved,            // 3 - Results decrypted and finalized
    Refunded             // 4 - Failed decryption, stakes refunded
}
```

### Shareholder

Struct containing shareholder information.

```solidity
struct Shareholder {
    bool active;          // Whether shareholder is active
    uint32 shares;        // Number of shares held
    string name;          // Shareholder name
    uint256 registeredAt; // Registration timestamp
}
```

### Proposal

Struct containing proposal details.

```solidity
struct Proposal {
    ProposalType proposalType;         // Type of proposal
    string title;                       // Proposal title
    string description;                 // Detailed description
    address proposer;                   // Board member who created proposal
    uint256 createdAt;                  // Creation timestamp
    uint256 deadline;                   // Voting deadline
    uint256 decryptionDeadline;         // Timeout for decryption
    ProposalState state;                // Current state
    euint64 encryptedForVotes;          // Encrypted "For" votes
    euint64 encryptedAgainstVotes;      // Encrypted "Against" votes
    uint64 revealedForVotes;            // Decrypted "For" votes
    uint64 revealedAgainstVotes;        // Decrypted "Against" votes
    uint32 thresholdPercentage;         // Required % to pass
    uint256 decryptionRequestId;        // Gateway request ID
    uint256 obfuscationMultiplier;      // Privacy protection multiplier
}
```

### VoteRecord

Struct recording vote information without revealing choice.

```solidity
struct VoteRecord {
    bool hasVoted;       // Whether address has voted
    uint8 voteChoice;    // Vote choice (hidden for privacy)
    uint256 timestamp;   // When vote was cast
}
```

---

## Constants

### Time Constants

```solidity
uint256 public constant DECRYPTION_TIMEOUT = 7 days;    // Timeout for Gateway decryption
uint256 public constant MIN_VOTING_PERIOD = 1 days;     // Minimum voting period
uint256 public constant MAX_VOTING_PERIOD = 90 days;    // Maximum voting period
```

### Gas Optimization Constants

```solidity
uint256 public constant MAX_HCU_PER_VOTE = 50000;       // Max HCU (Homomorphic Computation Units) per vote
```

---

## Error Messages

Common error messages you may encounter:

| Error | Cause | Solution |
|-------|-------|----------|
| "Already initialized" | Company already initialized | Cannot reinitialize |
| "Restricted: Board members only" | Non-board member calling board function | Use board member account |
| "Restricted: Active shareholders only" | Non-shareholder calling shareholder function | Register as shareholder first |
| "Invalid proposal ID" | Proposal doesn't exist | Check proposal ID |
| "Already voted" | Attempting to vote twice | Each address can only vote once |
| "Voting period ended" | Attempting to vote after deadline | Proposal voting has closed |
| "Invalid state for decryption request" | Wrong proposal state | Check proposal state |
| "Decryption already requested" | Attempting duplicate decryption request | Wait for Gateway callback |
| "Decryption deadline not reached" | Attempting timeout before deadline | Wait for timeout period |

---

## Gas Estimates

Approximate gas costs for common operations:

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| `initializeCompany` | ~100,000 | One-time initialization |
| `addBoardMember` | ~50,000 | Per board member |
| `registerShareholder` | ~100,000 | Per shareholder |
| `createProposal` | ~200,000 | Includes FHE initialization |
| `castConfidentialVote` | ~500,000 | FHE operations (HCU-intensive) |
| `requestTallyDecryption` | ~200,000 | Gateway request |
| `resolveTallyCallback` | ~150,000 | Gateway callback |
| View functions | <50,000 | Read-only operations |

**Note:** FHE operations are more expensive due to homomorphic computation. Actual costs may vary based on network congestion.

---

## Complete Usage Example

### Full Governance Workflow

```javascript
// 1. Initialize company (Owner)
await contract.initializeCompany("Tech Innovations Inc", "TII", 1000000);

// 2. Add board members (Owner)
await contract.addBoardMember(boardMember1Address);
await contract.addBoardMember(boardMember2Address);

// 3. Register shareholders (Board)
await contract.registerShareholder(shareholder1Address, 100000, "Alice");
await contract.registerShareholder(shareholder2Address, 150000, "Bob");

// 4. Create proposal (Board)
const proposalId = await contract.createProposal(
    0, // BOARD_ELECTION
    "Elect Jane Doe as CTO",
    "Jane has extensive experience...",
    7
);

// 5. Cast confidential votes (Shareholders)
// Shareholder 1 votes "For"
const encryptedVote1 = await fhevmInstance.encrypt64(1);
await contract.castConfidentialVote(
    proposalId,
    encryptedVote1.encrypted,
    encryptedVote1.proof
);

// Shareholder 2 votes "Against"
const encryptedVote2 = await fhevmInstance.encrypt64(2);
await contract.castConfidentialVote(
    proposalId,
    encryptedVote2.encrypted,
    encryptedVote2.proof
);

// 6. Wait for voting period to end

// 7. Request decryption (Board)
await contract.requestTallyDecryption(proposalId);

// 8. Wait for Gateway callback (automatic)

// 9. Retrieve results
const [forVotes, againstVotes, passed, state] =
    await contract.getDecryptedResults(proposalId);
console.log(`Result: ${passed ? 'PASSED' : 'FAILED'}`);
console.log(`For: ${forVotes}, Against: ${againstVotes}`);
```

---

## Support

For additional help:
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
- See [README.md](../README.md) for getting started guide
- Check contract source code for inline documentation
- Open an issue on GitHub for bugs or questions
