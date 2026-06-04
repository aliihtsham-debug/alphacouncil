# Alpha Council — Architecture Document

> Version: 1.0 | Date: 2026-06-04 | Status: Approved for Build

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 15 SPA)                      │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────┐ │
│  │  Landing     │  │  Committee   │  │ Portfolio  │  │  Trade    │ │
│  │  Page        │  │  Dashboard   │  │ Overview   │  │  History  │ │
│  └─────────────┘  └──────────────┘  └────────────┘  └───────────┘ │
│         │                │                 │               │        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              State Layer (Zustand + TanStack Query)            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│         │                │                 │               │        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │            API Client Layer (typed fetch wrappers)             │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────┬─────────────────────────┬───────────────────┬───────────┘
           │                         │                   │
           ▼                         ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVER (Next.js Route Handlers)                   │
│                                                                     │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌────────┐ ┌────────┐  │
│  │ /market  │ │ /portfolio│ │  /agents   │ │/trades │ │/reports│  │
│  └──────────┘ └───────────┘ └────────────┘ └────────┘ └────────┘  │
│       │             │              │             │          │       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  Service Layer (business logic)                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│       │             │              │             │          │       │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐ ┌─────────┐ ┌────────┐ │
│  │CoinMarket│  │  Trust   │  │    AI     │ │ Prisma  │ │ Redis  │ │
│  │Cap Client│  │  Wallet  │  │ Orchestra │ │   ORM   │ │ Cache  │ │
│  └─────────┘  └──────────┘  └───────────┘ └─────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Monorepo Folder Structure

