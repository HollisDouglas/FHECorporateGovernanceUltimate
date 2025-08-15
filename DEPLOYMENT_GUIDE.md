# 🚀 Complete Deployment Guide

## Overview

This guide walks you through deploying your FHEVM dApp to various networks, from local development to production mainnet.

## 📋 Pre-Deployment Checklist

### ✅ Development Environment
- [ ] Node.js >= 18.0.0 installed
- [ ] npm >= 9.0.0 installed
- [ ] Git installed and configured
- [ ] MetaMask browser extension installed
- [ ] Code editor with Solidity extension

### ✅ Project Setup
- [ ] All dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Environment variables configured (`.env` file)
- [ ] Contracts compile successfully (`npm run compile:fhe`)
- [ ] Frontend builds successfully (`cd frontend && npm run build`)

### ✅ Security Verification
- [ ] Private keys secured (never commit to version control)
- [ ] Contract access controls verified
- [ ] Frontend error handling implemented
- [ ] No sensitive data exposed in frontend

## 🌐 Network Configurations

### Local Development (Hardhat Network)

**Use for**: Initial development and testing

```javascript
// hardhat.config.js
networks: {
  hardhat: {
    chainId: 31337,
    gas: "auto",
    gasPrice: "auto"
  }
}
```

**Deployment**:
```bash
# Start local node
npx hardhat node

# Deploy to local network
npm run deploy:corporate
```

### Zama Devnet (Recommended for FHEVM Testing)

**Use for**: FHEVM feature testing and demonstration

```javascript
// hardhat.config.fhe.js
networks: {
  "zama-devnet": {
    url: "https://devnet.zama.ai",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 8009,
    gas: "auto",
    gasPrice: "auto"
  }
}
```

**Setup Steps**:
1. **Get Test Tokens**:
   - Visit [Zama Faucet](https://faucet.zama.ai)
   - Connect your MetaMask wallet
   - Request test ZAMA tokens
   - Wait for confirmation

2. **Configure MetaMask**:
   ```javascript
   // Add Zama Devnet to MetaMask
   {
     chainId: "0x1F49", // 8009 in hex
     chainName: "Zama Devnet",
     rpcUrls: ["https://devnet.zama.ai"],
     nativeCurrency: {
       name: "ZAMA",
       symbol: "ZAMA",
       decimals: 18
     },
     blockExplorerUrls: ["https://explorer.zama.ai"]
   }
   ```

3. **Deploy Contract**:
   ```bash
   npm run compile:fhe
   npm run deploy:fhe
   ```

### Ethereum Sepolia Testnet

**Use for**: Ethereum compatibility testing

```javascript
// hardhat.config.js
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 11155111,
    gas: "auto",
    gasPrice: "auto"
  }
}
```

**Setup Steps**:
1. **Get Sepolia ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Or [Alchemy Faucet](https://sepoliafaucet.com/)

2. **Deploy Contract**:
   ```bash
   npm run compile
   npm run deploy -- --network sepolia
   ```

3. **Verify Contract**:
   ```bash
   npm run verify -- --network sepolia YOUR_CONTRACT_ADDRESS
   ```

## 🔧 Deployment Scripts

### Basic Deployment Script

```javascript
// scripts/deploy-fhe.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to FHEVM network...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📋 Deploying with account: ${deployer.address}`);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy contract
  console.log("📦 Deploying CorporateGovernanceUltimate contract...");
  const CorporateGovernance = await ethers.getContractFactory("CorporateGovernanceUltimate");
  const contract = await CorporateGovernance.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`✅ Contract deployed to: ${contractAddress}`);
  console.log(`🔗 Transaction hash: ${contract.deploymentTransaction().hash}`);

  // Initialize the company
  console.log("🏢 Initializing company...");
  const initTx = await contract.initCompany("Acme Corporation", 1000000);
  await initTx.wait();
  console.log("✅ Company initialized successfully");

  // Save deployment info
  const deploymentInfo = {
    network: process.env.HARDHAT_NETWORK || "localhost",
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction().hash
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment-info.json");
  console.log("🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
```

### Advanced Deployment with Verification

```javascript
// scripts/deploy-and-verify.js
const { ethers, run } = require("hardhat");

async function main() {
  // ... deployment code ...

  // Verify contract on Etherscan
  if (process.env.ETHERSCAN_API_KEY && network.name !== "hardhat") {
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: []
      });
      console.log("✅ Contract verified successfully");
    } catch (error) {
      console.error("❌ Verification failed:", error.message);
    }
  }
}
```

## 🎨 Frontend Deployment

### Development Server

```bash
cd frontend
npm run dev
```

**Access**: `http://localhost:3000`

