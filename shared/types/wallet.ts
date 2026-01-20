// Wallet state interface - shared between backend and frontend
export interface WalletState {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
  isConnecting: boolean;
  error: string | null;
}