```
alphacouncil/
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI/CD
├── prisma/
│   ├── schema.prisma                       # Database schema
│   ├── migrations/                         # Prisma migrations
│   └── seed.ts                            # Seed data
├── public/
│   ├── fonts/                              # Custom fonts
│   ├── images/                             # Static images
│   └── icons/                              # SVG icons
├── src/
│   ├── app/                                # Next.js App Router
│   │   ├── layout.tsx                      # Root layout
│   │   ├── page.tsx                        # Landing page
│   │   ├── globals.css                     # Global styles + Tailwind
│   │   ├── (dashboard)/                    # Dashboard route group
│   │   │   ├── layout.tsx                  # Dashboard layout with sidebar
│   │   │   ├── committee/
│   │   │   │   └── page.tsx               # Committee debate screen
│   │   │   ├── portfolio/
│   │   │   │   └── page.tsx               # Portfolio overview
│   │   │   ├── recommendation/
│   │   │   │   └── page.tsx               # Recommendation panel
│   │   │   └── history/
│   │   │       └── page.tsx               # Trade history
│   │   └── api/                            # API Route Handlers
│   │       ├── market/
│   │       │   ├── route.ts               # GET /api/market
│   │       │   ├── trending/route.ts      # GET /api/market/trending
│   │       │   ├── tokens/route.ts        # GET /api/market/tokens
│   │       │   └── categories/route.ts    # GET /api/market/categories
│   │       ├── portfolio/
│   │       │   ├── route.ts               # GET /api/portfolio
│   │       │   └── analyze/route.ts       # POST /api/portfolio/analyze
│   │       ├── agents/
│   │       │   ├── route.ts               # POST /api/agents/debate
│   │       │   └── stream/route.ts        # SSE stream for agent debate
│   │       ├── recommendation/
│   │       │   ├── route.ts               # GET /api/recommendation
│   │       │   └── [id]/route.ts          # GET/PUT /api/recommendation/:id
│   │       ├── trades/
│   │       │   ├── route.ts               # GET/POST /api/trades
│   │       │   └── [id]/route.ts          # GET /api/trades/:id
│   │       └── reports/
│   │           └── route.ts               # POST /api/reports
│   ├── lib/                                # Core libraries
│   │   ├── prisma.ts                       # Prisma client singleton
│   │   ├── redis.ts                        # Redis client
│   │   ├── env.ts                          # Environment validation (Zod)
│   │   └── utils.ts                        # Utility functions
│   ├── services/                           # Business logic layer
│   │   ├── coinmarketcap/
│   │   │   ├── client.ts                   # CoinMarketCap API client
│   │   │   ├── types.ts                    # CMC type definitions
│   │   │   └── cache.ts                    # CMC response caching
│   │   ├── trust-wallet/
│   │   │   ├── connect.ts                  # Wallet connection logic
│   │   │   ├── portfolio.ts               # Portfolio retrieval
│   │   │   └── transactions.ts            # Transaction signing/execution
│   │   ├── ai/
│   │   │   ├── orchestrator.ts             # Agent orchestration engine
│   │   │   ├── agents/
│   │   │   │   ├── base-agent.ts           # Abstract base agent class
│   │   │   │   ├── market-research.ts      # Market Research Agent
│   │   │   │   ├── bull-analyst.ts        # Bull Analyst
│   │   │   │   ├── bear-analyst.ts        # Bear Analyst
│   │   │   │   ├── risk-manager.ts        # Risk Manager
│   │   │   │   └── portfolio-manager.ts   # Portfolio Manager
│   │   │   ├── prompts/
│   │   │   │   ├── market-research.ts      # Prompt templates
│   │   │   │   ├── bull-analyst.ts
│   │   │   │   ├── bear-analyst.ts
│   │   │   │   ├── risk-manager.ts
│   │   │   │   └── portfolio-manager.ts
│   │   │   ├── schemas/
│   │   │   │   ├── market-research.ts      # Zod schemas for structured output
│   │   │   │   ├── bull-analyst.ts
│   │   │   │   ├── bear-analyst.ts
│   │   │   │   ├── risk-manager.ts
│   │   │   │   └── portfolio-manager.ts
│   │   │   └── types.ts                    # Shared AI types
│   │   ├── portfolio/
│   │   │   ├── analyzer.ts                 # Portfolio analysis logic
│   │   │   └── risk.ts                     # Risk calculation utilities
│   │   └── reports/
│   │       ├── generator.ts                # Report generation
│   │       └── export.ts                   # PDF/Markdown export
│   ├── stores/                             # Zustand stores
│   │   ├── wallet-store.ts                 # Wallet connection state
│   │   ├── portfolio-store.ts              # Portfolio data state
│   │   ├── agent-store.ts                  # Agent debate state
│   │   ├── trade-store.ts                  # Trade history state
│   │   └── ui-store.ts                     # UI state (modals, toasts)
│   ├── hooks/                              # Custom React hooks
│   │   ├── use-wallet.ts                   # Wallet connection hook
│   │   ├── use-debate.ts                   # Agent debate streaming hook
│   │   ├── use-portfolio.ts                # Portfolio data hook
│   │   └── use-market-data.ts             # Market data hook
│   ├── components/                         # React components
│   │   ├── ui/                             # Shadcn UI components (auto-gen)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ... (30+ shadcn components)
│   │   ├── layout/
│   │   │   ├── header.tsx                  # App header
│   │   │   ├── sidebar.tsx                 # Dashboard sidebar
│   │   │   └── footer.tsx                  # Landing page footer
│   │   ├── landing/
│   │   │   ├── hero-section.tsx            # Hero with animated agents
│   │   │   ├── features-section.tsx        # Features grid
│   │   │   ├── how-it-works.tsx            # Step-by-step flow
│   │   │   ├── market-overview.tsx         # Live market tickers
│   │   │   ├── agent-showcase.tsx          # Agent cards preview
│   │   │   └── connect-cta.tsx             # Wallet connect CTA
│   │   ├── committee/
│   │   │   ├── committee-dashboard.tsx     # Main debate dashboard
│   │   │   ├── agent-card.tsx              # Individual agent card
│   │   │   ├── agent-thinking.tsx          # Thinking animation
│   │   │   ├── agent-output.tsx            # Agent output display
│   │   │   ├── debate-stream.tsx           # Streaming debate log
│   │   │   └── debate-input.tsx            # User prompt input
│   │   ├── portfolio/
│   │   │   ├── portfolio-overview.tsx      # Portfolio summary cards
│   │   │   ├── allocation-chart.tsx        # Pie/treemap charts
│   │   │   ├── risk-meter.tsx              # Risk gauge
│   │   │   ├── asset-list.tsx              # Token holdings table
│   │   │   └── sector-breakdown.tsx        # Sector distribution
│   │   ├── recommendation/
│   │   │   ├── recommendation-card.tsx     # Final recommendation display
│   │   │   ├── confidence-gauge.tsx        # Confidence score ring
│   │   │   ├── thesis-display.tsx          # Investment thesis text
│   │   │   └── action-buttons.tsx          # Approve/Modify/Reject
│   │   ├── trades/
│   │   │   ├── trade-history.tsx           # Trade history table
│   │   │   └── trade-detail.tsx            # Individual trade detail
│   │   ├── market/
│   │   │   ├── market-scanner.tsx          # Token scanner/filters
│   │   │   ├── trending-tokens.tsx         # Trending list
│   │   │   ├── gainer-loser.tsx            # Top gainers/losers
│   │   │   └── token-card.tsx              # Individual token card
│   │   └── shared/
│   │       ├── loading-spinner.tsx         # Loading states
│   │       ├── error-boundary.tsx          # Error boundary wrapper
│   │       ├── glass-card.tsx              # Glassmorphism card
│   │       ├── animated-number.tsx         # Counting animation
│   │       └── skeleton-loader.tsx         # Skeleton screens
│   └── types/                              # Shared TypeScript types
│       ├── api.ts                          # API request/response types
│       ├── market.ts                       # Market data types
│       ├── portfolio.ts                    # Portfolio types
│       ├── agent.ts                        # Agent types
│       └── trade.ts                        # Trade types
├── .env.example                            # Environment variable template
├── .env.local                              # Local environment (gitignored)
├── .gitignore
├── next.config.ts                          # Next.js configuration
├── tailwind.config.ts                      # TailwindCSS configuration
├── tsconfig.json                           # TypeScript configuration
├── package.json                            # Dependencies
├── middleware.ts                           # Next.js middleware (auth/ratelimit)
├── sentry.client.config.ts                # Sentry client config
├── sentry.server.config.ts                # Sentry server config
└── sentry.edge.config.ts                  # Sentry edge config
```

