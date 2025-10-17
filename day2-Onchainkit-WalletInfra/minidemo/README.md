# OnchainKit MiniApp Template

A Next.js template bootstrapped with [`create-onchain`](https://www.npmjs.com/package/create-onchain) and configured for building Farcaster mini apps with OnchainKit and Base network integration.

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

This template provides a pre-configured development environment for building onchain applications with OnchainKit, specifically optimized for Farcaster mini apps. It includes wallet connectivity, transaction handling, and mini app SDK integration out of the box.

## Features

- **Next.js 15** with App Router
- **OnchainKit** for onchain components (Wallet, Transaction, Swap, Checkout, Identity)
- **MiniKit SDK** for Farcaster mini app integration
- **Wagmi & Viem** for Ethereum interactions
- **Base Network** configuration
- **TypeScript** for type safety
- **Quick Auth** for user authentication (optional)
- **React Query** for data fetching and caching

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager
- A [Coinbase Developer Platform API key](https://portal.cdp.coinbase.com/products/onchainkit) (optional but recommended)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd minidemo
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Configure environment variables:

Create a `.env` file in the root directory (or update the existing one):

```env
NEXT_PUBLIC_PROJECT_NAME="your-project-name"
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your-api-key-here"
NEXT_PUBLIC_URL="your-deployment-url"
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view your app.

## Project Structure

```
minidemo/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── route.ts          # Authentication API endpoint
│   ├── .well-known/
│   │   └── farcaster.json/
│   │       └── route.ts          # Farcaster app manifest
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Main page component
│   ├── page.module.css           # Page-specific styles
│   └── rootProvider.tsx          # OnchainKit provider configuration
├── public/                       # Static assets
├── .env                          # Environment variables
├── minikit.config.ts             # MiniKit configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Configuration

### OnchainKit Provider

The OnchainKit provider is configured in `app/rootProvider.tsx`. You can customize:

- **Chain**: Currently set to Base (`base`)
- **Appearance**: Theme mode (auto, light, dark)
- **Wallet**: Display type and preferences
- **MiniKit**: Enable/disable mini app features

```typescript
<OnchainKitProvider
  apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
  chain={base}
  config={{
    appearance: {
      mode: "auto",
    },
    wallet: {
      display: "modal",
      preference: "all",
    },
  }}
  miniKit={{
    enabled: true,
    autoConnect: true,
    notificationProxyUrl: undefined,
  }}
>
  {children}
</OnchainKitProvider>
```

### MiniKit Configuration

MiniKit settings are defined in `minikit.config.ts` for Farcaster mini app integration.

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
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

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
