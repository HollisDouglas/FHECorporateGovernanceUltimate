import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("========================================");
  console.log("Corporate Governance Simulation");
  console.log("========================================\n");

  console.log("Network:", hre.network.name);
  console.log();

  // Deploy contract for simulation
  console.log("=== Deploying Contract ===");
  const CorporateGovernance = await ethers.getContractFactory("CorporateGovernanceUltimate");
  const governance = await CorporateGovernance.deploy();
  await governance.waitForDeployment();

  const contractAddress = await governance.getAddress();
  console.log("✓ Contract deployed at:", contractAddress);
  console.log();

  // Initialize company
  console.log("=== Initializing Company ===");
  const companyName = "Tech Innovations Corp";
  const totalShares = 100000;

  const initTx = await governance.initCompany(companyName, totalShares);
  await initTx.wait();
  console.log("✓ Company initialized");
  console.log("Name:", companyName);
  console.log("Total Shares:", totalShares);
  console.log();

  // Get test accounts
  const [deployer, board1, board2, shareholder1, shareholder2, shareholder3, shareholder4] =
    await ethers.getSigners();

  // Add board members
  console.log("=== Adding Board Members ===");
  const addBoard1 = await governance.addBoard(board1.address);
  await addBoard1.wait();
  console.log("✓ Added board member:", board1.address);

  const addBoard2 = await governance.addBoard(board2.address);
  await addBoard2.wait();
  console.log("✓ Added board member:", board2.address);
  console.log();

  // Register shareholders
  console.log("=== Registering Shareholders ===");

  const shareholders = [
    { address: shareholder1.address, shares: 25000, name: "Alice Johnson" },
    { address: shareholder2.address, shares: 20000, name: "Bob Smith" },
    { address: shareholder3.address, shares: 30000, name: "Carol Davis" },
    { address: shareholder4.address, shares: 15000, name: "David Wilson" },
  ];

  for (const sh of shareholders) {
    const tx = await governance.addShareholder(sh.address, sh.shares, sh.name);
    await tx.wait();
    console.log(`✓ Registered: ${sh.name} - ${sh.shares} shares`);
  }
  console.log();

  // Create proposals
  console.log("=== Creating Proposals ===");

  const proposals = [
    { type: 0, title: "Elect new technology board member", days: 7 },
    { type: 1, title: "Approve Q4 budget of $5M", days: 5 },
    { type: 2, title: "Merger with Innovation Labs Inc", days: 14 },
    { type: 3, title: "Distribute dividends of $2 per share", days: 7 },
  ];

  for (const prop of proposals) {
    const tx = await governance.connect(board1).createProposal(prop.type, prop.title, prop.days);
    await tx.wait();
    console.log(`✓ Created: ${prop.title}`);
  }

  const totalProposals = await governance.getTotalProposals();
  console.log(`\nTotal Proposals: ${totalProposals}`);
  console.log();

  // Simulate voting on proposals
  console.log("=== Simulating Voting ===");

  // Proposal 1: Board Election - All vote FOR
  console.log("\nProposal 1: Board Election");
  for (let i = 0; i < 4; i++) {
    const voter = [shareholder1, shareholder2, shareholder3, shareholder4][i];
    const tx = await governance.connect(voter).vote(1, 1); // Vote FOR
    await tx.wait();
    console.log(`✓ ${shareholders[i].name} voted FOR`);
  }

  // Proposal 2: Budget Approval - Mixed votes
  console.log("\nProposal 2: Budget Approval");
  await (await governance.connect(shareholder1).vote(2, 1)).wait(); // FOR
  console.log(`✓ ${shareholders[0].name} voted FOR`);

  await (await governance.connect(shareholder2).vote(2, 1)).wait(); // FOR
  console.log(`✓ ${shareholders[1].name} voted FOR`);

  await (await governance.connect(shareholder3).vote(2, 2)).wait(); // AGAINST
  console.log(`✓ ${shareholders[2].name} voted AGAINST`);

  await (await governance.connect(shareholder4).vote(2, 1)).wait(); // FOR
  console.log(`✓ ${shareholders[3].name} voted FOR`);

  // Proposal 3: Merger - Some vote, some abstain
  console.log("\nProposal 3: Merger (75% threshold required)");
  await (await governance.connect(shareholder1).vote(3, 1)).wait(); // FOR
  console.log(`✓ ${shareholders[0].name} voted FOR`);

  await (await governance.connect(shareholder2).vote(3, 2)).wait(); // AGAINST
  console.log(`✓ ${shareholders[1].name} voted AGAINST`);

  await (await governance.connect(shareholder3).vote(3, 1)).wait(); // FOR
  console.log(`✓ ${shareholders[2].name} voted FOR`);

  // shareholder4 abstains
  console.log(`  ${shareholders[3].name} abstained`);

  // Proposal 4: Dividends - All vote FOR
  console.log("\nProposal 4: Dividend Distribution");
  for (let i = 0; i < 4; i++) {
    const voter = [shareholder1, shareholder2, shareholder3, shareholder4][i];
    const tx = await governance.connect(voter).vote(4, 1); // Vote FOR
    await tx.wait();
    console.log(`✓ ${shareholders[i].name} voted FOR`);
  }

  console.log();

  // Display voting statistics
  console.log("=== Voting Statistics ===");
  for (let i = 1; i <= 4; i++) {
    const proposalInfo = await governance.getProposalInfo(i);
    console.log(`\nProposal ${i}: ${proposalInfo[2]}`);
    console.log(`- Type: ${["BOARD", "BUDGET", "MERGER", "DIVIDEND", "BYLAW", "STRATEGIC"][proposalInfo[1]]}`);
    console.log(`- Proposer: ${proposalInfo[4]}`);
    console.log(`- Threshold: ${proposalInfo[10]}%`);
    console.log(`- Active: ${proposalInfo[7]}`);

    // Check who voted
    let votedCount = 0;
    for (const sh of shareholders) {
      const hasVoted = await governance.hasVotedOn(i, sh.address);
      if (hasVoted) votedCount++;
    }
    console.log(`- Participation: ${votedCount}/${shareholders.length} shareholders`);
  }

  console.log("\n========================================");
  console.log("Simulation Summary");
  console.log("========================================");
  console.log("Contract Address:", contractAddress);
  console.log("Company Name:", companyName);
  console.log("Total Shares:", totalShares);
  console.log("Board Members:", 3); // deployer + board1 + board2
  console.log("Shareholders:", shareholders.length);
  console.log("Proposals Created:", totalProposals.toString());
  console.log("Votes Cast:", "14 votes across 4 proposals");
  console.log();

  console.log("Note: To finalize proposals and see results:");
  console.log("1. Wait for voting period to end (or fast-forward time in local network)");
  console.log("2. Call governance.finalize(proposalId)");
  console.log("3. Call governance.getResults(proposalId) to see if proposal passed");
  console.log();

  console.log("========================================");
  console.log("Simulation Complete");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nSimulation failed:");
    console.error(error);
    process.exit(1);
  });
