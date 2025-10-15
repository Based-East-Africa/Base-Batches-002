# Deploy and Verify Smart Contracts on Base - Workshop Guide

This is a comprehensive, step-by-step guide for deploying and verifying smart contracts on Base Sepolia testnet using Foundry. All commands are ready to copy and paste!

---

## Prerequisites

- Basic command line knowledge
- A wallet with a private key
- Base Sepolia ETH (get from [faucet](https://portal.cdp.coinbase.com/products/faucet))
- Etherscan API key (sign up at [BaseScan](https://basescan.org/))

---

## Part 1: Environment Setup

### Step 1: Create Project Directory

```bash
mkdir my-base-project && cd my-base-project
```

### Step 2: Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

This installs Foundry and updates it to the latest version.

### Step 3: Initialize Foundry Project

```bash
forge init
```

Your project now has the following structure:
- `src/` - Smart contracts (includes example `Counter.sol`)
- `test/` - Test files
- `script/` - Deployment scripts
- `foundry.toml` - Configuration file

---

## Part 2: Configure Your Environment

### Step 4: Create .env File

Create a `.env` file in your project root:

```bash
touch .env
```

### Step 5: Add Network Configuration

Add the following to your `.env` file:

```bash
BASE_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
ETHERSCAN_API_KEY="your-api-key-here"
```

**Important:** Replace `your-api-key-here` with your actual EtherScan API key.

### Step 6: Load Environment Variables

```bash
source .env
```

**Note:** You need to run `source .env` every time you open a new terminal session, or after modifying the `.env` file.

### Step 7: Secure Your Private Key

Store your private key in Foundry's secure keystore:

```bash
cast wallet import deployer --interactive
```

When prompted:
1. Enter your private key
2. Create a password

Your private key is stored in `~/.foundry/keystores` (not tracked by git).

**Security Warning:** Never share or commit your private key. Always keep it secure.

---

## Part 3: Deploy Your Contract

### Step 8: Compile Your Contract

```bash
forge build
```

This compiles all contracts in the `src/` directory.

### Step 9: Deploy to Base Sepolia

```bash
forge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer --broadcast
```

**Important Notes:**
- The `--broadcast` flag is **required** to actually deploy (without it, you only get a dry run simulation)
- You'll be prompted to enter your keystore password
- The format is `<contract-path>:<contract-name>`

Expected output:
```
Deployer: 0x...
Deployed to: 0x...  <-- YOUR CONTRACT ADDRESS
Transaction hash: 0x...
```

### Step 10: Save Your Contract Address

Copy the `Deployed to:` address and add it to your `.env` file:

```bash
echo 'COUNTER_CONTRACT_ADDRESS="0xYourDeployedAddressHere"' >> .env
```

Replace `0xYourDeployedAddressHere` with your actual deployed address.

### Step 11: Reload Environment Variables

```bash
source .env
```

---

## Part 4: Verify Your Contract on BaseScan

### Step 12: Verify Contract

```bash
forge verify-contract $COUNTER_CONTRACT_ADDRESS ./src/Counter.sol:Counter --chain 84532 --etherscan-api-key $ETHERSCAN_API_KEY --watch
```

Expected output:
```
Start verifying contract `0x...` deployed on base-sepolia

Submitting verification for [src/Counter.sol:Counter] 0x...
Submitted contract for verification:
        Response: `OK`
        GUID: `...`
        URL: https://sepolia.basescan.org/address/0x...

Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
```

**What verification does:**
- Makes your source code publicly viewable
- Allows others to interact with your contract via BaseScan
- Builds trust by showing the source matches the deployed bytecode

### Step 13: View on BaseScan

Visit your contract on BaseScan:
```
https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS
```

You should now see the **Contract** tab with **Read Contract** and **Write Contract** options.

---

## Part 5: Interact with Your Contract

### Step 14: Read Contract State (View Function)

Check the current value of the counter:

```bash
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

Expected output: `0x0000000000000000000000000000000000000000000000000000000000000000` (0 in hex)

**Note:** `cast call` doesn't require signing because it's a read-only operation.

### Step 15: Write to Contract - Increment

Increment the counter by 1:

```bash
cast send $COUNTER_CONTRACT_ADDRESS "increment()" --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer
```

You'll need to enter your keystore password.

Expected output includes:
```
status               1 (success)
transactionHash      0x...
gasUsed              43482
```

**What this output means:**
- `status: 1` = Success
- `transactionHash` = Unique ID for your transaction (viewable on BaseScan)
- `gasUsed` = Gas consumed by the transaction
- `to` = Your contract address
- `from` = Your wallet address

### Step 16: Verify the Increment

Read the counter value again:

```bash
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

Expected output: `0x0000000000000000000000000000000000000000000000000000000000000001` (1 in hex)

### Step 17: Write to Contract - Set Number

Set the counter to a specific value (e.g., 42):

```bash
cast send $COUNTER_CONTRACT_ADDRESS "setNumber(uint256)" 42 --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer
```

### Step 18: Verify the New Value

```bash
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

Expected output: `0x000000000000000000000000000000000000000000000000000000000000002a` (42 in hex)

---

## Understanding the Counter Contract

The Counter contract (`src/Counter.sol`) has three functions:

1. **`number()`** - View function that returns the current counter value
2. **`increment()`** - Increases the counter by 1
3. **`setNumber(uint256 newNumber)`** - Sets the counter to a specific value

### Issue: "Contract already verified"

**Solution:** This means the contract is already verified! Check BaseScan to confirm.

### Issue: Environment variables not loading

**Solution:** Always run `source .env` after:
- Opening a new terminal
- Modifying the `.env` file
- Adding new environment variables

---

## Quick Reference Commands

```bash
# Load environment variables (run after every .env change)
source .env

# Compile contracts
forge build

# Deploy contract
forge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer --broadcast

# Verify contract
forge verify-contract $COUNTER_CONTRACT_ADDRESS ./src/Counter.sol:Counter --chain 84532 --etherscan-api-key $ETHERSCAN_API_KEY --watch

# Read contract
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL

# Write to contract
cast send $COUNTER_CONTRACT_ADDRESS "increment()" --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer
```



## Resources

- [Base Documentation](https://docs.base.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Base Sepolia Faucet](https://docs.base.org/docs/tools/network-faucets/)
- [BaseScan](https://basescan.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

## Congratulations!

You've successfully:
- ✅ Set up a Foundry development environment
- ✅ Deployed a smart contract to Base Sepolia
- ✅ Verified your contract on BaseScan
- ✅ Interacted with your contract from the command line

You're now ready to build on Base!
