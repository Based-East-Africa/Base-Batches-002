# Split Payment Workshop - Instructor Guide

This guide provides detailed talking points and teaching notes for the Day 3 Base Account workshop.

## Pre-Workshop Checklist

- [ ] Ensure all participants have Node.js 18+ installed
- [ ] Share Base Sepolia faucet link: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- [ ] Have participants get OnchainKit API keys: https://portal.cdp.coinbase.com/products/onchainkit
- [ ] Test the demo app on your machine
- [ ] Have example recipient addresses ready (can use your own test addresses)
- [ ] Prepare BaseScan tab to show transaction results

## Workshop Timeline (60 minutes total)

### Part 1: Recap & Context (5 minutes)

#### Opening Statement:
"Yesterday we built with OnchainKit and learned about wallet connections, transactions, and UI components. Today we're adding **Base Account SDK** to unlock powerful smart wallet features - specifically **batch transactions**."

#### Key Question to Ask:
"Who here has sent multiple transactions in a row and had to confirm each one separately?"

*(Most hands will go up)*

"That's the pain point we're solving today. By the end of this workshop, you'll be able to bundle multiple transactions into ONE approval."

---

### Part 2: Architecture Explanation (10 minutes)

#### Visual Diagram (draw or share screen):
```
┌─────────────────────────────────────┐
│   Your App (Split Payment)         │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │ OnchainKit  │  │ Base Account│ │
│  │   (Day 2)   │  │    SDK      │ │
│  │             │  │   (Day 3)   │ │
│  │ • Wallet UI │  │ • Batching  │ │
│  │ • Wagmi     │  │ • Paymaster │ │
│  │ • Viem      │  │ • Sub-accts │ │
│  └──────────────┘  └─────────────┘ │
│          │              │          │
└──────────┼──────────────┼──────────┘
           │              │
           └──────┬───────┘
                  ▼
         ┌─────────────────┐
         │  User's Wallet  │
         │ (Coinbase Wallet│
         │  Smart Wallet)  │
         └─────────────────┘
```

#### Talking Points:

**OnchainKit's Role** (review):
- "OnchainKit gave us wallet connection, provider setup, and beautiful UI components"
- "It handles all the Wagmi/Viem configuration for us"
- "We're not replacing OnchainKit - we're building ON TOP of it"

**Base Account SDK's Role** (new):
- "Adds smart wallet capabilities to connected wallets"
- "Key feature today: **Batch transactions**"
- "Tomorrow preview: Paymaster (gas sponsorship)"

#### The Problem We're Solving:

**Traditional Wallet Flow** (draw on screen):
```
User wants to send $10 to 3 friends

Step 1: Send $10 to Alice → Confirm → Wait → Pay gas
Step 2: Send $10 to Bob → Confirm → Wait → Pay gas
Step 3: Send $10 to Carol → Confirm → Wait → Pay gas

Result: 3 transactions, 3 gas fees, 3 confirmations
Time: ~30-90 seconds
UX: Annoying!
```

**Base Account Batch Flow**:
```
User wants to send $10 to 3 friends

Step 1: [Send $10 to Alice + Bob + Carol] → ONE confirm

Result: 1 transaction, 1 gas fee, 1 confirmation
Time: ~10-30 seconds
UX: Delightful!
```

#### Real-World Use Cases:
- "Split bills at restaurants"
- "Group gift contributions"
- "Airdropping tokens to multiple recipients"
- "Paying multiple contractors at once"

**Ask the group**: "What other use cases can you think of?"

---

### Part 3: Code Walkthrough (15 minutes)

Open `app/components/SplitPayment.tsx` and walk through line by line.

#### 1. Imports (Lines 1-6)

```tsx
import { createBaseAccountSDK, base } from "@base-org/account";
import { parseEther, numberToHex } from "viem";
```

**Explain**:
- "`createBaseAccountSDK` - This is our entry point to Base Account features"
- "`base` - Contains constants like chain IDs"
- "`parseEther` - Converts '0.001' → wei (like '0.001 ETH' → '1000000000000000')"
- "`numberToHex` - Converts numbers to hex format for blockchain"

**Why hex?** "Blockchains speak in hexadecimal. Viem helps us convert human-readable numbers."

---

#### 2. SDK Initialization (Lines 36-45)

```tsx
const sdk = createBaseAccountSDK({
  appName: 'Split Payment Demo',
  appLogoUrl: 'https://base.org/favicon.ico',
  appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
});
```

**Explain**:
- "This creates our SDK instance - think of it as our 'connection' to Base Account features"
- "`appName` - Shows in wallet UI when users approve transactions"
- "`appChainIds` - We're using Base Sepolia (testnet) for safe testing"

**Important**: "Notice we do this in a `useEffect` hook. Why? Because this should only happen once when the component mounts."

