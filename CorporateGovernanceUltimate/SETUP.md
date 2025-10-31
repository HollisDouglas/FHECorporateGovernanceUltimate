# Setup Guide

Complete setup guide for the Corporate Governance Vue.js application with FHE-based confidential voting.

## Quick Start

```bash
# 1. Navigate to project directory
cd examples/CorporateGovernanceUltimate-main

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Start development server
npm run dev
```

The application will be running at `http://localhost:3001`

## Detailed Setup

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **MetaMask**: Browser extension for Web3 wallet

Check your versions:
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

### 2. Installation

Install all project dependencies:

```bash
npm install
```

This will install:
- Vue 3.4.21 - Progressive JavaScript framework
- TypeScript 5.2.2 - Type-safe development
- Vite 5.2.0 - Build tool and dev server
- Ethers.js 6.14.3 - Ethereum interaction
- fhevmjs 0.5.0 - FHE encryption
- Tailwind CSS 3.4.4 - Styling framework
- Vue Router 4.3.0 - Routing

### 3. Environment Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Contract address on Sepolia testnet
VITE_CONTRACT_ADDRESS=0x7c04dD380e26B56899493ec7A654EdEf108A2414

# Sepolia RPC URL (use your own Infura/Alchemy key)
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Sepolia chain ID
VITE_CHAIN_ID=11155111

# Application name
VITE_APP_NAME=Corporate Governance

# Application description
VITE_APP_DESCRIPTION=Confidential Shareholder Voting with FHE
```

### 4. Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at:
- Local: `http://localhost:3001`
- Network: `http://[your-ip]:3001` (accessible from other devices)

### 5. Building for Production

Build the optimized production bundle:

```bash
npm run build
```

This creates a `dist/` directory with:
- Minified JavaScript bundles
- Optimized CSS
- Source maps for debugging
- Vendor chunk splitting for better caching

Preview the production build locally:

```bash
npm run preview
```

### 6. MetaMask Setup

1. **Install MetaMask**:
   - Visit https://metamask.io/
   - Install the browser extension
   - Create or import a wallet

2. **Add Sepolia Network**:
   - The app will prompt you to switch networks
   - Click "Switch to Sepolia" when prompted
   - Approve the network addition in MetaMask

3. **Get Test ETH**:
   - Visit a Sepolia faucet: https://sepoliafaucet.com/
   - Enter your wallet address
   - Receive test ETH for transactions

### 7. Smart Contract Deployment (Optional)

If you need to deploy your own contract:

1. Navigate to the governance-dapp contracts directory:
```bash
cd ../governance-dapp/contracts
```

2. Deploy the ConfidentialGovernance contract to Sepolia

3. Update `VITE_CONTRACT_ADDRESS` in your `.env` file

## Project Structure

```
CorporateGovernanceUltimate-main/
├── src/
│   ├── components/              # Reusable Vue components
│   │   ├── CreateProposalModal.vue  # Modal for creating proposals
│   │   ├── ProposalCard.vue         # Proposal display card
│   │   ├── Toast.vue                # Toast notifications
│   │   ├── VoteModal.vue            # Voting interface
│   │   └── WalletConnect.vue        # Wallet connection UI
│   ├── composables/             # Vue 3 Composition API logic
│   │   ├── useContract.ts       # Smart contract interactions
│   │   ├── useFHEVM.ts          # FHE encryption logic
│   │   └── useWallet.ts         # Wallet management
│   ├── router/                  # Vue Router configuration
│   │   └── index.ts
│   ├── styles/                  # Global styles
│   │   └── tailwind.css
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                   # Utility functions
│   │   ├── constants.ts         # Contract ABI & config
│   │   ├── formatters.ts        # Data formatting
│   │   └── toast.ts             # Toast manager
│   ├── views/                   # Page components
│   │   ├── Dashboard.vue        # Main dashboard
│   │   └── Proposals.vue        # All proposals view
│   ├── App.vue                  # Root component
│   ├── main.ts                  # App entry point
│   └── vite-env.d.ts            # TypeScript declarations
├── public/                      # Static assets
├── .env.example                 # Environment template
├── .eslintrc.cjs                # ESLint configuration
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts
├── postcss.config.js            # PostCSS configuration
├── README.md                    # Project documentation
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── tsconfig.node.json           # Node TypeScript config
└── vite.config.ts               # Vite configuration
```

