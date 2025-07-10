const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const FHEVotingModule = buildModule("FHEVotingModule", (m) => {
  const fheVoting = m.contract("FHEVoting");

  return { fheVoting };
});

module.exports = FHEVotingModule;