### Production Build

```bash
cd frontend
npm run build
```

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Configure Build Settings**:
   ```json
   // vercel.json
   {
     "framework": "vite",
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

4. **Configure Environment Variables** in Vercel dashboard:
   - `VITE_CONTRACT_ADDRESS`: Your deployed contract address
   - `VITE_NETWORK_ID`: Target network chain ID
   - `VITE_RPC_URL`: RPC endpoint URL

### Deploy to Netlify

1. **Configure Build Settings**:
   ```toml
   # netlify.toml
   [build]
     publish = "frontend/dist"
     command = "cd frontend && npm run build"

   [build.environment]
     NODE_VERSION = "18"
   ```

2. **Deploy**:
   - Connect your GitHub repository to Netlify
   - Configure environment variables in Netlify dashboard
   - Trigger deployment

## 🔐 Security Best Practices

### Smart Contract Security

1. **Access Control**:
   ```solidity
   // Use OpenZeppelin's access control
   import "@openzeppelin/contracts/access/Ownable.sol";
   import "@openzeppelin/contracts/access/AccessControl.sol";
   ```

2. **Gas Optimization**:
   ```solidity
   // Use events for logging instead of storage
   event VoteAdded(uint256 indexed proposalId, address indexed voter);

   // Pack structs efficiently
   struct Proposal {
     uint32 forVotes;      // 4 bytes
     uint32 againstVotes;  // 4 bytes
     uint32 threshold;     // 4 bytes
     bool active;          // 1 byte (packed with above)
     // Total: 32 bytes (1 storage slot)
   }
   ```

3. **Reentrancy Protection**:
   ```solidity
   import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

   contract CorporateGovernance is ReentrancyGuard {
     function vote(uint256 _id, uint8 _choice) external nonReentrant {
       // Your voting logic
     }
   }
   ```

### Frontend Security

1. **Environment Variables**:
   ```javascript
   // Use environment variables for configuration
   const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
   const NETWORK_ID = import.meta.env.VITE_NETWORK_ID;
   ```

2. **Input Validation**:
   ```javascript
   const validateProposalInput = (title, type, days) => {
     if (!title || title.length < 5) {
       throw new Error("Title must be at least 5 characters");
     }
     if (type < 0 || type > 5) {
       throw new Error("Invalid proposal type");
     }
     if (days < 1 || days > 365) {
       throw new Error("Voting period must be between 1 and 365 days");
     }
   };
   ```

3. **Error Handling**:
   ```javascript
   const handleContractError = (error) => {
     if (error.code === 'INSUFFICIENT_FUNDS') {
       return "Insufficient funds for transaction";
     }
     if (error.reason) {
       return `Contract error: ${error.reason}`;
     }
     return "An unexpected error occurred";
   };
   ```

## 📊 Post-Deployment Verification

### Contract Verification Checklist

```bash
# Check contract deployment
npx hardhat verify --network zama-devnet YOUR_CONTRACT_ADDRESS

