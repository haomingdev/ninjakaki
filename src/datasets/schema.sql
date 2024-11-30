-- Create enum types for common values
CREATE TYPE provider_type AS ENUM ('Bank', 'E-wallet', 'Fintech', 'Insurance');
CREATE TYPE account_type AS ENUM ('Savings', 'Credit Card', 'Personal Loan', 'Auto Loan', 'Mortgage Loan', 'E-Wallet (Individual)', 'E-Wallet (Merchant)');
CREATE TYPE id_type AS ENUM ('NRIC', 'Passport');
CREATE TYPE product_type AS ENUM ('Islamic', 'Conventional');
CREATE TYPE payment_scheme AS ENUM ('DuitNow Transfer', 'Duitnow QR', 'FPX', 'JomPay', 'myDebit', 'VISA', 'Master', 'AMEX', 'JCB', 'UnionPay', 'On-Us Book Transfer');
CREATE TYPE transaction_status AS ENUM ('Pending', 'Completed', 'Cancelled');
CREATE TYPE credit_debit_indicator AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE repayment_frequency AS ENUM ('Monthly', 'Quarterly', 'Yearly');

-- Create accountscheme table
CREATE TABLE accountscheme (
    id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create account table
CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL UNIQUE,
    bic_code VARCHAR(20) NOT NULL,
    provider_type provider_type NOT NULL,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    account_type account_type NOT NULL,
    account_description TEXT NOT NULL,
    account_holder_full_name VARCHAR(255) NOT NULL,
    id_type id_type NOT NULL,
    id_value VARCHAR(50) NOT NULL,
    account_holder_email VARCHAR(255),
    account_holder_mobile VARCHAR(20),
    product_type product_type NOT NULL,
    sharia_compliance BOOLEAN NOT NULL,
    account_currency CHAR(3) NOT NULL DEFAULT 'MYR',
    scheme_id INTEGER REFERENCES accountscheme(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create balancescheme table
CREATE TABLE balancescheme (
    id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create balance table
CREATE TABLE balance (
    id SERIAL PRIMARY KEY,
    account_id VARCHAR(50) REFERENCES account(account_id),
    account_balance_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    outstanding_balance DECIMAL(15,2),
    pending_balance DECIMAL(15,2),
    available_balance DECIMAL(15,2),
    credit_limit DECIMAL(15,2),
    account_currency CHAR(3) NOT NULL,
    repayment_due_date DATE,
    repayment_amount_due DECIMAL(15,2),
    repayment_frequency VARCHAR(20),
    maturity_date DATE,
    scheme_id INTEGER REFERENCES balancescheme(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create transactionscheme table
CREATE TABLE transactionscheme (
    id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create transaction table
CREATE TABLE transaction (
    id SERIAL PRIMARY KEY,
    account_id VARCHAR(50) REFERENCES account(account_id),
    payment_scheme payment_scheme NOT NULL,
    credit_debit_indicator credit_debit_indicator NOT NULL,
    transaction_id UUID NOT NULL UNIQUE,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_amount DECIMAL(15,2),
    transaction_currency CHAR(3),
    account_currency_amount DECIMAL(15,2) NOT NULL,
    account_currency CHAR(3) NOT NULL,
    fx_rate DECIMAL(10,6),
    status transaction_status NOT NULL,
    booking_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    value_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    merchant_category_code VARCHAR(4),
    merchant_name VARCHAR(255),
    merchant_address TEXT,
    merchant_postal_code VARCHAR(10),
    merchant_city VARCHAR(100),
    merchant_country CHAR(2),
    category_purpose_code VARCHAR(4),
    business_category_code VARCHAR(4),
    msic VARCHAR(5),
    scheme_id INTEGER REFERENCES transactionscheme(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create loan_details table for loan-specific information
CREATE TABLE loan_details (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES account(id),
    repayment_due_date DATE NOT NULL,
    repayment_amount_due DECIMAL(15,2) NOT NULL,
    repayment_frequency repayment_frequency NOT NULL,
    maturity_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create merchant_details table for merchant-specific information
CREATE TABLE merchant_details (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES account(id),
    merchant_city VARCHAR(100),
    merchant_country CHAR(2),
    merchant_category_code VARCHAR(4),
    merchant_name VARCHAR(255),
    merchant_address TEXT,
    postal_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_details table for payment-specific information
CREATE TABLE payment_details (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES account(id),
    category_purpose_code VARCHAR(4),
    business_category_code VARCHAR(4),
    msic VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create triggers to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_account_updated_at
    BEFORE UPDATE ON account
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accountscheme_updated_at
    BEFORE UPDATE ON accountscheme
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_balance_updated_at
    BEFORE UPDATE ON balance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_balancescheme_updated_at
    BEFORE UPDATE ON balancescheme
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_updated_at
    BEFORE UPDATE ON transaction
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactionscheme_updated_at
    BEFORE UPDATE ON transactionscheme
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_details_updated_at
    BEFORE UPDATE ON loan_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_details_updated_at
    BEFORE UPDATE ON merchant_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_details_updated_at
    BEFORE UPDATE ON payment_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_account_account_id ON account(account_id);
CREATE INDEX idx_account_account_number ON account(account_number);
CREATE INDEX idx_account_id_value ON account(id_value);
CREATE INDEX idx_balance_account_id ON balance(account_id);
CREATE INDEX idx_transaction_account_id ON transaction(account_id);
CREATE INDEX idx_transaction_transaction_id ON transaction(transaction_id);
CREATE INDEX idx_transaction_booking_datetime ON transaction(booking_datetime);
CREATE INDEX idx_transaction_value_datetime ON transaction(value_datetime);
CREATE INDEX idx_loan_details_account_id ON loan_details(account_id);
CREATE INDEX idx_merchant_details_account_id ON merchant_details(account_id);
CREATE INDEX idx_payment_details_account_id ON payment_details(account_id);