**Tomorrow's preview** (point to comments):
```tsx
// paymasterUrls: {
//   [base.constants.CHAIN_IDS.baseSepolia]: 'YOUR_PAYMASTER_URL'
// }
```
"See these commented lines? Tomorrow we'll uncomment this ONE configuration and enable gasless transactions!"

---

#### 3. Preparing Batch Calls (Lines 66-85)

```tsx
const calls = [
  {
    to: recipient1 as `0x${string}`,
    value: numberToHex(parseEther(amount)),
    data: "0x" as `0x${string}`,
  },
  // ... 2 more
];
```

**Explain**:
- "Each object in this array is a separate transfer"
- "`to` - Recipient address"
- "`value` - Amount in hex-encoded wei"
- "`data: '0x'` - Empty data means 'simple ETH transfer'"

**Ask**: "What if we wanted to interact with a smart contract instead?"
**Answer**: "We'd put encoded contract call data in the `data` field. For example, calling an ERC-20 `transfer()` function."

**Analogy**: "Think of this like a shopping cart. We're adding 3 'purchase items' before checkout."

---

#### 4. Execute Batch Transaction (Lines 87-102)

```tsx
const result = await provider.request({
  method: "wallet_sendCalls",
  params: [{
    version: "2.0.0",
    from: address,
    chainId: numberToHex(base.constants.CHAIN_IDS.baseSepolia),
    atomicRequired: true,
    calls: calls
  }]
});
```

**This is the money shot! Go slow here.**

**Explain**:
- "`wallet_sendCalls` - This is an **EIP-5792** standard method"
  - "EIP = Ethereum Improvement Proposal"
  - "Think of it like a 'protocol' that wallets agree to support"
  - "Any wallet supporting EIP-5792 can do batch transactions"

- "`version: '2.0.0'` - Protocol version (future-proofing)"

- "`from: address` - This comes from OnchainKit's Wagmi hook"
  - "See how OnchainKit and Base Account SDK work together!"

- "`atomicRequired: true` - **CRITICAL**"
  - "This means: ALL transfers succeed OR ALL fail"
  - "Why is this important for payments?"
  - **Let class answer**, then: "Right! You don't want to send to 2 people but fail on the 3rd"

**Analogy**: "It's like a database transaction - all or nothing."

---

#### 5. Error Handling (Lines 104-120)

```tsx
if (error.code === 4001) {
  setErrorMessage("Transaction rejected by user");
}
```

**Explain**:
- "Always handle errors gracefully"
- "Code 4001 = user rejected in wallet"
- "Insufficient funds = common mistake in testing"

---

### Part 4: Live Demo (15 minutes)

#### Setup Phase (5 minutes)

**Screen share your terminal:**

1. **Clone & Install**
   ```bash
   cd day3-base-accounts/SplitPayment
   npm install
   ```

   *While installing*: "This is installing Base Account SDK v2.4.0 along with OnchainKit, Wagmi, and Viem."

2. **Setup .env**
   ```bash
   cp .env.example .env
   # Open .env and paste API key
   ```

   "Everyone should have their API key from the CDP portal. Paste it here."

3. **Start dev server**
   ```bash
   npm run dev
   ```

#### Demo Phase (10 minutes)

**Open http://localhost:3000 in browser**

**Step 1: Connect Wallet**
- Click "Connect Wallet" button
- "Notice this beautiful UI? This is from OnchainKit - we didn't write a single line of wallet connection code!"
- Select Coinbase Wallet
- Switch to Base Sepolia if needed

**Step 2: Show Wallet Balance**
- Open wallet and show Base Sepolia balance
- "Make sure you have at least 0.01 ETH from the faucet"

**Step 3: Enter Recipients**
- "I'm going to use 3 test addresses I control so we can verify receipt"
- Enter addresses:
  - Recipient 1: [your test address 1]
  - Recipient 2: [your test address 2]
  - Recipient 3: [your test address 3]
- Amount: 0.001

**Emphasize**: "Total cost = 0.003 ETH + gas fees"

**Step 4: Execute!**
- Click "Split Payment"
- **WAIT for wallet popup**
- "Here's the key moment - ONE confirmation popup for THREE transfers"
- Show the wallet UI details if visible
- Approve transaction

**Step 5: Wait & Celebrate**
- "Transaction sent! Now we wait for blockchain confirmation..."
- When success message appears: "Look! ONE transaction hash"
- Click "View on BaseScan"

**Step 6: Show BaseScan**
- "See this transaction? Let's look at the Internal Transactions tab"
- Click "Internal Txns" tab
- "There! Three separate transfers, but all in ONE transaction"
- "Each recipient got exactly 0.001 ETH"

**Participant Activity**: "Now you try! Use your neighbor's address or create test addresses."

---

### Part 5: Connecting to Tomorrow (10 minutes)

