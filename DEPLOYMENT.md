# Deployment Guide

This document provides comprehensive instructions for deploying and managing the Corporate Governance Platform smart contracts.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Process](#deployment-process)
- [Contract Verification](#contract-verification)
- [Deployment Information](#deployment-information)
- [Network Configuration](#network-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn** package manager
3. **MetaMask** or another Ethereum wallet
4. **Test ETH** for Sepolia testnet deployment
5. **Etherscan API Key** for contract verification

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Gas reporting
REPORT_GAS=false
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

**Security Warning:** Never commit your `.env` file to version control!

### 3. Get Test ETH

For Sepolia testnet:
- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Enter your wallet address
- Request test ETH

## Deployment Process

### Local Development Network

1. **Start Local Hardhat Node:**
```bash
npm run node
```

2. **Deploy to Local Network:**
```bash
npm run deploy:local
```

### Sepolia Testnet

1. **Ensure you have Sepolia ETH** in your deployment wallet

2. **Compile Contracts:**
```bash
npm run compile
```

3. **Deploy to Sepolia:**
```bash
npm run deploy:sepolia
```

Expected output:
```
========================================
Corporate Governance Platform Deployment
========================================

Deployment Configuration:
-------------------------
Network: sepolia
Chain ID: 11155111
Deployer Address: 0x...
Account Balance: 0.5 ETH

Deploying CorporateGovernanceUltimate contract...
✓ Contract deployed successfully!
Contract Address: 0x742d35Cc6474C4f0D1c6B2f0B9b8E99a8c123456
Transaction Hash: 0x...
Gas Used: 2547893
Block Number: 5123456

Initializing company configuration...
✓ Company initialized
Company Name: Corporate Governance Platform
Total Shares: 1,000,000

✓ Deployment information saved to: deployments/deployment-sepolia-1234567890.json
```

### Mainnet Deployment

**Warning:** Deploying to mainnet requires real ETH. Double-check all configurations!

1. **Update `.env` with mainnet RPC URL**
2. **Ensure sufficient ETH for gas fees**
3. **Deploy:**
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Contract Verification

Verify your contract on Etherscan for transparency and easier interaction:

### Automatic Verification

Verification happens automatically during deployment on testnets/mainnet.

### Manual Verification

If automatic verification fails:

```bash
npm run verify:sepolia
```

Or manually using Hardhat:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

Expected output:
```
========================================
Contract Verification on Etherscan
========================================

Deployment Information:
-----------------------
Network: sepolia
Contract Address: 0x742d35Cc6474C4f0D1c6B2f0B9b8E99a8c123456

Starting verification process...
✓ Contract verified successfully!

View on Etherscan:
https://sepolia.etherscan.io/address/0x742d35Cc6474C4f0D1c6B2f0B9b8E99a8c123456#code
```

## Deployment Information

### Deployment Artifacts

After deployment, check the `deployments/` directory for JSON files containing:

- Contract address
- Network information
- Deployer address
- Transaction hash
- Block number
- Company configuration
- Timestamp

Example `deployment-sepolia-1234567890.json`:
```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "contractAddress": "0x742d35Cc6474C4f0D1c6B2f0B9b8E99a8c123456",
  "deployer": "0xYourAddress...",
  "companyName": "Corporate Governance Platform",
  "totalShares": 1000000,
  "deploymentTime": "2024-01-15T10:30:00.000Z",
  "blockNumber": 5123456,
  "transactionHash": "0x..."
}
```

### Network Details

#### Sepolia Testnet
- **Network Name:** Sepolia
- **Chain ID:** 11155111
- **RPC URL:** https://ethereum-sepolia-rpc.publicnode.com
- **Block Explorer:** https://sepolia.etherscan.io/
- **Faucet:** https://sepoliafaucet.com/

#### Ethereum Mainnet
- **Network Name:** Mainnet
- **Chain ID:** 1
- **RPC URL:** https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
- **Block Explorer:** https://etherscan.io/

## Network Configuration

The project supports multiple networks configured in `hardhat.config.js`:

### Supported Networks

| Network | Chain ID | Use Case |
|---------|----------|----------|
| Hardhat | 31337 | Local testing |
| Localhost | 31337 | Local node |
| Sepolia | 11155111 | Public testnet |
| Mainnet | 1 | Production |

### Custom Network

To add a custom network, edit `hardhat.config.js`:

```javascript
networks: {
  customNetwork: {
    url: process.env.CUSTOM_RPC_URL,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 12345,
  }
}
```

## Post-Deployment Steps

After successful deployment:

### 1. Interact with Contract

```bash
npm run interact
```

This script will:
- Connect to your deployed contract
- Register sample shareholders
- Create a test proposal
- Simulate voting

### 2. Run Full Simulation

```bash
npm run simulate
```

This creates a complete governance scenario with:
- Multiple board members
- Multiple shareholders
- Various proposal types
- Voting simulation

### 3. Update Frontend

If you have a frontend application:

1. Copy the contract address from deployment output
2. Update your frontend configuration:
```javascript
const CONTRACT_ADDRESS = "0x742d35Cc6474C4f0D1c6B2f0B9b8E99a8c123456";
```

## Troubleshooting

### Common Issues

#### 1. Insufficient Funds

**Error:** `sender doesn't have enough funds`

**Solution:**
- Check your wallet balance
- Get test ETH from faucet (for testnet)
- Ensure you have enough for gas fees

#### 2. Nonce Too Low

**Error:** `nonce has already been used`

**Solution:**
```bash
# Reset your account in MetaMask
# Or specify nonce manually in deployment script
```

#### 3. Gas Estimation Failed

**Error:** `cannot estimate gas`

**Solution:**
- Check contract code for errors
- Ensure all constructor parameters are correct
- Try increasing gas limit manually

#### 4. Verification Failed

**Error:** `Etherscan API error`

**Solution:**
- Verify ETHERSCAN_API_KEY is correct
- Wait 1-2 minutes after deployment
- Check if contract is already verified
- Ensure you're on the correct network

#### 5. RPC Connection Issues

**Error:** `could not detect network`

**Solution:**
- Check internet connection
- Verify RPC URL in `.env`
- Try alternative RPC endpoints
- Check if network is experiencing issues

### Getting Help

If you encounter issues:

1. Check the [Hardhat Documentation](https://hardhat.org/docs)
2. Review contract compilation errors: `npm run compile`
3. Enable verbose logging in scripts
4. Check network status and gas prices

## Gas Optimization

### Estimate Gas Costs

Enable gas reporting:

```bash
REPORT_GAS=true npm test
```

### Current Deployment Costs (Estimated)

| Network | Deployment Cost | Typical Range |
|---------|----------------|---------------|
| Sepolia | ~0.001 ETH | 0.0005 - 0.002 ETH |
| Mainnet | ~0.05 ETH | 0.03 - 0.1 ETH |

*Note: Costs vary based on network congestion and gas prices*

## Security Checklist

Before mainnet deployment:

- [ ] Audit smart contract code
- [ ] Test all functions thoroughly
- [ ] Verify access controls
- [ ] Check for reentrancy vulnerabilities
- [ ] Review upgrade mechanisms
- [ ] Test on testnet first
- [ ] Verify contract on Etherscan
- [ ] Document all functions
- [ ] Set up monitoring
- [ ] Prepare incident response plan

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Etherscan API](https://docs.etherscan.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

**Need Help?** Create an issue in the project repository or consult the documentation.
