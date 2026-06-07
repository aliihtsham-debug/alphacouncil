# Alpha Council

**AI-Powered Investment Committee for Web3**

Alpha Council is a crypto investment platform where multiple specialized AI agents debate investment opportunities in real time — simulating a professional hedge fund investment committee — before reaching a consensus decision. Connect your wallet, watch the agents argue, and execute trades directly on-chain.

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)
![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748)

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Who Is This For](#who-is-this-for)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

---

## The Problem

Crypto investors face three persistent challenges:

1. **Information overload** — Thousands of tokens, endless news cycles, and conflicting signals make it impossible to research every opportunity thoroughly.
2. **Emotional decision-making** — Fear and greed drive most trading decisions, leading to buying highs and selling lows.
3. **Opaque advice** — Existing trading bots and AI tools give single-perspective recommendations with no transparent reasoning. You see the "what" but never the "why."

## The Solution

Alpha Council replaces black-box signals with a **transparent, multi-perspective AI committee**. Instead of one AI telling you what to do, five specialized agents with different viewpoints debate each investment:

| Agent | Role | Perspective |
|-------|------|-------------|
| **Market Research** | Scans CoinMarketCap data, identifies candidate tokens, ranks by opportunity score | Neutral / Data-driven |
| **Bull Analyst** | Argues FOR the investment, identifies upside potential and catalysts | Optimistic |
| **Bear Analyst** | Challenges the bullish thesis, identifies risks and downsides | Skeptical |
| **Risk Manager** | Evaluates portfolio impact, concentration risk, and safe allocation size | Defensive |
| **Portfolio Manager** | Synthesizes all inputs into a final BUY / HOLD / SELL decision with confidence score | Executive |

All reasoning streams to your screen in real time via Server-Sent Events, so you can watch the debate unfold and understand exactly why the committee reached its conclusion.

## Who Is This For

- **Crypto investors** who want AI-assisted research without blindly following a single signal
- **DeFi users on BNB Smart Chain** who want portfolio analysis and one-click trade execution
- **Web3-native users** who prefer wallet-based authentication over email/password
- **Anyone who values transparent reasoning** over opaque black-box recommendations

## Key Features

### 🎙️ Real-Time AI Debate
Watch five AI agents debate an investment thesis in real time. Each agent streams its reasoning as it thinks, so you see the full conversation — not just the final answer.

### 📊 Portfolio Analysis
Connect your wallet to get a complete breakdown of your on-chain holdings:
- BNB balance + all BEP-20 tokens with live prices
- Sector classification (AI, DeFi, Gaming, Layer 1, Layer 2, Meme, Stablecoin, Infrastructure)
- Risk scoring (0–100) based on concentration, volatility, stablecoin buffer, and diversification
- Visual allocation and sector distribution charts

### 💱 One-Click Trade Execution
Approve a recommendation and execute the trade directly from the dashboard:
- Real on-chain swaps via PancakeSwap Router V2 on BNB Smart Chain
- Automatic ERC-20 token approval (checks allowance, approves if needed)
- Multi-hop routing for tokens without direct pairs
- Configurable slippage tolerance (0.1% – 50%, default 0.5%)
- Live transaction status polling

### 📈 Market Scanner
Browse market data powered by CoinMarketCap:
- Global market overview (total market cap, volume, BTC/ETH dominance, Fear & Greed Index)
- Trending tokens, top gainers, and top losers
- Token categories with filtering

### 📄 Reports
Generate and export investment reports:
- Investment Report, Weekly Rebalance, and Portfolio Health formats
- PDF export (server-side generation)
- Markdown export (client-side download)

### 🔐 Wallet-Based Auth
No email, no password, no signup form:
- Connect via Trust Wallet (or any EIP-1193 compatible wallet)
- Sign-In with Ethereum (SIWE) for secure, passwordless authentication
- HTTP-only session cookies

### 🎨 Dark-Mode UI
Polished glassmorphism design with:
- Neon color palette (cyan, purple, green accents)
- Smooth animations via Framer Motion
- Responsive layout (desktop sidebar + mobile bottom navigation)

## How It Works

### Authentication Flow
1. User clicks **"Connect Wallet"** — Trust Wallet extension detected via `window.ethereum`
2. `eth_requestAccounts` prompts wallet approval
3. Server generates a cryptographic nonce (`GET /api/auth/nonce`)
4. SIWE message is constructed (EIP-4361 format) with address, chain ID, nonce, domain, and URI
5. `personal_sign` prompts user to sign in their wallet
6. Signature verified server-side (`POST /api/auth/verify`)
7. User record created/found in PostgreSQL, session cookie set

### Investment Debate Flow
1. User enters a natural-language prompt on the Committee page (e.g., *"Find the best AI token under $1B market cap"*)
2. `useDebate` hook opens an SSE connection to `POST /api/agents/stream` with the prompt + current portfolio data
3. The orchestrator runs the agent pipeline:
   - **Market Research** scans CoinMarketCap → returns ranked candidate tokens
   - **Bull Analyst** and **Bear Analyst** run in parallel on the top candidate
   - **Risk Manager** evaluates portfolio impact and safe allocation
   - **Portfolio Manager** synthesizes everything into a final recommendation
4. Each agent's output streams as SSE events (`agent_start`, `agent_token`, `agent_end`)
5. Client-side Zustand store updates in real time, rendering the debate live
6. Final recommendation includes: decision, token, allocation %, confidence %, thesis, supporting arguments, and risks

### Trade Execution Flow
1. User approves a recommendation (or modifies allocation/slippage)
2. System checks ERC-20 token allowance for the PancakeSwap router
3. If insufficient, sends an `approve(MAX_UINT256)` transaction and waits for confirmation
4. Gets an on-chain swap quote via `getAmountsOut` (multi-hop routing if needed)
5. Calculates `amountOutMin` from slippage tolerance
6. Encodes swap calldata (supports BNB→Token, Token→BNB, Token→Token)
7. Estimates gas with 25% buffer
8. Sends transaction via Trust Wallet's `eth_sendTransaction`
9. Returns real txHash and polls for on-chain confirmation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, TailwindCSS 4, Shadcn UI (Radix UI) |
| **Animations** | Framer Motion 12 |
| **Language** | TypeScript 5 |
| **State (Client)** | Zustand 5 |
| **State (Server)** | TanStack React Query 5 |
| **Database ORM** | Prisma 7 (with `pg` driver adapter) |
| **Database** | PostgreSQL (Neon serverless) |
| **Validation** | Zod 4 |
| **Auth** | Sign-In with Ethereum (SIWE) |
| **AI (Primary)** | OpenRouter API (configurable model) |
| **AI (Fallback)** | OpenAI API (GPT-4o) |
| **Market Data** | CoinMarketCap Pro API |
| **On-Chain Data** | BSCScan API |
| **DEX** | PancakeSwap Router V2 |
| **Wallet** | Trust Wallet (EIP-1193 injected provider) |
| **Charts** | Recharts 3 |
| **PDF Generation** | PDFKit 0.15 |
| **Error Tracking** | Sentry 10 |
| **Analytics** | PostHog 1.381 |
| **Testing** | Vitest 3 + Testing Library |
| **Linting** | ESLint 9 (Next.js core-web-vitals) |
| **Deployment** | Vercel |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Landing  │  │Committee │  │Portfolio │  │  Reports   │  │
│  │   Page    │  │  Page    │  │  Page    │  │   Page     │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│       │              │             │              │          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Zustand Stores + React Query             │   │
│  │  wallet-store │ agent-store │ portfolio-store │ ui   │   │
│  └──────────────────────────────────────────────────────┘   │
│       │              │             │              │          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Hooks: useWallet │ useDebate │ usePortfolio  │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP / SSE
┌───────────────────────────┴─────────────────────────────────┐
│                    Next.js API Routes                         │
│  /api/auth/*  │  /api/agents/*  │  /api/portfolio/*         │
│  /api/market  │  /api/trades/*  │  /api/reports/*           │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                     Services Layer                            │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  AI Agents   │  │ Trust Wallet │  │  CoinMarketCap    │   │
│  │ Orchestrator │  │  Service     │  │  Service          │   │
│  │ ┌─────────┐ │  │ connect.ts   │  │ client.ts         │   │
│  │ │Market   │ │  │ portfolio.ts │  │ index.ts          │   │
│  │ │Research │ │  │ calldata.ts  │  └───────────────────┘   │
│  │ ├─────────┤ │  │ swap-quote.ts│                          │
│  │ │Bull     │ │  │ transactions│  ┌───────────────────┐   │
│  │ │Analyst  │ │  │ rpc.ts      │  │  Portfolio        │   │
│  │ ├─────────┤ │  └──────────────┘  │  Analyzer         │   │
│  │ │Bear     │ │                    │  analyzer.ts      │   │
│  │ │Analyst  │ │  ┌──────────────┐  └───────────────────┘   │
│  │ ├─────────┤ │  │  BSCScan     │                          │
│  │ │Risk     │ │  │  Service     │  ┌───────────────────┐   │
│  │ │Manager  │ │  │  bscscan.ts  │  │  Reports          │   │
│  │ ├─────────┤ │  └──────────────┘  │  generator.ts     │   │
│  │ │Portfolio│ │                    │  export.ts        │   │
│  │ │Manager  │ │                    └───────────────────┘   │
│  │ └─────────┘ │                                            │
│  └─────────────┘                                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                   External Services                           │
│  PostgreSQL (Neon) │ OpenRouter │ CoinMarketCap │ BSCScan   │
│  PancakeSwap V2    │ OpenAI     │ Sentry        │ PostHog   │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (or yarn/pnpm/bun)
- **PostgreSQL** database — [Neon](https://neon.tech) (serverless) is recommended
- **API keys** for the services listed below

### Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_NAME` | Yes | Display name for the app |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (Neon recommended) |
| `OPENROUTER_API_KEY` | **Yes** | API key from [openrouter.ai](https://openrouter.ai) |
| `OPENROUTER_BASE_URL` | No | Default: `https://openrouter.ai/api/v1` |
| `OPENROUTER_MODEL` | No | Default: `openrouter/owl-alpha` |
| `OPENAI_API_KEY` | No | Fallback LLM (leave empty to disable) |
| `OPENAI_MODEL` | No | Default: `gpt-4o` |
| `COINMARKETCAP_API_KEY` | **Yes** | Pro API key from [coinmarketcap.com](https://coinmarketcap.com/api) |
| `COINMARKETCAP_BASE_URL` | No | Default: `https://pro-api.coinmarketcap.com/v1` |
| `SESSION_SECRET` | **Yes** | Min 32 characters. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `BSCSCAN_API_KEY` | **Yes** | Free key from [bscscan.com](https://bscscan.com/myapikey) |
| `SENTRY_DSN` | No | Error tracking (leave empty to disable) |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Product analytics (leave empty to disable) |

### Installation

```bash
# Clone the repository
git clone https://github.com/aliihtsham-debug/alphacouncil.git
cd alphacouncil

# Install dependencies (triggers prisma generate via postinstall)
npm install
```

### Database Setup

```bash
# Push the Prisma schema to your PostgreSQL database
npx prisma migrate dev --name init

# Or, if you prefer the interactive migration workflow:
npx prisma migrate dev
```

This creates all tables defined in `prisma/schema.prisma`: User, Wallet, Portfolio, Asset, Recommendation, AgentDebate, ExecutedTrade, Report, and AuditLog.

### Running Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Useful Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Build & Production
npm run build            # Production build
npm run start            # Start production server

# Database
npx prisma migrate dev   # Create and run migrations
npx prisma studio        # Open Prisma Studio (database GUI)
npx prisma generate      # Regenerate Prisma client

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report

# Linting
npm run lint             # Run ESLint
```

## Project Structure

```
alphacouncil/
├── prisma/
│   └── schema.prisma          # Database schema (7 models, 7 enums)
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout (fonts, Sentry, PostHog)
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css        # Theme, glassmorphism, animations
│   │   ├── (dashboard)/       # Dashboard route group
│   │   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   │   ├── committee/     # AI debate page
│   │   │   ├── portfolio/     # Portfolio analysis page
│   │   │   ├── history/       # Trade history page
│   │   │   └── reports/       # Reports page
│   │   └── api/               # API routes
│   │       ├── auth/          # SIWE auth (nonce, verify)
│   │       ├── agents/        # AI agent streaming
│   │       ├── market/        # Market data proxy
│   │       ├── portfolio/     # Portfolio CRUD + analysis
│   │       ├── trades/        # Trade CRUD
│   │       ├── recommendation/# Recommendation CRUD
│   │       └── reports/       # Report generation + export
│   ├── components/
│   │   ├── ui/                # Shadcn UI components (30+)
│   │   ├── shared/            # Shared custom components
│   │   ├── layout/            # Sidebar, navigation
│   │   └── landing/           # Landing page sections
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-wallet.ts      # Wallet connection + SIWE auth
│   │   ├── use-debate.ts      # SSE debate streaming
│   │   ├── use-portfolio.ts   # Portfolio data fetching
│   │   └── use-market-data.ts # Market data fetching
│   ├── lib/                   # Shared utilities
│   │   ├── auth.ts            # SIWE message creation/verification
│   │   ├── env.ts             # Environment variable validation
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Formatting utilities
│   ├── services/
│   │   ├── ai/                # AI agent system
│   │   │   ├── orchestrator.ts    # Agent pipeline orchestration
│   │   │   ├── base-agent.ts      # Abstract base agent
│   │   │   ├── agents/            # 5 agent implementations
│   │   │   ├── prompts/           # System prompts
│   │   │   └── schemas/           # Zod output schemas
│   │   ├── trust-wallet/      # Wallet + DEX integration
│   │   │   ├── connect.ts         # EIP-1193 wallet connection
│   │   │   ├── portfolio.ts       # On-chain portfolio fetching
│   │   │   ├── calldata.ts        # ABI calldata encoders
│   │   │   ├── swap-quote.ts      # Multi-hop swap quoting
│   │   │   ├── transactions.ts    # Swap execution + approval
│   │   │   ├── rpc.ts             # JSON-RPC helpers
│   │   │   └── bscscan.ts         # BSCScan API client
│   │   ├── coinmarketcap/     # Market data service
│   │   │   ├── client.ts          # CMC API client
│   │   │   ├── index.ts           # Public API (direct calls)
│   │   │   └── types.ts           # CMC type definitions
│   │   ├── portfolio/         # Portfolio analysis
│   │   │   └── analyzer.ts        # Risk scoring + sector analysis
│   │   └── reports/           # Report generation
│   │       ├── generator.ts       # Report content generation
│   │       └── export.ts          # PDF/Markdown export
│   ├── stores/                # Zustand state stores
│   │   ├── wallet-store.ts    # Wallet connection state
│   │   ├── agent-store.ts     # Agent debate state
│   │   ├── portfolio-store.ts # Portfolio data state
│   │   ├── trade-store.ts     # Trade execution state
│   │   └── ui-store.ts        # UI state (sidebar, toasts)
│   ├── types/                 # Shared TypeScript types
│   │   ├── agent.ts           # Agent types and enums
│   │   ├── market.ts          # Market data types
│   │   ├── portfolio.ts       # Portfolio types
│   │   ├── trade.ts           # Trade types
│   │   └── api.ts             # API request/response types
│   └── middleware.ts          # Auth enforcement middleware
├── .env.example               # Environment variable template
├── next.config.ts             # Next.js config + security headers
├── tailwind.config.ts         # Theme, colors, animations
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## API Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/auth/nonce` | Generate SIWE nonce | No |
| `POST` | `/api/auth/verify` | Verify SIWE signature, create session | No |
| `POST` | `/api/agents/stream` | Stream AI agent debate via SSE | Yes |
| `GET` | `/api/market` | Market overview data | No |
| `GET` | `/api/portfolio` | Get user portfolio history | Yes |
| `POST` | `/api/portfolio/analyze` | Analyze current on-chain portfolio | Yes |
| `GET` | `/api/recommendation/:id` | Get recommendation detail | Yes |
| `PATCH` | `/api/recommendation/:id` | Update recommendation status | Yes |
| `GET` | `/api/trades/:id` | Get trade detail | Yes |
| `POST` | `/api/reports/generate` | Generate a report | Yes |
| `GET` | `/api/reports/export` | Export report as PDF or Markdown | Yes |

## Database Schema

The database has **7 models** and **7 enums**:

- **User** — Wallet-authenticated user account
- **Wallet** — Connected wallet address and chain info
- **Portfolio** — Snapshot of user's holdings with risk metrics
- **Asset** — Individual token within a portfolio
- **Recommendation** — AI committee's investment recommendation
- **AgentDebate** — Individual agent's contribution to a debate
- **ExecutedTrade** — On-chain trade execution record
- **Report** — Generated investment report
- **AuditLog** — User action audit trail

Enums: `Decision` (BUY/HOLD/SELL), `RecommendationStatus`, `AgentType`, `TradeStatus`, `ReportType`, `ReportFormat`

## Testing

Tests use **Vitest** with **React Testing Library**:

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode for development
npm run test:coverage # Coverage report
```

Current test coverage includes:
- **Calldata encoding** — PancakeSwap swap functions, ERC-20 approve/allowance/symbol, constants
- **Auth utilities** — SIWE message creation and verification
- **Trade store** — Zustand store state management
- **Portfolio analyzer** — Risk scoring and sector analysis
- **LLM client** — OpenRouter/OpenAI API integration
- **Report generation** — Content generation and export

## Deployment

The project is designed for **Vercel** deployment:

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Set all environment variables from `.env.local` in Vercel's project settings
4. Deploy — Vercel handles the Next.js build automatically

**Important:** Make sure to set `DATABASE_URL` in your Vercel environment variables. The `.env.local` file is not deployed.

## License

MIT

---

Made with ❤️ by [aliihtsham-debug](https://github.com/aliihtsham-debug)
