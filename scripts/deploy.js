import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("Starting SimpleVoting deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy FHELib first
  console.log("\nDeploying FHELib contract...");
  const FHELib = await ethers.getContractFactory("FHELib");
  const fheLib = await FHELib.deploy();
  
  await fheLib.waitForDeployment();
  const fheLibAddress = await fheLib.getAddress();
  
  console.log("FHELib deployed to:", fheLibAddress);

  // Deploy SimpleVoting contract
  console.log("\nDeploying SimpleVoting contract...");
  const ConfidentialVoting = await ethers.getContractFactory("SimpleVoting");
  const confidentialVoting = await ConfidentialVoting.deploy();
  
  await confidentialVoting.waitForDeployment();
  const votingAddress = await confidentialVoting.getAddress();
  
  console.log("SimpleVoting deployed to:", votingAddress);

  // Set up initial configuration
  console.log("\nSetting up initial configuration...");
  
  // Add deployer as initial board member
  const addBoardMemberTx = await confidentialVoting.addBoardMember(deployer.address);
  await addBoardMemberTx.wait();
  console.log("Added deployer as initial board member");

  // Register deployer as a shareholder with some voting power
  const registerTx = await confidentialVoting.registerShareholder(
    deployer.address,
    ethers.parseUnits("1000", 0), // 1000 shares
    "FOUNDER"
  );
  await registerTx.wait();
  console.log("Registered deployer as shareholder with 1000 shares");

  // Deploy FHELibTest for testing (optional)
  console.log("\nDeploying FHELibTest contract...");
  const FHELibTest = await ethers.getContractFactory("FHELibTest");
  const fheLibTest = await FHELibTest.deploy();
  
  await fheLibTest.waitForDeployment();
  const fheLibTestAddress = await fheLibTest.getAddress();
  
  console.log("FHELibTest deployed to:", fheLibTestAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      FHELib: {
        address: fheLibAddress,
        deploymentTransaction: fheLib.deploymentTransaction()?.hash
      },
      SimpleVoting: {
        address: votingAddress,
        deploymentTransaction: confidentialVoting.deploymentTransaction()?.hash
      },
      FHELibTest: {
        address: fheLibTestAddress,
        deploymentTransaction: fheLibTest.deploymentTransaction()?.hash
      }
    },
    deployedAt: new Date().toISOString(),
    initialSetup: {
      boardMembers: [deployer.address],
      shareholders: [
        {
          address: deployer.address,
          shares: "1000",
          companyId: "FOUNDER"
        }
      ]
    }
  };

  // Write deployment info to file
  import fs from "fs";
  import path from "path";
  import { fileURLToPath } from 'url';
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${hre.network.config.chainId}`);
  console.log(`FHELib: ${fheLibAddress}`);
  console.log(`SimpleVoting: ${votingAddress}`);
  console.log(`FHELibTest: ${fheLibTestAddress}`);
  console.log(`Deployment info saved to: ${deploymentFile}`);

  // Verify contract state
  console.log("\n=== Verifying Contract State ===");
  const isBoardMember = await confidentialVoting.isBoardMember(deployer.address);
  const shareholder = await confidentialVoting.getShareholder(deployer.address);
  const totalProposals = await confidentialVoting.getTotalProposals();
  
  console.log(`Deployer is board member: ${isBoardMember}`);
  console.log(`Deployer shares: ${shareholder.shares.toString()}`);
  console.log(`Total proposals: ${totalProposals.toString()}`);

  // Verify contracts if on a testnet/mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await fheLib.deploymentTransaction()?.wait(5);
    await confidentialVoting.deploymentTransaction()?.wait(5);
    await fheLibTest.deploymentTransaction()?.wait(5);

    console.log("Verifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: fheLibAddress,
        constructorArguments: []
      });
      console.log("FHELib verified successfully");
    } catch (error) {
      console.log("FHELib verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: votingAddress,
        constructorArguments: []
      });
      console.log("SimpleVoting verified successfully");
    } catch (error) {
      console.log("SimpleVoting verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: fheLibTestAddress,
        constructorArguments: []
      });
      console.log("FHELibTest verified successfully");
    } catch (error) {
      console.log("FHELibTest verification failed:", error.message);
    }
  }

  console.log("\n=== Next Steps ===");
  console.log("1. Update frontend with the deployed contract address:");
  console.log(`   CONTRACT_ADDRESS=${votingAddress}`);
  console.log("2. Register additional shareholders using registerShareholder()");
  console.log("3. Create voting proposals using createProposal()");
  console.log("4. Test the voting functionality");

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });