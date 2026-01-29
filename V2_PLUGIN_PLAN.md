# GalaChain Command Center - Fresh Rebuild Plan

## Overview

Rebuild the Command Center dApp from scratch using `@gala-chain/launchpad-sdk` (v5.0.4-beta.22) as the sole chain interaction layer. Same feature scope as the original `IMPLEMENTATION_PLAN.json`, same tech stack (NestJS + Vue 3 + Tailwind + Pinia), but architected around the higher-level LaunchpadSDK instead of raw `@gala-chain/api + @gala-chain/connect`.

**Key difference from old build**: LaunchpadSDK wraps all chain operations (balances, transfers, burns, locks, NFT management, wallet connection) into a single class with 217 methods. No need for custom DTO construction or raw chaincode calls.

---

## Architecture Decisions

### SDK Singleton: Pinia store with `shallowRef<LaunchpadSDK>`
- SDK instance is NOT deeply reactive (too expensive)
- Re-created when wallet connects/disconnects or environment toggles
- Read-only mode (no wallet) available immediately on boot

### Wallet: Separate store using SDK's `ExternalWalletProvider`
- EIP-6963 wallet detection via SDK's `detectWallets()`
- `ExternalWalletProvider(wallet.provider)` wraps MetaMask/etc
- Listens for `accountsChanged` events
- Persists "was connected" flag for auto-reconnect

### Environment Toggle: Re-create SDK on switch
- `new LaunchpadSDK({ env: 'PROD' | 'STAGE', walletProvider })`
- All data stores reset and re-fetch
- Persisted to localStorage

### Modals: Compound `BaseModal` + per-operation content
- Native `<dialog>` with Tailwind
- Two-step confirmation for destructive ops (burn, lock)
- Every operation composable handles toast + transaction tracking

### Authorization: Implicit via SDK
- **Burn**: Show button if user owns tokens (burn will fail if unauthorized)
- **NFT Mint**: Check via `fetchNftCollections(address)` for collection authority
- **Collection claim**: Check availability via `isNftCollectionAvailable(name)`

---

## Phase 0: Project Scaffolding

**Goal**: NestJS + Vue 3 + Tailwind + Pinia project structure, build pipeline, health endpoint.

### Files
```
package.json                          # Root: nestjs deps + scripts
tsconfig.json                         # Root TS config
nest-cli.json                         # NestJS CLI
.env / .env.example                   # Environment vars
.gitignore / .prettierrc / .eslintrc.cjs
Procfile                              # Railway: web: node dist/src/main.js
src/main.ts                           # NestJS entry
src/app.module.ts                     # Root module (ServeStatic + Health)
src/config/configuration.ts           # ConfigService validation
src/modules/health/health.module.ts
src/modules/health/health.controller.ts
client/index.html                     # Vite entry
client/vite.config.ts                 # Proxy /api, output ../dist/client
client/tsconfig.json / tsconfig.node.json
client/tailwind.config.ts             # GalaChain brand colors
client/postcss.config.cjs
client/src/main.ts                    # Vue app entry
client/src/App.vue                    # Root <router-view>
client/src/style.css                  # Tailwind directives + base styles
client/src/env.d.ts                   # Vite env types
```

