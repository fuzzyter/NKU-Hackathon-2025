"""
MongoDB schemas and database initialization for Trading Simulator
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
import os

# Database connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client.trading_simulator

def create_indexes():
    """Create database indexes for optimal performance"""
    
    # Users collection indexes
    db.users.create_index("email", unique=True)
    db.users.create_index("username", unique=True)
    db.users.create_index("level")
    db.users.create_index("totalPL")
    db.users.create_index("winRate")
    db.users.create_index("totalTrades")
    db.users.create_index("streak")
    db.users.create_index("xp")
    db.users.create_index("lastActive")
    db.users.create_index([("totalPL", DESCENDING)])
    db.users.create_index([("winRate", DESCENDING)])
    db.users.create_index([("level", DESCENDING)])
    
    # Friend requests collection indexes
    db.friend_requests.create_index([("fromUserId", ASCENDING), ("toUserId", ASCENDING)])
    db.friend_requests.create_index("status")
    db.friend_requests.create_index("createdAt")
    db.friend_requests.create_index("expiresAt")
    
    # Trades collection indexes
    db.trades.create_index("userId")
    db.trades.create_index("symbol")
    db.trades.create_index("createdAt")
    db.trades.create_index([("userId", ASCENDING), ("createdAt", DESCENDING)])
    
    # Activities collection indexes
    db.activities.create_index("userId")
    db.activities.create_index("type")
    db.activities.create_index("createdAt")
    db.activities.create_index([("userId", ASCENDING), ("createdAt", DESCENDING)])
    
    # Quests collection indexes
    db.quests.create_index("order")
    db.quests.create_index("difficulty")
    db.quests.create_index("module")
    
    # User progress collection indexes
    db.user_progress.create_index("userId", unique=True)
    db.user_progress.create_index("completedQuests")
    
    # Study groups collection indexes
    db.study_groups.create_index("createdBy")
    db.study_groups.create_index("members")
    db.study_groups.create_index("inviteCode")
    
    # Messages collection indexes
    db.messages.create_index([("senderId", ASCENDING), ("recipientId", ASCENDING)])
    db.messages.create_index("groupId")
    db.messages.create_index("timestamp")
    
    # Achievements collection indexes
    db.achievements.create_index("userId")
    db.achievements.create_index("type")
    db.achievements.create_index("earnedAt")

def seed_initial_data():
    """Seed the database with initial data"""
    
    # Seed quests if they don't exist
    if db.quests.count_documents({}) == 0:
        initial_quests = [
            {
                "title": "What is an Option?",
                "description": "Learn the fundamentals of options contracts",
                "category": "Options Basics",
                "difficulty": "beginner",
                "xp": 50,
                "module": "Options Basics",
                "prerequisites": [],
                "learningObjectives": [
                    "Understand what options are",
                    "Learn basic options terminology",
                    "Understand the difference between calls and puts"
                ],
                "estimatedTime": 15,
                "order": 1,
                "content": {
                    "sections": [
                        {
                            "title": "Introduction to Options",
                            "content": "Options are financial instruments that give you the right, but not the obligation, to buy or sell an underlying asset at a predetermined price."
                        },
                        {
                            "title": "Key Terms",
                            "content": "Strike Price, Expiration Date, Premium, Call vs Put"
                        }
                    ]
                }
            },
            {
                "title": "The Call Option",
                "description": "Master bullish speculation with call options",
                "category": "Options Basics",
                "difficulty": "beginner",
                "xp": 75,
                "module": "Options Basics",
                "prerequisites": ["What is an Option?"],
                "learningObjectives": [
                    "Understand call option mechanics",
                    "Learn when to use call options",
                    "Calculate call option profit/loss"
                ],
                "estimatedTime": 20,
                "order": 2,
                "content": {
                    "sections": [
                        {
                            "title": "Call Options Explained",
                            "content": "A call option gives you the right to buy a stock at a specific price."
                        }
                    ]
                }
            },
            {
                "title": "The Put Option",
                "description": "Learn bearish strategies with put options",
                "category": "Options Basics",
                "difficulty": "beginner",
                "xp": 75,
                "module": "Options Basics",
                "prerequisites": ["What is an Option?"],
                "learningObjectives": [
                    "Understand put option mechanics",
                    "Learn when to use put options",
                    "Calculate put option profit/loss"
                ],
                "estimatedTime": 20,
                "order": 3,
                "content": {
                    "sections": [
                        {
                            "title": "Put Options Explained",
                            "content": "A put option gives you the right to sell a stock at a specific price."
                        }
                    ]
                }
            },
            {
                "title": "The Covered Call",
                "description": "Generate income from stock holdings",
                "category": "Income Generation",
                "difficulty": "intermediate",
                "xp": 100,
                "module": "Income Generation",
                "prerequisites": ["The Call Option"],
                "learningObjectives": [
                    "Understand covered call strategy",
                    "Learn risk/reward of covered calls",
                    "Identify optimal stocks for covered calls"
                ],
                "estimatedTime": 25,
                "order": 4,
                "content": {
                    "sections": [
                        {
                            "title": "Covered Call Strategy",
                            "content": "Selling call options against stock you own to generate income."
                        }
                    ]
                }
            },
            {
                "title": "Cash-Secured Put",
                "description": "Get paid to buy stocks at lower prices",
                "category": "Income Generation",
                "difficulty": "intermediate",
                "xp": 100,
                "module": "Income Generation",
                "prerequisites": ["The Put Option"],
                "learningObjectives": [
                    "Understand cash-secured put strategy",
                    "Learn when to use cash-secured puts",
                    "Calculate margin requirements"
                ],
                "estimatedTime": 25,
                "order": 5,
                "content": {
                    "sections": [
                        {
                            "title": "Cash-Secured Put Strategy",
                            "content": "Selling put options with cash to cover assignment."
                        }
                    ]
                }
            }
        ]
        
        db.quests.insert_many(initial_quests)
    
    # Seed achievement types
    if db.achievement_types.count_documents({}) == 0:
        achievement_types = [
            {
                "name": "First Trade",
                "description": "Complete your first trade",
                "icon": "🎯",
                "rarity": "common",
                "criteria": {"totalTrades": 1}
            },
            {
                "name": "Profit Maker",
                "description": "Make your first profit",
                "icon": "💰",
                "rarity": "common",
                "criteria": {"totalPL": 100}
            },
            {
                "name": "Risk Manager",
                "description": "Complete 10 trades with positive P&L",
                "icon": "🛡️",
                "rarity": "rare",
                "criteria": {"winningTrades": 10}
            },
            {
                "name": "Options Expert",
                "description": "Complete 50 options trades",
                "icon": "📊",
                "rarity": "rare",
                "criteria": {"optionsTrades": 50}
            },
            {
                "name": "Streak Master",
                "description": "Achieve a 10-day winning streak",
                "icon": "🔥",
                "rarity": "epic",
                "criteria": {"streak": 10}
            },
            {
                "name": "Level 10",
                "description": "Reach level 10",
                "icon": "⭐",
                "rarity": "epic",
                "criteria": {"level": 10}
            },
            {
                "name": "High Roller",
                "description": "Make $10,000 profit",
                "icon": "💎",
                "rarity": "legendary",
                "criteria": {"totalPL": 10000}
            },
            {
                "name": "Perfect Week",
                "description": "Win 100% of trades in a week",
                "icon": "🏆",
                "rarity": "legendary",
                "criteria": {"weeklyWinRate": 100}
            }
        ]
        
        db.achievement_types.insert_many(achievement_types)

def initialize_database():
    """Initialize the database with indexes and seed data"""
    try:
        print("Creating database indexes...")
        create_indexes()
        
        print("Seeding initial data...")
        seed_initial_data()
        
        print("Database initialization completed successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    initialize_database()
