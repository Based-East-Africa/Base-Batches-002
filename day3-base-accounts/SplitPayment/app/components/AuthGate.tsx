"use client";

import { useAuth } from "../hooks/useAuth";
import { SplitPaymentEnhanced } from "./SplitPaymentEnhanced";
import styles from "./SplitPayment.module.css";

/**
 * AuthGate Component
 *
 * Purpose: Authentication gate for Split Payment app
 *
 * Flow:
 * 1. User sees "Sign in with Base" button
 * 2. Clicks → Base Account popup for signature
 * 3. After successful auth → Show Split Payment UI
 * 4. User can sign out anytime
 *
 * Features:
 * - Sign in with Ethereum (SIWE) authentication
 * - Session management with localStorage
 * - Auto-restore session on page load
 * - Sign out functionality
 */

export function AuthGate() {
  const { isAuthenticated, address, isLoading, error, signIn, signOut } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Split Payment</h2>
          <p className={styles.connectPrompt}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Split Payment Demo</h2>
          <p className={styles.description} style={{ marginBottom: "2rem" }}>
            Authenticate with your Base Account to access split payment features
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
                🔐 Sign in with Base
              </h3>
              <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#555" }}>
                Authenticate using your wallet signature. No passwords required!
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
                <li style={{ marginBottom: "0.5rem" }}>✓ Secure wallet-based authentication</li>
                <li style={{ marginBottom: "0.5rem" }}>✓ Works with smart wallets (ERC-6492)</li>
                <li style={{ marginBottom: "0.5rem" }}>✓ Domain-bound signatures (EIP-4361)</li>
              </ul>
            </div>

            <button
              onClick={signIn}
              className={styles.button}
              style={{
                minWidth: "200px",
                background: "linear-gradient(135deg, #0052ff 0%, #0041cc 100%)",
                boxShadow: "0 4px 12px rgba(0, 82, 255, 0.3)",
              }}
            >
              Sign in with Base
            </button>

            {error && (
              <div className={styles.error} style={{ maxWidth: "400px" }}>
                <p className={styles.statusTitle}>Authentication Failed</p>
                <p className={styles.statusText}>{error}</p>
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
                <strong>New to Base Accounts?</strong>
              </p>
              <p style={{ margin: 0 }}>
                Base Accounts are smart wallets that use passkeys for authentication. They enable
                advanced features like batch transactions, gasless UX, and sub-accounts.
              </p>
              <a
                href="https://docs.base.org/base-account"
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

  // Authenticated - show split payment with sign out option
  return (
    <div>
      {/* Sign Out Header */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>👤</span>
          <div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>Signed in as</p>
            <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 600 }}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
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
          Sign Out
        </button>
      </div>

      {/* Main Split Payment UI */}
      <SplitPaymentEnhanced userAddress={address || ""} />
    </div>
  );
}
