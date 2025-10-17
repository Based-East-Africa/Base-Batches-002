import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { addNonce } from '@/lib/auth';

/**
 * Nonce Generation API Route
 *
 * Purpose: Generate unique, one-time-use nonces for Sign in with Base authentication
 *
 * Security:
 * - Each nonce expires after 10 minutes
 * - Can only be used once (consumed during verification)
 * - Prevents replay attacks
 */

export async function GET() {
  try {
    // Generate cryptographically secure random nonce
    const nonce = crypto.randomBytes(16).toString('hex');

    // Add to shared nonce store with automatic expiration
    addNonce(nonce);

    console.log('[Auth] Generated nonce:', nonce);

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('[Auth] Nonce generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}
