// Wallet state interface - shared between backend and frontend

/**
 * Represents the state of a connected wallet
 */
export interface WalletState {
  /** Whether the wallet is currently connected */
  connected: boolean;
  /** The GalaChain address of the connected wallet (format: client|<hex> or eth|<hex>) */
  address: string | null;
  /** The public key of the connected wallet */
  publicKey: string | null;
  /** Whether a connection attempt is in progress */
  isConnecting: boolean;
  /** Error message if connection failed */
  error: string | null;
}

/**
 * Wallet connection status enum
 */
export enum WalletConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error',
}

/**
 * Wallet provider types supported by the app
 */
export enum WalletProvider {
  MetaMask = 'metamask',
  // Future providers can be added here
}

/**
 * Result of a wallet connection attempt
 */
export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  publicKey?: string;
  error?: string;
}
