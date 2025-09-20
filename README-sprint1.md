# AI Calling Center - Sprint 1: Signup & Wallet Generation

This document outlines the setup, deployment, and testing procedures for the user signup flow, which is the core deliverable of Sprint 1 (per PRD v1.3, Sec 7).

## 1. Overview

This sprint implements the complete zero-to-trial user entry point. The key features include:
- A Next.js frontend at `/signup` for user registration.
- Secure, client-side wallet generation using `ethers.js`.
- User authentication and profile creation via Supabase.
- A backend API route for processing signups with Zod validation.
- A Polygon (Mumbai) smart contract for auditing PII hashes.
- Comprehensive unit tests with Vitest.

## 2. Prerequisites

- Node.js (v18+) and npm/yarn/pnpm
- A Supabase project
- A Stripe account
- An Alchemy account (or any Polygon Mumbai RPC provider)
- A wallet with Mumbai MATIC for contract deployment (e.g., MetaMask)

## 3. Environment Setup

Create a `.env.local` file in the root of the `ai-calling-center` project and populate it with the following variables.

```env
# Supabase Configuration (per eva_eva/README.md)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key" # For server-side operations

# Blockchain Configuration (per PRD Sec 4 & 5)
NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL="your-alchemy-mumbai-rpc-url"
NEXT_PUBLIC_AUDIT_CONTRACT_ADDRESS="address-after-deployment"
DEPLOYER_PRIVATE_KEY="your-wallet-private-key-for-deployment" # Use with caution

# Stripe Configuration (per PRD Sec 5)
STRIPE_SECRET_KEY="your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 4. Database Setup (Supabase)
Run the following SQL queries in your Supabase SQL Editor to create the `profiles` table and enable Row Level Security (RLS) as specified in the PRD.

```sql
-- Create the profiles table to store user-specific data
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL UNIQUE,
  quota_minutes INT DEFAULT 100 NOT NULL, -- Per PRD Sec 2.2: 100-min trial credit
  verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy: Users can only see and manage their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

## 5. Deploying the Smart Contract
The `AICallingAudit` contract (from PRD Sec 4) must be deployed to the Polygon Mumbai testnet.

Install Hardhat:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
```

Configure Hardhat: Create a `hardhat.config.js` file:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    mumbai: {
      url: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL || "",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY].filter(Boolean),
    },
  },
};
```

Deploy the contract:
```bash
npx hardhat run contracts/deploy-audit.js --network mumbai
```

Update Environment: After deployment, copy the resulting contract address and paste it into `NEXT_PUBLIC_AUDIT_CONTRACT_ADDRESS` in your `.env.local` file.

## 6. Running the Application
Install Dependencies:
```bash
npm install
```

Run the Development Server:
```bash
npm run dev
```
The signup page will be available at `http://localhost:3000/signup`.

## 7. Running Tests
The test suite uses Vitest to validate the signup flow, mocking external services like Supabase and ethers.

Install Test Dependencies:
```bash
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react
```

Run Tests:
```bash
npm run test
```

Or, for the UI mode:
```bash
npm run test:ui
```
