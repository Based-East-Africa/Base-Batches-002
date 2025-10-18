# Paymaster Demo - Gasless Transactions on Base

A minimalistic, professional demo application showcasing gasless transactions using Coinbase's Paymaster service on Base blockchain. Built with OnchainKit and Base's official design system.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Available Scripts](#available-scripts)
- [Learn More](#learn-more)

## Overview

This application demonstrates how to implement gasless transactions using Coinbase's Paymaster service on the Base blockchain. Users can send transactions without paying gas fees, dramatically improving the onboarding experience for web3 applications.

The UI follows Base's official design system with a minimalistic, professional aesthetic using their official color palette (blue, white, black, and grays).

## Features

- **Gasless Transactions**: Send transactions without ETH for gas fees
- **Paymaster Integration**: Coinbase Developer Platform paymaster service
- **Base Official Design**: Clean UI with Base's official colors (#0000ff, #3c8aff)
- **OnchainKit Components**: Wallet connectivity and transaction handling
- **MiniKit SDK**: Farcaster mini app compatible
- **TypeScript**: Fully typed for type safety and maintainability
- **Responsive Design**: Mobile-first, works on all devices
- **Dark/Light Mode**: Automatic theme switching
- **Clean Architecture**: Modular, maintainable code structure

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Coinbase Developer Platform account
- Base Sepolia testnet ETH (for testing)

### Installation

1. Navigate to the project:

```bash
cd day2-Onchainkit-WalletInfra/minidemo
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Update the `.env` file with your API keys:

```env
NEXT_PUBLIC_PROJECT_NAME="minidemo"
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your-onchainkit-api-key"
NEXT_PUBLIC_CHAIN="testnet"
NEXT_PUBLIC_PAYMASTER_URL="https://api.developer.coinbase.com/rpc/v1/base-sepolia/YOUR_PAYMASTER_API_KEY"
```

### Getting API Keys

#### OnchainKit API Key
1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project or select existing one
3. Navigate to API Keys section
4. Copy your OnchainKit API key

#### Paymaster URL
1. Go to [Coinbase Bundler & Paymaster](https://portal.cdp.coinbase.com/products/bundler-and-paymaster)
2. Create a new paymaster configuration
3. Select Base Sepolia network
4. Copy the provided paymaster URL
5. Add it to your `.env` file

### Running the Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
minidemo/
├── app/
│   ├── components/
│   │   ├── PaymasterDemo.tsx          # Main paymaster demo component
│   │   └── PaymasterDemo.module.css   # Component styles
│   ├── api/
│   │   └── auth/
│   │       └── route.ts               # Quick Auth endpoint
│   ├── globals.css                    # Base color system & global styles
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Home page
│   ├── page.module.css               # Page styles
│   └── rootProvider.tsx              # OnchainKit provider config
├── public/                            # Static assets
├── .env                              # Environment variables
└── package.json                      # Dependencies
```

## Configuration

### Paymaster Integration

The paymaster is configured in [app/rootProvider.tsx](app/rootProvider.tsx):

```typescript
<OnchainKitProvider
  apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
  chain={chain}
  paymasterUrl={process.env.NEXT_PUBLIC_PAYMASTER_URL}
  config={{
    appearance: { mode: "auto" },
    wallet: { display: "modal", preference: "all" }
  }}
>
  {children}
</OnchainKitProvider>
```

### Design System

Base's official colors are defined in [app/globals.css](app/globals.css):

```css
:root {
  --base-blue: #0000ff;        /* Primary brand color */
  --base-cerulean: #3c8aff;    /* Hover states */
  --base-white: #ffffff;       /* Backgrounds */
  --base-gray-100: #0a0b0d;    /* Text (dark mode bg) */
  --base-green: #66c800;       /* Success states */
  --base-red: #fc401f;         /* Error states */
}
```

## How It Works

### Paymaster Flow

1. **Provider Configuration**: OnchainKit provider configured with paymaster URL
2. **Transaction Creation**: User initiates a transaction via UI
3. **Paymaster Service**: Transaction routed through paymaster
4. **Gas Sponsorship**: Paymaster covers gas fees automatically
5. **Confirmation**: Transaction executes without user paying gas

### Transaction Implementation

```typescript
const callsId = await provider.request({
  method: "wallet_sendCalls",
  params: [{
    version: "2.0",
    from: userAddress,
    calls: [...],
    capabilities: {
      paymasterService: {
        url: process.env.NEXT_PUBLIC_PAYMASTER_URL
      }
    }
  }]
});
```

## Contributing

We welcome contributions from the community! Here's how you can help improve this template:

### How to Contribute

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/your-username/your-fork-name.git
   cd your-fork-name/minidemo
   ```

3. **Create a new branch**

   Use a descriptive branch name:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Make your changes**

   - Follow the existing code style and conventions
   - Write clear, concise commit messages
   - Test your changes thoroughly
   - Update documentation if needed

6. **Test your changes**

   ```bash
   # Run the development server
   npm run dev

   # Build the project to check for errors
   npm run build

   # Run linting
   npm run lint
   ```

7. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve bug description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

8. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

9. **Create a Pull Request**

   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of your changes
   - Link any related issues

### Contribution Guidelines

#### Code Style

- Use TypeScript for all new files
- Follow the existing code formatting (Prettier config included)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

#### What to Contribute

Here are some areas where contributions are especially welcome:

**Features:**
- Additional OnchainKit component examples
- New mini app features and integrations
- Enhanced authentication flows
- Additional blockchain interactions (swaps, NFTs, etc.)
- UI/UX improvements

**Documentation:**
- Tutorial guides
- Code comments
- API documentation
- Usage examples
- Troubleshooting guides

**Bug Fixes:**
- Report bugs by opening an issue
- Fix existing issues
- Improve error handling

**Testing:**
- Add unit tests
- Add integration tests
- Improve test coverage

#### Pull Request Process

1. Ensure your PR description clearly describes the problem and solution
2. Include relevant issue numbers if applicable
3. Update the README.md with details of changes if needed
4. Your PR will be reviewed by maintainers
5. Address any requested changes
6. Once approved, your PR will be merged

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment details (OS, Node version, etc.)

### Community

- Be respectful and inclusive
- Help others in discussions
- Share your projects built with this template
- Provide constructive feedback

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Usage

### Send Gasless Transaction

1. Connect your wallet using the Wallet button in the header
2. Click "Send Sponsored Transaction" button
3. Approve the transaction in your wallet
4. Transaction executes without gas fees

### Transfer Tokens (Gasless)

1. Ensure your wallet is connected
2. Click "Transfer Tokens (Gasless)" button
3. Confirm in your wallet
4. Token transfer completes without paying gas

## Customization

### Update Transaction Logic

Edit [app/components/PaymasterDemo.tsx](app/components/PaymasterDemo.tsx):

```typescript
const calls: Call[] = [
  {
    to: "0xYourContractAddress",
    data: "0xYourEncodedFunctionData",
    value: "0x0",
  },
];
```

### Modify Styling

Update colors in [app/globals.css](app/globals.css) or component styles in [app/components/PaymasterDemo.module.css](app/components/PaymasterDemo.module.css).

## Troubleshooting

### Paymaster Not Working

- Verify paymaster URL is correct in `.env`
- Check you have sufficient credits in Coinbase Developer Platform
- Ensure you're on Base Sepolia network

### Transaction Failing

- Confirm wallet is connected
- Verify contract address and data encoding
- Check browser console for error messages

## Resources

- [Base Documentation](https://docs.base.org)
- [OnchainKit Docs](https://onchainkit.xyz)
- [Coinbase Paymaster Guide](https://docs.cdp.coinbase.com/paymaster/docs/welcome)
- [Base Account SDK](https://docs.base.org/base-account)

## What You Can Build

This template is perfect for building a wide range of onchain applications. Here are some ideas to get you started:

### DeFi Applications

**Token Swap Mini App**
- Build a DEX interface using the Swap component
- Allow users to swap tokens directly in Farcaster
- Add price charts and token analytics
- Example use case: Quick token swaps without leaving the social feed

**Yield Farming Dashboard**
- Display user's staking positions
- Enable stake/unstake transactions
- Show real-time APY and rewards
- Example use case: Monitor and manage DeFi positions

**Payment Splitter**
- Split bills among friends onchain
- Create payment requests with one click
- Track who has paid and who hasn't
- Example use case: Split restaurant bills or group expenses

### NFT & Gaming

**NFT Minting Platform**
- Mint NFTs directly from Farcaster
- Display user's NFT collection
- Enable NFT transfers and trading
- Example use case: Exclusive community NFT drops

**Onchain Achievements**
- Award NFT badges for social activities
- Create achievement leaderboards
- Enable peer-to-peer challenges
- Example use case: Community engagement rewards

**Prediction Markets**
- Create and participate in prediction markets
- Vote with tokens on outcomes
- Display real-time odds and payouts
- Example use case: Community predictions on events

### Social & Commerce

**Tipping Platform**
- Enable crypto tips for content creators
- Support multiple tokens
- Show tipping leaderboards
- Example use case: Reward great content with instant tips

**Onchain Crowdfunding**
- Launch fundraising campaigns
- Track contributions in real-time
- Distribute governance tokens to backers
- Example use case: Fund community projects

**Digital Collectibles Store**
- Sell digital goods with crypto
- Instant checkout with the Checkout component
- Display purchase history
- Example use case: Sell art, music, or exclusive content

**Subscription Management**
- Manage recurring crypto subscriptions
- Automate membership renewals
- Gate content based on subscription status
- Example use case: Premium content access

### Community & DAO Tools

**DAO Voting Interface**
- Create and vote on proposals
- Display voting power and results
- Enable delegated voting
- Example use case: Community governance

**Token Gating**
- Gate content based on token holdings
- Verify NFT ownership
- Create exclusive experiences
- Example use case: Members-only features

**Community Rewards**
- Distribute tokens to active members
- Create reward tiers and milestones
- Track contribution metrics
- Example use case: Incentivize community participation

### Identity & Social

**Onchain Profile**
- Display user's onchain identity
- Show ENS names and avatars using Identity component
- Display transaction history and badges
- Example use case: Reputation and credibility system

**Social Tipping Bot**
- Automated tips based on engagement
- Group tipping pools
- Charitable donation matching
- Example use case: Amplify community generosity

### Getting Started with Examples

To implement any of these ideas:

1. Start with the main `page.tsx` file
2. Import the relevant OnchainKit components (Transaction, Swap, Checkout, Wallet, Identity)
3. Configure your smart contracts in the Transaction component
4. Style with the included CSS modules
5. Deploy and test in Farcaster

**Quick Example - Adding a Token Swap:**

```typescript
import { Swap, SwapAmountInput, SwapButton, SwapMessage, SwapToggleButton } from '@coinbase/onchainkit/swap';

<Swap>
  <SwapAmountInput label="From" token={ETH_TOKEN} type="from" />
  <SwapToggleButton />
  <SwapAmountInput label="To" token={USDC_TOKEN} type="to" />
  <SwapButton />
  <SwapMessage />
</Swap>
```

## Learn More

### OnchainKit Documentation

- [OnchainKit Docs](https://docs.base.org/onchainkit) - Comprehensive OnchainKit documentation
- [Transaction Component](https://docs.base.org/onchainkit/transaction/transaction)
- [Swap Component](https://docs.base.org/onchainkit/swap/swap)
- [Checkout Component](https://docs.base.org/onchainkit/checkout/checkout)
- [Wallet Component](https://docs.base.org/onchainkit/wallet/wallet)
- [Identity Component](https://docs.base.org/onchainkit/identity/identity)

### Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Base Network](https://base.org)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [Farcaster Developer Docs](https://docs.farcaster.xyz)

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with [OnchainKit](https://docs.base.org/onchainkit) and [create-onchain](https://www.npmjs.com/package/create-onchain)
