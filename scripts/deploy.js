import { ethers } from "hardhat";
import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("========================================");
  console.log("Corporate Governance Platform Deployment");
  console.log("========================================\n");

  // Get network information
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deployment Configuration:");
  console.log("-------------------------");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deployer Address:", deployer.address);
  console.log("Account Balance:", ethers.formatEther(balance), "ETH\n");

  // Validate balance
  if (balance === 0n) {
    throw new Error("Deployer account has insufficient ETH. Please fund the account.");
  }

  // Deploy the CorporateGovernanceUltimate contract
  console.log("Deploying CorporateGovernanceUltimate contract...");
  const CorporateGovernance = await ethers.getContractFactory("CorporateGovernanceUltimate");
  const governance = await CorporateGovernance.deploy();

  await governance.waitForDeployment();
  const contractAddress = await governance.getAddress();

  console.log("✓ Contract deployed successfully!");
  console.log("Contract Address:", contractAddress);

  // Get deployment transaction details
  const deployTx = governance.deploymentTransaction();
  if (deployTx) {
    console.log("Transaction Hash:", deployTx.hash);
    const receipt = await deployTx.wait();
    console.log("Gas Used:", receipt.gasUsed.toString());
    console.log("Block Number:", receipt.blockNumber);
  }

  // Initialize the company
  console.log("\nInitializing company configuration...");
  const companyName = "Corporate Governance Platform";
  const totalShares = 1000000; // 1 million shares

  const initTx = await governance.initCompany(companyName, totalShares);
  await initTx.wait();

  console.log("✓ Company initialized");
  console.log("Company Name:", companyName);
  console.log("Total Shares:", totalShares.toLocaleString());

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    companyName: companyName,
    totalShares: totalShares,
    deploymentTime: new Date().toISOString(),
    blockNumber: deployTx ? (await deployTx.wait()).blockNumber : 0,
    transactionHash: deployTx ? deployTx.hash : "",
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `deployment-${hre.network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✓ Deployment information saved to:", deploymentFile);

  // Verify contract on Etherscan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations before verification...");
    await deployTx?.wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✓ Contract verified successfully on Etherscan");
    } catch (error) {
      console.log("⚠ Verification failed:", error.message);
      console.log("You can verify manually using: npm run verify:sepolia");
    }
  }

  // Display deployment summary
  console.log("\n========================================");
  console.log("Deployment Summary");
  console.log("========================================");
  console.log("Contract:", "CorporateGovernanceUltimate");
  console.log("Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);

  if (hre.network.name === "sepolia") {
    console.log("\nView on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  }

  console.log("\n========================================");
  console.log("Next Steps");
  console.log("========================================");
  console.log("1. Verify contract (if not done automatically):");
  console.log("   npm run verify:sepolia");
  console.log("\n2. Interact with the deployed contract:");
  console.log("   npm run interact");
  console.log("\n3. Run governance simulation:");
  console.log("   npm run simulate\n");

  return {
    governance,
    contractAddress,
    deploymentInfo,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });