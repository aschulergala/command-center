import { LaunchpadSDK } from '@gala-chain/launchpad-sdk';
import type { LaunchpadSDKConfig, WalletProvider } from '@gala-chain/launchpad-sdk';
import type { GalaEnvironment } from './config';

export function createSDK(env: GalaEnvironment, walletProvider?: WalletProvider): LaunchpadSDK {
  const config: LaunchpadSDKConfig = {
    env,
    walletProvider,
  };

  return new LaunchpadSDK(config);
}

// Re-export types that consumers need
export type {
  LaunchpadSDK,
  LaunchpadSDKConfig,
  WalletProvider,
  DetectedWallet,
  WalletDetectionResult,
} from '@gala-chain/launchpad-sdk';
