export interface MintNftParams {
  collection: string;
  type: string;
  category: string;
  quantity: string;
  ownerAddress: string;
  additionalKey?: string;
}

export interface EstimateMintFeeParams {
  collection: string;
  type: string;
  category: string;
  quantity: string;
  ownerAddress: string;
}

export interface MintNftResult {
  transactionId: string;
  mintedQuantity: string;
  owner: string;
  tokenInstances: number[];
  tokenClass: { collection: string; type: string; category: string };
}
