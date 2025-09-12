from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from datetime import datetime, timedelta
import os

leaderboard_bp = Blueprint('leaderboard', __name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client.trading_simulator

@leaderboard_bp.route('/', methods=['GET'])
@jwt_required()
def get_leaderboard():
    try:
        category = request.args.get('category', 'total_profit')
        limit = int(request.args.get('limit', 50))
        
        # Define sort criteria based on category
        sort_criteria = {
            'total_profit': 'totalPL',
            'win_rate': 'winRate',
            'most_trades': 'totalTrades',
            'streak': 'streak',
            'level': 'level',
            'xp': 'xp'
        }
        
        sort_field = sort_criteria.get(category, 'totalPL')
        sort_direction = -1 if category != 'win_rate' else -1
        
        # Get leaderboard data
        leaderboard = list(db.users.find(
            {'isActive': True},
            {
                'username': 1,
                'displayName': 1,
                'level': 1,
                'xp': 1,
                'totalPL': 1,
                'totalPLPercent': 1,
                'winRate': 1,
                'totalTrades': 1,
                'streak': 1,
                'badges': 1,
                'lastActive': 1
            }
        ).sort(sort_field, sort_direction).limit(limit))
        
        # Add rank and format data
        for i, user in enumerate(leaderboard):
            user['rank'] = i + 1
            user['id'] = str(user['_id'])
            del user['_id']
        
        return jsonify({'leaderboard': leaderboard}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@leaderboard_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    try:
        categories = [
            {
                'id': 'total_profit',
                'name': 'Total Profit',
                'description': 'Highest total profit/loss',
                'sortBy': 'totalPL',
                'timeFrame': 'allTime'
            },
            {
                'id': 'win_rate',
                'name': 'Win Rate',
                'description': 'Highest percentage of winning trades',
                'sortBy': 'winRate',
                'timeFrame': 'allTime'
            },
            {
                'id': 'most_trades',
                'name': 'Most Active',
                'description': 'Most trades completed',
                'sortBy': 'totalTrades',
                'timeFrame': 'allTime'
            },
            {
                'id': 'streak',
                'name': 'Current Streak',
                'description': 'Longest current winning streak',
                'sortBy': 'streak',
                'timeFrame': 'allTime'
            },
            {
                'id': 'weekly',
                'name': 'This Week',
                'description': 'Best performers this week',
                'sortBy': 'totalPL',
                'timeFrame': 'weekly'
            },
            {
                'id': 'monthly',
                'name': 'This Month',
                'description': 'Best performers this month',
                'sortBy': 'totalPL',
                'timeFrame': 'monthly'
            }
        ]
        
        return jsonify({'categories': categories}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@leaderboard_bp.route('/user-rank', methods=['GET'])
@jwt_required()
def get_user_rank():
    try:
        user_id = get_jwt_identity()
        category = request.args.get('category', 'total_profit')
        
        # Get user's current stats
        user = db.users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Define sort criteria
        sort_criteria = {
            'total_profit': 'totalPL',
            'win_rate': 'winRate',
            'most_trades': 'totalTrades',
            'streak': 'streak',
            'level': 'level',
            'xp': 'xp'
        }
        
        sort_field = sort_criteria.get(category, 'totalPL')
        sort_direction = -1 if category != 'win_rate' else -1
        
        # Count users with better stats
        filter_criteria = {}
        if category == 'total_profit':
            filter_criteria = {'totalPL': {'$gt': user.get('totalPL', 0)}}
        elif category == 'win_rate':
            filter_criteria = {'winRate': {'$gt': user.get('winRate', 0)}}
        elif category == 'most_trades':
            filter_criteria = {'totalTrades': {'$gt': user.get('totalTrades', 0)}}
        elif category == 'streak':
            filter_criteria = {'streak': {'$gt': user.get('streak', 0)}}
        elif category == 'level':
            filter_criteria = {'level': {'$gt': user.get('level', 1)}}
        elif category == 'xp':
            filter_criteria = {'xp': {'$gt': user.get('xp', 0)}}
        
        rank = db.users.count_documents(filter_criteria) + 1
        
        return jsonify({
            'rank': rank,
            'category': category,
            'userStats': {
                'totalPL': user.get('totalPL', 0),
                'winRate': user.get('winRate', 0),
                'totalTrades': user.get('totalTrades', 0),
                'streak': user.get('streak', 0),
                'level': user.get('level', 1),
                'xp': user.get('xp', 0)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