---

## 3. Database Schema (Prisma)

```prisma
// ─── User & Wallet ───────────────────────────────────
model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  portfolios    Portfolio[]
  recommendations Recommendation[]
  executedTrades  ExecutedTrade[]
  reports         Report[]
  auditLogs       AuditLog[]
}

model Wallet {
  id            String   @id @id @default(cuid())
  userId        String   @unique
  address       String   @unique
  chain         String   @default("BNB")
  connectedAt   DateTime @default(now())
  isActive      Boolean  @default(true)
  
  user          User     @relation(fields: [userId], references: [id])
}

// ─── Portfolio ───────────────────────────────────────
model Portfolio {
  id              String   @id @default(cuid())
  userId          String
  totalValueUsd   Decimal  @db.Decimal(20, 8)
  stablecoinRatio Decimal  @db.Decimal(5, 4)
  riskScore       Int      // 0-100
  concentrationRisk Decimal @db.Decimal(5, 4)
  analyzedAt      DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  assets          Asset[]
  
  @@index([userId, analyzedAt])
}

model Asset {
  id              String   @id @default(cuid())
  portfolioId     String
  tokenSymbol     String
  tokenName       String
  contractAddress String?
  amount          Decimal  @db.Decimal(20, 8)
  valueUsd        Decimal  @db.Decimal(20, 8)
  allocationPct   Decimal  @db.Decimal(5, 4)
  sector          String?
  priceChange24h  Decimal? @db.Decimal(10, 4)
  
  portfolio       Portfolio @relation(fields: [portfolioId], references: [id])
  
  @@index([portfolioId])
}

// ─── AI Debate ───────────────────────────────────────
model Recommendation {
  id              String   @id @default(cuid())
  userId          String
  prompt          String
  decision        Decision // BUY | HOLD | SELL
  tokenSymbol     String
  tokenName       String
  allocationPct   Decimal  @db.Decimal(5, 4)
  confidence      Int      // 0-100
  investmentThesis String  @db.Text
  status          RecommendationStatus @default(PENDING)
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  agentDebates    AgentDebate[]
  executedTrade   ExecutedTrade?
  
  @@index([userId, createdAt])
  @@index([status])
}

model AgentDebate {
  id              String   @id @default(cuid())
  recommendationId String
  agentType       AgentType // MARKET_RESEARCH | BULL | BEAR | RISK | PORTFOLIO_MGR
  content         String   @db.Text
  structuredOutput Json?   // Agent-specific structured data
  confidence      Int?
  latencyMs       Int?
  createdAt       DateTime @default(now())
  
  recommendation  Recommendation @relation(fields: [recommendationId], references: [id])
  
  @@index([recommendationId, agentType])
}

// ─── Trade Execution ─────────────────────────────────
model ExecutedTrade {
  id                String   @id @default(cuid())
  recommendationId  String   @unique
  userId            String
  txHash            String?  @unique
  tokenSymbol       String
  action            Decision
  amount            Decimal  @db.Decimal(20, 8)
  amountUsd         Decimal  @db.Decimal(20, 8)
  status            TradeStatus @default(PENDING)
  executedAt        DateTime?
  createdAt         DateTime @default(now())
  
  recommendation    Recommendation @relation(fields: [recommendationId], references: [id])
  user              User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@index([status])
}

// ─── Reports ─────────────────────────────────────────
model Report {
  id          String      @id @default(cuid())
  userId      String
  type        ReportType  // INVESTMENT | WEEKLY | PORTFOLIO
  format      ReportFormat // PDF | MARKDOWN
  content     String      @db.Text
  fileUrl     String?
  createdAt   DateTime    @default(now())
  
  user        User        @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
}

// ─── Audit ───────────────────────────────────────────
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // CONNECT_WALLET | DEBATE_INIT | TRADE_APPROVE | etc.
  metadata    Json?
  ipAddress   String?
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@index([action])
}

// ─── Enums ───────────────────────────────────────────
enum Decision {
  BUY
  HOLD
  SELL
}

enum RecommendationStatus {
  PENDING
  APPROVED
  REJECTED
  MODIFIED
  EXPIRED
}

enum AgentType {
  MARKET_RESEARCH
  BULL_ANALYST
  BEAR_ANALYST
  RISK_MANAGER
  PORTFOLIO_MANAGER
}

enum TradeStatus {
  PENDING
  SUBMITTED
  CONFIRMED
  FAILED
  CANCELLED
}

enum ReportType {
  INVESTMENT
  WEEKLY_REBALANCE
  PORTFOLIO_HEALTH
}

enum ReportFormat {
  PDF
  MARKDOWN
}
```

