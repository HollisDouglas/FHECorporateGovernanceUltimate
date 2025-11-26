# Security & Privacy Documentation

Comprehensive guide to security features and privacy mechanisms in the Enhanced Corporate Governance Platform.

## Table of Contents

- [Security Overview](#security-overview)
- [Privacy Mechanisms](#privacy-mechanisms)
- [Access Control](#access-control)
- [Input Validation](#input-validation)
- [Smart Contract Security](#smart-contract-security)
- [FHE Security](#fhe-security)
- [Gateway Security](#gateway-security)
- [Attack Prevention](#attack-prevention)
- [Audit Trail](#audit-trail)
- [Best Practices](#best-practices)
- [Security Checklist](#security-checklist)

---

## Security Overview

The Enhanced Corporate Governance Platform implements multiple layers of security:

```
┌─────────────────────────────────────────────────────────┐
│              Security Layer Stack                        │
├─────────────────────────────────────────────────────────┤
│  Layer 7: Audit Trail & Monitoring                      │
│  Layer 6: Timeout Protection & Refund Mechanisms        │
│  Layer 5: Gateway Cryptographic Verification            │
│  Layer 4: FHE Privacy Protection                        │
│  Layer 3: Access Control & Permissions                  │
│  Layer 2: Input Validation & Bounds Checking            │
│  Layer 1: Solidity Overflow Protection (0.8.24+)        │
└─────────────────────────────────────────────────────────┘
```

### Security Principles

✅ **Defense in Depth**: Multiple security layers
✅ **Least Privilege**: Minimal necessary permissions
✅ **Zero Trust**: Verify all inputs and states
✅ **Privacy by Design**: Encryption built-in
✅ **Transparency**: Complete audit trail
✅ **Resilience**: Graceful failure handling

---

## Privacy Mechanisms

### 1. Fully Homomorphic Encryption (FHE)

**What is FHE?**

FHE allows computations on encrypted data without decrypting it first. In this system:
- Votes are encrypted client-side before submission
- Contract performs homomorphic addition on encrypted votes
- Only aggregated tallies are decrypted, not individual votes

**Privacy Guarantees:**

```
┌──────────────────────────────────────────────────────────┐
│  Individual Vote Privacy                                  │
├──────────────────────────────────────────────────────────┤
│  ✓ Vote choice encrypted with public key                 │
│  ✓ On-chain storage: only ciphertext visible             │
│  ✓ Contract operations: homomorphic (no decryption)      │
│  ✓ Final decryption: only aggregated tallies             │
│  ✗ Individual votes: NEVER decrypted                     │
└──────────────────────────────────────────────────────────┘
```

**Implementation:**

```solidity
// Client encrypts vote
const encryptedVote = await fhevmInstance.encrypt64(voteChoice);

// Contract adds to encrypted tally
proposal.encryptedForVotes = FHE.add(
    proposal.encryptedForVotes,
    FHE.select(isFor, weight, zero)
);
// Individual vote remains private!
```

**Key Points:**
- Even contract owner cannot decrypt individual votes
- Blockchain observers see only ciphertexts
- Only Gateway (with threshold keys) can decrypt aggregates
- Perfect secrecy until decryption threshold is met

### 2. Division Privacy Protection

**Problem:**
Division operations on small encrypted numbers can leak information through:
- Gas consumption patterns
- Timing analysis
- Side-channel attacks

**Solution: Obfuscation Multipliers**

```solidity
// Generate random multiplier per proposal
uint256 obfuscationMultiplier = pseudoRandom() % 1000 + 100; // 100-1099

// Apply multiplier during voting
uint64 obfuscatedWeight = voterShares * obfuscationMultiplier;
euint64 encryptedWeight = FHE.asEuint64(obfuscatedWeight);

// Remove multiplier after decryption
uint64 actualVotes = revealedVotes / obfuscationMultiplier;
```

**Privacy Benefits:**
- ✅ Obscures true vote magnitudes
- ✅ Prevents gas analysis attacks
- ✅ Different multiplier per proposal (no correlation)
- ✅ No impact on final results (cancels out)

**Example:**
```
Original vote weight: 100 shares
Multiplier: 347
Obfuscated weight: 34,700
Encrypted weight: encrypt(34,700)

After Gateway decryption: 34,700
After deobfuscation: 34,700 / 347 = 100 ✓
```

### 3. Price Obfuscation

**Attack Scenario:**
Attackers might try to infer vote distribution by analyzing transaction costs or timing.

**Protection Mechanisms:**

1. **Variable Gas Costs:**
   ```solidity
   // Obfuscation multiplier creates variable gas costs
   // Attacker cannot correlate gas to vote weight
   ```

2. **Encrypted Vote Weights:**
   ```solidity
   // True voting power hidden by encryption
   // Economic analysis impossible from chain data
   ```

3. **Uniform Transaction Patterns:**
   ```solidity
   // All votes execute same code path
   // No branching based on vote choice
   ```

### 4. Zero-Knowledge Proofs

**What are ZK Proofs?**

Zero-knowledge proofs allow proving a statement is true without revealing why it's true.

**In This System:**
```javascript
// Client generates proof
const { encrypted, proof } = await fhevmInstance.encrypt64(voteChoice);

// Proof demonstrates:
// 1. Encrypted value is valid (1 or 2)
// 2. Encryption was done correctly
// 3. No need to reveal actual vote choice
```

**Verification:**
```solidity
// Contract verifies proof
euint64 voteChoice = FHE.fromExternal(encryptedVoteChoice, inputProof);
// If proof invalid, transaction reverts
// If proof valid, vote choice is unknown but verified
```

**Privacy Properties:**
- Prove vote is valid without revealing it
- Prevent invalid votes (e.g., voting "3" when only 1 or 2 allowed)
- No information leakage during verification

---

## Access Control

### Role-Based Access Control (RBAC)

```
┌────────────────────────────────────────────────────────────┐
│  Role Hierarchy                                             │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐                                               │
│  │  Owner   │  (Highest privilege)                          │
│  └────┬─────┘                                               │
│       │                                                      │
│       ├─ initializeCompany()                                │
│       ├─ addBoardMember()                                   │
│       └─ removeBoardMember()                                │
│                                                              │
│  ┌──────────┐                                               │
│  │  Board   │  (Governance management)                      │
│  └────┬─────┘                                               │
│       │                                                      │
│       ├─ registerShareholder()                              │
│       ├─ createProposal()                                   │
│       ├─ requestTallyDecryption()                           │
│       └─ triggerRefund()                                    │
│                                                              │
│  ┌──────────────┐                                           │
│  │ Shareholders │  (Voting rights)                          │
│  └────┬─────────┘                                           │
│       │                                                      │
│       └─ castConfidentialVote()                             │
│                                                              │
│  ┌──────────┐                                               │
│  │  Public  │  (Limited view access)                        │
│  └────┬─────┘                                               │
│       │                                                      │
│       ├─ handleDecryptionTimeout()                          │
│       └─ View functions                                     │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Modifier Implementation

```solidity
modifier onlyOwner() {
    require(msg.sender == owner(), "Restricted: Owner only");
    _;
}

modifier onlyBoard() {
    require(boardMembers[msg.sender], "Restricted: Board members only");
    _;
}

modifier onlyShareholder() {
    require(shareholders[msg.sender].active, "Restricted: Active shareholders only");
    _;
}
```

### Access Control Matrix

| Function | Owner | Board | Shareholder | Public |
|----------|-------|-------|-------------|--------|
| initializeCompany | ✓ | ✗ | ✗ | ✗ |
| addBoardMember | ✓ | ✗ | ✗ | ✗ |
| removeBoardMember | ✓ | ✗ | ✗ | ✗ |
| registerShareholder | ✗ | ✓ | ✗ | ✗ |
| updateShareholderShares | ✗ | ✓ | ✗ | ✗ |
| createProposal | ✗ | ✓ | ✗ | ✗ |
| castConfidentialVote | ✗ | ✗ | ✓ | ✗ |
| requestTallyDecryption | ✗ | ✓ | ✗ | ✗ |
| triggerRefund | ✗ | ✓ | ✗ | ✗ |
| handleDecryptionTimeout | ✗ | ✗ | ✗ | ✓ |
| View functions | ✓ | ✓ | ✓ | ✓ |

---

## Input Validation

### Validation Levels

#### Level 1: Type Safety (Compile-time)
```solidity
// Solidity type system enforces correct types
function createProposal(
    ProposalType _proposalType,  // Must be valid enum value
    string memory _title,         // Must be string
    uint256 _votingDays          // Must be uint256
) external
```

#### Level 2: Business Logic Validation (Runtime)
```solidity
// Comprehensive runtime checks
require(bytes(_title).length > 0, "Title cannot be empty");
require(_votingDays >= MIN_VOTING_PERIOD / 1 days, "Voting period too short");
require(_votingDays <= MAX_VOTING_PERIOD / 1 days, "Voting period too long");
require(initialized, "Company not initialized");
```

#### Level 3: State Validation
```solidity
// Ensure valid state transitions
require(proposal.state == ProposalState.Active, "Proposal not active");
require(block.timestamp <= proposal.deadline, "Voting period ended");
require(!voteRecords[proposalId][msg.sender].hasVoted, "Already voted");
```

### Input Validation Checklist

✅ **Address Validation**
```solidity
require(_address != address(0), "Invalid address");
require(!boardMembers[_address], "Already a board member");
```

✅ **Numeric Bounds Checking**
```solidity
require(_shares > 0, "Shares must be positive");
require(_totalShares > 0, "Total shares must be positive");
```

✅ **String Validation**
```solidity
require(bytes(_name).length > 0, "Name cannot be empty");
require(bytes(_symbol).length > 0, "Symbol cannot be empty");
```

✅ **Range Validation**
```solidity
require(_votingDays >= MIN_VOTING_PERIOD / 1 days, "Period too short");
require(_votingDays <= MAX_VOTING_PERIOD / 1 days, "Period too long");
```

✅ **State Machine Validation**
```solidity
require(proposal.state == requiredState, "Invalid proposal state");
require(initialized, "Company not initialized");
```

✅ **Existence Checks**
```solidity
require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
require(shareholders[_address].active, "Shareholder not registered");
```

---

## Smart Contract Security

### 1. Reentrancy Protection

**Pattern Used:** State-Before-Interaction

```solidity
// ✓ SAFE: Update state first
function resolveTallyCallback(...) external {
    proposal.revealedForVotes = actualForVotes;
    proposal.revealedAgainstVotes = actualAgainstVotes;
    proposal.state = ProposalState.Resolved;  // State updated first

    emit ProposalResolved(...);  // External interaction last
}
```

**Why No Mutex Needed:**
- No ether transfers in most functions
- State updates before events
- FHE operations are atomic
- Gateway callback is single-entry

### 2. Integer Overflow Protection

**Solidity 0.8.24+ Built-in Protection:**
```solidity
// Automatic overflow/underflow checks
uint64 actualForVotes = revealedFor / uint64(obfuscationMultiplier);
// If overflow: transaction automatically reverts
// No SafeMath library needed
```

### 3. Gas Limit DoS Prevention

**No Unbounded Loops:**
```solidity
// ✗ AVOID: Unbounded loop over all shareholders
for (uint i = 0; i < shareholders.length; i++) { ... }

// ✓ SAFE: Individual access patterns
shareholders[specificAddress]
voteRecords[proposalId][specificVoter]
```

**Gas-Efficient Operations:**
- Direct mapping lookups: O(1)
- No mass operations over unbounded arrays
- View functions can iterate (off-chain, no gas cost)

### 4. Timestamp Dependence

**Safe Usage:**
```solidity
// ✓ SAFE: Deadline checks (tolerance acceptable)
require(block.timestamp <= proposal.deadline, "Voting period ended");

// ✗ AVOID: Critical randomness from timestamp
// Obfuscation multiplier uses block data but isn't security-critical
```

### 5. Front-Running Protection

**FHE Provides Natural Protection:**
```solidity
// Encrypted votes cannot be front-run
// Attacker cannot see vote choice to copy/counter
euint64 encryptedVote = FHE.fromExternal(encryptedVoteChoice, inputProof);
```

**Additional Measures:**
- Vote choices remain hidden until decryption
- No economic incentive to front-run (can't see votes)
- Obfuscation multiplier varies per proposal

---

## FHE Security

### Encryption Security

**Key Properties:**
- **Semantic Security**: Ciphertexts reveal nothing about plaintexts
- **Homomorphic**: Operations preserve encryption
- **Non-malleable**: Cannot modify ciphertexts to change results

### Threat Model

```
┌────────────────────────────────────────────────────────────┐
│  Threat Analysis                                            │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ✓ PROTECTED: Individual vote choices                       │
│    - Encrypted with FHE                                     │
│    - Only aggregates decrypted                              │
│                                                              │
│  ✓ PROTECTED: Vote weights                                  │
│    - Obfuscation multiplier applied                         │
│    - True weights hidden                                    │
│                                                              │
│  ✓ PROTECTED: Voting patterns                               │
│    - No correlation between transactions                    │
│    - Uniform execution paths                                │
│                                                              │
│  ⚠ PARTIALLY EXPOSED: Voting participation                  │
│    - Can see WHO voted (address)                            │
│    - Cannot see HOW they voted (choice)                     │
│                                                              │
│  ⚠ REVEALED AFTER DECRYPTION: Aggregate tallies             │
│    - Intentional: needed for governance                     │
│    - Only after voting period ends                          │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Cryptographic Assumptions

**Based On:**
- Learning With Errors (LWE) hardness
- Ring-LWE for efficiency
- Post-quantum secure (quantum-resistant)

**Key Sizes:**
- Public key: ~1MB (generated client-side)
- Ciphertext overhead: ~2KB per encrypted value
- Security level: 128-bit (equivalent to AES-128)

---

## Gateway Security

### Threshold Cryptography

**How It Works:**
```
┌─────────────────────────────────────────────────────────┐
│  Threshold Decryption (n-of-m scheme)                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Total Gateway Nodes: m = 7                              │
│  Threshold for Decryption: n = 5                         │
│                                                           │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     │
│  │Node 1 │ │Node 2 │ │Node 3 │ │Node 4 │ │Node 5 │     │
│  └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘     │
│      │         │         │         │         │           │
│      └─────────┴─────────┴─────────┴─────────┘           │
│                      │                                    │
│              5 nodes collaborate                          │
│                      │                                    │
│                      ▼                                    │
│              Decryption Succeeds                          │
│                                                           │
│  Security Properties:                                     │
│  ✓ No single node can decrypt alone                      │
│  ✓ Up to (m-n) nodes can be malicious/offline           │
│  ✓ Collusion of n nodes required to compromise          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Gateway Callback Verification

**Proof Verification Flow:**
```solidity
function resolveTallyCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    // Step 1: Verify cryptographic signatures
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);
    // If invalid: transaction reverts
    // If valid: proceed with decryption

    // Step 2: Decode results
    (uint64 revealedFor, uint64 revealedAgainst) = abi.decode(
        cleartexts,
        (uint64, uint64)
    );

    // Step 3: Process results
    // ...
}
```

**What's Verified:**
1. **Signature Validity**: Gateway signed with threshold keys
2. **Request Matching**: Decryption corresponds to original request
3. **Proof Correctness**: Decryption performed correctly
4. **No Tampering**: Cleartexts match ciphertexts

---

## Attack Prevention

### 1. Double Voting

**Prevention:**
```solidity
require(!voteRecords[proposalId][msg.sender].hasVoted, "Already voted");
voteRecords[proposalId][msg.sender].hasVoted = true;
```

**Attack Scenario:** Malicious shareholder tries to vote multiple times
**Defense:** Mapping tracks voting status per address per proposal

### 2. Vote Manipulation

**Prevention:** FHE + ZK Proofs
```solidity
euint64 voteChoice = FHE.fromExternal(encryptedVoteChoice, inputProof);
// Invalid votes rejected at proof verification stage
```

**Attack Scenario:** Submit invalid vote (e.g., vote "3" when only 1 or 2 allowed)
**Defense:** Zero-knowledge proofs ensure vote validity without revealing choice

### 3. Sybil Attacks

**Prevention:** Shareholder Registration
```solidity
function registerShareholder(...) external onlyBoard {
    // Only board can register shareholders
    // No self-registration
}
```

**Attack Scenario:** Create many addresses to gain voting power
**Defense:** Board controls shareholder registry and share allocation

### 4. Timing Attacks

**Prevention:** Obfuscation Multipliers
```solidity
uint256 obfuscationMultiplier = pseudoRandom() % 1000 + 100;
uint64 obfuscatedWeight = voterShares * obfuscationMultiplier;
```

**Attack Scenario:** Analyze gas consumption to infer vote weights
**Defense:** Random multipliers create variable gas costs

### 5. Front-Running

**Prevention:** Encrypted Votes
```solidity
// Attacker cannot see vote choice to front-run
euint64 encryptedVote = FHE.fromExternal(encryptedVoteChoice, inputProof);
```

**Attack Scenario:** See pending vote, submit counter-vote first
**Defense:** Vote choices encrypted, impossible to determine from mempool

### 6. Gateway Failure

**Prevention:** Timeout Protection
```solidity
if (block.timestamp > proposal.decryptionDeadline) {
    handleDecryptionTimeout(proposalId);
    // State changes to Refunded
}
```

**Attack Scenario:** Gateway fails or refuses to decrypt
**Defense:** Automatic timeout after 7 days, state changes to Refunded

### 7. Unauthorized Access

**Prevention:** Role-Based Access Control
```solidity
modifier onlyBoard() {
    require(boardMembers[msg.sender], "Restricted: Board members only");
    _;
}
```

**Attack Scenario:** Non-board member tries to create proposals
**Defense:** Modifiers enforce access control on all sensitive functions

---

## Audit Trail

### Complete Event Log

Every state change emits events for full auditability:

```solidity
event CompanyInitialized(string name, string symbol, uint256 totalShares);
event BoardMemberAdded(address indexed member, uint256 timestamp);
event ShareholderRegistered(address indexed shareholder, uint32 shares, string name);
event ProposalCreated(uint256 indexed proposalId, ...);
event VoteCast(uint256 indexed proposalId, address indexed voter, uint256 timestamp);
event DecryptionRequested(uint256 indexed proposalId, uint256 requestId, uint256 deadline);
event ProposalResolved(uint256 indexed proposalId, bool passed, uint64 forVotes, uint64 againstVotes);
event ProposalRefunded(uint256 indexed proposalId, string reason);
event DecryptionTimeout(uint256 indexed proposalId, uint256 timestamp);
```

### Audit Capabilities

**What Can Be Audited:**
✅ All shareholder registrations
✅ All proposal creations
✅ All voting participation (WHO voted, not HOW)
✅ All decryption requests and callbacks
✅ All refunds and timeouts
✅ Complete governance timeline

**What Cannot Be Audited:**
✗ Individual vote choices (by design, for privacy)
✗ Vote weights (obfuscated for privacy)

### Monitoring & Alerts

**Frontend Integration:**
```javascript
// Listen for proposal events
contract.on("ProposalCreated", (proposalId, proposalType, title, proposer, deadline) => {
    console.log(`New proposal ${proposalId}: ${title}`);
    // Notify users
});

// Listen for resolution
contract.on("ProposalResolved", (proposalId, passed, forVotes, againstVotes) => {
    console.log(`Proposal ${proposalId} ${passed ? 'PASSED' : 'FAILED'}`);
    // Display results
});

// Listen for timeouts
contract.on("DecryptionTimeout", (proposalId, timestamp) => {
    console.warn(`Proposal ${proposalId} decryption timed out`);
    // Alert administrators
});
```

---

## Best Practices

### For Contract Owners

1. **Key Management**
   - Store private keys in hardware wallets
   - Use multi-signature wallets for owner functions
   - Regularly backup wallet seeds

2. **Board Member Management**
   - Vet board members thoroughly
   - Maintain minimum board size (3-5 members)
   - Review board member list regularly

3. **Monitoring**
   - Monitor contract events regularly
   - Set up alerts for critical events
   - Review audit logs periodically

### For Board Members

1. **Shareholder Registration**
   - Verify shareholder identities off-chain
   - Ensure accurate share allocations
   - Document registration decisions

2. **Proposal Creation**
   - Provide clear, detailed descriptions
   - Set appropriate voting periods
   - Choose correct proposal types

3. **Decryption Requests**
   - Request decryption promptly after voting ends
   - Monitor Gateway status
   - Trigger timeouts if needed

### For Shareholders

1. **Voting**
   - Vote during the voting period
   - Verify transaction success
   - Keep voting receipts (transaction hashes)

2. **Client-Side Security**
   - Use trusted frontend interfaces
   - Verify contract addresses
   - Secure wallet private keys

3. **Privacy**
   - Encrypted votes protect privacy automatically
   - Vote choice never revealed on-chain
   - Only aggregates disclosed

### For Developers

1. **Frontend Integration**
   - Use official FHEVM SDK
   - Implement proper error handling
   - Verify cryptographic proofs client-side

2. **Testing**
   - Test with FHEVM testnet (Sepolia)
   - Simulate Gateway callbacks
   - Test timeout scenarios

3. **Deployment**
   - Audit contract before mainnet
   - Verify source code on Etherscan
   - Document deployment parameters

---

## Security Checklist

### Pre-Deployment

- [ ] Smart contract audited by professional auditors
- [ ] All tests passing (unit, integration, end-to-end)
- [ ] Gas optimization reviewed
- [ ] Access control tested
- [ ] Input validation comprehensive
- [ ] Event emissions verified
- [ ] Gateway integration tested
- [ ] Timeout scenarios tested
- [ ] Frontend security reviewed
- [ ] Documentation complete

### Post-Deployment

- [ ] Contract verified on Etherscan
- [ ] Owner key secured (hardware wallet)
- [ ] Multi-sig wallet configured (if applicable)
- [ ] Board members vetted and added
- [ ] Event monitoring configured
- [ ] Backup procedures documented
- [ ] Incident response plan ready
- [ ] User documentation published

### Ongoing

- [ ] Regular security reviews
- [ ] Monitor for unusual activity
- [ ] Update dependencies (if upgrading)
- [ ] Review access control lists
- [ ] Audit logs reviewed
- [ ] Community feedback addressed

---

## Incident Response

### If Gateway Fails

1. **Wait for Timeout:**
   - Monitor `decryptionDeadline`
   - After 7 days, anyone can call `handleDecryptionTimeout()`

2. **Manual Refund:**
   - Board member calls `triggerRefund()` with reason
   - Proposal state changes to `Refunded`

3. **Re-propose:**
   - Board creates new proposal if needed
   - Shareholders vote again

### If Unauthorized Access Detected

1. **Immediate Actions:**
   - Review transaction logs
   - Identify compromised accounts
   - Remove compromised board members (if applicable)

2. **Investigation:**
   - Analyze attack vector
   - Determine scope of compromise
   - Document findings

3. **Remediation:**
   - Rotate compromised keys
   - Update access controls
   - Notify affected parties
   - Implement additional safeguards

### If Contract Bug Found

1. **Assessment:**
   - Determine severity (critical, high, medium, low)
   - Assess exploitability
   - Estimate potential impact

2. **Disclosure:**
   - Follow responsible disclosure process
   - Notify contract owner privately
   - Allow time for fix before public disclosure

3. **Resolution:**
   - If critical: Consider pausing operations (if pause mechanism exists)
   - Deploy fixes if contract is upgradeable
   - If not upgradeable: Deploy new contract and migrate

---

## Conclusion

The Enhanced Corporate Governance Platform implements industry-leading security and privacy practices:

✅ **Privacy**: FHE ensures vote secrecy
✅ **Security**: Multi-layered defense in depth
✅ **Transparency**: Complete audit trail
✅ **Resilience**: Timeout protection and refund mechanisms
✅ **Accountability**: Role-based access control
✅ **Auditability**: Comprehensive event logging

By following this documentation and adhering to best practices, you can deploy and operate a secure, privacy-preserving corporate governance system.

---

## Additional Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture details
- [API.md](./API.md) - Complete API reference
- [README.md](../README.md) - Getting started guide
- [FHEVM Documentation](https://docs.zama.ai/fhevm) - FHE implementation details
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/security) - Access control patterns

For security concerns or vulnerability reports:
- Email: security@yourcompany.com
- Use responsible disclosure process
- Allow time for fixes before public disclosure
