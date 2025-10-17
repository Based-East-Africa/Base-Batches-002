/**
 * Shared Authentication Utilities
 *
 * Provides nonce management for SIWE authentication
 * Shared between API routes to ensure nonces are properly tracked
 */

// Shared nonce store (use Redis in production!)
export const nonces = new Set<string>();

/**
 * Add nonce with automatic expiration
 * @param nonce - The nonce string to add
 */
export function addNonce(nonce: string) {
  nonces.add(nonce);

  // Automatically expire after 5 minutes
  setTimeout(() => {
    nonces.delete(nonce);
    console.log('[Auth] Nonce expired:', nonce);
  }, 5 * 60 * 1000);

  console.log('[Auth] Nonce added to store. Total nonces:', nonces.size);
}

/**
 * Verify and consume nonce (one-time use)
 * @param nonce - The nonce to verify
 * @returns true if nonce is valid and consumed, false otherwise
 */
export function consumeNonce(nonce: string): boolean {
  if (!nonces.has(nonce)) {
    console.log('[Auth] Nonce not found in store. Available:', Array.from(nonces));
    return false;
  }

  // Remove nonce so it can't be reused
  nonces.delete(nonce);
  console.log('[Auth] Nonce consumed. Remaining:', nonces.size);

  return true;
}