---

## 4. AI Agent Architecture

### 4.1 Agent Base Class

```
┌──────────────────────────────────────────────────────────┐
│                    BaseAgent                              │
├──────────────────────────────────────────────────────────┤
│ - name: string                                           │
│ - systemPrompt: string                                   │
│ - outputSchema: z.ZodSchema                              │
│ - maxRetries: number                                     │
│ - timeoutMs: number                                      │
├──────────────────────────────────────────────────────────┤
│ + async execute(input: AgentInput): Promise<Output>      │
│ + async validate(output: unknown): Output                │
│ + formatOutput(output: Output): AgentMessage             │
│ # buildMessages(input): Message[]                        │
│ # callLLM(messages): Promise<RawOutput>                  │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Orchestration Pipeline

```
User Query
    │
    ▼
┌──────────────────────────┐
│  1. Market Research      │  Scans CoinMarketCap
│     Agent                │  Identifies candidate tokens
│     Timeout: 15s         │  Ranks opportunities
│     Retry: 2x            │
└──────────┬───────────────┘
           │ { candidateTokens[], trends[], marketSummary }
           ▼
┌──────────────────────────┐     ┌──────────────────────────┐
│  2a. Bull Analyst        │     │  2b. Bear Analyst        │
│      (parallel)          │     │      (parallel)          │
│      Timeout: 15s        │     │      Timeout: 15s        │
│      Retry: 2x           │     │      Retry: 2x           │
└──────────┬───────────────┘     └──────────┬───────────────┘
           │ { bullishArguments[],           │ { bearishArguments[],
           │   opportunityScore,               │   riskScore }
           │   confidence }                    │
           └──────────┬───────────────────────┘
                      ▼
           ┌──────────────────────────┐
           │  3. Risk Manager         │  Portfolio context aware
           │     Timeout: 15s         │  Exposure & allocation
           │     Retry: 2x            │
           └──────────┬───────────────┘
                      │ { allocation, portfolioImpact, riskLevel }
                      ▼
           ┌──────────────────────────┐
           │  4. Portfolio Manager    │  Final aggregation
           │     Timeout: 15s         │  Structured decision
           │     Retry: 2x            │
           └──────────┬───────────────┘
                      │ { decision, confidence, thesis, allocation }
                      ▼
              Final Recommendation
