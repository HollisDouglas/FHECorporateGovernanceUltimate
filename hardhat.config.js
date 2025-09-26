import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.28",
settings: {        optimizer: {          enabled: true,          runs: 1000,        },        viaIR: true,      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://sepolia.infura.io/v3/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 20000000000, // 20 gwei
      gas: 6000000,
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};