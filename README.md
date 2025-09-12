# Trading Simulator - Full Stack Application

A comprehensive trading simulator application built with React Native (frontend), Flask (backend), and MongoDB (database) that allows users to learn options trading through gamified quests and collaborate with friends.

## 🏗️ Project Structure

```
Trading Simulator/
├── frontend/                 # React Native/Expo App
│   ├── app/                  # App screens and navigation
│   ├── components/           # Reusable UI components
│   ├── services/             # Frontend business logic
│   ├── types/                # TypeScript type definitions
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── assets/               # Images and static assets
│   └── package.json          # Frontend dependencies
├── backend/                  # Flask API Server
│   ├── routes/               # API route handlers
│   ├── models/               # Data models
│   ├── services/             # Backend business logic
│   ├── utils/                # Backend utilities
│   ├── app.py                # Flask application entry point
│   └── requirements.txt      # Python dependencies
├── database/                 # Database schemas and connection
│   ├── schemas.py            # MongoDB schemas and initialization
│   ├── connection.py         # Database connection management
│   └── env_example.txt       # Environment variables template
└── README.md                 # This file
```

## 🚀 Features

### Core Trading Features
- **Options Trading Simulator** - Practice options strategies with virtual money
- **Portfolio Management** - Track positions, P&L, and performance
- **Strategy Lab** - Build and test complex options strategies
- **Risk Calculator** - Analyze position risks and Greeks
- **Market Data Integration** - Real-time stock and options data

### Gamification & Learning
- **Quest System** - Progressive learning through structured quests
- **Achievement System** - Unlock badges and rewards
- **Leaderboards** - Compete with other traders globally
- **Education Modules** - Comprehensive options trading education

### Collaboration Features
- **Friends System** - Add friends and compare performance
- **Study Groups** - Collaborative learning with friends
- **Portfolio Sharing** - Share and compare portfolios
- **Messaging** - Chat with friends and study groups
- **Challenges** - Create and participate in trading competitions
- **Activity Feed** - See what friends are doing

## 🛠️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **Lucide React Native** - Icon library

### Backend
- **Flask** - Python web framework
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - Cross-origin resource sharing
- **PyMongo** - MongoDB driver for Python
- **yfinance** - Yahoo Finance API wrapper

### Database
- **MongoDB** - NoSQL document database
- **PyMongo** - MongoDB Python driver

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v4.4 or higher)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Trading Simulator"
```

### 2. Database Setup

#### Install MongoDB
- **macOS**: `brew install mongodb-community`
- **Windows**: Download from [MongoDB website](https://www.mongodb.com/try/download/community)
- **Linux**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

#### Start MongoDB
```bash
# macOS/Linux
mongod

# Windows
net start MongoDB
```

#### Initialize Database
```bash
cd database
python schemas.py
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp ../database/env_example.txt .env

# Edit .env file with your configuration
# Set JWT_SECRET_KEY to a secure random string
# Update MONGO_URI if needed

# Run the Flask server
python app.py
```

The backend API will be available at `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:19006`

## 📱 Usage

### Getting Started
1. **Register** - Create a new account with email and password
2. **Complete Tutorial** - Go through the initial quest to learn basics
3. **Explore Features** - Try the portfolio, lab, and leaderboard
4. **Add Friends** - Search for and add friends to collaborate
5. **Join Study Groups** - Create or join learning groups
6. **Track Progress** - Monitor your learning journey and achievements

### Key Features Walkthrough

#### Portfolio Management
- View your virtual portfolio with real-time P&L
- Add positions by searching for stocks/options
- Track performance over time
- Compare with friends

#### Strategy Lab
- Build complex options strategies
- Visualize profit/loss charts
- Test different market scenarios
- Learn strategy mechanics

#### Learning System
- Complete quests to unlock new content
- Earn XP and level up
- Unlock achievements and badges
- Track learning progress

#### Collaboration
- Add friends and compare performance
- Create study groups for collaborative learning
- Share portfolio snapshots
- Participate in group challenges

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Portfolio
- `GET /api/portfolio/` - Get portfolio summary
- `POST /api/portfolio/positions` - Add position
- `DELETE /api/portfolio/positions/<id>` - Remove position
- `GET /api/portfolio/history` - Get trade history

### Market Data
- `GET /api/market/quote/<symbol>` - Get stock quote
- `GET /api/market/options/<symbol>` - Get options chain
- `GET /api/market/search` - Search symbols
- `GET /api/market/chart/<symbol>` - Get chart data

### Friends & Collaboration
- `GET /api/friends/` - Get friends list
- `POST /api/friends/requests` - Send friend request
- `POST /api/friends/requests/<id>/accept` - Accept friend request
- `GET /api/friends/activities` - Get friend activities

### Education
- `GET /api/education/quests` - Get available quests
- `POST /api/education/quests/<id>/start` - Start quest
- `POST /api/education/quests/<id>/complete` - Complete quest

### Leaderboard
- `GET /api/leaderboard/` - Get leaderboard
- `GET /api/leaderboard/categories` - Get categories
- `GET /api/leaderboard/user-rank` - Get user rank

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create `Procfile` in backend directory:
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
│   └── educationService.ts # Education content
├── hooks/                 # Custom React hooks
│   └── useFrameworkReady.ts
└── assets/               # Images and icons
```

2. Deploy to Heroku:
```bash
cd backend
heroku create your-app-name
heroku addons:create mongolab:sandbox
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Expo)
```bash
cd frontend
expo build:web
expo publish
```

### Database (MongoDB Atlas)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Update `MONGO_URI` in production environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🔮 Roadmap

### Upcoming Features
- [ ] Real-time chat with WebSocket
- [ ] Push notifications
- [ ] Advanced charting with technical indicators
- [ ] Paper trading competitions
- [ ] Mobile app deployment
- [ ] Social media integration
- [ ] Advanced analytics dashboard
- [ ] API rate limiting and caching
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added collaboration features
- **v1.2.0** - Enhanced UI/UX and performance
- **v2.0.0** - Full-stack architecture with Flask backend

---

**Happy Trading! 📈**