#### Bridge to Advanced Topics

**Smart Wallets Deep Dive**:
"Let me show you something cool. Open DevTools console and let's inspect the SDK."

```tsx
console.log(sdk.getProvider());
```

"This provider is EIP-1193 compliant. That means it works with any Web3 library - Wagmi, Ethers, Web3.js."

**Question to class**: "Did we deploy a smart contract for this?"

**Answer**: "No! Base Accounts ARE smart contracts. They're ERC-4337 accounts."

**Tomorrow's Topics**:

1. **Sub-accounts**
   ```tsx
   // Preview (don't code yet)
   const subAccount = await sdk.subAccount.create({
     name: 'split-payments-only'
   });
   ```
   "Create app-specific wallets with limited permissions"

2. **Paymaster (Gas Sponsorship)**
   ```tsx
   // Add ONE line to SDK config:
   paymasterUrls: {
     [base.constants.CHAIN_IDS.baseSepolia]: 'paymaster-url'
   }
   ```
   "Users won't pay gas fees - your app sponsors them!"

3. **Multi-owner accounts & Session keys** (time permitting)

---

### Part 6: Q&A and Challenges (5 minutes)

#### Common Questions:

**Q: "Does this work on mainnet?"**
A: "Yes! Just change `baseSepolia` to `base` in `rootProvider.tsx`"

**Q: "Can I batch 100 transactions?"**
A: "Yes, but there are gas limits. Also some wallets have max batch sizes. Test with smaller batches first."

**Q: "What if one recipient address is invalid?"**
A: "The entire transaction will fail (because `atomicRequired: true`). That's why validation is important!"

**Q: "Can I mix ETH transfers and contract calls?"**
A: "Absolutely! Just set the `data` field to your encoded contract call."

#### Challenge Ideas (assign as homework):

1. **Easy**: Add input validation (check if addresses are valid)
2. **Medium**: Add ERC-20 token support (batch USDC transfers)
3. **Hard**: Add "split by percentage" instead of equal amounts
4. **Expert**: Implement recurring scheduled payments

---

## Troubleshooting Guide

### Issue: "Transaction Failed"
- Check balance (need amount × 3 + gas)
- Verify all addresses are valid
- Ensure connected to Base Sepolia
- Try refreshing page and reconnecting wallet

### Issue: "SDK is null"
- useEffect hasn't run yet
- Check console for import errors
- Verify `@base-org/account` is installed

### Issue: "Wallet won't connect"
- Update Coinbase Wallet to latest version
- Clear browser cache
- Try different wallet (MetaMask, etc.)
- Check if Base Sepolia is added to wallet

### Issue: "Can't get testnet ETH"
- Base faucet has rate limits
- Ask participants to use alternative faucets
- Share your own testnet ETH with participants

---

## Post-Workshop

### Follow-up Materials to Share:
- Link to Base Account SDK docs
- EIP-5792 specification
- Tomorrow's workshop preview materials
- Challenge solutions (post after 24 hours)

### Feedback Form Questions:
1. Did you successfully execute a batch transaction? (Yes/No)
2. How clear was the explanation of OnchainKit vs Base Account SDK? (1-5)
3. What use case are you most excited to build? (Free text)
4. What was confusing? (Free text)

---

## Notes for Instructor

### Pacing Tips:
- **Too fast?** Add more Q&A breaks
- **Too slow?** Skip challenge ideas section, assign as homework
- **Very engaged group?** Live code a 4th use case together

### Energy Check-ins:
- After Part 2: "Everyone following? Questions before we see code?"
- After Part 3: "Brain break! Stand up and stretch for 30 seconds"
- After Part 4: "Who was able to successfully send a batch transaction?"

### Common Mistakes to Watch For:
- Forgetting to add `.env` file → app won't connect
- Using mainnet instead of testnet → expensive mistakes!
- Not waiting for transaction confirmation → premature error reporting
- Mixing up `atomicRequired` explanation

---

## Success Metrics

By end of workshop, participants should be able to:
- [ ] Explain the difference between OnchainKit and Base Account SDK
- [ ] Initialize the Base Account SDK
- [ ] Create a batch transaction with multiple calls
- [ ] Understand `atomicRequired` parameter
- [ ] Successfully execute a batch transaction on testnet

---

## Additional Resources

### For Participants:
- [Base Account SDK Documentation](https://docs.base.org/base-account)
- [EIP-5792 Spec](https://eips.ethereum.org/EIPS/eip-5792)
- [OnchainKit Docs](https://docs.base.org/onchainkit)

### For Instructor:
- [Base Builder Discord](https://discord.gg/buildonbase)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com)
- [Workshop Feedback Form](https://forms.gle/...) *(create your own)*

---

**Good luck with the workshop! You've got this!** 🔵
