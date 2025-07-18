const { ethers } = require("hardhat");

async function main() {
    console.log("🌟 Deploying Super Optimized Corporate Governance...");
    console.log("机密股东投票 - 企业决策隐私投票 (超级优化版)");

    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);

    // Deploy super optimized contract
    console.log("\n📦 Deploying CorporateGovernanceSuper...");
    const Contract = await ethers.getContractFactory("CorporateGovernanceSuper");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`✅ Deployed at: ${contractAddress}`);

    // Initialize
    await contract.initializeCompany("机密投票企业", "SECRET-001", "REG123", 1000000);
    console.log("✅ Company initialized");

    // Setup
    const [, boardMember] = await ethers.getSigners();
    if (boardMember) {
        await contract.addBoardMember(boardMember.address);
        console.log(`✅ Board member added: ${boardMember.address}`);
    }

    // Register shareholders
    await contract.registerShareholderPlain(deployer.address, 50000, "SH001", "创始人");
    await contract.registerShareholderPlain(boardMember?.address || deployer.address, 30000, "SH002", "投资者");
    console.log("✅ Shareholders registered");

    // Create proposals
    await contract.createProposal(0, "董事会选举", "desc", "hash", 7);
    await contract.createProposal(1, "预算批准", "desc", "hash", 5);
    console.log("✅ Sample proposals created");

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 SUPER OPTIMIZED DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log(`Contract: ${contractAddress}`);
    console.log(`Network: ${network.name}`);
    
    const companyInfo = await contract.getCompanyInfo();
    console.log(`Company: ${companyInfo[0]} (${companyInfo[1]})`);
    console.log(`Shareholders: ${companyInfo[4]}`);
    console.log(`Proposals: ${await contract.getTotalProposals()}`);

    // Save
    const fs = require('fs');
    fs.writeFileSync('./super-deployment.json', JSON.stringify({
        contractAddress,
        network: network.name,
        theme: "机密股东投票 - 企业决策隐私投票",
        features: {
            stackOptimized: true,
            confidentialVoting: true,
            enterpriseGovernance: true
        },
        deployedAt: new Date().toISOString()
    }, null, 2));
    
    console.log(`\n💾 Saved to: super-deployment.json`);
    console.log(`\n🚀 Ready for confidential corporate voting!`);
    console.log(`\n📋 Next Steps:`);
    console.log(`1. npm run serve`);
    console.log(`2. Update CONTRACT_ADDRESS to: ${contractAddress}`);
    console.log(`3. Access: http://localhost:3018/corporate-governance.html`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Failed:", error);
        process.exit(1);
    });