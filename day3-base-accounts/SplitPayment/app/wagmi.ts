import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export function getConfig() {
  return createConfig({
    chains: [base, baseSepolia],
    connectors: [
      injected(),
      coinbaseWallet({
        appName: 'SplitPayment',
        preference: 'smartWalletOnly',
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [base.id]: http('https://base-mainnet.g.alchemy.com/v2/81SDB7xvtSzdS4Fx2Emaxf0idRZlqsIA'),
      [baseSepolia.id]: http(),
    },
  });
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