## Available Scripts

```bash
# Start development server (port 3001)
npm run dev

# Build for production
npm run build

# Build production bundle only
npm run build:production

# Preview production build (port 3019)
npm run preview

# Type check without emitting files
npm run type-check

# Run ESLint
npm run lint
```

## Key Features Explained

### 1. Wallet Connection (`src/composables/useWallet.ts`)

- Connects to MetaMask and other Web3 wallets
- Detects network changes and prompts switching to Sepolia
- Monitors account changes and balance updates
- Persists connection state across page refreshes

### 2. FHE Encryption (`src/composables/useFHEVM.ts`)

- Initializes FHEVM instance when wallet connects
- Encrypts votes client-side using Fully Homomorphic Encryption
- Provides encryption status to UI components
- Handles encryption errors gracefully

### 3. Smart Contract Interaction (`src/composables/useContract.ts`)

- Loads contract state and proposals
- Casts votes with optional FHE encryption
- Creates new governance proposals
- Estimates gas and handles transaction errors
- Provides real-time loading states

### 4. Toast Notifications (`src/utils/toast.ts`)

- Custom toast notification system
- Supports success, error, info, and loading states
- Auto-dismisses after configurable duration
- Can update existing toasts for multi-step processes

### 5. Responsive UI

- Mobile-first design with Tailwind CSS
- Beautiful gradients and animations
- Card-based layout for proposals
- Modal dialogs for voting and proposal creation

## Troubleshooting

### Issue: MetaMask not detected

**Solution**:
- Ensure MetaMask extension is installed and enabled
- Refresh the page after installing MetaMask
- Check browser console for errors

### Issue: Wrong network

**Solution**:
- Click "Switch to Sepolia" button in the header
- Approve the network switch in MetaMask
- If Sepolia is not available, the app will add it automatically

### Issue: Transaction fails

**Solution**:
- Ensure you have sufficient test ETH on Sepolia
- Check if you're registered as a shareholder
- Verify the proposal is still active and within deadline
- Check gas estimation in browser console

### Issue: FHE encryption fails

**Solution**:
- The app will automatically fallback to unencrypted voting
- Check network connectivity to the FHE gateway
- Ensure wallet is connected and on the correct network

### Issue: Build errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Try building again
npm run build
```

## Development Tips

1. **Hot Module Replacement**: Changes to Vue components and TypeScript files will hot reload automatically

2. **TypeScript Errors**: Run `npm run type-check` to see all TypeScript errors without building

3. **Tailwind IntelliSense**: Install the Tailwind CSS IntelliSense VS Code extension for class autocomplete

4. **Vue DevTools**: Install Vue DevTools browser extension for debugging Vue components

5. **Network Tab**: Monitor blockchain transactions in browser DevTools Network tab

## Next Steps

1. **Customize Styling**: Edit `tailwind.config.js` to match your brand colors

2. **Add Features**:
   - Proposal voting results visualization
   - Shareholder registration form
   - Board member management interface
   - Voting history tracking

3. **Deploy**:
   - Build for production: `npm run build`
   - Deploy `dist/` folder to hosting (Vercel, Netlify, etc.)
   - Configure environment variables on hosting platform

4. **Testing**:
   - Add unit tests with Vitest
   - Add component tests with Vue Test Utils
   - Add E2E tests with Playwright

## Support & Resources

- **Vue.js Documentation**: https://vuejs.org/
- **Vite Documentation**: https://vitejs.dev/
- **Ethers.js Documentation**: https://docs.ethers.org/
- **FHEVM SDK**: Refer to the SDK documentation in `packages/fhevm-sdk/`
- **Tailwind CSS**: https://tailwindcss.com/docs

## License

MIT License - See LICENSE file for details
