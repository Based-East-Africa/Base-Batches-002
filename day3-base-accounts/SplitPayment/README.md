# Split Payment Demo - Base Account Workshop

A hands-on workshop demonstrating batch transactions using Base Account SDK and OnchainKit.

## What This App Demonstrates

- **Batch Transactions**: Send ETH to 3 recipients in a single transaction
- **Base Account SDK**: Smart wallet features without deploying contracts
- **OnchainKit Integration**: Seamless wallet connection and provider setup
- **Foundation for Gasless UX**: Ready for paymaster integration (day 4 workshop)

## Overview

### Part 1: Understanding the Architecture

#### How OnchainKit Helps
- **Wallet Connection**: Pre-built UI components
- **Provider Setup**: Wagmi/Viem already configured
- **Network Management**: Base Mainnet/Sepolia ready

#### What Base Account SDK Adds
- **Batch Transactions**: Multiple transfers in one click
- **Smart Wallet Features**: ERC-4337 accounts
- **Paymaster Integration**: Gas sponsorship (next workshop)

#### Key Concept

**Traditional Flow:**
```
User → Transfer 1 → Approve → Transfer 2 → Approve → Transfer 3 → Approve
(3 separate transactions, 3 gas fees, 3 confirmations)
```

**Base Account Batch:**
```
User → [Transfer 1 + Transfer 2 + Transfer 3] → One Approval
(1 transaction, 1 gas fee, 1 confirmation)
```

### Part 2: Code Walkthrough 

#### 1. SDK Initialization

```tsx
import { createBaseAccountSDK, base } from '@base-org/account';

const sdk = createBaseAccountSDK({
  appName: 'Split Payment Demo',
  appLogoUrl: 'https://base.org/favicon.ico',
  appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
});
```

**Explain**: This creates the SDK instance that bridges OnchainKit's wallet connection with Base Account features.

#### 2. Prepare Batch Calls

```tsx
const calls = [
  {
    to: '0xRecipient1Address',
    value: numberToHex(parseEther('0.001')),
    data: '0x', // Empty for simple ETH transfer
  },
  {
    to: '0xRecipient2Address',
    value: numberToHex(parseEther('0.001')),
    data: '0x',
  },
  {
    to: '0xRecipient3Address',
    value: numberToHex(parseEther('0.001')),
    data: '0x',
  }
];
```

**Explain**: Each call is a separate transfer. The `data: '0x'` means it's a simple ETH transfer (no contract interaction).

#### 3. Execute Batch Transaction

```tsx
const result = await provider.request({
  method: 'wallet_sendCalls',
  params: [{
    version: '2.0.0',
    from: userAddress,
    chainId: numberToHex(base.constants.CHAIN_IDS.baseSepolia),
    atomicRequired: true, // All succeed or all fail
    calls: calls
  }]
});
```

**Explain**:
- `atomicRequired: true` = all-or-nothing (important for payments)
- `wallet_sendCalls` = EIP-5792 standard method
- Returns transaction hash for tracking