### Key Dependencies
**Root**: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/serve-static`
**Client**: `vue@^3.4`, `vue-router@^4`, `pinia@^2`, `@gala-chain/launchpad-sdk`, `ethers@^6`, `bignumber.js`, `zod`, `axios`, `vee-validate@^4`, `@vee-validate/zod`, `@vueuse/core`
**Dev**: `vite`, `@vitejs/plugin-vue`, `tailwindcss`, `autoprefixer`, `postcss`, `typescript`, `concurrently`, `vitest`, `@vue/test-utils`

### Scripts
```json
"dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
"dev:server": "nest start --watch",
"dev:client": "cd client && vite",
"build": "npm run build:client && npm run build:server",
"build:client": "cd client && vite build",
"build:server": "nest build",
"start:prod": "node dist/src/main.js",
"test": "npm run test:client && npm run test:server",
"test:client": "cd client && vitest run",
"test:server": "jest"
```

### Verify
- `npm run build` completes
- `npm run dev` starts both servers
- `GET /api/health` returns `{ status: 'ok', timestamp }`

---

## Phase 1: SDK Integration + Wallet Connection

**Goal**: LaunchpadSDK singleton, wallet detection/connection, environment toggle.

### Files
```
client/src/lib/sdk.ts                 # createSDK(), type re-exports
client/src/lib/config.ts              # Typed VITE_* env config
client/src/lib/errors.ts              # SDK error -> user message parsing
client/src/stores/sdk.ts              # SDK instance store (shallowRef)
client/src/stores/wallet.ts           # Wallet detection + connection
client/src/composables/useWallet.ts   # Wallet composable
client/src/composables/useSdk.ts      # SDK access composable
client/src/components/wallet/WalletConnect.vue      # Connect button + dropdown
client/src/components/wallet/WalletSelector.vue     # Multi-wallet picker
client/src/components/wallet/EnvironmentToggle.vue  # PROD/STAGE switch
```

### SDK Store Pattern
```typescript
// stores/sdk.ts
const sdk = shallowRef<LaunchpadSDK | null>(null);
const env = ref<'PROD' | 'STAGE'>(localStorage.getItem('gala-env') ?? 'PROD');

function initialize(walletProvider?: WalletProvider) {
  sdk.value = new LaunchpadSDK({ env: env.value, walletProvider });
}
function switchEnvironment(newEnv: 'PROD' | 'STAGE') {
  env.value = newEnv;
  localStorage.setItem('gala-env', newEnv);
  initialize(useWalletStore().walletProvider);
  // Reset all data stores
}
```

### Wallet Store Pattern
```typescript
// stores/wallet.ts - uses SDK's ExternalWalletProvider + detectWallets()
const walletProvider = shallowRef<WalletProvider | null>(null);
const detectedWallets = shallowRef<DetectedWallet[]>([]);

