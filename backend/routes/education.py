from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from datetime import datetime
import os

education_bp = Blueprint('education', __name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client.trading_simulator

@education_bp.route('/quests', methods=['GET'])
@jwt_required()
def get_quests():
    try:
        user_id = get_jwt_identity()
        
        # Get all quests
        quests = list(db.quests.find().sort('order', 1))
        
        # Get user's progress
        user_progress = db.user_progress.find_one({'userId': user_id}) or {}
        completed_quests = user_progress.get('completedQuests', [])
        current_quest = user_progress.get('currentQuest')
        
        # Format quests with user progress
        for quest in quests:
            quest['id'] = str(quest['_id'])
            del quest['_id']
            
            # Determine quest status
            if quest['id'] in completed_quests:
                quest['status'] = 'completed'
            elif quest['id'] == current_quest:
                quest['status'] = 'in_progress'
            elif quest.get('prerequisites'):
                # Check if prerequisites are met
                prereqs_met = all(prereq in completed_quests for prereq in quest['prerequisites'])
                quest['status'] = 'available' if prereqs_met else 'locked'
            else:
                quest['status'] = 'available'
        
        return jsonify({'quests': quests}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@education_bp.route('/quests/<quest_id>/start', methods=['POST'])
@jwt_required()
def start_quest():
    try:
        user_id = get_jwt_identity()
        quest_id = request.view_args['quest_id']
        
        # Get quest details
        quest = db.quests.find_one({'_id': quest_id})
        if not quest:
            return jsonify({'error': 'Quest not found'}), 404
        
        # Update user progress
        db.user_progress.update_one(
            {'userId': user_id},
            {
                '$set': {
                    'currentQuest': quest_id,
                    'questStartedAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return jsonify({'message': 'Quest started successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@education_bp.route('/quests/<quest_id>/complete', methods=['POST'])
@jwt_required()
def complete_quest():
    try:
        user_id = get_jwt_identity()
        quest_id = request.view_args['quest_id']
        
        # Get quest details
        quest = db.quests.find_one({'_id': quest_id})
        if not quest:
            return jsonify({'error': 'Quest not found'}), 404
        
        # Get user data
        user = db.users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update user progress
        db.user_progress.update_one(
            {'userId': user_id},
            {
                '$addToSet': {'completedQuests': quest_id},
                '$unset': {'currentQuest': ''},
                '$set': {'updatedAt': datetime.utcnow()}
            },
            upsert=True
        )
        
        # Award XP and update user level
        xp_gained = quest.get('xp', 0)
        new_xp = user.get('xp', 0) + xp_gained
        new_level = (new_xp // 1000) + 1  # Simple level calculation
        
        db.users.update_one(
            {'_id': user_id},
            {
                '$set': {
                    'xp': new_xp,
                    'level': new_level,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        
        return jsonify({
            'message': 'Quest completed successfully',
            'xpGained': xp_gained,
            'newLevel': new_level,
            'newXP': new_xp
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@education_bp.route('/progress', methods=['GET'])
@jwt_required()
def get_progress():
    try:
        user_id = get_jwt_identity()
        
        # Get user progress
        progress = db.user_progress.find_one({'userId': user_id})
        if not progress:
            progress = {
                'userId': user_id,
                'completedQuests': [],
                'currentQuest': None,
                'createdAt': datetime.utcnow()
            }
        
        # Get user stats
        user = db.users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate progress stats
        total_quests = db.quests.count_documents({})
        completed_quests = len(progress.get('completedQuests', []))
        completion_percentage = (completed_quests / total_quests * 100) if total_quests > 0 else 0
        
        progress_data = {
            'userId': str(progress['_id']) if '_id' in progress else user_id,
            'completedQuests': progress.get('completedQuests', []),
            'currentQuest': progress.get('currentQuest'),
            'totalQuests': total_quests,
            'completedCount': completed_quests,
            'completionPercentage': completion_percentage,
            'level': user.get('level', 1),
            'xp': user.get('xp', 0),
            'streak': user.get('streak', 0)
        }
        
        return jsonify({'progress': progress_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
