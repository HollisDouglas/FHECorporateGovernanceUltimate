import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("========================================");
  console.log("Gas Usage Benchmark");
  console.log("========================================\n");

  const benchmarks = {
    timestamp: new Date().toISOString(),
    operations: []
  };

  // Deploy contract
  console.log("Deploying contract...");
  const CorporateGovernance = await ethers.getContractFactory("CorporateGovernanceUltimate");
  const governance = await CorporateGovernance.deploy();
  await governance.waitForDeployment();

  const deployTx = governance.deploymentTransaction();
  const deployReceipt = await deployTx.wait();

  benchmarks.operations.push({
    operation: "Contract Deployment",
    gasUsed: deployReceipt.gasUsed.toString(),
    avgGasPrice: deployReceipt.gasPrice?.toString() || "N/A",
    estimatedCost: ethers.formatEther((deployReceipt.gasUsed * (deployReceipt.gasPrice || 0n)).toString()) + " ETH"
  });

  console.log(`✓ Deployment: ${deployReceipt.gasUsed} gas\n`);

  // Initialize company
  console.log("Benchmarking: Initialize Company");
  const initTx = await governance.initCompany("Test Company", 1000000);
  const initReceipt = await initTx.wait();

  benchmarks.operations.push({
    operation: "Initialize Company",
    gasUsed: initReceipt.gasUsed.toString(),
    avgGasPrice: initReceipt.gasPrice?.toString() || "N/A",
    estimatedCost: ethers.formatEther((initReceipt.gasUsed * (initReceipt.gasPrice || 0n)).toString()) + " ETH"
  });

  console.log(`✓ Initialize: ${initReceipt.gasUsed} gas\n`);

  const [owner, board1, shareholder1, shareholder2, shareholder3] = await ethers.getSigners();

  // Add board member
  console.log("Benchmarking: Add Board Member");
  const addBoardTx = await governance.addBoard(board1.address);
  const addBoardReceipt = await addBoardTx.wait();

  benchmarks.operations.push({
    operation: "Add Board Member",
    gasUsed: addBoardReceipt.gasUsed.toString(),
    avgGasPrice: addBoardReceipt.gasPrice?.toString() || "N/A",
    estimatedCost: ethers.formatEther((addBoardReceipt.gasUsed * (addBoardReceipt.gasPrice || 0n)).toString()) + " ETH"
  });

  console.log(`✓ Add Board: ${addBoardReceipt.gasUsed} gas\n`);

  // Add shareholder
  console.log("Benchmarking: Add Shareholder");
  const addShareholderTx = await governance.addShareholder(shareholder1.address, 10000, "Alice Johnson");
  const addShareholderReceipt = await addShareholderTx.wait();

  benchmarks.operations.push({
    operation: "Add Shareholder",
    gasUsed: addShareholderReceipt.gasUsed.toString(),
    avgGasPrice: addShareholderReceipt.gasPrice?.toString() || "N/A",
    estimatedCost: ethers.formatEther((addShareholderReceipt.gasUsed * (addShareholderReceipt.gasPrice || 0n)).toString()) + " ETH"
  });

  console.log(`✓ Add Shareholder: ${addShareholderReceipt.gasUsed} gas\n`);

  // Add more shareholders for voting tests
  await governance.addShareholder(shareholder2.address, 15000, "Bob Smith");
  await governance.addShareholder(shareholder3.address, 20000, "Carol Davis");

  // Create proposal
  console.log("Benchmarking: Create Proposal");
  const createProposalTx = await governance.createProposal(0, "Elect new board member", 7);
  const createProposalReceipt = await createProposalTx.wait();

  benchmarks.operations.push({
    operation: "Create Proposal",
    gasUsed: createProposalReceipt.gasUsed.toString(),
    avgGasPrice: createProposalReceipt.gasPrice?.toString() || "N/A",
    estimatedCost: ethers.formatEther((createProposalReceipt.gasUsed * (createProposalReceipt.gasPrice || 0n)).toString()) + " ETH"
  });

  console.log(`✓ Create Proposal: ${createProposalReceipt.gasUsed} gas\n`);

  // Vote (first shareholder)
  console.log("Benchmarking: Vote (First)");
  const vote1Tx = await governance.connect(shareholder1).vote(1, 1);
  const vote1Receipt = await vote1Tx.wait();

  benchmarks.operations.push({
    operation: "Vote (First Voter)",
    gasUsed: vote1Receipt.gasUsed.toString(),
    avgGasPrice: vote1Receipt.gasPrice?.toString() || "N/A",
    estimatedCost: ethers.formatEther((vote1Receipt.gasUsed * (vote1Receipt.gasPrice || 0n)).toString()) + " ETH"
  });

  console.log(`✓ Vote 1: ${vote1Receipt.gasUsed} gas\n`);

  // Vote (second shareholder)
  console.log("Benchmarking: Vote (Second)");
  const vote2Tx = await governance.connect(shareholder2).vote(1, 1);
  const vote2Receipt = await vote2Tx.wait();

  benchmarks.operations.push({
    operation: "Vote (Second Voter)",
    gasUsed: vote2Receipt.gasUsed.toString(),
    avgGasPrice: vote2Receipt.gasPrice?.toString() || "N/A",
    estimatedCost: ethers.formatEther((vote2Receipt.gasUsed * (vote2Receipt.gasPrice || 0n)).toString()) + " ETH"
  });

  console.log(`✓ Vote 2: ${vote2Receipt.gasUsed} gas\n`);

  // Vote (third shareholder)
  console.log("Benchmarking: Vote (Third)");
  const vote3Tx = await governance.connect(shareholder3).vote(1, 2);
  const vote3Receipt = await vote3Tx.wait();

  benchmarks.operations.push({
    operation: "Vote (Third Voter)",
    gasUsed: vote3Receipt.gasUsed.toString(),
    avgGasPrice: vote3Receipt.gasPrice?.toString() || "N/A",
    estimatedCost: ethers.formatEther((vote3Receipt.gasUsed * (vote3Receipt.gasPrice || 0n)).toString()) + " ETH"
  });

  console.log(`✓ Vote 3: ${vote3Receipt.gasUsed} gas\n`);

  // Fast forward time
  await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine");

  // Finalize proposal
  console.log("Benchmarking: Finalize Proposal");
  const finalizeTx = await governance.finalize(1);
  const finalizeReceipt = await finalizeTx.wait();

  benchmarks.operations.push({
    operation: "Finalize Proposal",
    gasUsed: finalizeReceipt.gasUsed.toString(),
    avgGasPrice: finalizeReceipt.gasPrice?.toString() || "N/A",
    estimatedCost: ethers.formatEther((finalizeReceipt.gasUsed * (finalizeReceipt.gasPrice || 0n)).toString()) + " ETH"
  });

  console.log(`✓ Finalize: ${finalizeReceipt.gasUsed} gas\n`);

  // Get results
  console.log("Benchmarking: Get Results");
  const getResultsTx = await governance.getResults(1);
  // Note: view functions don't have gas costs in the same way

  benchmarks.operations.push({
    operation: "Get Results (View)",
    gasUsed: "N/A (View Function)",
    avgGasPrice: "N/A",
    estimatedCost: "Free"
  });

  console.log(`✓ Get Results: View function (no gas cost)\n`);

  // Calculate totals and averages
  const totalGas = benchmarks.operations
    .filter(op => op.gasUsed !== "N/A (View Function)")
    .reduce((sum, op) => sum + BigInt(op.gasUsed), 0n);

  const avgGas = totalGas / BigInt(benchmarks.operations.length - 1);

  // Print summary
  console.log("========================================");
  console.log("Gas Benchmark Summary");
  console.log("========================================\n");

  benchmarks.operations.forEach(op => {
    console.log(`${op.operation}:`);
    console.log(`  Gas Used: ${op.gasUsed}`);
    if (op.estimatedCost !== "Free") {
      console.log(`  Est. Cost: ${op.estimatedCost}`);
    }
    console.log();
  });

  console.log("========================================");
  console.log(`Total Gas Used: ${totalGas}`);
  console.log(`Average Gas per Operation: ${avgGas}`);
  console.log("========================================\n");

  // Gas efficiency assessment
  console.log("Gas Efficiency Assessment:");
  benchmarks.operations.forEach(op => {
    if (op.gasUsed !== "N/A (View Function)") {
      const gas = BigInt(op.gasUsed);
      let rating = "";

      if (gas < 50000n) {
        rating = "✅ Excellent";
      } else if (gas < 100000n) {
        rating = "✅ Good";
      } else if (gas < 150000n) {
        rating = "⚠️  Acceptable";
      } else {
        rating = "❌ Needs Optimization";
      }

      console.log(`  ${op.operation}: ${rating}`);
    }
  });

  // Save benchmark results
  const reportsDir = path.join(__dirname, "..", "gas-reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const reportFile = path.join(reportsDir, `gas-benchmark-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(benchmarks, null, 2));

  console.log(`\n📄 Benchmark report saved to: ${reportFile}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Benchmark failed:");
    console.error(error);
    process.exit(1);
  });
