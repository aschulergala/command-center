import type { NftBalance } from '@/stores/nfts';

export function buildTokenName(nft: NftBalance): string {
  return `${nft.collection}|${nft.category}|${nft.type}|${nft.additionalKey}`;
}
