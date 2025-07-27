import { ethers } from "hardhat";
import fs from 'fs';

async function main() {
  try {
    console.log("🚀 Starting contract deployment to Sepolia testnet...");
    console.log("⏳ This may take 1-2 minutes...\n");

    // Check network
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 11155111n) {
      throw new Error(`❌ Wrong network! Expected Sepolia (11155111), got ${network.chainId}`);
    }

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceEth} ETH`);
    
    if (parseFloat(balanceEth) < 0.01) {
      throw new Error("❌ Insufficient balance! Need at least 0.01 ETH. Get free testnet ETH from https://sepoliafaucet.com/");
    }

    console.log("\n📝 Getting contract factory...");
    const FHEVoting = await ethers.getContractFactory("FHEVoting");

    console.log("🚀 Deploying contract...");
    
    // Deploy with explicit gas settings
    const contract = await FHEVoting.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("20", "gwei")
    });

    console.log("⏳ Waiting for deployment confirmation...");
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log(`\n✅ Contract deployed successfully!`);
    console.log(`📍 Contract Address: ${contractAddress}`);

    // Verify the contract is deployed
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error("❌ Contract deployment failed - no code at address");
    }

    console.log("\n🔧 Setting up initial configuration...");
    
    // Add deployer as board member
    console.log("👨‍💼 Adding deployer as board member...");
    const tx1 = await contract.addBoardMember(deployer.address, {
      gasLimit: 100000,
      gasPrice: ethers.parseUnits("20", "gwei")
    });
    await tx1.wait();
    console.log("✅ Deployer added as board member");

    // Register deployer as shareholder
    console.log("🏛️ Registering deployer as shareholder...");
    const tx2 = await contract.registerShareholder(deployer.address, 1000, "MAIN-SHAREHOLDER", {
      gasLimit: 150000,
      gasPrice: ethers.parseUnits("20", "gwei")
    });
    await tx2.wait();
    console.log("✅ Deployer registered as shareholder with 1000 shares");

    // Final balance check
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    const gasUsed = balance - finalBalance;
    console.log(`\n💸 Gas used: ${ethers.formatEther(gasUsed)} ETH`);
    console.log(`💰 Remaining balance: ${ethers.formatEther(finalBalance)} ETH`);

    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("\n📋 Contract Information:");
    console.log(`├─ Address: ${contractAddress}`);
    console.log(`├─ Network: Sepolia Testnet (11155111)`);
    console.log(`├─ Block: ${await ethers.provider.getBlockNumber()}`);
    console.log(`├─ Deployer: ${deployer.address}`);
    console.log(`└─ Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    
    console.log("\n🔧 NEXT STEPS:");
    console.log(`1. ✏️  Copy this address: ${contractAddress}`);
    console.log(`2. 📝 Update CONTRACT_ADDRESS in app.js`);
    console.log(`3. 🚀 Commit and push to trigger Vercel deployment`);
    console.log(`4. 🧪 Test the application with real blockchain interactions`);

    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress,
      deployer: deployer.address,
      network: "sepolia",
      chainId: 11155111,
      blockNumber: await ethers.provider.getBlockNumber(),
      timestamp: new Date().toISOString(),
      etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
      gasUsed: ethers.formatEther(gasUsed),
      remainingBalance: ethers.formatEther(finalBalance)
    };

    fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment details saved to deployment.json");

    return contractAddress;

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("🔍 Error details:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.error("\n💡 Solution: Get more test ETH from https://sepoliafaucet.com/");
    } else if (error.message.includes("network")) {
      console.error("\n💡 Solution: Check your network configuration in hardhat.config.js");
    } else if (error.message.includes("private key")) {
      console.error("\n💡 Solution: Check your PRIVATE_KEY in .env file");
    }
    
    process.exit(1);
  }
}

// Run deployment
main()
  .then((address) => {
    console.log(`\n🚀 Ready to use contract at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });