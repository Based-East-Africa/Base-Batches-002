/**
 * Shared Authentication Utilities
 *
 * Provides nonce management for SIWE authentication
 * Uses global singleton pattern to ensure nonces persist across API routes
 */

// Global nonce store using globalThis to persist across module reloads
const globalForNonces = globalThis as unknown as {
  nonces: Set<string> | undefined;
};

// Initialize or reuse existing nonce store
export const nonces = globalForNonces.nonces ?? new Set<string>();

if (process.env.NODE_ENV !== 'production') {
  globalForNonces.nonces = nonces;
}

/**
 * Add nonce with automatic expiration
 * @param nonce - The nonce string to add
 */
export function addNonce(nonce: string) {
  nonces.add(nonce);
  console.log('[Auth] Nonce added. Total:', nonces.size, 'Nonces:', Array.from(nonces));

  // Automatically expire after 10 minutes
  setTimeout(() => {
    nonces.delete(nonce);
    console.log('[Auth] Nonce expired:', nonce);
  }, 10 * 60 * 1000);
}

/**
 * Verify nonce exists (don't consume yet)
 * @param nonce - The nonce to verify
 * @returns true if nonce exists
 */
export function verifyNonce(nonce: string): boolean {
  const exists = nonces.has(nonce);
  console.log('[Auth] Verifying nonce:', {
    nonce,
    exists,
    totalNonces: nonces.size,
    available: Array.from(nonces),
  });
  return exists;
}

/**
 * Consume nonce (one-time use)
 * @param nonce - The nonce to consume
 * @returns true if nonce was consumed
 */
export function consumeNonce(nonce: string): boolean {
  const deleted = nonces.delete(nonce);
  console.log('[Auth] Nonce consumed:', { nonce, deleted, remaining: nonces.size });
  return deleted;
}
