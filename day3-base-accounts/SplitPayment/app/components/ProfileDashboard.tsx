"use client";

import { Identity, Avatar, Name, Badge, Address, useName, Socials } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { base } from 'viem/chains';
import styles from './ProfileDashboard.module.css';

// Coinbase Verified attestation schema ID on Base
const COINBASE_VERIFIED_SCHEMA_ID = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

export function ProfileDashboard() {
  const { address, isConnected } = useAccount();
  const { data: name, isLoading: nameLoading } = useName({ address: address as `0x${string}`, chain: base });

  // Don't render if not connected
  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Your Profile</h2>
        <p className={styles.description}>
          Your onchain identity on Base
        </p>

        <div className={styles.profileContent}>
          {/* Identity Component */}
          <div className={styles.identity}>
            <Identity
              address={address as `0x${string}`}
              chain={base}
              schemaId={COINBASE_VERIFIED_SCHEMA_ID}
            >
              <div className={styles.identityLayout}>
                <Avatar className={styles.avatar}>
                  <Badge tooltip="Verified Account" />
                </Avatar>

                <div className={styles.identityInfo}>
                  <Name className={styles.name}>
                    <Badge tooltip="Verified Account" />
                  </Name>
                  <Address className={styles.address} />
                  <Socials address={address as `0x${string}`} chain={base} className={styles.socials} />
                </div>
              </div>
            </Identity>
          </div>

          {/* Info Box - conditional messaging based on Basename status */}
          <div className={styles.infoBox}>
            {!nameLoading && !name ? (
              <>
                <h3 className={styles.infoTitle}>You don&apos;t have a Basename yet</h3>
                <p className={styles.infoText}>
                  Get your own human-readable name on Base (like &quot;yourname.base.eth&quot;) to make your wallet easier to find and share.
                </p>
                <ul className={styles.infoList}>
                  <li>Works across all Base applications</li>
                  <li>Can be verified with Coinbase attestation</li>
                  <li>Stored on-chain as an NFT (transferable)</li>
                </ul>
                <a
                  href="https://www.base.org/names"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  Get a Basename →
                </a>
              </>
            ) : (
              <>
                <h3 className={styles.infoTitle}>About Basenames</h3>
                <ul className={styles.infoList}>
                  <li>Human-readable names like &quot;yourname.base.eth&quot;</li>
                  <li>Works across all Base applications</li>
                  <li>Can be verified with Coinbase attestation</li>
                  <li>Stored on-chain as NFTs (transferable)</li>
                </ul>
                <a
                  href="https://www.base.org/names"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  Manage your Basename →
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