```

### 4.3 Agent Communication Pattern

- **Sequential with parallelism**: Steps 2a (Bull) and 2b (Bear) run concurrently after Market Research. Risk Manager waits for both. Portfolio Manager waits for all.
- **SSE streaming**: Each agent's result streams to the client as soon as it completes.
- **Retry logic**: 2 retries with exponential backoff (1s, 2s) per agent.
- **Timeout**: 15s per agent, 90s total pipeline.

### 4.4 Agent Prompt Structure (per agent)

Each agent prompt contains:
1. **Identity** — Name, role, personality
2. **Context** — User prompt, portfolio data, market data
3. **Predecessor outputs** — Results from prior agents
4. **Instructions** — Chain-of-thought reasoning steps
5. **Output format** — JSON schema enforcement
6. **Constraints** — What NOT to do

---

## 5. API Routes

### 5.1 Market Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/market/overview` | Price, volume, market cap overview | No |
| GET | `/api/market/trending` | Trending tokens from CMC | No |
| GET | `/api/market/tokens?category=AI` | Filtered token list | No |
| GET | `/api/market/categories` | Available categories | No |
| GET | `/api/market/gainers` | Top 24h gainers | No |
| GET | `/api/market/losers` | Top 24h losers | No |

### 5.2 Portfolio Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/portfolio` | Get analyzed portfolio | Wallet |
| POST | `/api/portfolio/analyze` | Re-analyze wallet holdings | Wallet |

### 5.3 Agent Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/agents/debate` | Initiate agent debate | Wallet |
| GET | `/api/agents/stream?sessionId=xxx` | SSE stream of debate | Wallet |

### 5.4 Recommendation Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/recommendation?userId=xxx` | List recommendations | Wallet |
| GET | `/api/recommendation/:id` | Get single recommendation | Wallet |
| PUT | `/api/recommendation/:id` | Approve/Reject/Modify | Wallet |

### 5.5 Trade Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/trades?userId=xxx` | Trade history | Wallet |
| GET | `/api/trades/:id` | Trade detail + tx status | Wallet |
| POST | `/api/trades` | Execute a trade | Wallet |

### 5.6 Report Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/reports` | Generate report | Wallet |
| GET | `/api/reports/:id/download` | Download PDF/MD | Wallet |

---

## 6. State Management Architecture

### 6.1 Zustand Stores

```
wallet-store.ts
├── address: string | null
├── chain: string
├── isConnected: boolean
├── isConnecting: boolean
├── connect() / disconnect()

agent-store.ts
├── sessionId: string | null
├── isActive: boolean
├── currentStep: AgentType | null
├── agents: Record<AgentType, AgentState>
├── debateLog: DebateMessage[]
├── startDebate(prompt) / reset()

portfolio-store.ts
├── data: Portfolio | null
├── isLoading: boolean
├── analyzedAt: Date | null
├── refresh()

trade-store.ts
├── trades: ExecutedTrade[]
├── pendingTrade: ExecutedTrade | null
├── execute() / updateStatus()

ui-store.ts
├── sidebarOpen: boolean
├── activeModal: string | null
├── toasts: Toast[]
```

