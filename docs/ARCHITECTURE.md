# Architecture Documentation

## Overview

The Enhanced Corporate Governance Platform is a privacy-preserving blockchain governance system that leverages Fully Homomorphic Encryption (FHE) to enable confidential voting while maintaining transparency and auditability.

## Table of Contents

- [System Architecture](#system-architecture)
- [Gateway Callback Mode](#gateway-callback-mode)
- [Privacy Protection](#privacy-protection)
- [Security Features](#security-features)
- [Gas Optimization](#gas-optimization)
- [State Management](#state-management)
- [Data Flow](#data-flow)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│                   (Web3 Wallet Interface)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Blockchain Interaction                         │
│              (ethers.js + FHEVM SDK Client)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FHE Client-Side Encryption                               │   │
│  │  - Generate encrypted inputs                              │   │
│  │  - Create zero-knowledge proofs                           │   │
│  │  - Manage encryption keys                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Smart Contract Layer (On-Chain)                     │
│          CorporateGovernanceEnhanced.sol                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │Access Control│  │  FHE Voting  │  │  State Management  │    │
│  │- Owner       │  │- Encrypted   │  │- Proposals         │    │
│  │- Board       │  │  Tallies     │  │- Shareholders      │    │
│  │- Shareholders│  │- Privacy     │  │- Vote Records      │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Gateway Callback Interface                               │   │
│  │  - Request decryption                                     │   │
│  │  - Receive callback with decrypted results               │   │
│  │  - Verify cryptographic proofs                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FHEVM Gateway (Oracle)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Decryption Service                                       │   │
│  │  - Receive decryption requests                           │   │
│  │  - Perform threshold decryption                          │   │
│  │  - Generate cryptographic proofs                         │   │
│  │  - Execute callbacks to smart contract                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Key Management                                           │   │
│  │  - Distributed key generation                            │   │
│  │  - Threshold signature scheme                            │   │
│  │  - Secure key storage                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Smart Contract Layer

**CorporateGovernanceEnhanced.sol**
- Role-based access control (Owner, Board, Shareholders)
- FHE-based confidential voting
- Gateway callback handling
- Refund mechanisms
- Timeout protection

**Key Features:**
- Fully Homomorphic Encryption for vote privacy
- Asynchronous decryption via Gateway callbacks
- Comprehensive input validation
- Gas-optimized operations

#### 2. Gateway Layer (Oracle Network)

The Gateway serves as a trusted decryption oracle that:
- Listens for decryption requests on-chain
- Performs threshold decryption using distributed keys
- Generates cryptographic proofs of correct decryption
- Calls back to the smart contract with decrypted results

**Security Properties:**
- Threshold signature scheme (no single point of failure)
- Cryptographic verification of decryption correctness
- Time-bounded operations with timeout protection

#### 3. Frontend Layer

**Client-Side Operations:**
- Wallet connection (MetaMask, WalletConnect, etc.)
- FHE key generation and management
- Vote encryption before submission
- Zero-knowledge proof generation
- Transaction signing and submission

---

## Gateway Callback Mode

### Asynchronous Decryption Workflow

```
┌──────────────┐
│ 1. Voting    │
│    Period    │
│    Ends      │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Board Member Requests Decryption                     │
│    - Call: requestTallyDecryption(proposalId)           │
│    - Contract changes state to DecryptionRequested      │
│    - Emits DecryptionRequested event with requestId     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Gateway Oracle Monitors Events                       │
│    - Listens for DecryptionRequested events             │
│    - Retrieves encrypted ciphertexts                    │
│    - Extracts request metadata                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Gateway Performs Threshold Decryption                │
│    - Multiple Gateway nodes collaborate                 │
│    - Threshold signature scheme ensures security        │
│    - Decrypts: encryptedForVotes, encryptedAgainstVotes│
│    - Generates cryptographic proof of correctness       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Gateway Calls Back to Contract                       │
│    - Calls: resolveTallyCallback(requestId, cleartexts,│
│              decryptionProof)                           │
│    - Contract verifies proof via FHE.checkSignatures()  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Contract Processes Results                           │
│    - Decodes cleartexts to (forVotes, againstVotes)     │
│    - Removes obfuscation multiplier                     │
│    - Calculates if proposal passed                      │
│    - Changes state to Resolved                          │
│    - Emits ProposalResolved event                       │
└─────────────────────────────────────────────────────────┘
```

### Timeout Protection

To prevent permanent lock-up if Gateway fails:

```solidity
// After decryption deadline passes
if (block.timestamp > proposal.decryptionDeadline) {
    // Any user can trigger timeout handling
    handleDecryptionTimeout(proposalId);
    // Changes state to Refunded
    // No results available, but voting power is not locked
}
```

**Timeout Parameters:**
- `DECRYPTION_TIMEOUT`: 7 days after voting ends
- Automatic state transition to `Refunded` after timeout
- Board can manually trigger refund for known failures

### Refund Mechanism

When decryption fails or times out:

1. **Automatic Timeout Handling:**
   ```solidity
   handleDecryptionTimeout(proposalId)
   ```
   - Checks if `decryptionDeadline` has passed
   - Changes proposal state to `Refunded`
   - Emits `DecryptionTimeout` event

2. **Manual Refund Trigger:**
   ```solidity
   triggerRefund(proposalId, "Gateway service unavailable")
   ```
   - Board member can manually trigger for known issues
   - Provides reason string for transparency
   - Emits `ProposalRefunded` event

3. **State Implications:**
   - Proposal marked as `Refunded` (cannot be resolved)
   - Vote tallies remain encrypted (privacy preserved)
   - No winner/loser determination
   - Can be re-proposed by board if needed

---

## Privacy Protection

### 1. Fully Homomorphic Encryption (FHE)

**Vote Encryption:**
```solidity
// Voter submits encrypted vote
euint64 voteChoice = FHE.fromExternal(encryptedVoteChoice, inputProof);

// Contract performs homomorphic operations
ebool isFor = FHE.eq(voteChoice, FHE.asEuint64(1));
proposal.encryptedForVotes = FHE.add(
    proposal.encryptedForVotes,
    FHE.select(isFor, weight, zero)
);
```

**Privacy Properties:**
- Individual votes remain encrypted on-chain
- Only aggregated tallies are decrypted
- Vote choices cannot be determined by observing blockchain
- Zero-knowledge proofs verify vote validity without revealing content

### 2. Division Privacy Protection (Random Multipliers)

**Problem:**
Division operations on small encrypted numbers can leak information through timing or gas consumption patterns.

**Solution:**
Apply random multiplier before encryption, remove after decryption:

```solidity
// At proposal creation
uint256 obfuscationMultiplier = pseudoRandom() % 1000 + 100; // 100-1099

// During voting
uint64 obfuscatedWeight = voterShares * obfuscationMultiplier;
euint64 encryptedWeight = FHE.asEuint64(obfuscatedWeight);

// After decryption
uint64 actualVotes = revealedVotes / obfuscationMultiplier;
```

**Benefits:**
- Prevents side-channel attacks via gas analysis
- Obscures true vote magnitudes during encrypted operations
- No impact on final results (multiplier cancels out)
- Different multiplier per proposal for additional security

### 3. Price Obfuscation

For preventing economic analysis attacks:

**Technique:**
- Variable gas costs due to obfuscation multiplier
- Encrypted vote weights make economic calculation infeasible
- No correlation between transaction value and vote weight

**Implementation:**
```solidity
// Obfuscated weight hides economic value
uint64 obfuscatedWeight = uint64(voterShares) * uint64(obfuscationMultiplier);
```

### 4. Zero-Knowledge Proofs

**Client-Side Proof Generation:**
```typescript
// Frontend generates ZK proof
const { encryptedVote, proof } = await fhevmClient.encrypt(
    voteChoice,
    contractAddress
);

// Submit to contract
await contract.castConfidentialVote(proposalId, encryptedVote, proof);
```

**On-Chain Verification:**
```solidity
// Contract verifies without learning vote content
euint64 voteChoice = FHE.fromExternal(encryptedVoteChoice, inputProof);
```

---

## Security Features

### 1. Input Validation

**Comprehensive Checks:**
```solidity
// Address validation
require(_address != address(0), "Invalid address");

// Bounds checking
require(_shares > 0, "Shares must be positive");
require(_votingDays >= MIN_VOTING_PERIOD / 1 days, "Period too short");
require(_votingDays <= MAX_VOTING_PERIOD / 1 days, "Period too long");

// String validation
require(bytes(_name).length > 0, "Name cannot be empty");

// State validation
require(initialized, "Company not initialized");
```

### 2. Access Control

**Role-Based Permissions:**
```solidity
modifier onlyOwner() // Contract owner only
modifier onlyBoard() // Board members only
modifier onlyShareholder() // Active shareholders only
```

**Permission Matrix:**
| Function | Owner | Board | Shareholder | Anyone |
|----------|-------|-------|-------------|--------|
| initializeCompany | ✓ | ✗ | ✗ | ✗ |
| addBoardMember | ✓ | ✗ | ✗ | ✗ |
| registerShareholder | ✗ | ✓ | ✗ | ✗ |
| createProposal | ✗ | ✓ | ✗ | ✗ |
| castConfidentialVote | ✗ | ✗ | ✓ | ✗ |
| requestTallyDecryption | ✗ | ✓ | ✗ | ✗ |
| handleDecryptionTimeout | ✗ | ✗ | ✗ | ✓ |

### 3. Overflow Protection

**Solidity 0.8.24+ Built-in:**
- Automatic overflow/underflow checks
- No need for SafeMath library
- Gas-efficient checked arithmetic

### 4. Reentrancy Protection

**State-Before-Interaction Pattern:**
```solidity
// Update state first
proposal.state = ProposalState.Resolved;

// Then emit events (external interaction)
emit ProposalResolved(...);
```

### 5. Double Voting Prevention

**Vote Recording:**
```solidity
require(!voteRecords[proposalId][msg.sender].hasVoted, "Already voted");
voteRecords[proposalId][msg.sender].hasVoted = true;
```

### 6. Timestamp Dependence Mitigation

**Safe Timestamp Usage:**
```solidity
// Only used for deadline checks (acceptable use case)
require(block.timestamp <= proposal.deadline, "Voting period ended");

// Not used for critical randomness (use pseudo-random for obfuscation only)
```

---

## Gas Optimization

### HCU (Homomorphic Computation Units) Management

**What is HCU?**
- Gas-equivalent metric for FHE operations
- FHE operations are more expensive than standard EVM operations
- Must be carefully managed to keep costs reasonable

**Optimization Strategies:**

#### 1. Minimize FHE Operations
```solidity
// Bad: Multiple FHE operations per vote
euint64 temp1 = FHE.add(a, b);
euint64 temp2 = FHE.add(temp1, c);
euint64 result = FHE.add(temp2, d);

// Good: Batch operations when possible
euint64 result = FHE.add(proposal.encryptedForVotes, weight);
```

#### 2. Use `FHE.select()` Efficiently
```solidity
// Single conditional addition instead of branching
proposal.encryptedForVotes = FHE.add(
    proposal.encryptedForVotes,
    FHE.select(isFor, weight, zero) // Only one select() call
);
```

#### 3. Limit Ciphertext Conversions
```solidity
// Convert to bytes32 only when necessary (for Gateway requests)
bytes32[] memory ciphertexts = new bytes32[](2);
ciphertexts[0] = FHE.toBytes32(proposal.encryptedForVotes);
ciphertexts[1] = FHE.toBytes32(proposal.encryptedAgainstVotes);
```

#### 4. Use Appropriate Data Types
```solidity
// Use smallest sufficient type
euint64 // Instead of euint256 when 64 bits suffice
```

**Gas Benchmarks:**
| Operation | Approximate Gas | HCU Cost |
|-----------|----------------|----------|
| Regular vote (non-FHE) | ~100,000 | 0 |
| Confidential vote (FHE) | ~500,000 | ~400,000 |
| Decryption request | ~200,000 | ~50,000 |
| Gateway callback | ~150,000 | ~30,000 |

---

## State Management

### Proposal State Machine

```
                    ┌──────────────┐
                    │   Active     │
                    │  (Voting)    │
                    └──────┬───────┘
                           │
                 Voting Period Ends
                           │
                           ▼
                    ┌──────────────┐
             ┌──────│   Expired    │
             │      └──────┬───────┘
             │             │
    Timeout  │   requestTallyDecryption()
    Reached  │             │
             │             ▼
             │      ┌─────────────────────┐
             │      │ DecryptionRequested │
             │      └──────┬──────────────┘
             │             │
             │             ├──────────┬────────────┐
             │             │          │            │
             │   Gateway Callback   Timeout    Manual Trigger
             │             │          │            │
             │             ▼          ▼            ▼
             │      ┌──────────┐  ┌──────────────────┐
             └─────▶│ Refunded │  │    Refunded      │
                    └──────────┘  └──────────────────┘
                           ▲
                           │
                    Gateway Success
                           │
                           ▼
                    ┌──────────────┐
                    │   Resolved   │
                    │ (Final State)│
                    └──────────────┘
```

### State Transitions

| From State | To State | Trigger | Requirements |
|------------|----------|---------|--------------|
| Active | Expired | Automatic | `block.timestamp > deadline` |
| Expired | DecryptionRequested | `requestTallyDecryption()` | Board member |
| DecryptionRequested | Resolved | Gateway callback | Valid proof |
| DecryptionRequested | Refunded | `handleDecryptionTimeout()` | Timeout reached |
| DecryptionRequested | Refunded | `triggerRefund()` | Board member |

---

## Data Flow

### Complete Voting Lifecycle

```
1. Initialization Phase
   ├─ Owner: initializeCompany()
   ├─ Owner: addBoardMember()
   └─ Board: registerShareholder()

2. Proposal Creation
   ├─ Board: createProposal()
   ├─ Contract: Generate obfuscation multiplier
   ├─ Contract: Set deadline & decryption deadline
   └─ Event: ProposalCreated

3. Voting Phase
   ├─ Shareholder: Generate encrypted vote client-side
   ├─ Shareholder: castConfidentialVote()
   ├─ Contract: Verify ZK proof
   ├─ Contract: Homomorphically add to tallies
   ├─ Contract: Record vote (without revealing choice)
   └─ Event: VoteCast

4. Decryption Request Phase
   ├─ Board: requestTallyDecryption()
   ├─ Contract: Change state to DecryptionRequested
   ├─ Contract: Call FHE.requestDecryption()
   └─ Event: DecryptionRequested

5. Gateway Processing Phase
   ├─ Gateway: Detect DecryptionRequested event
   ├─ Gateway: Retrieve encrypted ciphertexts
   ├─ Gateway: Perform threshold decryption
   ├─ Gateway: Generate cryptographic proof
   └─ Gateway: Prepare callback transaction

6. Resolution Phase
   ├─ Gateway: Call resolveTallyCallback()
   ├─ Contract: Verify proof with FHE.checkSignatures()
   ├─ Contract: Decode cleartexts
   ├─ Contract: Remove obfuscation multiplier
   ├─ Contract: Calculate if proposal passed
   ├─ Contract: Change state to Resolved
   └─ Event: ProposalResolved

7. Timeout/Refund Phase (if needed)
   ├─ Anyone: handleDecryptionTimeout() [if timeout reached]
   ├─ OR Board: triggerRefund() [for known failures]
   ├─ Contract: Change state to Refunded
   └─ Event: ProposalRefunded
```

### Data Storage Patterns

**On-Chain Storage:**
- Shareholder registry (address → Shareholder struct)
- Board member registry (address → bool)
- Proposal data (proposalId → Proposal struct)
- Vote records (proposalId → address → VoteRecord)
- Encrypted vote tallies (euint64 ciphertexts)

**Off-Chain Storage (Events):**
- Complete audit trail via events
- Frontend can reconstruct full history
- Indexing services can build queryable databases

---

## Conclusion

This architecture provides:

✅ **Privacy**: FHE ensures vote secrecy
✅ **Security**: Multi-layered access control and validation
✅ **Resilience**: Timeout protection and refund mechanisms
✅ **Transparency**: Complete audit trail via events
✅ **Efficiency**: Gas-optimized HCU management
✅ **Scalability**: Gateway-based async decryption
✅ **Robustness**: Comprehensive error handling

The system balances privacy, security, and usability to create a production-ready corporate governance platform.
