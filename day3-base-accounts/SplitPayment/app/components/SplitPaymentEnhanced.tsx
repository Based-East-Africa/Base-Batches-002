"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createBaseAccountSDK, base } from "@base-org/account";
import { parseEther, numberToHex } from "viem";
import styles from "./SplitPayment.module.css";
import { UserDataConsent } from "./UserDataConsent";
import { GasPaymentToggle } from "./GasPaymentToggle";

/**
 * Enhanced SplitPayment Component
 *
 * Features:
 * 1. ✅ Batch Transactions - Multiple transfers in one transaction
 * 2. 🆕 User Authentication - Sign in with Base (SIWE)
 * 3. 🆕 Data Collection - Email (required) + Phone (optional)
 * 4. 🆕 ERC-20 Gas Payments - Pay gas in USDC instead of ETH
 * 5. 🔄 Dual Wallet Support - Coinbase Smart Wallet (batch) + MetaMask (fallback)
 *
 * Technical Implementation:
 * - Base Account SDK for batch transactions
 * - dataCallback capability for user info collection
 * - paymasterService capability for ERC-20 gas
 * - Graceful fallbacks for unsupported wallets
 */

// USDC token address on Base Sepolia
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Paymaster URL (replace with your actual paymaster)
// Get from: https://portal.cdp.coinbase.com
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || "";

interface CollectedUserData {
  email?: string;
  phoneNumber?: {
    number: string;
    country: string;
  };
}

interface SplitPaymentEnhancedProps {
  userAddress: string;
}

