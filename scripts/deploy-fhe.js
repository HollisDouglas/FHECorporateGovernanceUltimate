const { ethers } = require("hardhat");
const { createInstance } = require("fhevm");

async function main() {
  console.log("🚀 Starting FHE Voting contract deployment...");

  // Get the contract factory
  const FHEVoting = await ethers.getContractFactory("FHEVoting");
  
  console.log("📝 Deploying FHEVoting contract...");
  
  // Deploy the contract
  const fheVoting = await FHEVoting.deploy();
  await fheVoting.waitForDeployment();
  
  const contractAddress = await fheVoting.getAddress();
  console.log("✅ FHEVoting contract deployed to:", contractAddress);
  
  // Initialize FHEVM instance
  console.log("🔧 Initializing FHEVM instance...");
  const instance = await createInstance({
    chainId: network.config.chainId,
    networkUrl: network.config.url,
    gatewayUrl: "https://gateway.zama.ai/",
  });
  
  console.log("🎉 Deployment completed successfully!");
  console.log("📋 Contract Details:");
  console.log(`   - Contract Address: ${contractAddress}`);
  console.log(`   - Network: ${network.name}`);
  console.log(`   - Chain ID: ${network.config.chainId}`);
  console.log(`   - Owner: ${await fheVoting.owner()}`);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString(),
    contractName: "FHEVoting"
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    './fhe-deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to fhe-deployment.json");
  
  // Verification instructions
  console.log("\n🔍 To verify the contract, run:");
  console.log(`npx hardhat verify --network ${network.name} ${contractAddress}`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });