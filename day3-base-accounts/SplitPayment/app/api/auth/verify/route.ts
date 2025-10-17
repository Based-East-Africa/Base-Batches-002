import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import crypto from 'crypto';
import { consumeNonce } from '@/lib/auth';

/**
 * Signature Verification API Route
 *
 * Purpose: Verify SIWE (Sign in with Ethereum) signatures and create sessions
 *
 * Flow:
 * 1. Extract nonce from signed message
 * 2. Verify nonce is valid and unused
 * 3. Verify signature using viem (supports ERC-6492 for undeployed wallets)
 * 4. Create session token
 * 5. Return session to client
 *
 * Security:
 * - Nonces can only be used once
 * - Signatures are verified on-chain
 * - ERC-6492 support for smart wallets
 * - Session tokens stored securely
 */

// Create viem client for signature verification
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// In-memory session storage (use Redis/DB in production!)
const sessions = new Map<string, {
  address: string;
  createdAt: number;
  expiresAt: number;
}>();

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}, 60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, message, signature } = body;

    // Validate request body
    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: address, message, signature' },
        { status: 400 }
      );
    }

    console.log('[Auth] Verifying signature for address:', address);
    console.log('[Auth] Message:', message);

    // 1. Extract nonce from message
    // SIWE message format includes "Nonce: <value>"
    const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/i);
    if (!nonceMatch) {
      console.error('[Auth] No nonce found in message');
      return NextResponse.json(
        { error: 'Invalid message format: nonce not found' },
        { status: 400 }
      );
    }

    const nonce = nonceMatch[1];
    console.log('[Auth] Extracted nonce:', nonce);

    // 2. Verify and consume nonce from shared store
    const nonceValid = consumeNonce(nonce);

    if (!nonceValid) {
      console.error('[Auth] Invalid or reused nonce:', nonce);
      return NextResponse.json(
        { error: 'Invalid, expired, or reused nonce' },
        { status: 401 }
      );
    }

    // 3. Verify signature using viem
    // This supports ERC-6492 for undeployed smart wallets
    let isValid = false;
    try {
      isValid = await publicClient.verifyMessage({
        address: address as `0x${string}`,
        message: message,
        signature: signature as `0x${string}`,
      });
    } catch (error) {
      console.error('[Auth] Signature verification error:', error);
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('[Auth] Signature valid for:', address);

    // 4. Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    sessions.set(sessionToken, {
      address: address,
      createdAt: now,
      expiresAt: now + sevenDays,
    });

    console.log('[Auth] Session created for:', address);

    // 5. Return session token
    return NextResponse.json({
      sessionToken,
      address,
      expiresIn: sevenDays / 1000, // Return in seconds
    });
  } catch (error) {
    console.error('[Auth] Verification failed:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Verify Session Token
 * Used to check if a session is still valid
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing session token' },
        { status: 400 }
      );
    }

    const session = sessions.get(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if expired
    if (Date.now() > session.expiresAt) {
      sessions.delete(token);
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      address: session.address,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('[Auth] Session check failed:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}

/**
 * Sign Out
 * Invalidate session token
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Missing session token' },
        { status: 400 }
      );
    }

    sessions.delete(token);

    return NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    console.error('[Auth] Sign out failed:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
