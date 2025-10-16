"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createBaseAccountSDK, base } from "@base-org/account";
import { parseEther, numberToHex } from "viem";
import styles from "./SplitPayment.module.css";

/**
 * SplitPayment Component
 *
 * Demonstrates Base Account SDK's batch transaction feature:
 * - Multiple ETH transfers in a single transaction
 * - Atomic execution (all succeed or all fail)
 * - One gas fee, one confirmation
 *
 * Integration Points:
 * - OnchainKit: Provides wallet connection (Wagmi/Viem)
 * - Base Account SDK: Adds batch transaction capability via wallet_sendCalls
 * - Fallback Support: Works with traditional wallets (MetaMask) using standard transactions
 */
export function SplitPayment() {
  const { address, isConnected, connector } = useAccount(); // OnchainKit's Wagmi integration
  const { data: walletClient } = useWalletClient(); // For fallback to traditional wallets

  // State for recipient addresses
  const [recipient1, setRecipient1] = useState("");
  const [recipient2, setRecipient2] = useState("");
  const [recipient3, setRecipient3] = useState("");

  // Amount to send to each recipient (in ETH)
  const [amount, setAmount] = useState("0.001");

  // Transaction status tracking
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [usedBatchMode, setUsedBatchMode] = useState<boolean>(false);

  // Initialize Base Account SDK
  // This bridges OnchainKit's wallet connection with Base Account features
  const [sdk, setSdk] = useState<ReturnType<typeof createBaseAccountSDK> | null>(null);

  useEffect(() => {
    // Initialize SDK when component mounts
    const baseAccountSdk = createBaseAccountSDK({
      appName: "Split Payment Demo",
      appLogoUrl: "https://base.org/favicon.ico",
      appChainIds: [base.constants.CHAIN_IDS.baseSepolia], // Using testnet

      // Note: Paymaster configuration (for gas sponsorship) will be added here 
      // paymasterUrls: {
      //   [base.constants.CHAIN_IDS.baseSepolia]: 'YOUR_PAYMASTER_URL'
      // }
    });

    setSdk(baseAccountSdk);
  }, []);

  /**
   * Detect if connected wallet is a Coinbase Smart Wallet / Base Account
   * Base Accounts work with the SDK, traditional wallets need fallback
   */
  const isCoinbaseSmartWallet = () => {
    // Check if connector is Coinbase Wallet
    const connectorName = connector?.name?.toLowerCase() || "";
    return connectorName.includes("coinbase");
  };

  /**
   * Execute batch payment transaction using Base Account SDK
   * (for Coinbase Smart Wallet)
   */
  const executeBatchWithSDK = async (calls: Array<{
    to: `0x${string}`;
    value: string;
    data: `0x${string}`;
  }>) => {
    if (!sdk || !address) {
      throw new Error("SDK not initialized");
    }

    const provider = sdk.getProvider(); // EIP-1193 compliant provider

    // Execute batch transaction using wallet_sendCalls
    // This is the core Base Account SDK feature!
    const result = await provider.request({
      method: "wallet_sendCalls", // EIP-5792 standard method
      params: [
        {
          version: "1.0", // Protocol version
          from: address, // Sender address (from OnchainKit/Wagmi)
          chainId: numberToHex(base.constants.CHAIN_IDS.baseSepolia), // Target chain
          calls: calls, // Array of transfer operations
        },
      ],
    });

    return result;
  };

  /**
   * Fallback: Execute individual transactions for traditional wallets
   * (for MetaMask, Rainbow, etc.)
   */
  const executeSeparateTransactions = async (calls: Array<{
    to: `0x${string}`;
    value: string;
    data: `0x${string}`;
  }>) => {
    if (!walletClient) {
      throw new Error("Wallet client not available");
    }

    const hashes: string[] = [];

    for (let i = 0; i < calls.length; i++) {
      console.log(`Sending transaction ${i + 1}/3...`);

      const hash = await walletClient.sendTransaction({
        to: calls[i].to,
        value: BigInt(calls[i].value),
        data: calls[i].data,
        chain: walletClient.chain,
      });

      hashes.push(hash);
      console.log(`Transaction ${i + 1} sent:`, hash);
    }

    return hashes;
  };

  /**
   * Main handler: Execute batch payment transaction
   *
   * Uses Base Account SDK for Coinbase Smart Wallet (batch transactions)
   * Falls back to individual transactions for traditional wallets (MetaMask)
   */
  const handleSplitPayment = async () => {
    if (!address) {
      setErrorMessage("Please connect your wallet first");
      setStatus("error");
      return;
    }

    // Validate inputs
    if (!recipient1 || !recipient2 || !recipient3) {
      setErrorMessage("Please enter all recipient addresses");
      setStatus("error");
      return;
    }

    try {
      setStatus("pending");
      setErrorMessage("");
      setTxHash("");
      setUsedBatchMode(false);

      // Prepare batch calls
      // Each call represents a separate ETH transfer
      const calls = [
        {
          to: recipient1 as `0x${string}`,
          value: numberToHex(parseEther(amount)), // Convert ETH amount to hex-encoded wei
          data: "0x" as `0x${string}`, // Empty data = simple ETH transfer (no contract interaction)
        },
        {
          to: recipient2 as `0x${string}`,
          value: numberToHex(parseEther(amount)),
          data: "0x" as `0x${string}`,
        },
        {
          to: recipient3 as `0x${string}`,
          value: numberToHex(parseEther(amount)),
          data: "0x" as `0x${string}`,
        },
      ];

      // Check which wallet type and use appropriate method
      const isCoinbase = isCoinbaseSmartWallet();
      console.log("Wallet type:", isCoinbase ? "Coinbase Smart Wallet" : "Traditional Wallet");

      if (isCoinbase && sdk) {
        try {
          // Use Base Account SDK for batch transactions
          console.log("Using Base Account SDK for batch transaction...");

          const result = await executeBatchWithSDK(calls);

          // Extract transaction hash from result
          const hash = (result as { hash?: string })?.hash || (result as string);
          setTxHash(hash);
          setStatus("success");
          setUsedBatchMode(true);

          console.log("Batch transaction sent via SDK:", hash);
        } catch (sdkError) {
          console.error("SDK batch failed, trying fallback:", sdkError);

          // If SDK fails, fall back to individual transactions
          const hashes = await executeSeparateTransactions(calls);
          setTxHash(hashes[0]);
          setStatus("success");
          setUsedBatchMode(false);
          setErrorMessage(`Note: Batch mode failed. Sent 3 separate transactions: ${hashes.join(", ")}`);
        }
      } else {
        // Traditional wallet - send individual transactions
        console.log("Traditional wallet detected, sending separate transactions...");
        setErrorMessage("Note: Your wallet doesn't support Base Account batch transactions. Sending 3 separate transactions instead. For the full batch experience, use Coinbase Smart Wallet!");

        const hashes = await executeSeparateTransactions(calls);
        setTxHash(hashes[0]);
        setStatus("success");
        setUsedBatchMode(false);
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);

      // Handle common errors
      if (error.code === 4001) {
        setErrorMessage("Transaction rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        setErrorMessage("Insufficient balance for transaction");
      } else if (error.message?.includes("invalid address")) {
        setErrorMessage("One or more recipient addresses are invalid");
      } else {
        setErrorMessage(error.message || "Transaction failed");
      }

      setStatus("error");
    }
  };

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Split Payment</h2>
          <p className={styles.connectPrompt}>Please connect your wallet to continue</p>
          <p className={styles.hint} style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
            For the best experience with batch transactions, use <strong>Coinbase Smart Wallet</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Split Payment Demo</h2>
        <p className={styles.description}>
          Send ETH to 3 recipients {usedBatchMode ? "in a single batch transaction" : ""}
        </p>

        {/* Wallet Type Indicator */}
        {isCoinbaseSmartWallet() ? (
          <div style={{
            background: "#d4edda",
            border: "1px solid #28a745",
            borderRadius: "8px",
            padding: "0.75rem",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}>
            ✅ <strong>Coinbase Smart Wallet detected!</strong> You&apos;ll use Base Account SDK batch transactions.
          </div>
        ) : (
          <div style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "8px",
            padding: "0.75rem",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}>
            ⚠️ <strong>Traditional wallet detected.</strong> For batch transactions, switch to Coinbase Smart Wallet.
          </div>
        )}

        <div className={styles.form}>
          {/* Amount Input */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Amount per recipient (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.input}
              placeholder="0.001"
            />
            <span className={styles.hint}>
              Total: {(parseFloat(amount) * 3).toFixed(3)} ETH + gas
            </span>
          </div>

          {/* Recipient Inputs */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Recipient 1</label>
            <input
              type="text"
              value={recipient1}
              onChange={(e) => setRecipient1(e.target.value)}
              className={styles.input}
              placeholder="0x..."
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Recipient 2</label>
            <input
              type="text"
              value={recipient2}
              onChange={(e) => setRecipient2(e.target.value)}
              className={styles.input}
              placeholder="0x..."
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Recipient 3</label>
            <input
              type="text"
              value={recipient3}
              onChange={(e) => setRecipient3(e.target.value)}
              className={styles.input}
              placeholder="0x..."
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSplitPayment}
            disabled={status === "pending"}
            className={styles.button}
          >
            {status === "pending" ? "Processing..." : "Split Payment"}
          </button>

          {/* Status Display */}
          {status === "success" && txHash && (
            <div className={styles.success}>
              <p className={styles.statusTitle}>Transaction Successful!</p>
              <p className={styles.statusText}>
                {usedBatchMode
                  ? "🎉 All 3 payments sent in ONE transaction using Base Account SDK!"
                  : "Payments sent (3 separate transactions)"
                }
              </p>
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View on BaseScan
              </a>
            </div>
          )}

          {status === "error" && errorMessage && (
            <div className={styles.error}>
              <p className={styles.statusTitle}>Transaction Failed</p>
              <p className={styles.statusText}>{errorMessage}</p>
            </div>
          )}

          {status === "pending" && (
            <div className={styles.pending}>
              <p className={styles.statusText}>
                Confirm transaction in your wallet...
              </p>
            </div>
          )}
        </div>

        {/*  Notes */}
        <div className={styles.notes}>
          <h3 className={styles.notesTitle}>Key Concepts:</h3>
          <ul className={styles.notesList}>
            <li>
              <strong>Base Account SDK:</strong> Enables batch transactions via wallet_sendCalls (EIP-5792)
            </li>
            <li>
              <strong>Coinbase Smart Wallet:</strong> Full support for batch transactions = 1 confirmation, 1 gas fee
            </li>
            <li>
              <strong>Traditional Wallets:</strong> Graceful fallback to separate transactions
            </li>
            <li>
              <strong>Tomorrow's Topic:</strong> Add paymaster config for gasless transactions!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
