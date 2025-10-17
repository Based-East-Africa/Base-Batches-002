"use client";

import { useState, useEffect } from "react";
import { createBaseAccountSDK, base } from "@base-org/account";
import { numberToHex } from "viem";

/**
 * useAuth Hook
 *
 * Purpose: Manage Sign in with Base authentication
 *
 * Features:
 * - Sign in with wallet signature (SIWE)
 * - Session management
 * - Sign out functionality
 * - Auto-restore session on page load
 *
 * Flow:
 * 1. User clicks "Sign in with Base"
 * 2. Fetch nonce from server
 * 3. Request wallet signature with signInWithEthereum capability
 * 4. Verify signature on server
 * 5. Store session token
 */

interface AuthState {
  isAuthenticated: boolean;
  address: string | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    address: null,
    sessionToken: null,
    isLoading: true,
    error: null,
  });

  // Initialize SDK
  const sdk = createBaseAccountSDK({
    appName: "Split Payment Demo",
    appLogoUrl: "https://base.org/favicon.ico",
    appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
  });

  const provider = sdk.getProvider();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedToken = localStorage.getItem("sessionToken");
        const storedAddress = localStorage.getItem("userAddress");

        if (storedToken && storedAddress) {
          // Verify session is still valid
          const response = await fetch(`/api/auth/verify?token=${storedToken}`);

          if (response.ok) {
            setAuthState({
              isAuthenticated: true,
              address: storedAddress,
              sessionToken: storedToken,
              isLoading: false,
              error: null,
            });
            return;
          } else {
            // Session expired or invalid, clear storage
            localStorage.removeItem("sessionToken");
            localStorage.removeItem("userAddress");
          }
        }
      } catch (error) {
        console.error("[useAuth] Session check failed:", error);
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    };

    checkSession();
  }, []);

  /**
   * Sign in with Base
   * Initiates Sign in with Ethereum flow
   */
  const signIn = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      console.log("[useAuth] Starting sign in flow...");

      // 1. Fetch nonce from server
      const nonceResponse = await fetch("/api/auth/nonce");
      if (!nonceResponse.ok) {
        throw new Error("Failed to fetch nonce");
      }

      const { nonce } = await nonceResponse.json();
      console.log("[useAuth] Received nonce:", nonce);

      // 2. Switch to Base Sepolia
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: numberToHex(base.constants.CHAIN_IDS.baseSepolia) }],
        });
      } catch (switchError: any) {
        // Chain might already be selected, or user might reject
        console.warn("[useAuth] Chain switch:", switchError.message);
      }

      // 3. Connect wallet with signInWithEthereum capability
      const result = await provider.request({
        method: "wallet_connect",
        params: [
          {
            version: "1",
            capabilities: {
              signInWithEthereum: {
                nonce,
                chainId: numberToHex(base.constants.CHAIN_IDS.baseSepolia),
              },
            },
          },
        ],
      });

      console.log("[useAuth] Wallet connect result:", result);

      // Extract address, message, and signature
      const { accounts } = result as any;
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from wallet");
      }

      const { address } = accounts[0];
      const siweData = accounts[0].capabilities?.signInWithEthereum;

      if (!siweData || !siweData.message || !siweData.signature) {
        throw new Error("Missing SIWE data from wallet response");
      }

      const { message, signature } = siweData;

      console.log("[useAuth] Got signature for address:", address);

      // 4. Verify signature on backend
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || "Signature verification failed");
      }

      const { sessionToken } = await verifyResponse.json();

      console.log("[useAuth] Authentication successful!");

      // 5. Store session
      localStorage.setItem("sessionToken", sessionToken);
      localStorage.setItem("userAddress", address);

      setAuthState({
        isAuthenticated: true,
        address,
        sessionToken,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      console.error("[useAuth] Sign in failed:", error);

      const errorMessage =
        error.code === 4001
          ? "User rejected signature request"
          : error.message || "Authentication failed";

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  };

  /**
   * Sign out
   * Invalidates session and clears local storage
   */
  const signOut = async () => {
    try {
      const { sessionToken } = authState;

      if (sessionToken) {
        // Call backend to invalidate session
        await fetch("/api/auth/verify", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionToken }),
        });
      }

      // Clear local storage
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("userAddress");

      setAuthState({
        isAuthenticated: false,
        address: null,
        sessionToken: null,
        isLoading: false,
        error: null,
      });

      console.log("[useAuth] Signed out successfully");
    } catch (error) {
      console.error("[useAuth] Sign out failed:", error);
      // Still clear local state even if server call fails
      setAuthState({
        isAuthenticated: false,
        address: null,
        sessionToken: null,
        isLoading: false,
        error: null,
      });
    }
  };

  return {
    ...authState,
    signIn,
    signOut,
  };
}
