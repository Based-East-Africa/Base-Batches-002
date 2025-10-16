"use client";
import styles from "./page.module.css";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { SplitPayment } from "./components/SplitPayment";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <SplitPayment />
    </div>
  );
}
