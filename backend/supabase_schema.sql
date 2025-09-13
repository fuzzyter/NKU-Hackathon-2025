-- Supabase Database Schema for Options Trading Education App
-- Run these commands in your Supabase SQL editor

-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- 1. User Profiles Table
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    email TEXT,
    total_exp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges JSONB DEFAULT '[]'::jsonb,
    completed_quizzes TEXT[] DEFAULT '{}',
    learning_streak INTEGER DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Experience Logs Table
CREATE TABLE experience_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    exp_gained INTEGER NOT NULL,
    activity_type TEXT NOT NULL, -- 'quiz_completion', 'video_watched', 'daily_login', etc.
    total_exp_after INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb -- Additional data about the activity
);

-- 3. Quiz Attempts Table
CREATE TABLE quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    quiz_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    time_taken INTEGER, -- in seconds
    answers JSONB NOT NULL, -- Array of user answers
    passed BOOLEAN DEFAULT FALSE,
    attempt_number INTEGER DEFAULT 1,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Learning Progress Table
CREATE TABLE learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'video', 'quiz', 'article', 'interactive'
    status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    progress_percentage INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, content_id)
);

-- 5. User Achievements Table
CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 6. Daily Streaks Table
CREATE TABLE daily_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    streak_date DATE NOT NULL,
    activity_count INTEGER DEFAULT 1,
    exp_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, streak_date)
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_total_exp ON user_profiles(total_exp DESC);
CREATE INDEX idx_experience_logs_user_id ON experience_logs(user_id);
CREATE INDEX idx_experience_logs_timestamp ON experience_logs(timestamp DESC);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_content ON learning_progress(content_id, content_type);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_daily_streaks_user_date ON daily_streaks(user_id, streak_date DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- RLS Policies for experience_logs
CREATE POLICY "Users can view their own experience logs" ON experience_logs
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own experience logs" ON experience_logs
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- RLS Policies for learning_progress
CREATE POLICY "Users can view their own learning progress" ON learning_progress
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own learning progress" ON learning_progress
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own achievements" ON user_achievements
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- RLS Policies for daily_streaks
CREATE POLICY "Users can view their own daily streaks" ON daily_streaks
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own daily streaks" ON daily_streaks
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate user level based on experience
CREATE OR REPLACE FUNCTION calculate_user_level(total_exp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level formula: level = floor(sqrt(total_exp / 100)) + 1
    RETURN FLOOR(SQRT(total_exp / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to update user level when experience changes
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_exp != OLD.total_exp THEN
        NEW.level = calculate_user_level(NEW.total_exp);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update level when experience changes
CREATE TRIGGER update_level_on_exp_change
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Create view for leaderboard
CREATE VIEW leaderboard AS
SELECT 
    user_id,
    username,
    total_exp,
    level,
    badges,
    learning_streak,
    last_active,
    RANK() OVER (ORDER BY total_exp DESC) as rank
FROM user_profiles
ORDER BY total_exp DESC;

-- Create view for user statistics
CREATE VIEW user_statistics AS
SELECT 
    up.user_id,
    up.username,
    up.total_exp,
    up.level,
    COALESCE(ARRAY_LENGTH(up.badges, 1), 0) as badges_count,
    COALESCE(ARRAY_LENGTH(up.completed_quizzes, 1), 0) as completed_quizzes_count,
    up.learning_streak,
    COUNT(DISTINCT qa.quiz_id) as total_quizzes_attempted,
    COUNT(qa.id) as total_quiz_attempts,
    COUNT(CASE WHEN qa.passed THEN 1 END) as passed_quiz_attempts,
    CASE 
        WHEN COUNT(DISTINCT qa.quiz_id) > 0 
        THEN ROUND((COUNT(CASE WHEN qa.passed THEN 1 END)::DECIMAL / COUNT(DISTINCT qa.quiz_id)) * 100, 2)
        ELSE 0 
    END as quiz_success_rate,
    COUNT(el.id) as total_activities,
    up.last_active
FROM user_profiles up
LEFT JOIN quiz_attempts qa ON up.user_id = qa.user_id
LEFT JOIN experience_logs el ON up.user_id = el.user_id
GROUP BY up.user_id, up.username, up.total_exp, up.level, up.badges, up.completed_quizzes, up.learning_streak, up.last_active;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
