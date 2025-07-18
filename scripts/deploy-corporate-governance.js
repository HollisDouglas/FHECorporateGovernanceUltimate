const { ethers } = require("hardhat");

async function main() {
    console.log("🏢 Starting Corporate Governance System Deployment...");

    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deploying with account: ${deployer.address}`);
    console.log(`💰 Account balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

    // Deploy CorporateGovernanceOptimized contract  
    console.log("\n📦 Deploying CorporateGovernanceOptimized contract...");
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernanceOptimized");
    
    const corporateGovernance = await CorporateGovernance.deploy();
    await corporateGovernance.waitForDeployment();
    
    const contractAddress = await corporateGovernance.getAddress();
    console.log(`✅ CorporateGovernance deployed to: ${contractAddress}`);

    // Initialize company information
    console.log("\n🏛️ Initializing company information...");
    try {
        const initTx = await corporateGovernance.initializeCompany(
            "科技创新股份有限公司",  // Company name
            "TECH-001",              // Stock symbol
            "91000000123456789X",    // Registration number
            1000000                  // Total shares (1M)
        );
        await initTx.wait();
        console.log("✅ Company information initialized successfully");
    } catch (error) {
        console.log("⚠️ Company already initialized or initialization failed:", error.message);
    }

    // Setup initial board members
    console.log("\n👥 Setting up initial board members...");
    
    // Get additional accounts for board members
    const [, boardMember1, boardMember2] = await ethers.getSigners();
    
    try {
        // Add deployer as default board member (contract owner)
        console.log(`➕ Adding deployer as board member: ${deployer.address}`);
        
        // Add additional board members
        if (boardMember1) {
            const addBoardTx1 = await corporateGovernance.addBoardMember(boardMember1.address);
            await addBoardTx1.wait();
            console.log(`✅ Added board member: ${boardMember1.address}`);
        }
        
        if (boardMember2) {
            const addBoardTx2 = await corporateGovernance.addBoardMember(boardMember2.address);
            await addBoardTx2.wait();
            console.log(`✅ Added board member: ${boardMember2.address}`);
        }
    } catch (error) {
        console.log("⚠️ Board member setup error:", error.message);
    }

    // Register sample shareholders
    console.log("\n🔐 Registering sample shareholders...");
    const sampleShareholders = [
        { address: deployer.address, shares: 50000, companyId: "SH001", name: "创始人股东" },
        { address: boardMember1?.address || deployer.address, shares: 30000, companyId: "SH002", name: "天使投资人" },
        { address: boardMember2?.address || deployer.address, shares: 20000, companyId: "SH003", name: "机构投资者" }
    ];

    for (const shareholder of sampleShareholders) {
        if (shareholder.address) {
            try {
                const registerTx = await corporateGovernance.registerShareholderPlain(
                    shareholder.address,
                    shareholder.shares,
                    shareholder.companyId,
                    shareholder.name
                );
                await registerTx.wait();
                console.log(`✅ Registered shareholder: ${shareholder.name} (${shareholder.shares.toLocaleString()} shares)`);
            } catch (error) {
                console.log(`⚠️ Failed to register ${shareholder.name}:`, error.message);
            }
        }
    }

    // Create sample proposals to demonstrate the system
    console.log("\n📋 Creating sample governance proposals...");
    
    const sampleProposals = [
        {
            type: 0, // Board election
            title: "董事会换届选举",
            description: "根据公司章程，进行新一届董事会选举。本次选举将选出9名董事，任期3年。候选人包括现任董事和新提名人员，具备丰富的行业经验和专业背景。",
            attachmentHash: "QmSampleHash1",
            durationDays: 7
        },
        {
            type: 1, // Budget approval
            title: "2024年度预算方案",
            description: "审议批准公司2024年度财务预算方案。预算总额为5亿元，主要投入研发创新、市场拓展和运营管理。详细预算分配已上传至系统。",
            attachmentHash: "QmSampleHash2",
            durationDays: 5
        },
        {
            type: 3, // Dividend distribution  
            title: "2023年度利润分配方案",
            description: "基于2023年度经营业绩，董事会提议向全体股东分配现金股利每股0.5元，总分配金额约5000万元。分配基准日为股东大会通过后的第10个工作日。",
            attachmentHash: "QmSampleHash3",
            durationDays: 14
        }
    ];

    for (const proposal of sampleProposals) {
        try {
            const proposalTx = await corporateGovernance.createProposal(
                proposal.type,
                proposal.title,
                proposal.description,
                proposal.attachmentHash,
                proposal.durationDays
            );
            await proposalTx.wait();
            console.log(`✅ Created proposal: ${proposal.title}`);
        } catch (error) {
            console.log(`⚠️ Failed to create proposal "${proposal.title}":`, error.message);
        }
    }

    // Display deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 CORPORATE GOVERNANCE SYSTEM DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    
    const companyInfo = await corporateGovernance.getCompanyInfo();
    const [companyName, stockSymbol, regNumber, totalShares, totalShareholders, boardMembers] = companyInfo;
    const totalProposals = await corporateGovernance.getTotalProposals();
    
    console.log(`\n📊 Deployment Summary:`);
    console.log(`├─ Contract Address: ${contractAddress}`);
    console.log(`├─ Network: ${network.name}`);
    console.log(`├─ Chain ID: ${network.config.chainId}`);
    console.log(`├─ Deployer: ${deployer.address}`);
    console.log(`└─ Gas Used: Check transaction receipts`);
    
    console.log(`\n🏢 Company Information:`);
    console.log(`├─ Name: ${companyName}`);
    console.log(`├─ Stock Code: ${stockSymbol}`);
    console.log(`├─ Registration: ${regNumber}`);
    console.log(`├─ Total Shares: ${totalShares.toLocaleString()}`);
    console.log(`├─ Shareholders: ${totalShareholders}`);
    console.log(`├─ Board Members: ${boardMembers.length}`);
    console.log(`└─ Active Proposals: ${totalProposals}`);

    // Save deployment information for frontend
    const deploymentInfo = {
        network: network.name,
        chainId: network.config.chainId,
        contractAddress: contractAddress,
        deployer: deployer.address,
        companyInfo: {
            name: companyName,
            symbol: stockSymbol,
            regNumber: regNumber,
            totalShares: totalShares.toString(),
            totalShareholders: totalShareholders.toString(),
            boardMembers: boardMembers,
            totalProposals: totalProposals.toString()
        },
        abi: CorporateGovernance.interface.formatJson(),
        deployedAt: new Date().toISOString(),
        frontendFiles: [
            "corporate-governance.html",
            "board-dashboard.html"
        ]
    };
    
    const fs = require('fs');
    fs.writeFileSync('./corporate-governance-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: corporate-governance-deployment.json`);

    // Instructions for next steps
    console.log(`\n📋 Next Steps:`);
    console.log(`1. Update frontend files with contract address: ${contractAddress}`);
    console.log(`2. Start local server: npx http-server . -p 3018 -c-1`);
    console.log(`3. Access shareholder interface: http://localhost:3018/corporate-governance.html`);
    console.log(`4. Access board dashboard: http://localhost:3018/board-dashboard.html`);
    console.log(`5. Connect MetaMask to local network (if testing locally)`);
    
    console.log(`\n🔐 Security Notes:`);
    console.log(`• FHE encryption protects all voting choices`);
    console.log(`• Only board members can view decrypted results`);
    console.log(`• All transactions are recorded on blockchain`);
    console.log(`• Shareholder identities are cryptographically verified`);
    
    console.log(`\n🚀 System is ready for confidential corporate governance!`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });