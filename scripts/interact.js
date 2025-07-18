import { ethers } from "hardhat";
import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("========================================");
  console.log("Contract Interaction Script");
  console.log("========================================\n");

  // Get signers
  const [deployer, shareholder1, shareholder2] = await ethers.getSigners();

  // Load deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const files = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith(`deployment-${hre.network.name}`))
    .sort()
    .reverse();

  if (files.length === 0) {
    throw new Error("No deployment found. Please deploy the contract first.");
  }

  const deploymentPath = path.join(deploymentsDir, files[0]);
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  console.log("Loading deployed contract...");
  console.log("Network:", deploymentInfo.network);
  console.log("Contract Address:", deploymentInfo.contractAddress);
  console.log();

  // Get contract instance
  const CorporateGovernance = await ethers.getContractFactory("CorporateGovernanceUltimate");
  const governance = CorporateGovernance.attach(deploymentInfo.contractAddress);

  // Check company info
  console.log("=== Company Information ===");
  const companyInfo = await governance.getCompanyInfo();
  console.log("Company Name:", companyInfo[0]);
  console.log("Total Shares:", companyInfo[3].toString());
  console.log("Board Members:", companyInfo[5].length);
  console.log();

  // Register shareholders
  console.log("=== Registering Shareholders ===");

  const registerTx1 = await governance.addShareholder(
    shareholder1.address,
    10000,
    "Alice Johnson"
  );
  await registerTx1.wait();
  console.log("✓ Registered shareholder:", shareholder1.address);

  const registerTx2 = await governance.addShareholder(
    shareholder2.address,
    15000,
    "Bob Smith"
  );
  await registerTx2.wait();
  console.log("✓ Registered shareholder:", shareholder2.address);
  console.log();

  // Create a proposal
  console.log("=== Creating Proposal ===");
  const proposalTx = await governance.createProposal(
    0, // ProposalType.BOARD
    "Elect new board member for technology committee",
    7 // 7 days voting period
  );
  await proposalTx.wait();
  console.log("✓ Proposal created successfully");

  const totalProposals = await governance.getTotalProposals();
  console.log("Total Proposals:", totalProposals.toString());
  console.log();

  // Get proposal details
  console.log("=== Proposal Details ===");
  const proposalInfo = await governance.getProposalInfo(1);
  console.log("Proposal ID:", proposalInfo[0].toString());
  console.log("Type:", proposalInfo[1].toString());
  console.log("Title:", proposalInfo[2]);
  console.log("Proposer:", proposalInfo[4]);
  console.log("Deadline:", new Date(Number(proposalInfo[6]) * 1000).toLocaleString());
  console.log("Active:", proposalInfo[7]);
  console.log();

  // Cast votes
  console.log("=== Casting Votes ===");

  const voteTx1 = await governance.connect(shareholder1).vote(1, 1); // Vote FOR
  await voteTx1.wait();
  console.log("✓ Shareholder 1 voted FOR");

  const voteTx2 = await governance.connect(shareholder2).vote(1, 1); // Vote FOR
  await voteTx2.wait();
  console.log("✓ Shareholder 2 voted FOR");
  console.log();

  // Check voting status
  console.log("=== Voting Status ===");
  const hasVoted1 = await governance.hasVotedOn(1, shareholder1.address);
  const hasVoted2 = await governance.hasVotedOn(1, shareholder2.address);
  console.log("Shareholder 1 has voted:", hasVoted1);
  console.log("Shareholder 2 has voted:", hasVoted2);
  console.log();

  console.log("=== Shareholder Information ===");
  const shareholderInfo1 = await governance.getShareholderInfo(shareholder1.address);
  const shareholderInfo2 = await governance.getShareholderInfo(shareholder2.address);
  console.log("Shareholder 1:", shareholderInfo1[3], "- Shares:", shareholderInfo1[1].toString());
  console.log("Shareholder 2:", shareholderInfo2[3], "- Shares:", shareholderInfo2[1].toString());
  console.log();

  console.log("========================================");
  console.log("Interaction Complete");
  console.log("========================================");
  console.log("\nNext Steps:");
  console.log("- Wait for voting period to end");
  console.log("- Run: governance.finalize(1) to close the proposal");
  console.log("- Run: governance.getResults(1) to see voting results");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Interaction script failed:", error);
    process.exit(1);
  });