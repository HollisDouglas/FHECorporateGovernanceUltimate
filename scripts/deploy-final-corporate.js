const { ethers } = require("hardhat");

async function main() {
    console.log("🎉 Deploying Final Corporate Governance System...");
    console.log("机密股东投票 - 企业决策隐私投票系统");

    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deploying with account: ${deployer.address}`);
    console.log(`💰 Account balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

    // Deploy final contract
    console.log("\n📦 Deploying CorporateGovernanceFinal contract...");
    try {
        const Contract = await ethers.getContractFactory("CorporateGovernanceFinal");
        const contract = await Contract.deploy();
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        console.log(`✅ Contract deployed at: ${contractAddress}`);

        // Initialize company
        console.log("\n🏛️ Initializing company information...");
        try {
            const initTx = await contract.initializeCompany(
                "机密投票科技股份有限公司",  // Company name
                "PRIVATE-VOTE",             // Stock symbol
                "91000000123456789X",       // Registration number
                1000000                     // Total shares (1M)
            );
            await initTx.wait();
            console.log("✅ Company information initialized successfully");
        } catch (error) {
            console.log("⚠️ Company initialization error:", error.message);
        }

        // Setup board members
        console.log("\n👥 Setting up board members...");
        const [, boardMember1, boardMember2] = await ethers.getSigners();
        
        if (boardMember1) {
            try {
                const addBoardTx1 = await contract.addBoardMember(boardMember1.address);
                await addBoardTx1.wait();
                console.log(`✅ Added board member: ${boardMember1.address}`);
            } catch (error) {
                console.log("⚠️ Board member 1 addition failed:", error.message);
            }
        }
        
        if (boardMember2) {
            try {
                const addBoardTx2 = await contract.addBoardMember(boardMember2.address);
                await addBoardTx2.wait();
                console.log(`✅ Added board member: ${boardMember2.address}`);
            } catch (error) {
                console.log("⚠️ Board member 2 addition failed:", error.message);
            }
        }

        // Register shareholders
        console.log("\n🔐 Registering sample shareholders...");
        const sampleShareholders = [
            { address: deployer.address, shares: 50000, companyId: "PV001", name: "创始人股东" },
            { address: boardMember1?.address || deployer.address, shares: 30000, companyId: "PV002", name: "机构投资者" },
            { address: boardMember2?.address || deployer.address, shares: 20000, companyId: "PV003", name: "天使投资人" }
        ];

        for (const shareholder of sampleShareholders) {
            if (shareholder.address) {
                try {
                    const registerTx = await contract.registerShareholderPlain(
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

        // Create sample proposals
        console.log("\n📋 Creating sample governance proposals...");
        
        const sampleProposals = [
            {
                type: 0, // Board election
                title: "2024年董事会换届选举",
                description: "根据公司章程规定，进行新一届董事会成员选举。本次选举将产生9名董事，任期3年。采用机密投票保护股东隐私，确保选举公正透明。",
                attachmentHash: "QmBoardElection2024",
                durationDays: 7
            },
            {
                type: 1, // Budget approval
                title: "2024年度预算方案审批",
                description: "审议并批准公司2024年度财务预算方案。总预算5.2亿元，包括研发投入2亿元、市场推广1.5亿元、运营成本1.7亿元。投票过程完全保密。",
                attachmentHash: "QmBudget2024Plan",
                durationDays: 5
            },
            {
                type: 2, // Merger decision
                title: "重大并购项目决策",
                description: "关于收购ABC科技有限公司51%股权的重大决策。交易金额2.8亿元，将显著增强公司在AI领域的竞争力。此为高机密决策，采用加密投票。",
                attachmentHash: "QmMergerProposal",
                durationDays: 14
            }
        ];

        for (const proposal of sampleProposals) {
            try {
                const proposalTx = await contract.createProposal(
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
        console.log("\n" + "=".repeat(80));
        console.log("🎉 机密股东投票系统部署完成！");
        console.log("🎉 CONFIDENTIAL SHAREHOLDER VOTING SYSTEM DEPLOYED!");
        console.log("=".repeat(80));
        
        try {
            const companyInfo = await contract.getCompanyInfo();
            const [companyName, stockSymbol, regNumber, totalShares, totalShareholders, boardMembers] = companyInfo;
            const totalProposals = await contract.getTotalProposals();
            
            console.log(`\n📊 部署概况 | Deployment Summary:`);
            console.log(`├─ 合约地址 | Contract Address: ${contractAddress}`);
            console.log(`├─ 网络 | Network: ${network.name}`);
            console.log(`├─ 链ID | Chain ID: ${network.config.chainId}`);
            console.log(`├─ 部署者 | Deployer: ${deployer.address}`);
            console.log(`└─ 系统类型 | System Type: 企业机密治理投票`);
            
            console.log(`\n🏢 公司信息 | Company Information:`);
            console.log(`├─ 公司名称 | Company Name: ${companyName}`);
            console.log(`├─ 股票代码 | Stock Code: ${stockSymbol}`);
            console.log(`├─ 注册编号 | Registration: ${regNumber}`);
            console.log(`├─ 总股本 | Total Shares: ${totalShares.toLocaleString()}`);
            console.log(`├─ 股东数量 | Shareholders: ${totalShareholders}`);
            console.log(`├─ 董事成员 | Board Members: ${boardMembers.length}`);
            console.log(`└─ 活跃提案 | Active Proposals: ${totalProposals}`);

            console.log(`\n🔐 隐私保护特性 | Privacy Protection Features:`);
            console.log(`├─ ✅ 机密投票选择保护 | Confidential vote choice protection`);
            console.log(`├─ ✅ 股东身份验证系统 | Shareholder identity verification`);
            console.log(`├─ ✅ 董事会专用结果解密 | Board-only result decryption`);
            console.log(`├─ ✅ 区块链审计追踪 | Blockchain audit trail`);
            console.log(`├─ ✅ 6种提案类型支持 | 6 proposal types supported`);
            console.log(`├─ ✅ 动态投票阈值设置 | Dynamic voting thresholds`);
            console.log(`└─ ✅ FHE加密升级就绪 | FHE encryption upgrade ready`);

            // Save deployment information
            const deploymentInfo = {
                network: network.name,
                chainId: network.config.chainId,
                contractAddress: contractAddress,
                contractType: "CorporateGovernanceFinal",
                deployer: deployer.address,
                theme: "机密股东投票 - 企业决策隐私投票",
                companyInfo: {
                    name: companyName,
                    symbol: stockSymbol,
                    regNumber: regNumber,
                    totalShares: totalShares.toString(),
                    totalShareholders: totalShareholders.toString(),
                    boardMembers: boardMembers,
                    totalProposals: totalProposals.toString()
                },
                features: {
                    confidentialVoting: true,
                    shareholderVerification: true,
                    boardOnlyDecryption: true,
                    auditTrail: true,
                    proposalTypes: 6,
                    fheReady: true
                },
                abi: Contract.interface.formatJson(),
                deployedAt: new Date().toISOString(),
                frontendFiles: [
                    "corporate-governance.html",
                    "board-dashboard.html"
                ]
            };
            
            const fs = require('fs');
            fs.writeFileSync('./final-corporate-deployment.json', JSON.stringify(deploymentInfo, null, 2));
            console.log(`\n💾 部署信息已保存 | Deployment info saved to: final-corporate-deployment.json`);

            console.log(`\n📋 下一步操作 | Next Steps:`);
            console.log(`1. 更新前端合约地址 | Update frontend CONTRACT_ADDRESS: ${contractAddress}`);
            console.log(`2. 启动本地服务器 | Start local server: npm run serve`);
            console.log(`3. 访问股东界面 | Access shareholder interface:`);
            console.log(`   http://localhost:3018/corporate-governance.html`);
            console.log(`4. 访问董事会面板 | Access board dashboard:`);
            console.log(`   http://localhost:3018/board-dashboard.html`);
            console.log(`5. 配置MetaMask网络 | Configure MetaMask network settings`);
            
            console.log(`\n🎯 系统功能 | System Features:`);
            console.log(`• 股东可进行完全机密投票 | Shareholders can cast completely confidential votes`);
            console.log(`• 6种企业治理提案类型 | 6 types of corporate governance proposals`);
            console.log(`• 基于股份权重的投票统计 | Share-weighted vote tallying`);
            console.log(`• 董事会成员专用管理面板 | Board member exclusive management panel`);
            console.log(`• 完整的合规审计日志 | Complete compliance audit logs`);
            console.log(`• 专业的中文企业界面 | Professional Chinese enterprise interface`);
            
            console.log(`\n🚀 机密股东投票系统已准备就绪！`);
            console.log(`🚀 Confidential Shareholder Voting System is Ready!`);

        } catch (error) {
            console.error("❌ Failed to get deployment summary:", error);
        }

    } catch (error) {
        console.error("❌ Contract deployment failed:", error);
        console.error("Stack trace:", error.stack);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment script failed:", error);
        process.exit(1);
    });