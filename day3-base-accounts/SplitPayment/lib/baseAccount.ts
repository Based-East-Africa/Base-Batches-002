import { createBaseAccountSDK, base } from '@base-org/account';

/**
 * Base Account SDK Singleton
 *
 * Initialize SDK once outside React components to avoid:
 * - Rehydration errors
 * - Multiple SDK instances
 * - React strict mode issues
 */

// Initialize SDK once (singleton pattern)
export const sdk = createBaseAccountSDK({
  appName: "Split Payment Demo",
  appLogoUrl: "https://base.org/favicon.ico",
  appChainIds: [base.constants.CHAIN_IDS.baseSepolia],
});

// Get provider instance
export const provider = sdk.getProvider();

console.log('[SDK] Base Account SDK initialized');
