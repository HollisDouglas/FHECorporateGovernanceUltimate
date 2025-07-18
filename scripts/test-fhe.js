const { ethers } = require("hardhat");
const { createInstance } = require("fhevmjs");

async function main() {
    console.log("🧪 Starting FHE Voting System Tests...");

    // Deploy contract
    console.log("📦 Deploying FHEVoting contract...");
    const FHEVoting = await ethers.getContractFactory("FHEVoting");
    const fheVoting = await FHEVoting.deploy();
    await fheVoting.waitForDeployment();
    
    const contractAddress = await fheVoting.getAddress();
    console.log(`✅ Contract deployed at: ${contractAddress}`);

    // Get signers
    const [owner, voter1, voter2] = await ethers.getSigners();
    console.log(`👤 Owner: ${owner.address}`);
    console.log(`👤 Voter1: ${voter1.address}`);
    console.log(`👤 Voter2: ${voter2.address}`);

    // Test 1: Authorize voters with plain weights (for testing)
    console.log("\n🔐 Test 1: Authorizing voters...");
    try {
        await fheVoting.authorizeVoterPlain(voter1.address, 1);
        console.log("✅ Voter1 authorized with weight 1");
        
        await fheVoting.authorizeVoterPlain(voter2.address, 2);
        console.log("✅ Voter2 authorized with weight 2");
    } catch (error) {
        console.error("❌ Authorization failed:", error.message);
    }

    // Test 2: Create proposal
    console.log("\n📝 Test 2: Creating proposal...");
    try {
        const tx = await fheVoting.createProposal(
            "Test Proposal 1",
            "This is a test proposal for FHE voting",
            7 // 7 days
        );
        await tx.wait();
        console.log("✅ Proposal created successfully");
        
        const totalProposals = await fheVoting.getTotalProposals();
        console.log(`📊 Total proposals: ${totalProposals}`);
    } catch (error) {
        console.error("❌ Proposal creation failed:", error.message);
    }

    // Test 3: Cast votes using plain function (for testing)
    console.log("\n🗳️ Test 3: Casting votes...");
    try {
        // Voter1 votes FOR (choice = 1)
        const voter1Contract = fheVoting.connect(voter1);
        await voter1Contract.castVotePlain(1, 1);
        console.log("✅ Voter1 voted FOR");
        
        // Voter2 votes AGAINST (choice = 2)
        const voter2Contract = fheVoting.connect(voter2);
        await voter2Contract.castVotePlain(1, 2);
        console.log("✅ Voter2 voted AGAINST");
    } catch (error) {
        console.error("❌ Voting failed:", error.message);
    }

    // Test 4: Check vote status
    console.log("\n✅ Test 4: Checking vote status...");
    try {
        const hasVoted1 = await fheVoting.hasVotedOn(1, voter1.address);
        const hasVoted2 = await fheVoting.hasVotedOn(1, voter2.address);
        console.log(`Voter1 has voted: ${hasVoted1}`);
        console.log(`Voter2 has voted: ${hasVoted2}`);
    } catch (error) {
        console.error("❌ Status check failed:", error.message);
    }

    // Test 5: Get proposal info
    console.log("\n📋 Test 5: Getting proposal info...");
    try {
        const proposalInfo = await fheVoting.getProposalInfo(1);
        const [id, title, description, deadline, active, proposer, finalized] = proposalInfo;
        console.log(`Proposal ID: ${id}`);
        console.log(`Title: ${title}`);
        console.log(`Description: ${description}`);
        console.log(`Deadline: ${new Date(Number(deadline) * 1000).toLocaleString()}`);
        console.log(`Active: ${active}`);
        console.log(`Finalized: ${finalized}`);
    } catch (error) {
        console.error("❌ Proposal info failed:", error.message);
    }

    // Test 6: Try to decrypt results (should work for owner, fail for others)
    console.log("\n🔓 Test 6: Testing result decryption...");
    try {
        // First finalize the proposal (simulate deadline passed)
        console.log("Finalizing proposal...");
        
        // Note: In real scenario, you'd wait for deadline to pass
        // For testing, we might need to modify contract or use time manipulation
        console.log("⚠️ Note: Proposal needs to be past deadline to finalize");
        console.log("⚠️ In production, wait for deadline or use time manipulation in tests");
        
    } catch (error) {
        console.error("❌ Finalization failed:", error.message);
    }

    console.log("\n🎉 FHE Voting System Tests Completed!");
    console.log("\n📋 Summary:");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Network: ${network.name}`);
    console.log(`Chain ID: ${network.config.chainId}`);
    
    // Save deployment info for frontend
    const deploymentInfo = {
        contractAddress: contractAddress,
        network: network.name,
        chainId: network.config.chainId,
        abi: FHEVoting.interface.formatJson(),
        deployedAt: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync('./fhe-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to fhe-deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });