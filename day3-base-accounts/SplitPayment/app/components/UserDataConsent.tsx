"use client";

import styles from "./SplitPayment.module.css";

/**
 * UserDataConsent Component
 *
 * Purpose: Inform users about data collection before transaction
 *
 * Features:
 * - Show what data will be collected
 * - Explain required vs optional fields
 * - Educational messaging about data usage
 *
 * Data Collection:
 * - Email (required) - for transaction receipts
 * - Phone number (optional) - for SMS notifications
 */

interface UserDataConsentProps {
  onToggle: (enabled: boolean) => void;
  enabled: boolean;
}

export function UserDataConsent({ onToggle, enabled }: UserDataConsentProps) {
  return (
    <div className={styles.inputGroup}>
      <div
        style={{
          background: "#f0f8ff",
          border: "2px solid #0052ff",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <input
            type="checkbox"
            id="dataConsent"
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
            htmlFor="dataConsent"
            style={{
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              margin: 0,
            }}
          >
            📧 Collect User Information
          </label>
        </div>

        {enabled && (
          <div style={{ paddingLeft: "2rem" }}>
            <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", color: "#333" }}>
              <strong>We&apos;ll collect:</strong>
            </p>

            <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", color: "#555" }}>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Email address</strong> (required) - for transaction receipts
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>Phone number</strong> (optional) - for SMS notifications
              </li>
            </ul>

            <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.8rem", color: "#666", fontStyle: "italic" }}>
              💡 You&apos;ll be prompted in your wallet to provide this information. You can decline optional fields.
            </p>
          </div>
        )}
      </div>

      {!enabled && (
        <p className={styles.hint} style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>
          Enable to collect contact information for receipts and notifications
        </p>
      )}
    </div>
  );
}
