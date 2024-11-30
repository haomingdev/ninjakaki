/*
  Warnings:

  - You are about to drop the column `userid` on the `financial_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `userid` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `financial_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ic` to the `financial_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ic` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "financial_metrics_userid_idx";

-- DropIndex
DROP INDEX "transactions_userid_idx";

-- AlterTable
ALTER TABLE "financial_metrics" DROP COLUMN "userid",
ADD COLUMN     "full_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "ic" VARCHAR(14) NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "userid",
ADD COLUMN     "full_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "ic" VARCHAR(14) NOT NULL;

-- CreateIndex
CREATE INDEX "financial_metrics_ic_idx" ON "financial_metrics"("ic");

-- CreateIndex
CREATE INDEX "transactions_ic_idx" ON "transactions"("ic");