### Part 3: Testing this project
### Prerequisites
- Node.js 18+ installed
- Coinbase Smart Wallet
- Base Sepolia testnet ETH (get from [Coinbase Developer Portal Faucet](https://portal.cdp.coinbase.com/products/faucet))
- OnchainKit API key (get from [Coinbase Developer Platform](https://portal.cdp.coinbase.com))
-If you do not have a Coinbase Developer Platform account(create one at [Coinbase Developer Platform](
https://app.fuul.xyz/landing/coinbase-cdp?referrer=0x4dc7f61e7B7Ea65729c6A135fa9178073CF50866
))

#### Steps:

1. **Clone & Install**
   ```bash
   git clone [your-repo]
   cd SplitPayment
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Add your NEXT_PUBLIC_ONCHAINKIT_API_KEY
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Connect Wallet** (OnchainKit component)
   - Click "Connect Wallet" button
   - **Emphasize**: "This is from OnchainKit - we didn't build this!"

5. **Enter Recipients**
   - 3 input fields for addresses
   - Amount input (split equally)

6. **Execute Split Payment**
   - Click "Split Payment" button
   - **ONE confirmation popup** 
   - See transaction on BaseScan

7. **Verify Results**
   - Check all 3 recipients received funds
   - See it's ONE transaction hash


"Notice how we didn't need to deploy a contract? That's because Base Accounts ARE smart wallets (ERC-4337). Day 4 we'll explore:"
- Sub-accounts (app-specific wallets)
- Multi-owner accounts
- Session keys

#### Bridge to Paymaster/Gasless UX

```tsx
// Show this config (don't implement yet)
const sdk = createBaseAccountSDK({
  appName: 'Split Payment Demo',
  appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
  paymasterUrls: {  // <-- Tomorrow's topic!
    [base.constants.CHAIN_IDS.baseSepolia]: 'https://paymaster-url'
  }
});
```

**Explain**: "See this `paymasterUrls` config? Tomorrow we'll add this ONE line and users won't pay gas fees!"



### Prerequisites
- Node.js 18+ installed
- Coinbase Wallet or compatible Web3 wallet
- Base Sepolia testnet ETH (get from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- OnchainKit API key (get from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/products/onchainkit))

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd SplitPayment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your OnchainKit API key:
   ```
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## File Structure

```
app/
  ├── page.tsx                    # Main page with wallet connection
  ├── layout.tsx                  # App layout
  ├── rootProvider.tsx            # OnchainKit provider setup
  └── components/
      ├── SplitPayment.tsx        # Core batch transaction component
      └── SplitPayment.module.css # Component styles
```

## How to Use the App

1. **Connect Wallet**: Click the wallet button in the header
2. **Get Test ETH**: Visit [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
3. **Enter Recipients**: Add 3 Ethereum addresses
4. **Set Amount**: Choose amount per recipient (default: 0.001 ETH)
5. **Split Payment**: Click button and approve in wallet
6. **View Transaction**: Click BaseScan link to see all 3 transfers

## Technical Details

### Dependencies
- `@base-org/account`: Base Account SDK for batch transactions
- `@coinbase/onchainkit`: Wallet connection and UI components
- `wagmi`: React hooks for Ethereum
- `viem`: TypeScript utilities for Ethereum
- `next`: React framework

### Key Features

#### Batch Transactions (`wallet_sendCalls`)
- Implements EIP-5792 standard
- Multiple operations in single transaction
- Atomic execution (all succeed or all fail)

#### OnchainKit Integration
- Pre-configured Wagmi and Viem
- Beautiful wallet connection UI
- Base Sepolia testnet ready

#### Error Handling
- User rejection detection
- Insufficient balance checking
- Clear error messages

## Common Issues

### Transaction Fails
- **Check balance**: Ensure you have enough ETH for total amount + gas
- **Verify addresses**: All recipient addresses must be valid Ethereum addresses
- **Network**: Confirm you're connected to Base Sepolia

### Wallet Won't Connect
- **Update wallet**: Ensure Coinbase Wallet is up to date
- **Clear cache**: Try clearing browser cache and reconnecting
- **Check network**: Add Base Sepolia to your wallet if needed

## Resources

### Documentation
- [Base Account SDK](https://docs.base.org/base-account/overview/what-is-base-account)
- [Batch Transactions](https://docs.base.org/base-account/improve-ux/batch-transactions)
- [OnchainKit](https://docs.base.org/onchainkit)
- [EIP-5792 Specification](https://eips.ethereum.org/EIPS/eip-5792)

### Tools
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [BaseScan (Sepolia)](https://sepolia.basescan.org/)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)

## Next Steps

### Tomorrow's Workshop: Advanced Base Account Features
1. **Paymaster Integration**: Sponsor gas fees for users
2. **Sub-accounts**: Create app-specific accounts
3. **Session Keys**: Allow limited permissions without full wallet access

### Challenge Ideas
- Add ERC-20 token support to batch transfers
- Implement "split by percentage" instead of equal amounts
- Add address book for frequent recipients
- Create recurring payment schedules

## Contributing

This is a workshop demo. Feel free to:
- Add features and experiment
- Report issues or improvements
- Share your implementations

## License

MIT License - feel free to use this for your own workshops!

---

**Built with Base Account SDK and OnchainKit**

Happy building! 🔵
