# AGENTS.md

## Project Overview

GalaChain Command Center - A lightweight dApp for GalaChain token operations (fungible tokens, NFTs, creator tools).

## Stack

- **Backend**: NestJS + TypeScript
- **Frontend**: Vue 3 + Vite + TypeScript
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Form Validation**: VeeValidate + zod
- **Wallet Connection**: @gala-chain/connect
- **Chain API**: @gala-chain/api + @gala-chain/client

## Project Structure

```
command-center/
├── src/           # NestJS backend
├── client/        # Vue 3 frontend
├── shared/        # Shared types (imported by both)
├── dist/          # NestJS build output
└── dist/client/   # Vue build output (served by NestJS)
```

This is a single deployable unit. NestJS serves the Vue static build for all non-API routes.

## Patterns

### Deployment
- This codebase deploys to Railway as a single service
- NestJS serves API routes at `/api/*` and Vue static files for everything else
- Build order: Vue builds first to `dist/client/`, then NestJS builds to `dist/`

### Frontend Architecture
- This codebase uses Pinia stores for state management (not Vuex)
- This codebase uses Vue composables (`use*.ts`) for reusable logic
- Always put Vue composables in `client/src/composables/`
- Always put Pinia stores in `client/src/stores/`
- Always put shared types in `shared/` so both frontend and backend can import them

### Wallet & Signing
- This codebase uses @gala-chain/connect `BrowserConnectClient` for MetaMask wallet connection
- Wallet state is managed in the Pinia `wallet` store with localStorage persistence
- All write operations (transfer, mint, burn) require wallet signing via MetaMask
- Wallet signing cannot be automated in tests - mock the client layer instead

### Testing
- Always mock `@gala-chain/connect` and the GalaChain client in automated tests
- Use `@pinia/testing` with `createTestingPinia()` to mock stores in component tests
- For E2E tests, inject mock wallet state via `window.__MOCK_WALLET__`
- Tasks involving wallet connection or transaction signing require manual testing
- Integration tests for read operations can use a provided test wallet address

### Forms
- This codebase uses VeeValidate for form handling in Vue components
- Always define validation schemas with zod, then use `@vee-validate/zod` to integrate

### API Design
- Frontend talks directly to GalaChain for most operations (no backend proxy)
- NestJS `/api` routes are reserved for features requiring backend processing
