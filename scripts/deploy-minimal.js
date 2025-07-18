const { ethers } = require("hardhat");

async function main() {
    console.log("🏢 Deploying Minimal Corporate Governance System...");

    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deploying with: ${deployer.address}`);

    // Deploy minimal contract
    console.log("\n📦 Deploying CorporateGovernanceMinimal...");
    const Contract = await ethers.getContractFactory("CorporateGovernanceMinimal");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`✅ Contract deployed at: ${contractAddress}`);

    // Initialize company
    console.log("\n🏛️ Initializing company...");
    try {
        const initTx = await contract.initializeCompany(
            "科技创新股份有限公司",
            "TECH-001", 
            "91000000123456789X",
            1000000
        );
        await initTx.wait();
        console.log("✅ Company initialized");
    } catch (error) {
        console.log("⚠️ Init error:", error.message);
    }

    // Add board member
    console.log("\n👥 Setting up board...");
    const [, boardMember1] = await ethers.getSigners();
    if (boardMember1) {
        try {
            const addTx = await contract.addBoardMember(boardMember1.address);
            await addTx.wait();
            console.log(`✅ Added board member: ${boardMember1.address}`);
        } catch (error) {
            console.log("⚠️ Board setup error:", error.message);
        }
    }

    // Register shareholders
    console.log("\n🔐 Registering shareholders...");
    const shareholders = [
        { address: deployer.address, shares: 50000, id: "SH001", name: "创始人" },
        { address: boardMember1?.address || deployer.address, shares: 30000, id: "SH002", name: "投资者" }
    ];

    for (const sh of shareholders) {
        try {
            const regTx = await contract.registerShareholderPlain(sh.address, sh.shares, sh.id, sh.name);
            await regTx.wait();
            console.log(`✅ Registered: ${sh.name} (${sh.shares} shares)`);
        } catch (error) {
            console.log(`⚠️ Failed to register ${sh.name}`);
        }
    }

    // Create sample proposal
    console.log("\n📋 Creating sample proposal...");
    try {
        const proposalTx = await contract.createProposal(
            0, // Board election
            "董事会换届选举",
            "选举新一届董事会成员",
            "QmHash123",
            7 // 7 days
        );
        await proposalTx.wait();
        console.log("✅ Sample proposal created");
    } catch (error) {
        console.log("⚠️ Proposal creation failed:", error.message);
    }

    // Display summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Network: ${network.name}`);
    
    const companyInfo = await contract.getCompanyInfo();
    const totalProposals = await contract.getTotalProposals();
    
    console.log(`\nCompany: ${companyInfo[0]}`);
    console.log(`Stock Code: ${companyInfo[1]}`); 
    console.log(`Total Shareholders: ${companyInfo[4]}`);
    console.log(`Total Proposals: ${totalProposals}`);

    // Save deployment info
    const deploymentInfo = {
        contractAddress,
        network: network.name,
        companyName: companyInfo[0],
        stockSymbol: companyInfo[1],
        deployedAt: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync('./minimal-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: minimal-deployment.json`);
    
    console.log(`\n📋 Next Steps:`);
    console.log(`1. Update frontend CONTRACT_ADDRESS to: ${contractAddress}`);
    console.log(`2. Start server: npm run serve`);
    console.log(`3. Visit: http://localhost:3018/corporate-governance.html`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });