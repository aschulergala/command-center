// GalaChain types re-exported from @gala-chain/api
// This allows both NestJS backend and Vue client to import from @shared/types/galachain

// Core chain types (classes)
export {
  TokenClass,
  TokenClassKey,
  TokenInstance,
  TokenInstanceKey,
  TokenInstanceQuantity,
  TokenBalance,
  TokenHold,
  TokenAllowance,
} from '@gala-chain/api';

// Core chain types (interfaces/types only)
export type {
  TokenClassKeyProperties,
  TokenInstanceKeyProperties,
} from '@gala-chain/api';

// DTO types for operations (classes)
export {
  ChainCallDTO,
  SubmitCallDTO,
  createValidDTO,
  createValidSubmitDTO,
} from '@gala-chain/api';

// Token operation DTOs
export {
  TransferTokenDto,
  FetchBalancesDto,
  FetchBalancesWithPaginationDto,
  FetchBalancesWithPaginationResponse,
  FetchTokenClassesDto,
  FetchTokenClassesWithPaginationDto,
  FetchTokenClassesResponse,
  CreateTokenClassDto,
  UpdateTokenClassDto,
  TokenBalanceWithMetadata,
  FetchBalancesWithTokenMetadataResponse,
} from '@gala-chain/api';

// Mint DTOs
export {
  MintTokenDto,
  MintTokenWithAllowanceDto,
  BatchMintTokenDto,
  HighThroughputMintTokenDto,
  FulfillMintDto,
  FetchMintRequestsDto,
  FetchTokenSupplyDto,
} from '@gala-chain/api';

// Burn DTOs
export {
  BurnTokensDto,
  BurnAndMintDto,
  FetchBurnsDto,
  FetchBurnCountersWithPaginationDto,
  FetchBurnCountersResponse,
} from '@gala-chain/api';

// Allowance types (enum and classes)
export {
  AllowanceType,
  GrantAllowanceDto,
  FetchAllowancesDto,
  FetchAllowancesResponse,
} from '@gala-chain/api';

// Allowance types (interfaces/types only)
export type { AllowanceKey } from '@gala-chain/api';

// Burn token quantity
export { BurnTokenQuantity } from '@gala-chain/api';

// User types - these are branded types with associated functions
export type { UserAlias, UserRef } from '@gala-chain/api';
export { asValidUserAlias, asValidUserRef } from '@gala-chain/api';

// Response types
export { GalaChainResponse, GalaChainResponseType } from '@gala-chain/api';

// NFT Collection types
export {
  TokenMintAllowance,
  TokenMintConfiguration,
  TokenBurnCounter,
} from '@gala-chain/api';

// Re-export BigNumber for consistency
export { BigNumber } from 'bignumber.js';