### 6.2 TanStack Query Keys

```
['portfolio', address]           — Wallet portfolio data
['market', 'overview']            — Market overview
['market', 'trending']            — Trending tokens
['market', 'tokens', category]    — Filtered tokens
['recommendations', userId]       — User recommendations
['trades', userId]                — User trades
['report', reportId]              — Single report
```

---

## 7. Streaming Architecture (Real-Time Debate)

```
Client                        Server
  │                             │
  │  POST /api/agents/debate   │
  │  { prompt, portfolio }     │
  │ ──────────────────────────► │
  │                             │
  │  ◄─── session-id: abc123 ──│
  │                             │
  │  GET /api/agents/stream    │
  │  ?sessionId=abc123         │
  │  (EventSource / SSE)       │
  │ ◄══════════════════════════│
  │                             │
  │  SSE event: "agent_start"  │  Market Research begins
  │  SSE event: "token"        │  Partial output (streaming)
  │  SSE event: "agent_end"    │  Market Research done
  │  SSE event: "agent_start"  │  Bull + Bear begin (parallel)
  │  SSE event: "token"        │  Bull streaming...
  │  SSE event: "token"        │  Bear streaming...
  │  SSE event: "agent_end"    │  Bull done
  │  SSE event: "agent_end"    │  Bear done
  │  SSE event: "agent_start"  │  Risk Manager begins
  │  ...                        │
  │  SSE event: "final"        │  Portfolio Manager decision
  │  SSE event: "done"         │  Pipeline complete
```

---

## 8. Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Cache Layers                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: TanStack Query (Client)                           │
│  ├── Market data: staleTime 60s                             │
│  ├── Portfolio: staleTime 30s                               │
│  └── Recommendations: staleTime 0 (always fresh)            │
│                                                             │
│  Layer 2: Redis (Server)                                    │
│  ├── CMC market data: TTL 60s                               │
│  ├── CMC categories: TTL 3600s                              │
│  ├── CMC trending: TTL 120s                                 │
│  └── Session state: TTL 300s                                │
│                                                             │
│  Layer 3: Next.js Data Cache                                │
│  ├── Static pages: revalidate 300s                          │
│  └── ISR for landing page                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Security Layers                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Environment                                             │
│     ├── All secrets in .env.local (never committed)         │
│     ├── Zod validation on env at startup                    │
│     └── Server-side API calls only (no client secrets)      │
│                                                             │
│  2. Input Validation                                        │
│     ├── Zod schemas on ALL API inputs                       │
│     ├── Prompt sanitization (no injection)                  │
│     └── Rate limiting: 10 req/min per IP (debate endpoint)  │
│                                                             │
│  3. Wallet Security                                         │
│     ├── Wallet-based auth (no passwords)                    │
│     ├── Transaction confirmation required for ALL trades    │
│     ├── Max trade cap configurable                          │
│     └── Audit log for every wallet action                   │
│                                                             │
│  4. API Security                                            │
│     ├── CORS restricted to app domain                       │
│     ├── CSRF protection via SameSite cookies                │
│     ├── Request size limits (1MB max)                       │
│     └── Helmet headers                                      │
│                                                             │
│  5. Observability                                           │
│     ├── Sentry for error tracking                           │
│     ├── PostHog for analytics (no PII)                      │
│     └── AuditLog table for compliance                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Deployment                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Vercel    │    │   Vercel     │    │   Vercel      │  │
│  │   Edge      │    │   Serverless │    │   PostgreSQL  │  │
│  │   (CDN)     │    │   Functions  │    │   (Neon)      │  │
│  │             │    │              │    │               │  │
│  │  Static     │    │  API Routes  │    │  Prisma ORM   │  │
│  │  Assets     │    │  AI Agents   │    │  Migrations   │  │
│  │  Pages      │    │  SSE Streams │    │               │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│                             │                               │
│                    ┌────────┴────────┐                      │
│                    │   Upstash Redis  │                      │
│                    │   (Serverless)   │                      │
│                    └─────────────────┘                      │
│                                                             │
│  External Services:                                         │
│  ├── CoinMarketCap API (market data)                        │
│  ├── OpenAI API (LLM)                                       │
│  ├── OpenRouter API (fallback LLM)                          │
│  ├── Trust Wallet SDK (wallet + swaps)                      │
│  ├── Sentry (error tracking)                                │
│  └── PostHog (analytics)                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Environment Variables

