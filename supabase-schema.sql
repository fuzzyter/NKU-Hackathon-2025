-- Supabase 데이터베이스 스키마
-- 이 파일의 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  total_pl DECIMAL(15,2) DEFAULT 0,
  total_pl_percent DECIMAL(5,2) DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  best_trade DECIMAL(15,2) DEFAULT 0,
  worst_trade DECIMAL(15,2) DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 활동 테이블
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 거래 기록 테이블
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  trade_type VARCHAR(20) NOT NULL, -- 'call', 'put', 'straddle', etc.
  strike_price DECIMAL(10,2),
  expiration_date DATE,
  premium DECIMAL(10,2),
  quantity INTEGER DEFAULT 1,
  profit_loss DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed', 'expired'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- 교육 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS education_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL, -- 'article', 'video', 'quiz'
  content_url TEXT,
  difficulty_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  category VARCHAR(50),
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 교육 진행도 테이블
CREATE TABLE IF NOT EXISTS user_education_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES education_content(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- 뉴스 테이블
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  content TEXT,
  summary TEXT,
  source VARCHAR(100),
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  category VARCHAR(50),
  sentiment VARCHAR(20), -- 'positive', 'negative', 'neutral'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_total_pl ON users(total_pl DESC);
CREATE INDEX IF NOT EXISTS idx_users_win_rate ON users(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_users_total_trades ON users(total_trades DESC);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_education_progress ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 활동 데이터는 모든 사용자가 볼 수 있음 (리더보드용)
CREATE POLICY "Anyone can view activities" ON user_activities
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 거래 데이터는 자신의 것만 볼 수 있음
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

-- 교육 진행도는 자신의 것만 볼 수 있음
CREATE POLICY "Users can view own progress" ON user_education_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_education_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_education_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 교육 콘텐츠와 뉴스는 모든 사용자가 볼 수 있음
CREATE POLICY "Anyone can view education content" ON education_content
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view news" ON news
  FOR SELECT USING (true);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_content_updated_at BEFORE UPDATE ON education_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입 (선택사항)
INSERT INTO education_content (title, description, content_type, difficulty_level, category, xp_reward) VALUES
('옵션 거래 기초', '옵션 거래의 기본 개념을 학습합니다.', 'article', 'beginner', 'basics', 100),
('콜 옵션과 풋 옵션', '콜과 풋 옵션의 차이점을 이해합니다.', 'video', 'beginner', 'basics', 150),
('그릭스 이해하기', '델타, 감마, 세타, 베가의 의미를 배웁니다.', 'article', 'intermediate', 'greeks', 200),
('리스크 관리', '옵션 거래에서 리스크를 관리하는 방법을 학습합니다.', 'article', 'intermediate', 'risk', 250),
('고급 전략', '복잡한 옵션 전략들을 배웁니다.', 'video', 'advanced', 'strategies', 300);

-- 샘플 뉴스 데이터
INSERT INTO news (title, content, summary, source, category, sentiment, published_at) VALUES
('주식시장 급등, 옵션 거래량 증가', '주요 지수들이 상승하면서 옵션 거래량이 크게 증가했습니다.', '시장 상승으로 옵션 거래 활발', 'Financial News', 'market', 'positive', NOW() - INTERVAL '1 hour'),
('VIX 지수 하락, 변동성 감소', 'VIX 지수가 크게 하락하여 시장 변동성이 줄어들었습니다.', '변동성 지수 하락으로 안정적 시장', 'Market Watch', 'volatility', 'neutral', NOW() - INTERVAL '2 hours');
