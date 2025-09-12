"""
Database connection and utilities for Trading Simulator
"""

from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        self.client = None
        self.db = None
        
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client.trading_simulator
            
            # Test connection
            self.client.admin.command('ping')
            print("Successfully connected to MongoDB!")
            
            return True
            
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            return False
    
    def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    def get_collection(self, collection_name):
        """Get a collection from the database"""
        if not self.db:
            raise Exception("Database not connected")
        return self.db[collection_name]
    
    def create_user(self, user_data):
        """Create a new user"""
        users = self.get_collection('users')
        return users.insert_one(user_data)
    
    def get_user_by_email(self, email):
        """Get user by email"""
        users = self.get_collection('users')
        return users.find_one({'email': email})
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        users = self.get_collection('users')
        return users.find_one({'_id': user_id})
    
    def update_user(self, user_id, update_data):
        """Update user data"""
        users = self.get_collection('users')
        return users.update_one({'_id': user_id}, {'$set': update_data})
    
    def add_trade(self, trade_data):
        """Add a new trade"""
        trades = self.get_collection('trades')
        trade_data['createdAt'] = datetime.utcnow()
        return trades.insert_one(trade_data)
    
    def get_user_trades(self, user_id, limit=100):
        """Get user's trades"""
        trades = self.get_collection('trades')
        return list(trades.find({'userId': user_id}).sort('createdAt', -1).limit(limit))
    
    def add_activity(self, activity_data):
        """Add user activity"""
        activities = self.get_collection('activities')
        activity_data['createdAt'] = datetime.utcnow()
        return activities.insert_one(activity_data)
    
    def get_user_activities(self, user_id, limit=50):
        """Get user activities"""
        activities = self.get_collection('activities')
        return list(activities.find({'userId': user_id}).sort('createdAt', -1).limit(limit))

# Global database manager instance
db_manager = DatabaseManager()

def get_db():
    """Get database instance"""
    if not db_manager.db:
        db_manager.connect()
    return db_manager.db

def get_collection(collection_name):
    """Get collection instance"""
    return db_manager.get_collection(collection_name)
