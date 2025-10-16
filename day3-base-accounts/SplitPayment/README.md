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

This creates the SDK instance that bridges OnchainKit's wallet connection with Base Account features.

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

Each call is a separate transfer. The `data: '0x'` means it's a simple ETH transfer (no contract interaction).

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
   git clone https://github.com/Based-East-Africa/Base-Batches-002

   cd day3-base-accounts

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

4. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)


5. **Connect Wallet** (OnchainKit component)
   - Click "Connect Wallet" button
   -This is from OnchainKit

6. **Enter Recipients**
   - 3 input fields for addresses
   - Amount input (split equally)

7. **Execute Split Payment**
   - Click "Split Payment" button
   - **ONE confirmation popup** 
   - See transaction on BaseScan

8. **Verify Results**
   - Check all 3 recipients received funds
   - See it's ONE transaction hash


Notice how we didn't need to deploy a contract? That's because Base Accounts ARE smart wallets (ERC-4337). 

Day 4 we'll explore:
- Sub-accounts (app-specific wallets)
- Multi-owner accounts
- Session keys

#### Bridge to Paymaster/Gasless UX

```tsx
const sdk = createBaseAccountSDK({
  appName: 'Split Payment Demo',
  appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
  paymasterUrls: {  // <-- Tomorrow's topic!
    [base.constants.CHAIN_IDS.baseSepolia]: 'https://paymaster-url'
  }
});
```

See this `paymasterUrls` config? Day 4 we'll add this ONE line and users won't pay gas fees!


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


## Resources

### Documentation
- [Base Account SDK](https://docs.base.org/base-account/overview/what-is-base-account)
- [Batch Transactions](https://docs.base.org/base-account/improve-ux/batch-transactions)
- [OnchainKit](https://docs.base.org/onchainkit)
- [EIP-5792 Specification](https://eips.ethereum.org/EIPS/eip-5792)


## Next Steps

### Tomorrow's Workshop: Advanced Base Account Features
1. **Paymaster Integration**: Sponsor gas fees for users
2. **Sub-accounts**: Create app-specific accounts
3. **Session Keys**: Allow limited permissions without full wallet access

### Challenge Ideas(You can contribute to this repo as part of learning!)
- Add ERC-20 token support to batch transfers
- Implement "split by percentage" instead of equal amounts
- Add address book for frequent recipients
- Create recurring payment schedules(https://docs.base.org/base-account/guides/accept-recurring-payments)

## Contributing

Feel free to:
- Add features and experiment
- Report issues or improvements
- Share your implementations

## License

MIT License - feel free to use this for your own workshops!

---

**Built with Base Account SDK and OnchainKit**

Happy building! 🔵