export function SplitPaymentEnhanced({ userAddress }: SplitPaymentEnhancedProps) {
  const { address, isConnected, connector } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Recipient state
  const [recipient1, setRecipient1] = useState("");
  const [recipient2, setRecipient2] = useState("");
  const [recipient3, setRecipient3] = useState("");
  const [amount, setAmount] = useState("0.001");

  // Feature toggles
  const [collectData, setCollectData] = useState(false);
  const [payWithUSDC, setPayWithUSDC] = useState(false);

  // Transaction state
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [usedBatchMode, setUsedBatchMode] = useState<boolean>(false);

  // Collected data state
  const [collectedData, setCollectedData] = useState<CollectedUserData | null>(null);
  const [gasPaymentMethod, setGasPaymentMethod] = useState<"ETH" | "USDC">("ETH");

  // SDK initialization
  const [sdk, setSdk] = useState<ReturnType<typeof createBaseAccountSDK> | null>(null);

  useEffect(() => {
    const baseAccountSdk = createBaseAccountSDK({
      appName: "Split Payment Demo",
      appLogoUrl: "https://base.org/favicon.ico",
      appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
      // Paymaster configuration for ERC-20 gas payments
      ...(payWithUSDC &&
        PAYMASTER_URL && {
          paymasterUrls: {
            [base.constants.CHAIN_IDS.baseSepolia]: PAYMASTER_URL,
          },
        }),
    });

    setSdk(baseAccountSdk);
  }, [payWithUSDC]);

  /**
   * Detect Coinbase Smart Wallet
   */
  const isCoinbaseSmartWallet = () => {
    const connectorName = connector?.name?.toLowerCase() || "";
    return connectorName.includes("coinbase");
  };

  /**
   * Execute batch transaction with Base Account SDK
   * Includes data collection and ERC-20 gas payment capabilities
   */
  const executeBatchWithSDK = async (calls: Array<{
    to: `0x${string}`;
    value: string;
    data: `0x${string}`;
  }>) => {
    if (!sdk || !address) {
      throw new Error("SDK not initialized");
    }

    const provider = sdk.getProvider();

    // Build capabilities object
    const capabilities: any = {};

    // Add data collection capability
    if (collectData) {
      capabilities.dataCallback = {
        requests: [
          { type: "email", optional: false }, // Required
          { type: "phoneNumber", optional: true }, // Optional
        ],
      };
    }

    // Add paymaster capability for ERC-20 gas
    if (payWithUSDC && PAYMASTER_URL) {
      capabilities.paymasterService = {
        url: PAYMASTER_URL,
      };
    }

    console.log("[SplitPayment] Executing with capabilities:", capabilities);

    // Execute batch transaction
    const result = await provider.request({
      method: "wallet_sendCalls",
      params: [
        {
          version: "1.0",
          from: address,
          chainId: numberToHex(base.constants.CHAIN_IDS.baseSepolia),
          calls: calls,
          ...(Object.keys(capabilities).length > 0 && { capabilities }),
        },
      ],
    });

    // Extract collected data if available
    if (collectData && (result as any).payerInfoResponses) {
      const data = (result as any).payerInfoResponses;
      setCollectedData({
        email: data.email,
        phoneNumber: data.phoneNumber,
      });
      console.log("[SplitPayment] Collected user data:", data);
    }

    // Check if USDC was used for gas
    if (payWithUSDC && (result as any).tokenPayment) {
      setGasPaymentMethod("USDC");
      console.log("[SplitPayment] Gas paid in USDC:", (result as any).tokenPayment);
    } else {
      setGasPaymentMethod("ETH");
    }

    return result;
  };

  /**
   * Fallback for traditional wallets (MetaMask, etc.)
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
      console.log(`[SplitPayment] Sending transaction ${i + 1}/3...`);

      const hash = await walletClient.sendTransaction({
        to: calls[i].to,
        value: BigInt(calls[i].value),
        data: calls[i].data,
        chain: walletClient.chain,
      });

      hashes.push(hash);
    }

    return hashes;
  };

  /**
   * Main transaction handler
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

    // Validate paymaster URL if USDC selected
    if (payWithUSDC && !PAYMASTER_URL) {
      setErrorMessage("Paymaster not configured. Add NEXT_PUBLIC_PAYMASTER_URL to your .env file");
      setStatus("error");
      return;
    }

    try {
      setStatus("pending");
      setErrorMessage("");
      setTxHash("");
      setUsedBatchMode(false);
      setCollectedData(null);

      // Prepare batch calls
      const calls = [
        {
          to: recipient1 as `0x${string}`,
          value: numberToHex(parseEther(amount)),
          data: "0x" as `0x${string}`,
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

      const isCoinbase = isCoinbaseSmartWallet();
      console.log("[SplitPayment] Wallet type:", isCoinbase ? "Coinbase Smart Wallet" : "Traditional");

      if (isCoinbase && sdk) {
        try {
          // Use Base Account SDK (batch mode with capabilities)
          console.log("[SplitPayment] Using Base Account SDK...");

          const result = await executeBatchWithSDK(calls);

          const hash = (result as { hash?: string })?.hash || (result as string);
          setTxHash(hash);
          setStatus("success");
          setUsedBatchMode(true);

          console.log("[SplitPayment] Success! Hash:", hash);
        } catch (sdkError) {
          console.error("[SplitPayment] SDK batch failed:", sdkError);

          // Fallback to individual transactions
          const hashes = await executeSeparateTransactions(calls);
          setTxHash(hashes[0]);
          setStatus("success");
          setUsedBatchMode(false);
          setErrorMessage(`Batch mode failed. Sent 3 separate transactions: ${hashes.join(", ")}`);
        }
      } else {
        // Traditional wallet
        console.log("[SplitPayment] Using traditional wallet...");

        if (collectData) {
          setErrorMessage("Note: Data collection only works with Coinbase Smart Wallet. ");
        }

        if (payWithUSDC) {
          setErrorMessage((prev) => prev + "USDC gas payment only works with Coinbase Smart Wallet. ");
        }

        const hashes = await executeSeparateTransactions(calls);
        setTxHash(hashes[0]);
        setStatus("success");
        setUsedBatchMode(false);
      }
    } catch (error: any) {
      console.error("[SplitPayment] Transaction failed:", error);

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
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Split Payment Demo</h2>
        <p className={styles.description}>
          Send ETH to 3 recipients with advanced features
        </p>

        {/* Wallet Type Indicator */}
        {isCoinbaseSmartWallet() ? (
          <div
            style={{
              background: "#d4edda",
              border: "1px solid #28a745",
              borderRadius: "8px",
              padding: "0.75rem",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            ✅ <strong>Coinbase Smart Wallet!</strong> All features available
          </div>
        ) : (
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "8px",
              padding: "0.75rem",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ <strong>Traditional wallet.</strong> Some features require Coinbase Smart Wallet
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

          {/* NEW FEATURE: User Data Collection */}
          <UserDataConsent enabled={collectData} onToggle={setCollectData} />

          {/* NEW FEATURE: ERC-20 Gas Payment */}
          <GasPaymentToggle
            enabled={payWithUSDC}
            onToggle={setPayWithUSDC}
            usdcAddress={USDC_ADDRESS}
          />

          {/* Submit Button */}
          <button
            onClick={handleSplitPayment}
            disabled={status === "pending"}
            className={styles.button}
          >
            {status === "pending" ? "Processing..." : "Split Payment"}
          </button>

          {/* Success Display with Enhanced Info */}
          {status === "success" && txHash && (
            <div className={styles.success}>
              <p className={styles.statusTitle}>Transaction Successful! 🎉</p>
              <p className={styles.statusText}>
                {usedBatchMode
                  ? "All 3 payments sent in ONE batch transaction!"
                  : "Payments sent (3 separate transactions)"}
              </p>

              {/* Gas Payment Method */}
              <p className={styles.statusText}>
                <strong>Gas paid in:</strong> {gasPaymentMethod}
                {gasPaymentMethod === "USDC" && " 💵"}
              </p>

              {/* Collected User Data */}
              {collectedData && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    background: "#f0f8ff",
                    borderRadius: "6px",
                  }}
                >
                  <p style={{ margin: "0 0 0.5rem 0", fontWeight: 600, fontSize: "0.9rem" }}>
                    📧 Collected Information:
                  </p>
                  {collectedData.email && (
                    <p style={{ margin: "0.25rem 0", fontSize: "0.85rem" }}>
                      <strong>Email:</strong> {collectedData.email}
                    </p>
                  )}
                  {collectedData.phoneNumber && (
                    <p style={{ margin: "0.25rem 0", fontSize: "0.85rem" }}>
                      <strong>Phone:</strong> {collectedData.phoneNumber.country}{" "}
                      {collectedData.phoneNumber.number}
                    </p>
                  )}
                </div>
              )}

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

          {/* Error Display */}
          {status === "error" && errorMessage && (
            <div className={styles.error}>
              <p className={styles.statusTitle}>Transaction Failed</p>
              <p className={styles.statusText}>{errorMessage}</p>
            </div>
          )}

          {/* Pending Display */}
          {status === "pending" && (
            <div className={styles.pending}>
              <p className={styles.statusText}>Confirm transaction in your wallet...</p>
              {collectData && (
                <p className={styles.statusText} style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  You&apos;ll be prompted to provide your email and phone number
                </p>
              )}
            </div>
          )}
        </div>

        {/* Educational Notes */}
        <div className={styles.notes}>
          <h3 className={styles.notesTitle}>Features Demonstrated:</h3>
          <ul className={styles.notesList}>
            <li>
              <strong>Batch Transactions:</strong> Multiple transfers in one transaction
            </li>
            <li>
              <strong>Data Collection:</strong> Collect user email + phone via dataCallback
            </li>
            <li>
              <strong>ERC-20 Gas:</strong> Pay gas fees in USDC instead of ETH
            </li>
            <li>
              <strong>Dual Support:</strong> Works with Coinbase Smart Wallet and traditional wallets
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
