# 📈 Trading Simulator

A comprehensive options trading simulator built with React Native and Expo, designed for learning and practicing trading strategies in a risk-free environment.

## 🚀 Features

### 🎯 **Quest System**
- Gamified learning experience with XP and levels
- Progressive quest system from beginner to advanced
- Achievement tracking and streak monitoring

### 🧪 **Strategy Lab**
- Interactive options strategy builder
- Real-time P&L visualization
- Pre-built strategy templates (Iron Condor, Straddle, Butterfly, etc.)
- Black-Scholes option pricing model
- Greeks calculations (Delta, Gamma, Theta, Vega)

### 📊 **Portfolio Management**
- Real-time portfolio tracking
- Position monitoring with live P&L
- Transaction history
- Performance analytics

### 📰 **Market Intelligence**
- Real-time market news feed
- Symbol-specific news filtering
- Market impact indicators
- Trending topics

### ⚖️ **Risk Management**
- Position sizing calculator
- Risk-reward ratio analysis
- Portfolio risk assessment
- Breakeven calculations

### 🏆 **Social Features**
- Leaderboard with multiple categories
- Achievement system
- Progress tracking
- Community rankings

### 📚 **Education Center**
- Video tutorials
- Interactive quizzes
- Learning modules
- Progress tracking

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **UI**: React Native with LinearGradient
- **Icons**: Lucide React Native
- **Language**: TypeScript
- **State Management**: React Hooks
- **Backend**: Supabase (Database, Authentication, Real-time)

## 📱 Screens

1. **Quests** - Gamified learning dashboard
2. **Strategy Lab** - Options strategy builder and testing
3. **Portfolio** - Portfolio management and tracking
4. **News** - Market news and analysis
5. **Risk** - Risk management tools
6. **Education** - Learning center with tutorials
7. **Leaderboard** - Social rankings and achievements
8. **Achievements** - Progress and accomplishment tracking

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fuzzyter/NKU-Hackathon-2025
   cd NKU-Hackathon-2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Update `app.json` with your Supabase credentials:
     ```json
     "extra": {
       "supabaseUrl": "your_supabase_project_url_here",
       "supabaseAnonKey": "your_supabase_anon_key_here"
     }
     ```
   - Run the SQL schema in your Supabase SQL Editor:
     ```bash
   - Copy the contents of `supabase-schema.sql` and run it in your Supabase project

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app (mobile)
   - Press `w` for web version
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build:web` - Build for web
- `npm run lint` - Run linter

## 🎮 How to Use

### Strategy Lab
1. Select a stock symbol (e.g., AAPL, TSLA)
2. Choose from pre-built strategies or create custom positions
3. View real-time P&L charts
4. Analyze risk metrics and Greeks

### Quest System
1. Complete beginner quests to unlock advanced content
2. Earn XP and level up
3. Track your learning progress
4. Unlock achievements

### Portfolio Management
1. Monitor your virtual positions
2. Track performance metrics
3. Review transaction history
4. Analyze portfolio risk

## 🏗️ Project Structure

```
Trading Simulator/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Quests dashboard
│   │   ├── lab.tsx        # Strategy Lab
│   │   ├── portfolio.tsx  # Portfolio management
│   │   ├── news.tsx       # News feed
│   │   ├── risk.tsx       # Risk calculator
│   │   ├── education.tsx  # Education center
│   │   ├── leaderboard.tsx # Leaderboard
│   │   └── achievements.tsx # Achievements
├── services/              # Business logic services
│   ├── marketData.ts      # Market data API
│   ├── optionsStrategies.ts # Options strategies
│   ├── riskCalculator.ts  # Risk calculations
│   ├── newsService.ts     # News data
│   ├── leaderboardService.ts # Leaderboard data
│   ├── educationService.ts # Education content
│   ├── authService.ts     # Supabase authentication
│   └── supabaseLeaderboardService.ts # Supabase leaderboard
├── lib/                   # Library configurations
│   └── supabase.ts        # Supabase client setup
├── components/            # Reusable components
│   └── SupabaseExample.tsx # Supabase integration example
├── hooks/                 # Custom React hooks
│   └── useFrameworkReady.ts
└── assets/               # Images and icons
```

## 🔧 Supabase Setup

### Database Schema
The project includes a comprehensive database schema with the following tables:
- `users` - User profiles and trading statistics
- `user_activities` - User activity tracking
- `trades` - Trading history and positions
- `education_content` - Learning materials
- `user_education_progress` - User learning progress
- `news` - Market news and updates

### Authentication
- Email/password authentication
- Google OAuth integration
- Row Level Security (RLS) policies
- User profile management

### Real-time Features
- Live leaderboard updates
- Real-time user activities
- Live trading data synchronization

### Usage Example
```typescript
import { supabase } from './lib/supabase'
import { authService } from './services/authService'

// Sign up a new user
const { user, error } = await authService.signUp(email, password, username)

// Get leaderboard data
const leaderboard = await supabaseLeaderboardService.getLeaderboard('total_profit', 10)

// Subscribe to real-time updates
supabase
  .channel('leaderboard')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, 
    (payload) => console.log('Change received!', payload))
  .subscribe()
```

## 🎯 Key Features Explained

### Options Strategies
- **Iron Condor**: Limited risk, limited reward strategy
- **Straddle**: Direction-neutral strategy for volatility
- **Butterfly**: Low-cost strategy with limited risk
- **Covered Call**: Income generation strategy
- **Protective Put**: Downside protection strategy
- **Collar**: Combined protective strategy
- **Strangle**: Similar to straddle but different strikes
- **Calendar Spread**: Time-based strategy

### Risk Management
- Position sizing based on account value
- Risk-reward ratio calculations
- Portfolio diversification analysis
- Breakeven point identification

## 🤝 Contributing

This project was created for the NKU Hackathon 2025 sponsored by Fidelity. Contributions and improvements are welcome!

## 📄 License

This project is part of the NKU Hackathon 2025 competition.

## 🏆 Hackathon Details

- **Event**: NKU Hackathon 2025
- **Sponsor**: Fidelity
- **Theme**: Financial Technology Innovation
- **Focus**: Options Trading Education and Simulation

---

**Built with ❤️ for the NKU Hackathon 2025**