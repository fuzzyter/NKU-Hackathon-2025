-- Trading Quiz App Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security and necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Quizzes Table
CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    choices JSONB NOT NULL,
    correct_choice INTEGER NOT NULL CHECK (correct_choice >= 0),
    xp_reward INTEGER NOT NULL DEFAULT 10 CHECK (xp_reward > 0),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Profile Table
CREATE TABLE users_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    level INTEGER DEFAULT 1 CHECK (level > 0),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Quiz Progress Table
CREATE TABLE user_quiz_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    attempts INTEGER DEFAULT 0 CHECK (attempts >= 0),
    best_score INTEGER DEFAULT 0 CHECK (best_score >= 0),
    earned_xp INTEGER DEFAULT 0 CHECK (earned_xp >= 0),
    last_attempted TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, quiz_id) -- Prevent duplicate entries for same user/quiz combination
);

-- Create indexes for better performance
CREATE INDEX idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at DESC);
CREATE INDEX idx_users_profile_username ON users_profile(username);
CREATE INDEX idx_users_profile_total_xp ON users_profile(total_xp DESC);
CREATE INDEX idx_users_profile_level ON users_profile(level DESC);
CREATE INDEX idx_user_quiz_progress_user_id ON user_quiz_progress(user_id);
CREATE INDEX idx_user_quiz_progress_quiz_id ON user_quiz_progress(quiz_id);
CREATE INDEX idx_user_quiz_progress_last_attempted ON user_quiz_progress(last_attempted DESC);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quizzes (read-only for all authenticated users)
CREATE POLICY "Anyone can view quizzes" ON quizzes
    FOR SELECT TO authenticated, anon USING (true);

-- RLS Policies for users_profile
CREATE POLICY "Users can view their own profile" ON users_profile
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users_profile
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON users_profile
    FOR INSERT WITH CHECK (id = auth.uid());

-- RLS Policies for user_quiz_progress
CREATE POLICY "Users can view their own quiz progress" ON user_quiz_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quiz progress" ON user_quiz_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quiz progress" ON user_quiz_progress
    FOR UPDATE USING (user_id = auth.uid());

-- Create a function to calculate user level based on total XP
CREATE OR REPLACE FUNCTION calculate_user_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level formula: level = floor(xp / 100) + 1, with minimum level 1
    RETURN GREATEST(1, FLOOR(xp / 100.0) + 1);
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update user level when XP changes
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level = calculate_user_level(NEW.total_xp);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE ON users_profile
    FOR EACH ROW
    WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
    EXECUTE FUNCTION update_user_level();

-- Create a trigger to also update level on insert
CREATE TRIGGER trigger_insert_user_level
    BEFORE INSERT ON users_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

-- Create a view for leaderboard
CREATE VIEW leaderboard AS
SELECT 
    username,
    level,
    total_xp,
    balance,
    created_at,
    ROW_NUMBER() OVER (ORDER BY total_xp DESC, created_at ASC) as rank
FROM users_profile
ORDER BY total_xp DESC, created_at ASC;

-- Create a view for quiz statistics
CREATE VIEW quiz_statistics AS
SELECT 
    q.id,
    q.question,
    q.difficulty,
    q.xp_reward,
    COUNT(uqp.id) as total_attempts,
    COUNT(CASE WHEN uqp.best_score > 0 THEN 1 END) as successful_attempts,
    CASE 
        WHEN COUNT(uqp.id) > 0 
        THEN ROUND((COUNT(CASE WHEN uqp.best_score > 0 THEN 1 END)::DECIMAL / COUNT(uqp.id)) * 100, 2)
        ELSE 0 
    END as success_rate,
    AVG(uqp.attempts) as avg_attempts_per_user
FROM quizzes q
LEFT JOIN user_quiz_progress uqp ON q.id = uqp.quiz_id
GROUP BY q.id, q.question, q.difficulty, q.xp_reward
ORDER BY q.id;

-- Create a view for user progress summary
CREATE VIEW user_progress_summary AS
SELECT 
    up.id,
    up.username,
    up.level,
    up.total_xp,
    up.balance,
    COUNT(uqp.id) as quizzes_attempted,
    COUNT(CASE WHEN uqp.best_score > 0 THEN 1 END) as quizzes_completed,
    SUM(uqp.earned_xp) as xp_from_quizzes,
    AVG(uqp.best_score) as avg_score,
    MAX(uqp.last_attempted) as last_quiz_attempt
FROM users_profile up
LEFT JOIN user_quiz_progress uqp ON up.id = uqp.user_id
GROUP BY up.id, up.username, up.level, up.total_xp, up.balance
ORDER BY up.total_xp DESC;

-- Insert sample quiz data
INSERT INTO quizzes (question, choices, correct_choice, xp_reward, difficulty) VALUES
('What is a call option?', 
 '["The right to buy a stock at a specific price", "The right to sell a stock at a specific price", "The obligation to buy a stock", "The obligation to sell a stock"]'::jsonb, 
 0, 10, 'easy'),

('What does "strike price" mean in options trading?', 
 '["The current market price", "The price at which the option can be exercised", "The premium paid for the option", "The expiration date"]'::jsonb, 
 1, 10, 'easy'),

('What is the maximum loss for a call option buyer?', 
 '["Unlimited", "The strike price", "The premium paid", "Zero"]'::jsonb, 
 2, 15, 'medium'),

('What is a put option?', 
 '["The right to buy a stock", "The right to sell a stock at a specific price", "The obligation to buy", "A type of bond"]'::jsonb, 
 1, 10, 'easy'),

('What happens when an option expires "in the money"?', 
 '["It becomes worthless", "It is automatically exercised", "The premium is refunded", "Nothing happens"]'::jsonb, 
 1, 20, 'medium'),

('What is "time decay" in options?', 
 '["The increase in option value over time", "The decrease in option value as expiration approaches", "The change in strike price", "The volatility measure"]'::jsonb, 
 1, 25, 'hard'),

('What does "delta" measure in options?', 
 '["Time sensitivity", "Price sensitivity to underlying asset", "Volatility sensitivity", "Interest rate sensitivity"]'::jsonb, 
 1, 30, 'hard'),

('What is a "covered call" strategy?', 
 '["Buying a call without owning the stock", "Selling a call while owning the underlying stock", "Buying both call and put", "Selling naked puts"]'::jsonb, 
 1, 20, 'medium'),

('What does "implied volatility" represent?', 
 '["Historical price movements", "Market expectation of future volatility", "Current stock price", "Option premium"]'::jsonb, 
 1, 25, 'hard'),

('What is the "breakeven point" for a call option?', 
 '["Strike price only", "Strike price + premium paid", "Premium paid only", "Current stock price"]'::jsonb, 
 1, 15, 'medium');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Allow anon users to read quizzes but not modify user data
REVOKE INSERT, UPDATE, DELETE ON users_profile FROM anon;
REVOKE INSERT, UPDATE, DELETE ON user_quiz_progress FROM anon;
