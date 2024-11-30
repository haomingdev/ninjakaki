-- CreateTable
CREATE TABLE "accountscheme" (
    "id" SERIAL NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accountscheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "bic_code" TEXT NOT NULL,
    "provider_type" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "account_description" TEXT NOT NULL,
    "account_holder_full_name" TEXT NOT NULL,
    "id_type" TEXT NOT NULL,
    "id_value" TEXT NOT NULL,
    "account_holder_email" TEXT,
    "account_holder_mobile" TEXT,
    "product_type" TEXT NOT NULL,
    "sharia_compliance" BOOLEAN NOT NULL,
    "account_currency" TEXT NOT NULL DEFAULT 'MYR',
    "scheme_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balancescheme" (
    "id" SERIAL NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balancescheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "account_balance_datetime" TIMESTAMP(3) NOT NULL,
    "outstanding_balance" DECIMAL(65,30),
    "pending_balance" DECIMAL(65,30),
    "available_balance" DECIMAL(65,30),
    "credit_limit" DECIMAL(65,30),
    "account_currency" TEXT NOT NULL,
    "repayment_due_date" TIMESTAMP(3),
    "repayment_amount_due" DECIMAL(65,30),
    "repayment_frequency" TEXT,
    "maturity_date" TIMESTAMP(3),
    "scheme_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactionscheme" (
    "id" SERIAL NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactionscheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "payment_scheme" TEXT NOT NULL,
    "credit_debit_indicator" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "transaction_amount" DECIMAL(65,30),
    "transaction_currency" TEXT,
    "account_currency_amount" DECIMAL(65,30) NOT NULL,
    "account_currency" TEXT NOT NULL,
    "fx_rate" DECIMAL(65,30),
    "status" TEXT NOT NULL,
    "booking_datetime" TIMESTAMP(3) NOT NULL,
    "value_datetime" TIMESTAMP(3) NOT NULL,
    "merchant_category_code" TEXT,
    "merchant_name" TEXT,
    "merchant_address" TEXT,
    "merchant_postal_code" TEXT,
    "merchant_city" TEXT,
    "merchant_country" TEXT,
    "category_purpose_code" TEXT,
    "business_category_code" TEXT,
    "msic" TEXT,
    "scheme_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_account_id_key" ON "account"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_account_number_key" ON "account"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_transaction_id_key" ON "transaction"("transaction_id");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "accountscheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "balance_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "balance_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "balancescheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "transactionscheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
