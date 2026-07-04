-- 1. Create profiles table for WhatsApp integration
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Truncate existing tables to add NOT NULL user_id column safely
-- WARNING: This will delete existing transactions. 
-- If you want to keep them, remove 'NOT NULL' or UPDATE them with your user_id first!
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE budgets CASCADE;
TRUNCATE TABLE notifications CASCADE;

-- 3. Add user_id column to tables
ALTER TABLE transactions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;

ALTER TABLE budgets 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;

ALTER TABLE notifications 
ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;

-- 4. Enable Row Level Security (RLS) on all tables (Optional but highly recommended for SaaS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
CREATE POLICY "Users can only access their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);
