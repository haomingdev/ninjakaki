-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "ic" VARCHAR(14) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "spending_amount" DOUBLE PRECISION NOT NULL,
    "receipient_category" TEXT NOT NULL,
    "necessities_or_non_essential" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_metrics" (
    "id" SERIAL NOT NULL,
    "ic" VARCHAR(14) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "cancellation_rate" DOUBLE PRECISION NOT NULL,
    "ratings" DOUBLE PRECISION NOT NULL,
    "responsiveness_to_task" DOUBLE PRECISION NOT NULL,
    "min_max_diff_past_6_months" DOUBLE PRECISION NOT NULL,
    "ratings_influx" DOUBLE PRECISION NOT NULL,
    "type_of_gig" TEXT NOT NULL,
    "social_media_activeness_score" DOUBLE PRECISION NOT NULL,
    "permanent_employment" TEXT NOT NULL,
    "years_of_employment" INTEGER NOT NULL,
    "fluctuation_rate" DOUBLE PRECISION NOT NULL,
    "gross_income" DOUBLE PRECISION NOT NULL,
    "net_income" DOUBLE PRECISION NOT NULL,
    "impulsive_purchase_rate" DOUBLE PRECISION NOT NULL,
    "recurring_expense_consistency" DOUBLE PRECISION NOT NULL,
    "expense_to_income_ratio" DOUBLE PRECISION NOT NULL,
    "regular_saving" BOOLEAN NOT NULL,
    "regular_savings_amount" DOUBLE PRECISION NOT NULL,
    "emergency_fund_availability" BOOLEAN NOT NULL,
    "emergency_fund_amount" DOUBLE PRECISION NOT NULL,
    "consistent_spending" BOOLEAN NOT NULL,
    "spending_amount" DOUBLE PRECISION NOT NULL,
    "portfolio_diversification_risk" DOUBLE PRECISION NOT NULL,
    "awareness_of_utilisation_of_pfm" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserTransactions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "transactions_ic_idx" ON "transactions"("ic");

-- CreateIndex
CREATE INDEX "transactions_timestamp_idx" ON "transactions"("timestamp");

-- CreateIndex
CREATE INDEX "financial_metrics_ic_idx" ON "financial_metrics"("ic");

-- CreateIndex
CREATE INDEX "financial_metrics_timestamp_idx" ON "financial_metrics"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "_UserTransactions_AB_unique" ON "_UserTransactions"("A", "B");

-- CreateIndex
CREATE INDEX "_UserTransactions_B_index" ON "_UserTransactions"("B");

-- AddForeignKey
ALTER TABLE "_UserTransactions" ADD CONSTRAINT "_UserTransactions_A_fkey" FOREIGN KEY ("A") REFERENCES "financial_metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTransactions" ADD CONSTRAINT "_UserTransactions_B_fkey" FOREIGN KEY ("B") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
