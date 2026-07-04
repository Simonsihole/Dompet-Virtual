# Supabase Auth Implementation Plan

## Overview
Transform the single-tenant ExpenseTracker into a Multi-Tenant SaaS using Supabase Authentication.

## Step 1: Database Migration
- Provide SQL script to user to execute in Supabase.
- The script will:
  - Add `user_id UUID REFERENCES auth.users(id) NOT NULL` to `transactions`, `budgets`, `notifications`.
  - Create `profiles` table to link `user_id` to a `phone_number` for Twilio routing.

## Step 2: Backend Authentication Middleware
- Create `server/lib/auth.js` to verify Supabase JWTs using `SUPABASE_JWT_SECRET`.
- Update `server/index.js` to apply this middleware to all `/api/*` routes (except `/api/webhook/*`).

## Step 3: Backend Multi-Tenancy Updates
Modify all SQL queries in the Express backend to filter by `user_id` (`req.user.sub`):
- `server/routes/transactions.js`
- `server/routes/balance.js`
- `server/routes/analytics.js`
- `server/routes/notifications.js`
- `server/routes/budgets.js`
- `server/routes/chat.js`

## Step 4: Webhook Twilio Routing
- Modify `server/routes/webhook.js`.
- Extract `From` phone number.
- Lookup `user_id` from `profiles` table.
- Insert transaction using that `user_id`.

## Step 5: Frontend Auth Context & Client
- Create `src/lib/supabase.js`.
- Create `src/context/AuthContext.jsx`.
- Update `src/lib/api.js` to automatically attach the `Authorization` header with the Supabase access token.

## Step 6: Frontend Pages & Routing
- Create `src/pages/Login.jsx` (sleek UI).
- Create `src/pages/Settings.jsx` (to link WhatsApp number).
- Update `src/App.jsx` to protect routes using `ProtectedRoute`.
- Update `src/components/Sidebar.jsx` and `BottomNav.jsx` with a Logout button.
