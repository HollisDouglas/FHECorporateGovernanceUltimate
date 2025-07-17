import { expect } from "chai";
import { ethers } from "hardhat";

describe("CorporateGovernanceUltimate", function () {
  let governance;
  let contractAddress;
  let deployer, boardMember1, boardMember2, shareholder1, shareholder2, shareholder3, unauthorizedUser;

  // Deployment fixture
  async function deployGovernanceFixture() {
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernanceUltimate");
    const contract = await CorporateGovernance.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    return { contract, address };
  }

  before(async function () {
    const signers = await ethers.getSigners();
    [deployer, boardMember1, boardMember2, shareholder1, shareholder2, shareholder3, unauthorizedUser] = signers;
  });

  beforeEach(async function () {
    ({ contract: governance, address: contractAddress } = await deployGovernanceFixture());
  });

  describe("Deployment and Initialization", function () {
    it("should deploy successfully with valid address", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(await governance.getAddress()).to.equal(contractAddress);
    });

    it("should set deployer as owner", async function () {
      expect(await governance.owner()).to.equal(deployer.address);
    });

    it("should set deployer as initial board member", async function () {
      expect(await governance.isBoardMember(deployer.address)).to.be.true;
    });

    it("should start with uninitialized company", async function () {
      expect(await governance.initialized()).to.be.false;
    });

    it("should have zero total shares initially", async function () {
      expect(await governance.totalShares()).to.equal(0);
    });

    it("should have zero proposals initially", async function () {
      expect(await governance.getTotalProposals()).to.equal(0);
    });

    it("should initialize company correctly", async function () {
      const companyName = "Tech Innovations Corp";
      const totalShares = 1000000;

      await governance.initCompany(companyName, totalShares);

      expect(await governance.initialized()).to.be.true;
      expect(await governance.companyName()).to.equal(companyName);
      expect(await governance.totalShares()).to.equal(totalShares);
    });

    it("should prevent double initialization", async function () {
      await governance.initCompany("First Company", 100000);

      await expect(
        governance.initCompany("Second Company", 200000)
      ).to.be.revertedWith("Done");
    });

    it("should emit CompanyInit event on initialization", async function () {
      const companyName = "Innovation Labs";

      await expect(governance.initCompany(companyName, 500000))
        .to.emit(governance, "CompanyInit")
        .withArgs(companyName);
    });
  });

  describe("Board Member Management", function () {
    beforeEach(async function () {
      await governance.initCompany("Test Company", 1000000);
    });

    it("should allow owner to add board members", async function () {
      await governance.addBoard(boardMember1.address);
      expect(await governance.isBoardMember(boardMember1.address)).to.be.true;
    });

    it("should prevent non-owner from adding board members", async function () {
      await expect(
        governance.connect(unauthorizedUser).addBoard(boardMember1.address)
      ).to.be.reverted;
    });

    it("should add multiple board members", async function () {
      await governance.addBoard(boardMember1.address);
      await governance.addBoard(boardMember2.address);

      expect(await governance.isBoardMember(boardMember1.address)).to.be.true;
      expect(await governance.isBoardMember(boardMember2.address)).to.be.true;
    });

    it("should allow adding same address as board member multiple times", async function () {
      await governance.addBoard(boardMember1.address);
      await governance.addBoard(boardMember1.address);

      expect(await governance.isBoardMember(boardMember1.address)).to.be.true;
    });
  });

  describe("Shareholder Management", function () {
    beforeEach(async function () {
      await governance.initCompany("Test Company", 1000000);
    });

    it("should allow board member to add shareholders", async function () {
      await governance.addShareholder(shareholder1.address, 10000, "Alice Johnson");

      const shareholderInfo = await governance.getShareholderInfo(shareholder1.address);
      expect(shareholderInfo[0]).to.be.true; // active
      expect(shareholderInfo[1]).to.equal(10000); // shares
      expect(shareholderInfo[3]).to.equal("Alice Johnson"); // name
    });

    it("should emit ShareholderAdd event", async function () {
      await expect(governance.addShareholder(shareholder1.address, 5000, "Bob Smith"))
        .to.emit(governance, "ShareholderAdd")
        .withArgs(shareholder1.address);
    });

    it("should prevent non-board member from adding shareholders", async function () {
      await expect(
        governance.connect(unauthorizedUser).addShareholder(shareholder1.address, 1000, "Test")
      ).to.be.revertedWith("Board only");
    });

    it("should register multiple shareholders", async function () {
      await governance.addShareholder(shareholder1.address, 10000, "Alice");
      await governance.addShareholder(shareholder2.address, 15000, "Bob");
      await governance.addShareholder(shareholder3.address, 20000, "Carol");

      expect((await governance.shareholders(shareholder1.address)).shares).to.equal(10000);
      expect((await governance.shareholders(shareholder2.address)).shares).to.equal(15000);
      expect((await governance.shareholders(shareholder3.address)).shares).to.equal(20000);
    });

    it("should update shareholder if registered again", async function () {
      await governance.addShareholder(shareholder1.address, 5000, "Alice");
      await governance.addShareholder(shareholder1.address, 10000, "Alice Updated");

      const shareholderInfo = await governance.shareholders(shareholder1.address);
      expect(shareholderInfo.shares).to.equal(10000);
      expect(shareholderInfo.name).to.equal("Alice Updated");
    });

    it("should allow registerShareholderPlain function", async function () {
      await governance.registerShareholderPlain(shareholder1.address, 7500, "", "David");

      const shareholderInfo = await governance.shareholders(shareholder1.address);
      expect(shareholderInfo.shares).to.equal(7500);
      expect(shareholderInfo.name).to.equal("David");
    });
  });

  describe("Proposal Creation", function () {
    beforeEach(async function () {
      await governance.initCompany("Test Company", 1000000);
      await governance.addShareholder(shareholder1.address, 10000, "Alice");
    });

    it("should allow board member to create proposal", async function () {
      const proposalTitle = "Elect new board member";
      const proposalType = 0; // BOARD
      const votingDays = 7;

      await governance.createProposal(proposalType, proposalTitle, votingDays);

      expect(await governance.getTotalProposals()).to.equal(1);
    });

    it("should emit ProposalAdd event", async function () {
      await expect(governance.createProposal(0, "Test Proposal", 5))
        .to.emit(governance, "ProposalAdd")
        .withArgs(1);
    });

    it("should prevent non-board member from creating proposal", async function () {
      await expect(
        governance.connect(shareholder1).createProposal(0, "Unauthorized Proposal", 7)
      ).to.be.revertedWith("Board only");
    });

    it("should set correct proposal type thresholds", async function () {
      await governance.createProposal(0, "Board Proposal", 7); // 50% threshold
      await governance.createProposal(1, "Budget Proposal", 7); // 60% threshold
      await governance.createProposal(2, "Merger Proposal", 7); // 75% threshold

      const proposal1 = await governance.proposals(0);
      const proposal2 = await governance.proposals(1);
      const proposal3 = await governance.proposals(2);

      expect(proposal1.threshold).to.equal(50);
      expect(proposal2.threshold).to.equal(60);
      expect(proposal3.threshold).to.equal(75);
    });

    it("should set correct deadline for proposal", async function () {
      const votingDays = 10;
      const tx = await governance.createProposal(0, "Test", votingDays);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const proposal = await governance.proposals(0);
      const expectedDeadline = BigInt(block.timestamp) + BigInt(votingDays * 24 * 60 * 60);

      expect(proposal.deadline).to.equal(expectedDeadline);
    });

    it("should create multiple proposals", async function () {
      await governance.createProposal(0, "Proposal 1", 7);
      await governance.createProposal(1, "Proposal 2", 5);
      await governance.createProposal(2, "Proposal 3", 14);

      expect(await governance.getTotalProposals()).to.equal(3);
    });

    it("should return correct proposal ID", async function () {
      const proposalId = await governance.createProposal.staticCall(0, "Test", 7);
      expect(proposalId).to.equal(1);

      await governance.createProposal(0, "Test", 7);
      const proposalId2 = await governance.createProposal.staticCall(0, "Test 2", 7);
      expect(proposalId2).to.equal(2);
    });
  });

  describe("Voting Mechanism", function () {
    beforeEach(async function () {
      await governance.initCompany("Test Company", 1000000);
      await governance.addShareholder(shareholder1.address, 10000, "Alice");
      await governance.addShareholder(shareholder2.address, 15000, "Bob");
      await governance.createProposal(0, "Test Proposal", 7);
    });

    it("should allow shareholder to vote FOR", async function () {
      await governance.connect(shareholder1).vote(1, 1);

      const proposal = await governance.proposals(0);
      expect(proposal.forVotes).to.equal(10000);
      expect(proposal.againstVotes).to.equal(0);
    });

    it("should allow shareholder to vote AGAINST", async function () {
      await governance.connect(shareholder1).vote(1, 2);

      const proposal = await governance.proposals(0);
      expect(proposal.forVotes).to.equal(0);
      expect(proposal.againstVotes).to.equal(10000);
    });

    it("should emit VoteAdd event", async function () {
      await expect(governance.connect(shareholder1).vote(1, 1))
        .to.emit(governance, "VoteAdd")
        .withArgs(1, shareholder1.address);
    });

    it("should prevent non-shareholder from voting", async function () {
      await expect(
        governance.connect(unauthorizedUser).vote(1, 1)
      ).to.be.revertedWith("Shareholder only");
    });

    it("should prevent double voting", async function () {
      await governance.connect(shareholder1).vote(1, 1);

      await expect(
        governance.connect(shareholder1).vote(1, 1)
      ).to.be.revertedWith("Already voted");
    });

    it("should reject invalid proposal ID", async function () {
      await expect(
        governance.connect(shareholder1).vote(99, 1)
      ).to.be.revertedWith("Invalid ID");
    });

    it("should aggregate votes from multiple shareholders", async function () {
      await governance.connect(shareholder1).vote(1, 1); // 10000 FOR
      await governance.connect(shareholder2).vote(1, 1); // 15000 FOR

      const proposal = await governance.proposals(0);
      expect(proposal.forVotes).to.equal(25000);
    });

    it("should handle mixed voting", async function () {
      await governance.connect(shareholder1).vote(1, 1); // 10000 FOR
      await governance.connect(shareholder2).vote(1, 2); // 15000 AGAINST

      const proposal = await governance.proposals(0);
      expect(proposal.forVotes).to.equal(10000);
      expect(proposal.againstVotes).to.equal(15000);
    });

    it("should track who has voted", async function () {
      await governance.connect(shareholder1).vote(1, 1);

      expect(await governance.hasVotedOn(1, shareholder1.address)).to.be.true;
      expect(await governance.hasVotedOn(1, shareholder2.address)).to.be.false;
    });

    it("should allow castVotePlain function", async function () {
      await governance.connect(shareholder1).castVotePlain(1, 1);

      const proposal = await governance.proposals(0);
      expect(proposal.forVotes).to.equal(10000);
    });

    it("should allow castConfidentialVote function", async function () {
      await governance.connect(shareholder1).castConfidentialVote(1, 1);

      const proposal = await governance.proposals(0);
      expect(proposal.forVotes).to.equal(10000);
    });

    it("should allow voteConfidential function", async function () {
      await governance.connect(shareholder1).voteConfidential(1, 1);

      const proposal = await governance.proposals(0);
      expect(proposal.forVotes).to.equal(10000);
    });
  });

  describe("Proposal Finalization", function () {
    beforeEach(async function () {
      await governance.initCompany("Test Company", 1000000);
      await governance.addShareholder(shareholder1.address, 60000, "Alice");
      await governance.addShareholder(shareholder2.address, 40000, "Bob");
      await governance.createProposal(0, "Test Proposal", 7);
    });

    it("should prevent finalization before deadline", async function () {
      await expect(
        governance.finalize(1)
      ).to.be.revertedWith("Cannot finalize");
    });

    it("should allow finalization after deadline", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]); // 8 days
      await ethers.provider.send("evm_mine");

      await governance.finalize(1);

      const proposal = await governance.proposals(0);
      expect(proposal.active).to.be.false;
    });

    it("should prevent non-board member from finalizing", async function () {
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(
        governance.connect(unauthorizedUser).finalize(1)
      ).to.be.revertedWith("Board only");
    });

    it("should reject invalid proposal ID for finalization", async function () {
      await expect(
        governance.finalize(99)
      ).to.be.revertedWith("Invalid ID");
    });

    it("should allow finalizeProposal function", async function () {
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await governance.finalizeProposal(1);

      const proposal = await governance.proposals(0);
      expect(proposal.active).to.be.false;
    });
  });

  describe("Results and Calculations", function () {
    beforeEach(async function () {
      await governance.initCompany("Test Company", 1000000);
      await governance.addShareholder(shareholder1.address, 60000, "Alice");
      await governance.addShareholder(shareholder2.address, 40000, "Bob");
      await governance.createProposal(0, "Test Proposal", 7);
    });

    it("should calculate passing result correctly", async function () {
      await governance.connect(shareholder1).vote(1, 1); // 60000 FOR
      await governance.connect(shareholder2).vote(1, 1); // 40000 FOR

      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await governance.finalize(1);

      const [forVotes, againstVotes, passed] = await governance.getResults(1);
      expect(forVotes).to.equal(60000);
      expect(againstVotes).to.equal(40000);
      expect(passed).to.be.true; // 100% FOR > 50% threshold
    });

    it("should calculate failing result correctly", async function () {
      await governance.connect(shareholder1).vote(1, 2); // 60000 AGAINST
      await governance.connect(shareholder2).vote(1, 1); // 40000 FOR

      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await governance.finalize(1);

      const [forVotes, againstVotes, passed] = await governance.getResults(1);
      expect(forVotes).to.equal(40000);
      expect(againstVotes).to.equal(60000);
      expect(passed).to.be.false; // 40% FOR < 50% threshold
    });

    it("should prevent getting results for active proposal", async function () {
      await governance.connect(shareholder1).vote(1, 1);

      await expect(
        governance.getResults(1)
      ).to.be.revertedWith("Still active");
    });

    it("should allow getDecryptedResults function", async function () {
      await governance.connect(shareholder1).vote(1, 1);
      await governance.connect(shareholder2).vote(1, 1);

      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await governance.finalize(1);

      const [forVotes, againstVotes, abstainVotes, passed] = await governance.getDecryptedResults(1);
      expect(forVotes).to.equal(60000);
      expect(againstVotes).to.equal(40000);
      expect(abstainVotes).to.equal(0);
      expect(passed).to.be.true;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await governance.initCompany("Innovation Labs", 1000000);
      await governance.addBoard(boardMember1.address);
      await governance.addShareholder(shareholder1.address, 25000, "Alice Johnson");
      await governance.createProposal(0, "Board Election", 7);
    });

    it("should return correct company info", async function () {
      const [name, symbol, description, shares, timestamp, boardList] = await governance.getCompanyInfo();

      expect(name).to.equal("Innovation Labs");
      expect(symbol).to.equal("CORP");
      expect(shares).to.equal(1000000);
      expect(boardList.length).to.equal(2); // deployer + boardMember1
    });

    it("should return correct shareholder info", async function () {
      const [active, shares, id, name, registered] = await governance.getShareholderInfo(shareholder1.address);

      expect(active).to.be.true;
      expect(shares).to.equal(25000);
      expect(name).to.equal("Alice Johnson");
      expect(registered).to.be.true;
    });

    it("should return correct proposal basic info", async function () {
      const [pType, title, proposer] = await governance.getProposalBasic(1);

      expect(pType).to.equal(0);
      expect(title).to.equal("Board Election");
      expect(proposer).to.equal(deployer.address);
    });

    it("should return correct proposal status", async function () {
      const [deadline, active, threshold] = await governance.getProposalStatus(1);

      expect(active).to.be.true;
      expect(threshold).to.equal(50);
    });

    it("should return correct proposal full info", async function () {
      const proposalInfo = await governance.getProposalInfo(1);

      expect(proposalInfo[0]).to.equal(1); // id
      expect(proposalInfo[1]).to.equal(0); // type
      expect(proposalInfo[2]).to.equal("Board Election"); // title
      expect(proposalInfo[4]).to.equal(deployer.address); // proposer
      expect(proposalInfo[7]).to.be.true; // active
      expect(proposalInfo[10]).to.equal(50); // threshold
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await governance.initCompany("Test Company", 1000000);
    });

    it("should handle zero shares shareholder", async function () {
      await governance.addShareholder(shareholder1.address, 0, "Zero Shares");

      const shareholderInfo = await governance.shareholders(shareholder1.address);
      expect(shareholderInfo.shares).to.equal(0);
    });

    it("should handle very large share amounts", async function () {
      const largeAmount = 999999999;
      await governance.addShareholder(shareholder1.address, largeAmount, "Large Holder");

      const shareholderInfo = await governance.shareholders(shareholder1.address);
      expect(shareholderInfo.shares).to.equal(largeAmount);
    });

    it("should handle proposal with zero voting days", async function () {
      await governance.createProposal(0, "Instant Proposal", 0);

      const proposal = await governance.proposals(0);
      expect(proposal.active).to.be.true;
    });

    it("should handle empty proposal title", async function () {
      await governance.createProposal(0, "", 7);

      const proposal = await governance.proposals(0);
      expect(proposal.title).to.equal("");
    });

    it("should handle empty shareholder name", async function () {
      await governance.addShareholder(shareholder1.address, 1000, "");

      const shareholderInfo = await governance.shareholders(shareholder1.address);
      expect(shareholderInfo.name).to.equal("");
    });
  });

  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await governance.initCompany("Test Company", 1000000);
      await governance.addShareholder(shareholder1.address, 10000, "Alice");
      await governance.createProposal(0, "Test", 7);
    });

    it("should have reasonable gas cost for voting", async function () {
      const tx = await governance.connect(shareholder1).vote(1, 1);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(150000);
    });

    it("should have reasonable gas cost for proposal creation", async function () {
      const tx = await governance.createProposal(0, "Another Proposal", 7);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(200000);
    });

    it("should have reasonable gas cost for shareholder registration", async function () {
      const tx = await governance.addShareholder(shareholder2.address, 5000, "Bob");
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(150000);
    });
  });
});
