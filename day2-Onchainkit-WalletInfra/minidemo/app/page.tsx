"use client";
import { useEffect } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import PaymasterDemo from "./components/PaymasterDemo";
import styles from "./page.module.css";

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Paymaster Demo</h1>
          <p className={styles.description}>
            Experience gasless transactions powered by Base
          </p>
        </div>

        <PaymasterDemo />
      </div>
    </div>
  );
}
