import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Nonce Generation API Route
 *
 * Purpose: Generate unique, one-time-use nonces for Sign in with Base authentication
 *
 * Flow:
 * 1. Generate random nonce
 * 2. Store nonce with expiry
 * 3. Return to client for signature request
 *
 * Security:
 * - Each nonce expires after 5 minutes
 * - Can only be used once (consumed during verification)
 * - Prevents replay attacks
 */

// In-memory nonce storage (use Redis in production!)
const nonces = new Map<string, { createdAt: number }>();

// Clean up expired nonces every minute
setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  for (const [nonce, data] of nonces.entries()) {
    if (now - data.createdAt > fiveMinutes) {
      nonces.delete(nonce);
    }
  }
}, 60 * 1000);

export async function GET() {
  try {
    // Generate cryptographically secure random nonce
    const nonce = crypto.randomBytes(16).toString('hex');

    // Store nonce with timestamp
    nonces.set(nonce, { createdAt: Date.now() });

    console.log('[Auth] Generated nonce:', nonce);

    return NextResponse.json({
      nonce,
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    console.error('[Auth] Nonce generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}

/**
 * Export helper function to verify and consume nonce
 * Used by the verify route
 */
export function consumeNonce(nonce: string): boolean {
  const nonceData = nonces.get(nonce);

  if (!nonceData) {
    return false; // Nonce doesn't exist or already used
  }

  // Check if expired (5 minutes)
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (now - nonceData.createdAt > fiveMinutes) {
    nonces.delete(nonce);
    return false;
  }

  // Consume nonce (delete so it can't be reused)
  nonces.delete(nonce);
  return true;
}
