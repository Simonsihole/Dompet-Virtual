# Dompet: WhatsApp Expense Tracker

Dompet is a sleek, mobile-responsive expense tracking application that allows you to seamlessly log your finances directly via a **WhatsApp chat** and view them on a premium web dashboard.

This project uses **React (Vite)** for a lightning-fast frontend, a **Serverless Express API** running on Vercel, and **Supabase (PostgreSQL)** for the database. Everything is designed to be hosted 100% for free.

---

## 🌟 Features

- **WhatsApp Integration**: Log expenses on the go. Just text "Food 20000 KFC" to your Twilio number, and it instantly syncs to the database!
- **Premium Dashboard**: A highly polished, sleek UI designed with strict premium aesthetics (dark mode, glassmorphism, responsive grids).
- **Mobile Optimized**: The dashboard automatically collapses into a native-feeling mobile app with a frosted bottom navigation bar.
- **Serverless Architecture**: The entire Express backend is seamlessly deployed as Vercel Serverless functions alongside the Vite frontend.
- **Real-Time Analytics**: View monthly trends, category breakdowns, and a beautifully crafted transaction ledger.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Phosphor Icons, Recharts
- **Backend**: Express.js, Twilio SDK (WhatsApp Sandbox), Vercel Serverless
- **Database**: PostgreSQL (Supabase), `pg` node driver

---

## 🚀 Setup & Deployment Guide

Want to deploy your own instance of Dompet? Follow these exact steps.

### 1. Database Setup (Supabase)
1. Go to [Supabase](https://supabase.com/) and create a free project.
2. Go to the **SQL Editor** in your Supabase dashboard and run the following script to create your tables:

```sql
-- Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
    amount NUMERIC NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    source VARCHAR(50) DEFAULT 'web',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets Table
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    limit_amount NUMERIC NOT NULL,
    period VARCHAR(20) DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
3. Go to **Settings -> Database** and copy your Connection String (URI). You will need this later.

### 2. WhatsApp Setup (Twilio)
1. Create a free account at [Twilio](https://www.twilio.com/).
2. Navigate to **Messaging -> Try it out -> Send a WhatsApp message**.
3. Follow the instructions to connect your personal phone number to the Twilio Sandbox.
4. Copy your **Account SID** and **Auth Token** from your Twilio Console.

### 3. Local Development (Optional)
To run the project on your own machine:
```bash
git clone https://github.com/your-username/ExpenseTracking.git
cd ExpenseTracking
npm install
```

Create a `server/.env` file with your credentials:
```env
DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
MY_PHONE_NUMBER=whatsapp:+your_actual_number
```

Start the local server:
```bash
npm run dev
```

### 4. Deploying to Vercel (Production)
Since this project is perfectly configured for Vercel, deploying is a breeze:
1. Push this code to a new GitHub repository.
2. Log into [Vercel](https://vercel.com/) and click **Add New -> Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** section and add the exact same variables you put in your `server/.env` file (`DATABASE_URL`, `TWILIO_ACCOUNT_SID`, etc.).
5. Click **Deploy**!

### 5. Final Step: Connect Webhook
Once Vercel gives you your live URL (e.g., `https://my-expense-tracker.vercel.app`), you must tell Twilio to send messages to it.
1. Go back to your Twilio WhatsApp Sandbox settings.
2. Find the **"When a message comes in"** webhook field.
3. Paste your Vercel URL with the webhook endpoint attached:
   `https://YOUR-VERCEL-APP-URL.vercel.app/api/webhook/whatsapp`
4. Save!

### 🎉 You're Done!
Open WhatsApp, send a message to your Twilio number like `"Food 15000 Lunch"`, and watch it instantly appear on your beautiful new Vercel dashboard!
