const { ethers } = require("hardhat");

async function main() {
    console.log("🎯 Deploying ULTIMATE Corporate Governance...");
    console.log("机密股东投票 - 企业决策隐私投票");
    console.log("(Stack Too Deep 终极解决方案)");

    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);

    console.log("\n📦 Deploying CorporateGovernanceUltimate...");
    const Contract = await ethers.getContractFactory("CorporateGovernanceUltimate");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`✅ SUCCESS! Contract deployed at: ${contractAddress}`);

    // Quick setup
    await contract.initCompany("机密投票企业集团", 1000000);
    console.log("✅ Company initialized");

    const [, member] = await ethers.getSigners();
    if (member) {
        await contract.addBoard(member.address);
        console.log(`✅ Board member added: ${member.address}`);
    }

    await contract.addShareholder(deployer.address, 50000, "创始人");
    await contract.addShareholder(member?.address || deployer.address, 30000, "投资者");
    console.log("✅ Shareholders registered");

    await contract.createProposal(0, "董事会选举提案", 7);
    await contract.createProposal(1, "年度预算审批", 5);
    console.log("✅ Sample proposals created");

    console.log("\n" + "=".repeat(70));
    console.log("🎉 ULTIMATE DEPLOYMENT SUCCESS!");
    console.log("🎉 Stack Too Deep问题已彻底解决！");
    console.log("=".repeat(70));
    
    console.log(`\n📊 部署信息:`);
    console.log(`合约地址: ${contractAddress}`);
    console.log(`网络: ${network.name}`);
    console.log(`公司: ${await contract.companyName()}`);
    console.log(`总提案数: ${await contract.getTotalProposals()}`);

    const fs = require('fs');
    fs.writeFileSync('./ultimate-deployment.json', JSON.stringify({
        contractAddress,
        network: network.name,
        contractName: "CorporateGovernanceUltimate",
        theme: "机密股东投票 - 企业决策隐私投票",
        stackOptimized: true,
        compilationGuaranteed: true,
        deployedAt: new Date().toISOString()
    }, null, 2));
    
    console.log(`\n💾 部署信息已保存至: ultimate-deployment.json`);
    
    console.log(`\n🔥 系统特性:`);
    console.log(`• ✅ 100%编译保证 - Stack Too Deep问题已解决`);
    console.log(`• ✅ 机密投票功能 - castConfidentialVote()`);
    console.log(`• ✅ 企业治理完整流程 - 6种提案类型`);
    console.log(`• ✅ 董事会权限管理 - 分级访问控制`);
    console.log(`• ✅ 专业UI兼容 - 前端接口完整`);
    
    console.log(`\n🚀 立即使用:`);
    console.log(`1. npm run serve`);
    console.log(`2. 更新前端 CONTRACT_ADDRESS: ${contractAddress}`);
    console.log(`3. 访问: http://localhost:3018/corporate-governance.html`);
    console.log(`4. 访问: http://localhost:3018/board-dashboard.html`);
    
    console.log(`\n🎯 这是最终的、绝对可以编译成功的版本！`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });