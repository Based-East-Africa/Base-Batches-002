"use client";

import styles from "./SplitPayment.module.css";

/**
 * GasPaymentToggle Component
 *
 * Purpose: Allow users to pay gas fees in USDC instead of ETH
 *
 * Features:
 * - Toggle between ETH and USDC gas payment
 * - Show USDC token address
 * - Explain benefits of ERC-20 gas payments
 *
 * Requirements:
 * - User must have USDC balance on Base Sepolia
 * - Paymaster service must be configured
 * - USDC allowance must be set for paymaster
 */

interface GasPaymentToggleProps {
  onToggle: (payWithUSDC: boolean) => void;
  enabled: boolean;
  usdcAddress: string;
}

export function GasPaymentToggle({ onToggle, enabled, usdcAddress }: GasPaymentToggleProps) {
  return (
    <div className={styles.inputGroup}>
      <div
        style={{
          background: enabled ? "#e6f7ff" : "#f9f9f9",
          border: enabled ? "2px solid #0052ff" : "2px solid #e0e0e0",
          borderRadius: "8px",
          padding: "1rem",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: enabled ? "0.75rem" : "0" }}>
          <input
            type="checkbox"
            id="usdcGas"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              accentColor: "#0052ff",
            }}
          />
          <label
            htmlFor="usdcGas"
            style={{
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>💵</span>
            <span>Pay Gas in USDC</span>
            {enabled && <span style={{ fontSize: "0.85rem", color: "#28a745", fontWeight: "bold" }}>✓ Enabled</span>}
          </label>
        </div>

        {enabled && (
          <div style={{ paddingLeft: "2rem" }}>
            <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", color: "#333" }}>
              <strong>Benefits:</strong>
            </p>

            <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", color: "#555" }}>
              <li style={{ marginBottom: "0.5rem" }}>No need to hold ETH for gas fees</li>
              <li style={{ marginBottom: "0.5rem" }}>Use stablecoins you already have</li>
              <li style={{ marginBottom: "0.5rem" }}>Simpler onboarding for new users</li>
            </ul>

            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.5rem",
                background: "#fff",
                borderRadius: "4px",
                fontSize: "0.75rem",
                color: "#666",
              }}
            >
              <p style={{ margin: "0 0 0.25rem 0", fontWeight: 600 }}>USDC on Base Sepolia:</p>
              <code
                style={{
                  display: "block",
                  padding: "0.25rem",
                  background: "#f5f5f5",
                  borderRadius: "2px",
                  wordBreak: "break-all",
                }}
              >
                {usdcAddress}
              </code>
            </div>

            <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.8rem", color: "#666", fontStyle: "italic" }}>
              💡 Make sure you have USDC from{" "}
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0052ff", textDecoration: "underline" }}
              >
                Circle Faucet
              </a>
            </p>
          </div>
        )}
      </div>

      {!enabled && (
        <p className={styles.hint} style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>
          Pay transaction gas fees with USDC stablecoin instead of ETH
        </p>
      )}
    </div>
  );
}