# Test basic functions
npx hardhat console --network zama-devnet
> const contract = await ethers.getContractAt("CorporateGovernanceUltimate", "YOUR_ADDRESS")
> await contract.companyName()
> await contract.initialized()
```

### Frontend Testing

1. **Connect Wallet**: Verify MetaMask connection works
2. **Network Detection**: Ensure correct network is detected
3. **Contract Interaction**: Test all major functions (create proposal, vote, etc.)
4. **Error Handling**: Test with invalid inputs and network issues
5. **Mobile Responsiveness**: Test on different screen sizes

### Performance Monitoring

1. **Transaction Monitoring**:
   ```javascript
   // Add transaction tracking
   const trackTransaction = async (txHash, operation) => {
     const receipt = await provider.waitForTransaction(txHash);
     console.log(`${operation} completed:`, {
       status: receipt.status,
       gasUsed: receipt.gasUsed.toString(),
       blockNumber: receipt.blockNumber
     });
   };
   ```

2. **Error Reporting**:
   ```javascript
   // Implement error reporting
   const reportError = (error, context) => {
     console.error(`Error in ${context}:`, error);
     // Send to monitoring service (e.g., Sentry)
   };
   ```

## 🔄 Upgrade Strategies

### Contract Upgrades

For production systems, consider implementing upgrade patterns:

```solidity
// Using OpenZeppelin's upgradeable contracts
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CorporateGovernanceUpgradeable is Initializable, OwnableUpgradeable {
    function initialize() public initializer {
        __Ownable_init();
        // Initialize your contract
    }
}
```

### Frontend Updates

1. **Version Management**:
   ```json
   // package.json
   {
     "version": "1.0.0",
     "scripts": {
       "version:patch": "npm version patch && git push && git push --tags",
       "version:minor": "npm version minor && git push && git push --tags"
     }
   }
   ```

2. **Feature Flags**:
   ```javascript
   // Feature toggle system
   const features = {
     ADVANCED_VOTING: import.meta.env.VITE_ENABLE_ADVANCED_VOTING === 'true',
     MULTI_SIG: import.meta.env.VITE_ENABLE_MULTI_SIG === 'true'
   };
   ```

## 📈 Monitoring and Analytics

### On-Chain Monitoring

```javascript
// Monitor contract events
const monitorEvents = async () => {
  contract.on("ProposalAdd", (proposalId, event) => {
    console.log(`New proposal created: ${proposalId}`);
  });

  contract.on("VoteAdd", (proposalId, voter, event) => {
    console.log(`Vote cast on proposal ${proposalId} by ${voter}`);
  });
};
```

### Performance Metrics

```javascript
// Track performance metrics
const metrics = {
  transactionTimes: [],
  gasUsage: [],
  errorRates: {}
};

const trackMetric = (type, value) => {
  if (!metrics[type]) metrics[type] = [];
  metrics[type].push(value);
};
```

## 🚨 Troubleshooting Common Issues

### Deployment Failures

**Issue**: "Insufficient funds"
```bash
# Check account balance
npx hardhat console --network zama-devnet
> const balance = await ethers.provider.getBalance("YOUR_ADDRESS")
> console.log(ethers.formatEther(balance))
```

**Issue**: "Gas estimation failed"
```javascript
// Deploy with manual gas limit
const contract = await CorporateGovernance.deploy({
  gasLimit: 5000000,
  gasPrice: ethers.parseUnits("20", "gwei")
});
```

**Issue**: "Network timeout"
```javascript
// Increase timeout in hardhat config
networks: {
  "zama-devnet": {
    url: "https://devnet.zama.ai",
    timeout: 60000, // 60 seconds
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

### Frontend Issues

**Issue**: "Contract not found"
```javascript
// Verify contract address and network
const checkContract = async () => {
  const code = await provider.getCode(CONTRACT_ADDRESS);
  if (code === '0x') {
    console.error('Contract not deployed at this address');
  }
};
```

**Issue**: "MetaMask connection failed"
```javascript
// Robust connection handling
const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User rejected connection');
    }
    throw error;
  }
};
```

---

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Netlify Deployment Guide](https://docs.netlify.com)

---

*Deployment completed successfully! Your FHEVM dApp is now live and ready for users! 🎉*