async function connect(wallet: DetectedWallet) {
  const provider = new ExternalWalletProvider(wallet.provider);
  const address = await provider.connect();
  walletProvider.value = provider;
  // Re-init SDK with wallet
  useSdkStore().initialize(provider);
}
```

### Omni-tool usage
- `/galachain:ask "ExternalWalletProvider account change handling"`
- `/galachain:ask "SDK environment URLs for PROD vs STAGE"`

### Verify
- Wallet detection shows available wallets
- MetaMask connect/disconnect works
- Environment toggle re-creates SDK
- Address displays correctly after connection

---

## Phase 2: App Shell + Navigation + Shared UI

**Goal**: Layout, routing, shared components.

### Files
```
client/src/router/index.ts
client/src/views/Layout.vue           # Header + nav + <router-view> + footer
client/src/views/TokensView.vue       # Stub
client/src/views/NFTsView.vue         # Stub
client/src/views/CreatorsView.vue     # Stub
client/src/views/ExportView.vue       # Stub
client/src/components/layout/AppHeader.vue
client/src/components/layout/AppNavigation.vue   # Desktop tabs
client/src/components/layout/MobileMenu.vue       # Slide-out drawer
client/src/components/ui/BaseModal.vue            # <dialog> wrapper
client/src/components/ui/LoadingSpinner.vue
client/src/components/ui/EmptyState.vue
client/src/components/ui/PageHeader.vue
client/src/components/ui/ErrorDisplay.vue
client/src/components/ui/SkeletonCard.vue
```

### Routes
- `/` -> redirect to `/tokens`
- `/tokens` - Fungible token dashboard
- `/nfts` - NFT gallery
- `/creators` - Creator tools + Pump
- `/export` - Coming soon

### Responsive
- Mobile-first, hamburger menu below `md:` breakpoint
- Touch targets >= 44px
- Modals: full-screen on mobile, centered card on desktop
- Safe-area padding for notched devices

---

## Phase 3: Fungible Token Operations

**Goal**: Token list, balances, transfer, burn, lock/unlock, toast notifications, transaction tracking.

### Files
```
client/src/stores/tokens.ts           # FT state
client/src/stores/transactions.ts     # Tx tracking
client/src/stores/toasts.ts           # Toast notifications
client/src/composables/useFungibleTokens.ts
client/src/composables/useTransferToken.ts
client/src/composables/useBurnTokens.ts
client/src/composables/useLockTokens.ts
client/src/composables/useToast.ts
client/src/components/tokens/TokenList.vue
client/src/components/tokens/TokenCard.vue
client/src/components/tokens/TokenCardSkeleton.vue
client/src/components/tokens/TransferModal.vue
client/src/components/tokens/BurnModal.vue
client/src/components/tokens/LockModal.vue
client/src/components/tokens/UnlockModal.vue
client/src/components/tokens/SortDropdown.vue
client/src/components/ui/Toast.vue
client/src/components/ui/ToastContainer.vue
client/src/components/ui/TransactionIndicator.vue
client/src/lib/schemas/transfer.schema.ts
client/src/lib/schemas/burn.schema.ts
client/src/lib/schemas/lock.schema.ts
```

### SDK Methods Used
| Operation | SDK Method |
|-----------|-----------|
| GALA balance | `sdk.fetchGalaBalance(address?)` |
| Token balance | `sdk.fetchTokenBalance({ tokenName, address? })` |
| Available balance | `sdk.fetchAvailableBalance({ tokenName })` |
| Locked balance | `sdk.fetchLockedBalance({ tokenName })` |
| Transfer GALA | `sdk.transferGala({ recipientAddress, amount })` |
| Transfer token | `sdk.transferToken({ to, tokenName, amount })` |
| Burn tokens | `sdk.burnTokens({ tokens: [{ tokenName, amount }] })` |
| Lock tokens | `sdk.lockTokens({ tokens: [{ tokenName, amount, expires? }] })` |
| Unlock tokens | `sdk.unlockTokens({ tokens: [{ tokenName, amount }] })` |

### Transaction Pattern (all operations follow this)
```typescript
const txId = transactions.addPending('transfer', tokenName);
toast.pending(`Transferring ${amount} ${tokenName}...`);
try {
  const result = await sdk.transferToken(params);
  transactions.markComplete(txId, result);
  toast.success(`Transferred ${amount} ${tokenName}`);
  await refreshBalances();
} catch (error) {
  transactions.markFailed(txId, error);
  toast.error(parseError(error));
}
```

### Omni-tool usage
- `/galachain:ask "fetchTokenBalance response shape"`
- `/galachain:ask "burnTokens batch size limit"`

---

## Phase 4: NFT Operations

**Goal**: NFT gallery, collection filtering, transfer, mint, burn.

### Files
```
client/src/stores/nfts.ts
client/src/composables/useNFTs.ts
client/src/composables/useTransferNFT.ts
client/src/composables/useMintNFT.ts
client/src/composables/useBurnNFT.ts
client/src/components/nfts/NFTGrid.vue
client/src/components/nfts/NFTCard.vue
client/src/components/nfts/NFTCardSkeleton.vue
client/src/components/nfts/CollectionFilter.vue
client/src/components/nfts/NFTSortDropdown.vue
client/src/components/nfts/TransferNFTModal.vue
client/src/components/nfts/MintNFTModal.vue
client/src/components/nfts/BurnNFTModal.vue
client/src/lib/schemas/nft-transfer.schema.ts
client/src/lib/schemas/nft-mint.schema.ts
```

### SDK Methods Used
| Operation | SDK Method |
|-----------|-----------|
| List NFTs | `sdk.fetchNftBalances(ownerAddress, collectionFilter?)` |
| Transfer NFT | `sdk.transferToken({ to, tokenName, amount: '1' })` |
| Mint NFT | `sdk.mintNft({ collection, type, category, quantity, ownerAddress })` |
| Burn NFT | `sdk.burnTokens({ tokens: [{ tokenName, amount: '1' }] })` |
| Mint fee | `sdk.estimateNftMintFee({ collection, type, category, quantity, ownerAddress })` |

### Collection filter syncs with URL: `?collection=MyNFTs`

---

## Phase 5: Creator Tools

**Goal**: Creator page, Pump entry, collection claiming, class management, minting from collections.

### Files
```
client/src/stores/creators.ts
client/src/composables/useCreatorCollections.ts
client/src/composables/useClaimCollection.ts
client/src/composables/useCreateTokenClass.ts
client/src/composables/useCollectionMint.ts
client/src/components/creators/PumpEntry.vue
client/src/components/creators/CollectionList.vue
client/src/components/creators/CollectionCard.vue
client/src/components/creators/CollectionCardSkeleton.vue
client/src/components/creators/ClassList.vue
client/src/components/creators/ClassCard.vue
client/src/components/creators/CreateCollectionModal.vue
client/src/components/creators/CreateClassModal.vue
client/src/components/creators/CollectionMintModal.vue
client/src/lib/schemas/collection.schema.ts
client/src/lib/schemas/token-class.schema.ts
client/src/lib/schemas/collection-mint.schema.ts
```

### SDK Methods Used
| Operation | SDK Method |
|-----------|-----------|
| List my collections | `sdk.fetchNftCollections(walletAddress)` |
| Check name available | `sdk.isNftCollectionAvailable(name)` |
| Claim collection | `sdk.claimNftCollection({ collectionName })` (costs 10,000 GALA) |
| Create token class | `sdk.createNftTokenClass({ collection, type, category, name?, maxSupply?, ... })` |
| List classes | `sdk.fetchNftTokenClasses({ collection })` |
| Estimate mint fee | `sdk.estimateNftMintFee(...)` |
| Mint from collection | `sdk.mintNft({ collection, type, category, quantity, ownerAddress })` |

### Omni-tool usage
- `/galachain:ask "claimNftCollection fees and requirements"`
- `/galachain:ask "createNftTokenClass all parameters"`

---

## Phase 6: Export Placeholder + Final Polish

**Goal**: Export coming-soon page, responsive polish, error handling audit.

### Files
```
client/src/views/ExportView.vue       # Full implementation
client/src/components/export/ExportComingSoon.vue
```

### Polish Tasks
- Audit all error handling paths (wallet errors, network errors, SDK errors)
- Responsive testing at all breakpoints
- Loading states for every async operation
- Empty states for every list
- Safe-area padding for notched devices
- Touch target audit (>= 44px)

---

## Phase 7: Testing

### Automated Testing Layers
1. **Unit (Vitest)**: Pinia stores, composables, zod schemas, error parsing
2. **Component (Vitest + @vue/test-utils)**: All modals, cards, buttons, forms
3. **Integration (Vitest)**: Real SDK read-only calls against test address
4. **E2E (Playwright)**: Navigation, wallet mock injection, full user flows

### Mock Strategy
- Mock `@gala-chain/launchpad-sdk` at module level for unit/component tests
- Inject `window.__MOCK_WALLET__` for E2E tests
- Use `createTestingPinia({ initialState })` for component tests

---

## Reference Files (read-only, for SDK API understanding)
- `/home/andy/dev-gala/launchpad-sdk/packages/sdk/src/LaunchpadSDK.ts` - All 217 public methods
- `/home/andy/dev-gala/launchpad-sdk/packages/sdk/src/wallet/ExternalWalletProvider.ts` - Browser wallet provider
- `/home/andy/dev-gala/launchpad-sdk/packages/sdk/src/wallet/types.ts` - WalletProvider interface, DetectedWallet
- `/home/andy/dev-gala/launchpad-sdk/packages/sdk/src/types/nft.dto.ts` - NFT type definitions
- `/home/andy/dev-gala/launchpad-sdk/packages/sdk/examples/` - Usage patterns

## Omni-Tool Plugin Usage
Use `/galachain:ask [topic]` throughout development to:
- Verify SDK method signatures and response shapes
- Understand GalaChain concepts (bonding curves, collection authority, etc.)
- Debug SDK errors with automatic error explanation hook
- Learn best practices for each operation type

## Verification
After each phase:
1. Build passes (`npm run build`)
2. Tests pass (`npm run test`)
3. Dev server works (`npm run dev`)
4. Visual verification via browser automation (screenshots of every state)
5. Console clean (no errors/warnings)
