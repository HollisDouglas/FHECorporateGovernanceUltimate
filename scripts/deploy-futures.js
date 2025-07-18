const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Confidential Futures Trading Platform...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy the main contract
  const ConfidentialFuturesTrading = await ethers.getContractFactory("ConfidentialFuturesTrading");

  console.log("⏳ Deploying ConfidentialFuturesTrading...");
  const contract = await ConfidentialFuturesTrading.deploy();

  await contract.deployed();

  console.log("✅ ConfidentialFuturesTrading deployed to:", contract.address);
  console.log("🔑 Owner address:", await contract.owner());
  console.log("🆔 Current contract ID:", await contract.currentContractId());

  // Create some initial contracts for testing
  console.log("\n📊 Creating initial futures contracts...");

  const assets = ["BTC", "ETH", "OIL"];

  for (const asset of assets) {
    try {
      console.log(`⏳ Creating ${asset} futures contract...`);
      const tx = await contract.createFuturesContract(asset);
      await tx.wait();
      console.log(`✅ ${asset} futures contract created`);

      // Set initial price for the contract
      const contractId = await contract.currentContractId() - 1;
      let initialPrice;

      switch(asset) {
        case "BTC":
          initialPrice = 4500000; // $45,000.00
          break;
        case "ETH":
          initialPrice = 250000; // $2,500.00
          break;
        case "OIL":
          initialPrice = 8500; // $85.00
          break;
        default:
          initialPrice = 10000; // $100.00
      }

      console.log(`⏳ Setting initial price for ${asset} contract (ID: ${contractId}) to $${initialPrice/100}...`);
      const priceTx = await contract.setContractPrice(contractId, initialPrice);
      await priceTx.wait();
      console.log(`✅ Initial price set for ${asset} contract`);

    } catch (error) {
      console.error(`❌ Error creating ${asset} contract:`, error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Details:");
  console.log("   Contract Address:", contract.address);
  console.log("   Owner:", await contract.owner());
  console.log("   Current Contract ID:", await contract.currentContractId());
  console.log("   Active Contracts:", await contract.getActiveContractsCount());

  // Log deployment info for frontend
  console.log("\n📝 Frontend Configuration:");
  console.log("   Update CONTRACT_ADDRESS in index.html to:", contract.address);
  console.log("   Network: Zama Devnet (Chain ID: 8009)");

  // Verification instructions
  console.log("\n🔍 To verify on block explorer:");
  console.log(`   npx hardhat verify --network zama-devnet ${contract.address}`);

  return contract.address;
}

main()
  .then((address) => {
    console.log(`\n✨ Deployment successful! Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });