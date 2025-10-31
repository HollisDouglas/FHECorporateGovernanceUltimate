# Corporate Governance - Vue.js Application

A modern corporate governance application built with Vue.js 3 and FHEVM SDK, featuring confidential voting using Fully Homomorphic Encryption (FHE).

## Features

- **Confidential Voting**: Vote on proposals with FHE encryption for maximum privacy
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Real-time Updates**: Live proposal status and voting results
- **Modern UI**: Beautiful, responsive interface built with Vue 3 and Tailwind CSS
- **Type Safety**: Full TypeScript support throughout the application
- **Production Ready**: Comprehensive error handling and loading states

## Technology Stack

- **Vue 3**: Progressive JavaScript framework with Composition API
- **TypeScript**: Type-safe development
- **Vite**: Next-generation frontend build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Ethers.js**: Ethereum library for blockchain interaction
- **FHEVM SDK**: Fully Homomorphic Encryption for confidential voting
- **Vue Router**: Official router for Vue.js

## Project Structure

```
CorporateGovernanceUltimate
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── CreateProposalModal.vue
│   │   ├── ProposalCard.vue
│   │   ├── Toast.vue
│   │   ├── VoteModal.vue
│   │   └── WalletConnect.vue
│   ├── composables/         # Vue composables for logic reuse
│   │   ├── useContract.ts   # Smart contract interactions
│   │   ├── useFHEVM.ts      # FHE encryption logic
│   │   └── useWallet.ts     # Wallet connection and management
│   ├── router/              # Vue Router configuration
│   │   └── index.ts
│   ├── styles/              # Global styles
│   │   └── tailwind.css
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── constants.ts     # Contract ABI and configuration
│   │   ├── formatters.ts    # Data formatting utilities
│   │   └── toast.ts         # Toast notification manager
│   ├── views/               # Page components
│   │   ├── Dashboard.vue
│   │   └── Proposals.vue
│   ├── App.vue              # Root component
│   └── main.ts              # Application entry point
├── public/                  # Static assets
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # This file
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask or compatible Web3 wallet

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your contract address and RPC URL if needed.

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Key Components

### Composables

- **useWallet**: Manages wallet connection, network switching, and account state
- **useFHEVM**: Handles FHE encryption initialization and vote encryption
- **useContract**: Provides smart contract interaction methods

### Components

- **WalletConnect**: Wallet connection button with status display
- **ProposalCard**: Displays proposal information and voting status
- **VoteModal**: Modal for casting votes with FHE encryption option
- **CreateProposalModal**: Form for creating new governance proposals
- **Toast**: Toast notification system for user feedback

### Views

- **Dashboard**: Overview of active and completed proposals with statistics
- **Proposals**: Full list of all proposals with creation capability

## Features in Detail

### FHE-based Confidential Voting

The application integrates FHEVM SDK to provide confidential voting:

1. When a user casts a vote, they can choose to encrypt it using FHE
2. The vote is encrypted client-side before being sent to the blockchain
3. Vote tallies remain confidential until the proposal is finalized
4. Results are decrypted only after the voting period ends

### Smart Contract Integration

The application connects to a ConfidentialGovernance smart contract deployed on Sepolia testnet:

- Create governance proposals (board members only)
- Cast votes on active proposals (shareholders only)
- View proposal status and deadlines
- Track voting participation

### Wallet Management

- Automatic wallet connection on page load if previously connected
- Network detection and switching to Sepolia testnet
- Real-time balance updates
- Account change detection

## Environment Variables

- `VITE_CONTRACT_ADDRESS`: Address of the deployed governance contract
- `VITE_RPC_URL`: Ethereum RPC endpoint URL
- `VITE_CHAIN_ID`: Network chain ID (11155111 for Sepolia)
- `VITE_APP_NAME`: Application name
- `VITE_APP_DESCRIPTION`: Application description

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run type-check`: Run TypeScript type checking
- `npm run lint`: Run ESLint

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Support

For issues and questions, please refer to the FHEVM SDK documentation and Vue.js documentation.