```bash
# ─── App ───────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Alpha Council

# ─── Database ───────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/alphacouncil

# ─── Redis ──────────────────────────────────────
REDIS_URL=redis://host:6379
REDIS_TOKEN=your-token

# ─── AI ─────────────────────────────────────────
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# ─── CoinMarketCap ──────────────────────────────
COINMARKETCAP_API_KEY=your-cmc-key
COINMARKETCAP_BASE_URL=https://pro-api.coinmarketcap.com/v1

# ─── Trust Wallet ───────────────────────────────
# (Client-side SDK, no server key needed)
NEXT_PUBLIC_TRUST_WALLET_APP_ID=your-app-id

# ─── Monitoring ─────────────────────────────────
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 12. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 15 App Router | Unified frontend + API, server components, SSE support |
| **Styling** | TailwindCSS + Shadcn UI | Rapid development, consistent design system, dark mode |
| **Animations** | Framer Motion | Declarative animations, layout animations, gesture support |
| **State** | Zustand + TanStack Query | Zustand for UI state, Query for server state — clean separation |
| **Database** | PostgreSQL (Neon) + Prisma | Serverless Postgres, type-safe ORM, migrations |
| **Cache** | Upstash Redis | Serverless, low-latency, compatible with Vercel edge |
| **AI** | OpenAI primary + OpenRouter fallback | Reliability through redundancy, structured outputs |
| **Streaming** | Server-Sent Events | Native browser support, simpler than WebSockets for one-way |
| **Auth** | Wallet-based (no passwords) | Web3 native, no auth server needed |
| **Deployment** | Vercel | Zero-config Next.js, edge functions, serverless DB |
| **Monitoring** | Sentry + PostHog | Error tracking + product analytics |

---

## 13. Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| First Contentful Paint | < 1.0s | Server components, edge CDN |
| Largest Contentful Paint | < 2.0s | Image optimization, font preloading |
| Time to Interactive | < 2.5s | Code splitting, lazy loading |
| API Response (market) | < 500ms | Redis caching, stale-while-revalidate |
| Agent Pipeline Total | < 60s | Parallel execution, streaming |
| Bundle Size (initial) | < 200KB | Tree shaking, dynamic imports |

---

## 14. Development Phases

### Phase 1: Foundation (Day 1)
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Set up TailwindCSS + Shadcn UI + dark theme
- [ ] Configure Prisma + database schema
- [ ] Set up Redis client
- [ ] Create base layout components (header, sidebar, footer)
- [ ] Build landing page (hero, features, how-it-works)

### Phase 2: Core Integrations (Day 1-2)
- [ ] CoinMarketCap API client with caching
- [ ] Trust Wallet connection flow
- [ ] Portfolio analysis service
- [ ] Market scanner UI

### Phase 3: AI Agent System (Day 2)
- [ ] Base agent class + orchestrator
- [ ] All 5 agent implementations
- [ ] Prompt templates + structured output schemas
- [ ] SSE streaming endpoint
- [ ] Committee dashboard UI with live cards

### Phase 4: Trade Execution (Day 2-3)
- [ ] Recommendation panel UI
- [ ] Trade execution flow via Trust Wallet
- [ ] Trade history UI
- [ ] Portfolio refresh after trades

### Phase 5: Polish & Deploy (Day 3)
- [ ] Investment reports (PDF/Markdown)
- [ ] Animations + micro-interactions
- [ ] Error boundaries + loading states
- [ ] Sentry + PostHog integration
- [ ] Deploy to Vercel
- [ ] Demo flow testing
