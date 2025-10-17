"use client";
import styles from "./page.module.css";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { AuthGate } from "./components/AuthGate";

/**
 * Main Page - Enhanced Split Payment Workshop
 *
 * Features:
 * 1. Authentication with Sign in with Base (SIWE)
 * 2. Batch transactions (3 transfers in one transaction)
 * 3. User data collection (email + phone)
 * 4. ERC-20 gas payments (pay gas in USDC)
 * 5. Dual wallet support (Coinbase Smart Wallet + MetaMask)
 *
 * Flow:
 * 1. Connect wallet (OnchainKit)
 * 2. Authenticate with Base Account (AuthGate)
 * 3. Access Split Payment features (SplitPaymentEnhanced)
 */

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      {/* Authentication Gate + Enhanced Split Payment */}
      <AuthGate />
    </div>
  );
}
