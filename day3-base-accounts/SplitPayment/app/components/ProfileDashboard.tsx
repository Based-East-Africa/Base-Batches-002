"use client";

import { Identity, Avatar, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { base } from 'viem/chains';
import styles from './ProfileDashboard.module.css';

// Coinbase Verified attestation schema ID on Base
const COINBASE_VERIFIED_SCHEMA_ID = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

export function ProfileDashboard() {
  const { address, isConnected } = useAccount();

  console.log('[ProfileDashboard] Rendering - isConnected:', isConnected, 'address:', address);

  // Don't render if not connected
  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Your Profile</h2>
        <p className={styles.description}>
          Your Base identity and Basename information
        </p>

        <div className={styles.profileContent}>
          {/* Debug info */}
          <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#333' }}>
              <strong>Connected Address:</strong> {address}
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
              Identity components below should show your Basename if you have one set as primary on Base mainnet.
            </p>
          </div>

          {/* Identity Component - OnchainKit will handle Basename resolution internally */}
          <div style={{
            padding: '1.5rem',
            background: '#ffffff',
            border: '2px solid #0052ff',
            borderRadius: '12px'
          }}>
            <Identity
              address={address as `0x${string}`}
              chain={base}
              schemaId={COINBASE_VERIFIED_SCHEMA_ID}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Avatar style={{ width: '80px', height: '80px' }}>
                  <Badge />
                </Avatar>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000', marginBottom: '0.5rem' }}>
                    <Name>
                      <Badge />
                    </Name>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#666' }}>
                    <Address />
                  </div>
                </div>
              </div>
            </Identity>
          </div>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <h3 className={styles.infoTitle}>What are Basenames?</h3>
            <ul className={styles.infoList}>
              <li>Human-readable names like "yourname.base.eth"</li>
              <li>Works across all Base applications</li>
              <li>Can be verified with Coinbase attestation</li>
              <li>Stored on-chain as NFTs (transferable)</li>
            </ul>
            <a
              href="https://www.base.org/names"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaButton}
              style={{ display: 'inline-block', marginTop: '1rem' }}
            >
              Get a Basename →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
