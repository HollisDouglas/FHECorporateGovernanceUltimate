const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying Ultra Simple Corporate Governance System...");

    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deploying with: ${deployer.address}`);

    // Deploy ultra simple contract
    console.log("\n📦 Deploying CorporateGovernanceUltraSimple...");
    try {
        const Contract = await ethers.getContractFactory("CorporateGovernanceUltraSimple");
        const contract = await Contract.deploy();
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        console.log(`✅ Contract deployed at: ${contractAddress}`);

        // Initialize
        console.log("\n🏛️ Initializing...");
        await contract.initializeCompany("机密投票企业", "VOTE-001", "REG123", 1000000);
        console.log("✅ Company initialized");

        // Add board member
        const [, boardMember1] = await ethers.getSigners();
        if (boardMember1) {
            await contract.addBoardMember(boardMember1.address);
            console.log(`✅ Added board member: ${boardMember1.address}`);
        }

        // Register shareholders
        console.log("\n👥 Registering shareholders...");
        await contract.registerShareholderPlain(deployer.address, 50000, "SH001", "创始人");
        await contract.registerShareholderPlain(boardMember1?.address || deployer.address, 30000, "SH002", "投资者");
        console.log("✅ Shareholders registered");

        // Create proposal
        console.log("\n📋 Creating sample proposal...");
        await contract.createProposal(0, "董事会选举", "desc", "hash", 7);
        console.log("✅ Sample proposal created");

        // Summary
        console.log("\n" + "=".repeat(50));
        console.log("🎉 ULTRA SIMPLE DEPLOYMENT COMPLETE!");
        console.log("=".repeat(50));
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Network: ${network.name}`);
        
        const companyInfo = await contract.getCompanyInfo();
        console.log(`Company: ${companyInfo[0]} (${companyInfo[1]})`);
        console.log(`Total Shareholders: ${companyInfo[4]}`);
        console.log(`Total Proposals: ${await contract.getTotalProposals()}`);

        // Save deployment info
        const fs = require('fs');
        fs.writeFileSync('./ultra-simple-deployment.json', JSON.stringify({
            contractAddress,
            network: network.name,
            companyName: companyInfo[0],
            deployedAt: new Date().toISOString()
        }, null, 2));
        
        console.log(`\n💾 Saved to: ultra-simple-deployment.json`);
        console.log(`\n📋 Next Steps:`);
        console.log(`1. Update frontend CONTRACT_ADDRESS to: ${contractAddress}`);
        console.log(`2. Run: npm run serve`);
        console.log(`3. Visit: http://localhost:3018/corporate-governance.html`);
        
        console.log(`\n🎯 Features Available:`);
        console.log(`• Complete corporate governance voting`);
        console.log(`• 6 proposal types with different thresholds`);
        console.log(`• Board member and shareholder management`);
        console.log(`• FHE upgrade ready (castConfidentialVote available)`);
        console.log(`• Professional UI with dashboard`);

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });