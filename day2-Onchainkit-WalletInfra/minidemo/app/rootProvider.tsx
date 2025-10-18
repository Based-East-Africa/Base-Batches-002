"use client";
import { ReactNode } from "react";
import { base, baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

export function RootProvider({ children }: { children: ReactNode }) {
  // Determine which chain to use based on environment
  const chain = process.env.NEXT_PUBLIC_CHAIN === "mainnet" ? base : baseSepolia;

  // Paymaster URL configuration
  const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={chain}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "all",
        },
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
      paymasterUrl={paymasterUrl}
    >
      {children}
    </OnchainKitProvider>
  );
}
