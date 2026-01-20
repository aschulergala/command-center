# GalaChain Command Center

A lightweight wallet-facing dApp for GalaChain token operations - fungible tokens, NFTs, and creator tools with wallet connection and transaction signing.

## Stack

- **Backend**: NestJS + TypeScript (serves API + static Vue build)
- **Frontend**: Vue 3 + Vite + TypeScript (builds to dist/client)
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Wallet Connection**: @gala-chain/connect
- **Chain API**: @gala-chain/api + @gala-chain/client

## Development

### Prerequisites

- Node.js >= 18
- npm

### Setup

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Start development servers (NestJS + Vite concurrently)
npm run dev
```

The development server runs:
- NestJS API: http://localhost:3000/api
- Vue dev server: http://localhost:5173 (proxies /api to NestJS)

### Scripts

```bash
npm run dev           # Start both servers in development mode
npm run build         # Build Vue + NestJS for production
npm run start:prod    # Run production build
npm run test          # Run all tests (client + server)
npm run typecheck     # TypeScript type checking
```

## Production Build

```bash
# Build everything
npm run build

# Test production locally
npm run start:prod
```

The production build:
1. Builds Vue app to `dist/client/`
2. Compiles NestJS to `dist/`
3. NestJS serves both API routes (`/api/*`) and Vue static files

## Railway Deployment

Railway auto-detects Node.js projects. No additional configuration needed.

### Quick Deploy

1. Push your code to a Git repository
2. Create a new project on [Railway](https://railway.app)
3. Connect your repository
4. Railway will automatically:
   - Detect Node.js
   - Run `npm install`
   - Run `npm run build`
   - Start with `npm start`

### Environment Variables

Set these in Railway dashboard:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 (Railway sets this) |
| `NODE_ENV` | Environment | production |
| `GALACHAIN_ENV` | GalaChain environment | production |
| `GALACHAIN_GATEWAY_URL` | Gateway URL | (environment default) |
| `GALACHAIN_API_URL` | API URL | (environment default) |

### Health Check

The app exposes a health endpoint at `/api/health` which Railway can use for health checks.

### Files

- `Procfile` - Heroku/Railway process configuration
- `railway.json` - Railway-specific deployment settings

## Project Structure

```
command-center/
├── src/                    # NestJS backend source
│   ├── modules/            # Feature modules
│   ├── config/             # Configuration
│   └── middleware/         # Express middleware
├── client/                 # Vue 3 frontend source
│   ├── src/
│   │   ├── views/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── stores/         # Pinia stores
│   │   ├── composables/    # Vue composables
│   │   └── lib/            # Utilities
│   └── dist/               # Vue production build
├── shared/                 # Shared TypeScript types
├── dist/                   # NestJS compiled output
│   └── client/             # Vue build (served by NestJS)
└── package.json
```

## License

ISC
