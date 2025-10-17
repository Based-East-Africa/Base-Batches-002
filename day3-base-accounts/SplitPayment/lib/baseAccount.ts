'use client';

import { createBaseAccountSDK, base } from '@base-org/account';

/**
 * Base Account SDK Singleton
 *
 * Client-side only SDK initialization to avoid SSR issues
 */

let sdkInstance: ReturnType<typeof createBaseAccountSDK> | null = null;

export function getSDK() {
  if (!sdkInstance) {
    sdkInstance = createBaseAccountSDK({
      appName: "Split Payment Demo",
      appLogoUrl: "https://base.org/favicon.ico",
      appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
    });
    console.log('[SDK] Base Account SDK initialized');
  }
  return sdkInstance;
}

export function getProvider() {
  return getSDK().getProvider();
}
