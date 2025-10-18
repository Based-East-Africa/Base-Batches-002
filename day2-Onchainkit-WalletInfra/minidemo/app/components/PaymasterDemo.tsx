"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { isAddress } from "viem";
import styles from "./PaymasterDemo.module.css";

interface EthereumProvider {
  request: (args: { method: string; params: unknown[] }) => Promise<string>;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
}

type TransactionType = "native" | "token" | "contract";

export default function PaymasterDemo() {
  const { address, isConnected, connector } = useAccount();
  useMiniKit();
  const { sendTransaction, data: txHash, isPending } = useSendTransaction();
  useWaitForTransactionReceipt({ hash: txHash });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [currentTxHash, setCurrentTxHash] = useState<string>("");
  const [walletType, setWalletType] = useState<string>("");

  // Form fields
  const [transactionType, setTransactionType] = useState<TransactionType>("native");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("0x036CbD53842c5426634e7929541eC2318f3dCF7e"); // USDC on Base Sepolia
  const [contractAddress, setContractAddress] = useState<string>("0x4bbfd120d9f352a0bed7a014bd67913a2007a878");
  const [functionData, setFunctionData] = useState<string>("0x9846cd9e");

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detect wallet type on mount
  useEffect(() => {
    const provider = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
    if (provider?.isMetaMask) setWalletType("MetaMask");
    else if (provider?.isCoinbaseWallet) setWalletType("Coinbase Wallet");
    else setWalletType("Unknown");
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (transactionType === "native" || transactionType === "token") {
      if (!recipient || !isAddress(recipient)) {
        newErrors.recipient = "Invalid recipient address";
      }
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        newErrors.amount = "Invalid amount";
      }
      if (transactionType === "token" && (!tokenAddress || !isAddress(tokenAddress))) {
        newErrors.tokenAddress = "Invalid token address";
      }
    } else if (transactionType === "contract") {
      if (!contractAddress || !isAddress(contractAddress)) {
        newErrors.contractAddress = "Invalid contract address";
      }
      if (!functionData || !functionData.startsWith("0x")) {
        newErrors.functionData = "Invalid function data (must start with 0x)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [transactionType, recipient, amount, tokenAddress, contractAddress, functionData]);

  const handleTransaction = useCallback(async () => {
    if (!isConnected || !address) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      setStatus("Please fix form errors before submitting");
      return;
    }

    setIsLoading(true);
    setStatus("Preparing transaction...");
    setCurrentTxHash("");

    try {
      const provider = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
      if (!provider) {
        throw new Error("No ethereum provider found");
      }

      let targetAddress: string;
      let txData: string;
      let value: string = "0x0";

      // Prepare transaction based on type
      if (transactionType === "native") {
        targetAddress = recipient;
        txData = "0x";
        value = `0x${BigInt(parseFloat(amount) * 1e18).toString(16)}`;
      } else if (transactionType === "token") {
        targetAddress = tokenAddress;
        // ERC20 transfer(address to, uint256 amount)
        const tokenAmount = BigInt(parseFloat(amount) * 1e6); // Assuming 6 decimals for USDC
        txData = `0xa9059cbb${recipient.slice(2).padStart(64, "0")}${tokenAmount.toString(16).padStart(64, "0")}`;
        value = "0x0";
      } else {
        targetAddress = contractAddress;
        txData = functionData;
        value = "0x0";
      }

      const supportsWalletSendCalls = !provider.isMetaMask;

      if (supportsWalletSendCalls) {
        setStatus("Sending gasless transaction with paymaster...");

        const callsId = await provider.request({
          method: "wallet_sendCalls",
          params: [
            {
              version: "1.0",
              from: address,
              calls: [
                {
                  to: targetAddress,
                  data: txData,
                  value,
                },
              ],
              capabilities: {
                paymasterService: {
                  url: process.env.NEXT_PUBLIC_PAYMASTER_URL || "",
                },
              },
            },
          ],
        });

        setCurrentTxHash(callsId);
        setStatus("✓ Transaction submitted successfully!");
      } else {
        setStatus("Sending transaction (gas required with MetaMask)...");

        sendTransaction({
          to: targetAddress as `0x${string}`,
          data: txData as `0x${string}`,
          value: value !== "0x0" ? BigInt(value) : undefined,
        });

        setStatus("✓ Transaction submitted!");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Transaction failed";
      setStatus(`✗ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, sendTransaction, transactionType, recipient, amount, tokenAddress, contractAddress, functionData, validateForm]);

  return (
    <div className={styles.container}>
      <div className={styles.mainCard}>
        {isConnected ? (
          <>
            {/* Transaction Type Selector */}
            <div className={styles.typeSelector}>
              <button
                className={`${styles.typeButton} ${transactionType === "native" ? styles.active : ""}`}
                onClick={() => setTransactionType("native")}
              >
                <div className={styles.typeIcon}>↗</div>
                <div className={styles.typeLabel}>Send ETH</div>
              </button>
              <button
                className={`${styles.typeButton} ${transactionType === "token" ? styles.active : ""}`}
                onClick={() => setTransactionType("token")}
              >
                <div className={styles.typeIcon}>⬡</div>
                <div className={styles.typeLabel}>Send Token</div>
              </button>
              <button
                className={`${styles.typeButton} ${transactionType === "contract" ? styles.active : ""}`}
                onClick={() => setTransactionType("contract")}
              >
                <div className={styles.typeIcon}>⚙</div>
                <div className={styles.typeLabel}>Contract Call</div>
              </button>
            </div>

            {/* Form Fields */}
            <div className={styles.formSection}>
              {(transactionType === "native" || transactionType === "token") && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Recipient Address</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${errors.recipient ? styles.inputError : ""}`}
                      placeholder="0x..."
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                    {errors.recipient && (
                      <span className={styles.errorText}>{errors.recipient}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Amount {transactionType === "native" ? "(ETH)" : "(USDC)"}
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      className={`${styles.formInput} ${errors.amount ? styles.inputError : ""}`}
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    {errors.amount && (
                      <span className={styles.errorText}>{errors.amount}</span>
                    )}
                  </div>

                  {transactionType === "token" && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Token Contract Address</label>
                      <input
                        type="text"
                        className={`${styles.formInput} ${errors.tokenAddress ? styles.inputError : ""}`}
                        placeholder="0x..."
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                      />
                      {errors.tokenAddress && (
                        <span className={styles.errorText}>{errors.tokenAddress}</span>
                      )}
                    </div>
                  )}
                </>
              )}

              {transactionType === "contract" && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contract Address</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${errors.contractAddress ? styles.inputError : ""}`}
                      placeholder="0x..."
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                    />
                    {errors.contractAddress && (
                      <span className={styles.errorText}>{errors.contractAddress}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Function Data (Hex)</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${errors.functionData ? styles.inputError : ""}`}
                      placeholder="0x..."
                      value={functionData}
                      onChange={(e) => setFunctionData(e.target.value)}
                    />
                    {errors.functionData && (
                      <span className={styles.errorText}>{errors.functionData}</span>
                    )}
                  </div>
                </>
              )}

              <button
                onClick={handleTransaction}
                disabled={isLoading || isPending}
                className={styles.submitButton}
              >
                {isLoading || isPending ? (
                  <div className={styles.loadingSpinner} />
                ) : (
                  <>
                    {walletType === "MetaMask" ? "Send Transaction" : "Send Gasless Transaction"}
                    <span className={styles.arrowIcon}>→</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {status && (
              <div
                className={`${styles.statusMessage} ${
                  status.startsWith("✗") ? styles.statusError : styles.statusSuccess
                }`}
              >
                {status}
              </div>
            )}

            {/* Transaction Hash */}
            {(currentTxHash || txHash) && (
              <div className={styles.txResult}>
                <div className={styles.txLabel}>Transaction Hash</div>
                <code className={styles.txHash}>
                  {(currentTxHash || txHash)?.slice(0, 10)}...
                  {(currentTxHash || txHash)?.slice(-8)}
                </code>
                {txHash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.explorerLink}
                  >
                    View Explorer
                  </a>
                )}
              </div>
            )}

            {/* Wallet Info */}
            <div className={styles.walletInfo}>
              <div className={styles.walletInfoItem}>
                <span className={styles.walletInfoLabel}>Address</span>
                <span className={styles.walletInfoValue}>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <div className={styles.walletInfoItem}>
                <span className={styles.walletInfoLabel}>Wallet</span>
                <span className={styles.walletInfoValue}>
                  {walletType || connector?.name || "Unknown"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.connectPrompt}>
            <div className={styles.connectIcon}>🔐</div>
            <h3 className={styles.connectTitle}>Connect Your Wallet</h3>
            <p className={styles.connectText}>
              Connect your wallet to start sending gasless transactions
            </p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {isConnected && (
        <div className={styles.infoPanel}>
          <div className={styles.infoPanelHeader}>
            <span className={styles.infoPanelIcon}>ⓘ</span>
            <h3 className={styles.infoPanelTitle}>
              {walletType === "MetaMask" ? "MetaMask Detected" : "Gasless Mode"}
            </h3>
          </div>
          <p className={styles.infoPanelText}>
            {walletType === "MetaMask"
              ? "Standard transactions with gas fees required. For gasless transactions, use Coinbase Wallet."
              : "Your transactions are sponsored by the paymaster. No gas fees required."}
          </p>
        </div>
      )}
    </div>
  );
}
