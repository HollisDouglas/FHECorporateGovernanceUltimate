const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting contract interaction script...");

  // Get signers
  const [deployer, creator, contributor1, contributor2] = await ethers.getSigners();
  
  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("Deployment file not found. Please deploy contracts first.");
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const privacyPadAddress = deploymentInfo.contracts.PrivacyPad.address;

  // Get contract instance
  const PrivacyPad = await ethers.getContractFactory("PrivacyPad");
  const privacyPad = PrivacyPad.attach(privacyPadAddress);

  console.log("PrivacyPad contract loaded at:", privacyPadAddress);
  console.log("Contract owner:", await privacyPad.owner());

  // Example interactions
  console.log("\n=== Creating Sample Campaign ===");
  
  const createTx = await privacyPad.connect(creator).createCampaign(
    "Revolutionary Privacy Project",
    "A groundbreaking project that will change how we think about privacy in blockchain",
    ethers.parseEther("50"), // 50 ETH target
    30 // 30 days duration
  );
  
  await createTx.wait();
  console.log("Campaign created successfully!");

  // Get campaign details
  const campaign = await privacyPad.getCampaign(1);
  console.log("\nCampaign Details:");
  console.log(`- ID: ${campaign.id}`);
  console.log(`- Creator: ${campaign.creator}`);
  console.log(`- Title: ${campaign.title}`);
  console.log(`- Target Amount: ${ethers.formatEther(campaign.targetAmount)} ETH`);
  console.log(`- Deadline: ${new Date(Number(campaign.deadline) * 1000).toLocaleString()}`);
  console.log(`- Is Active: ${campaign.isActive}`);

  console.log("\n=== Making Encrypted Contributions ===");

  // Contributor 1 makes an encrypted contribution
  const encryptedAmount1 = ethers.keccak256(ethers.toUtf8Bytes("secret_contribution_5_eth"));
  const contributionTx1 = await privacyPad.connect(contributor1).makeEncryptedContribution(
    1, // campaign ID
    encryptedAmount1,
    { value: ethers.parseEther("5") }
  );
  
  await contributionTx1.wait();
  console.log("Contributor 1 made encrypted contribution of 5 ETH");

  // Contributor 2 makes an encrypted contribution
  const encryptedAmount2 = ethers.keccak256(ethers.toUtf8Bytes("secret_contribution_10_eth"));
  const contributionTx2 = await privacyPad.connect(contributor2).makeEncryptedContribution(
    1, // campaign ID
    encryptedAmount2,
    { value: ethers.parseEther("10") }
  );
  
  await contributionTx2.wait();
  console.log("Contributor 2 made encrypted contribution of 10 ETH");

  // Check encrypted contributions
  const contribution1 = await privacyPad.encryptedContributions(1);
  const contribution2 = await privacyPad.encryptedContributions(2);
  
  console.log("\nEncrypted Contributions:");
  console.log(`Contribution 1 - Contributor: ${contribution1.contributor}, Encrypted: ${contribution1.encryptedAmount}`);
  console.log(`Contribution 2 - Contributor: ${contribution2.contributor}, Encrypted: ${contribution2.encryptedAmount}`);

  console.log("\n=== Revealing Contributions ===");

  // Reveal contributions
  const revealTx1 = await privacyPad.connect(contributor1).revealContribution(1, ethers.parseEther("5"));
  await revealTx1.wait();
  console.log("Contributor 1 revealed contribution: 5 ETH");

  const revealTx2 = await privacyPad.connect(contributor2).revealContribution(2, ethers.parseEther("10"));
  await revealTx2.wait();
  console.log("Contributor 2 revealed contribution: 10 ETH");

  // Check updated campaign stats
  const updatedCampaign = await privacyPad.getCampaign(1);
  console.log("\nUpdated Campaign Stats:");
  console.log(`- Total Raised: ${ethers.formatEther(updatedCampaign.totalRaised)} ETH`);
  console.log(`- Contributors: ${updatedCampaign.contributorCount}`);
  console.log(`- Progress: ${(Number(updatedCampaign.totalRaised) * 100 / Number(updatedCampaign.targetAmount)).toFixed(2)}%`);

  // Get campaign contributors
  const contributors = await privacyPad.getCampaignContributors(1);
  console.log(`- Contributor addresses: ${contributors.join(", ")}`);

  console.log("\n=== Platform Statistics ===");
  console.log(`Total Campaigns: ${await privacyPad.getTotalCampaigns()}`);
  console.log(`Total Contributions: ${await privacyPad.getTotalContributions()}`);

  // Show user-specific data
  const creatorCampaigns = await privacyPad.getUserCampaigns(creator.address);
  const contributor1Contributions = await privacyPad.getUserContributions(contributor1.address);
  
  console.log(`\nCreator's campaigns: ${creatorCampaigns.length}`);
  console.log(`Contributor 1's contributions: ${contributor1Contributions.length}`);

  console.log("\nInteraction script completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Interaction script failed:", error);
    process.exit(1);
  });