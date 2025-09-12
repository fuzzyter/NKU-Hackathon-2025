from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from datetime import datetime
import os

users_bp = Blueprint('users', __name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client.trading_simulator

@users_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    try:
        user_id = get_jwt_identity()
        
        user = db.users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        stats = {
            'level': user.get('level', 1),
            'xp': user.get('xp', 0),
            'totalPL': user.get('totalPL', 0),
            'totalPLPercent': user.get('totalPLPercent', 0),
            'winRate': user.get('winRate', 0),
            'totalTrades': user.get('totalTrades', 0),
            'streak': user.get('streak', 0),
            'badges': user.get('badges', []),
            'rank': user.get('rank', 0)
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_achievements():
    try:
        user_id = get_jwt_identity()
        
        # Get user's achievements
        achievements = list(db.achievements.find({'userId': user_id}).sort('earnedAt', -1))
        
        # Format achievements
        for achievement in achievements:
            achievement['id'] = str(achievement['_id'])
            del achievement['_id']
        
        return jsonify({'achievements': achievements}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
