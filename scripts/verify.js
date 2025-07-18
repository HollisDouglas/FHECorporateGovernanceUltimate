import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("========================================");
  console.log("Contract Verification on Etherscan");
  console.log("========================================\n");

  // Read the latest deployment file
  const deploymentsDir = path.join(__dirname, "..", "deployments");

  if (!fs.existsSync(deploymentsDir)) {
    throw new Error("No deployments directory found. Please deploy the contract first.");
  }

  const files = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith(`deployment-${hre.network.name}`))
    .sort()
    .reverse();

  if (files.length === 0) {
    throw new Error(`No deployment found for network: ${hre.network.name}`);
  }

  const latestDeployment = files[0];
  const deploymentPath = path.join(deploymentsDir, latestDeployment);
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  console.log("Deployment Information:");
  console.log("-----------------------");
  console.log("Network:", deploymentData.network);
  console.log("Contract Address:", deploymentData.contractAddress);
  console.log("Deployment File:", latestDeployment);
  console.log();

  // Verify the contract
  console.log("Starting verification process...");

  try {
    await hre.run("verify:verify", {
      address: deploymentData.contractAddress,
      constructorArguments: [],
    });

    console.log("\n✓ Contract verified successfully!");

    if (hre.network.name === "sepolia") {
      console.log("\nView on Etherscan:");
      console.log(`https://sepolia.etherscan.io/address/${deploymentData.contractAddress}#code`);
    } else if (hre.network.name === "mainnet") {
      console.log("\nView on Etherscan:");
      console.log(`https://etherscan.io/address/${deploymentData.contractAddress}#code`);
    }

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✓ Contract is already verified!");

      if (hre.network.name === "sepolia") {
        console.log("\nView on Etherscan:");
        console.log(`https://sepolia.etherscan.io/address/${deploymentData.contractAddress}#code`);
      }
    } else {
      console.error("\n✗ Verification failed!");
      console.error("Error:", error.message);
      console.log("\nTroubleshooting:");
      console.log("1. Ensure ETHERSCAN_API_KEY is set in .env file");
      console.log("2. Check that the contract was deployed on this network");
      console.log("3. Wait a few minutes after deployment before verifying");
      throw error;
    }
  }

  console.log("\n========================================");
  console.log("Verification Complete");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
