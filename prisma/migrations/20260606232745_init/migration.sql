-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('BUY', 'HOLD', 'SELL');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MODIFIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('MARKET_RESEARCH', 'BULL_ANALYST', 'BEAR_ANALYST', 'RISK_MANAGER', 'PORTFOLIO_MANAGER');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INVESTMENT', 'WEEKLY_REBALANCE', 'PORTFOLIO_HEALTH');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'MARKDOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'BNB',
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalValueUsd" DECIMAL(20,8) NOT NULL,
    "stablecoinRatio" DECIMAL(5,4) NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "concentrationRisk" DECIMAL(5,4) NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "contractAddress" TEXT,
    "amount" DECIMAL(20,8) NOT NULL,
    "valueUsd" DECIMAL(20,8) NOT NULL,
    "allocationPct" DECIMAL(5,4) NOT NULL,
    "sector" TEXT,
    "priceChange24h" DECIMAL(10,4),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "decision" "Decision" NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "allocationPct" DECIMAL(5,4) NOT NULL,
    "confidence" INTEGER NOT NULL,
    "investmentThesis" TEXT NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDebate" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "content" TEXT NOT NULL,
    "structuredOutput" JSONB,
    "confidence" INTEGER,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentDebate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutedTrade" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "txHash" TEXT,
    "tokenSymbol" TEXT NOT NULL,
    "action" "Decision" NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "amountUsd" DECIMAL(20,8) NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutedTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "format" "ReportFormat" NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Portfolio_userId_analyzedAt_idx" ON "Portfolio"("userId", "analyzedAt");

-- CreateIndex
CREATE INDEX "Asset_portfolioId_idx" ON "Asset"("portfolioId");

-- CreateIndex
CREATE INDEX "Recommendation_userId_createdAt_idx" ON "Recommendation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Recommendation_status_idx" ON "Recommendation"("status");

-- CreateIndex
CREATE INDEX "AgentDebate_recommendationId_agentType_idx" ON "AgentDebate"("recommendationId", "agentType");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutedTrade_recommendationId_key" ON "ExecutedTrade"("recommendationId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutedTrade_txHash_key" ON "ExecutedTrade"("txHash");

-- CreateIndex
CREATE INDEX "ExecutedTrade_userId_createdAt_idx" ON "ExecutedTrade"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExecutedTrade_status_idx" ON "ExecutedTrade"("status");

-- CreateIndex
CREATE INDEX "Report_userId_createdAt_idx" ON "Report"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDebate" ADD CONSTRAINT "AgentDebate_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutedTrade" ADD CONSTRAINT "ExecutedTrade_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutedTrade" ADD CONSTRAINT "ExecutedTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
