"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { SplitPaymentEnhanced } from "./SplitPaymentEnhanced";
import { ProfileDashboard } from "./ProfileDashboard";
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import styles from "./SplitPayment.module.css";

// Coinbase Verified attestation schema ID
const COINBASE_VERIFIED_SCHEMA_ID = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

/**
 * AuthGate Component
 *
 * Purpose: Wallet connection gate for Split Payment app
 *
 * Flow:
 * 1. User sees "Connect Wallet" button
 * 2. Clicks → Wallet selection modal
 * 3. After successful connection → Show Split Payment UI
 * 4. User can disconnect anytime
 *
 * Features:
 * - Wagmi-based wallet connection
 * - Support for multiple wallets (Coinbase Wallet extension, injected wallets, smart wallets)
 * - Automatic reconnection
 * - Disconnect functionality
 */

export function AuthGate() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Not connected - show wallet connection options
  if (!isConnected) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Split Payment Demo</h2>
          <p className={styles.description} style={{ marginBottom: "2rem" }}>
            Connect your wallet to access split payment features
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              padding: "2rem 0",
            }}
          >
            <div
              style={{
                background: "#f0f8ff",
                border: "2px solid #0052ff",
                borderRadius: "12px",
                padding: "1.5rem",
                maxWidth: "400px",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#0052ff" }}>
                🔐 Connect Your Wallet
              </h3>
              <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#555" }}>
                Choose your wallet to get started. Works with Coinbase Wallet, MetaMask, and more!
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "0.85rem",
                  color: "#666",
                  textAlign: "left",
                }}
              >
                <li style={{ marginBottom: "0.5rem" }}>✓ Secure wallet-based connection</li>
                <li style={{ marginBottom: "0.5rem" }}>✓ Works with browser extensions</li>
                <li style={{ marginBottom: "0.5rem" }}>✓ Support for Basenames</li>
              </ul>
            </div>

            {/* Wallet Connection Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "300px" }}>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  disabled={isConnecting || isPending}
                  className={styles.button}
                  style={{
                    background: isConnecting ? "#ccc" : "linear-gradient(135deg, #0052ff 0%, #0041cc 100%)",
                    boxShadow: "0 4px 12px rgba(0, 82, 255, 0.3)",
                    opacity: isConnecting || isPending ? 0.6 : 1,
                    cursor: isConnecting || isPending ? "not-allowed" : "pointer",
                  }}
                >
                  {isConnecting && isPending ? "Connecting..." : `Connect with ${connector.name}`}
                </button>
              ))}
            </div>

            {error && (
              <div className={styles.error} style={{ maxWidth: "400px" }}>
                <p className={styles.statusTitle}>Connection Failed</p>
                <p className={styles.statusText}>{error.message}</p>
              </div>
            )}

            <div
              style={{
                marginTop: "2rem",
                fontSize: "0.85rem",
                color: "#666",
                textAlign: "center",
                maxWidth: "500px",
              }}
            >
              <p style={{ margin: "0 0 0.5rem 0" }}>
                <strong>New to Base?</strong>
              </p>
              <p style={{ margin: 0 }}>
                Base is a secure, low-cost Ethereum L2 built by Coinbase. Get your own Basename
                to make your wallet address human-readable!
              </p>
              <a
                href="https://www.base.org/names"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#0052ff",
                  textDecoration: "underline",
                  display: "inline-block",
                  marginTop: "0.5rem",
                }}
              >
                Learn more →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Connected - show profile + split payment with disconnect option
  return (
    <div>
      {/* Disconnect Header with Identity */}
      <div
        style={{
          background: "#f9f9f9",
          borderBottom: "1px solid #e0e0e0",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Use Identity components to show avatar + basename */}
          <Identity
            address={address as `0x${string}`}
            chain={base}
            schemaId={COINBASE_VERIFIED_SCHEMA_ID}
          >
            <Avatar
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
              }}
            >
              <Badge tooltip="Verified Account" />
            </Avatar>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>Connected as</p>
              <Name
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Badge tooltip="Verified Account" />
              </Name>
            </div>
          </Identity>
        </div>
        <button
          onClick={() => disconnect()}
          style={{
            padding: "0.5rem 1rem",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 500,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f5f5f5";
            e.currentTarget.style.borderColor = "#999";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#ccc";
          }}
        >
          Disconnect
        </button>
      </div>

      {/* Profile Dashboard */}
      <ProfileDashboard />

      {/* Main Split Payment UI */}
      <SplitPaymentEnhanced userAddress={address || ""} />
    </div>
  );
}
