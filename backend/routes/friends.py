from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from datetime import datetime, timedelta
import os

friends_bp = Blueprint('friends', __name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client.trading_simulator

@friends_bp.route('/', methods=['GET'])
@jwt_required()
def get_friends():
    try:
        user_id = get_jwt_identity()
        
        user = db.users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        friends_list = user.get('friends', [])
        
        # Get friend details
        friends = []
        for friend_id in friends_list:
            friend = db.users.find_one(
                {'_id': friend_id},
                {'password': 0, 'email': 0, 'portfolio': 0}
            )
            if friend:
                friend['id'] = str(friend['_id'])
                del friend['_id']
                friends.append(friend)
        
        return jsonify({'friends': friends}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@friends_bp.route('/search', methods=['GET'])
@jwt_required()
def search_users():
    try:
        query = request.args.get('q', '')
        
        if len(query) < 2:
            return jsonify({'users': []}), 200
        
        # Search users by username or displayName
        users = list(db.users.find({
            '$or': [
                {'username': {'$regex': query, '$options': 'i'}},
                {'displayName': {'$regex': query, '$options': 'i'}}
            ],
            'isActive': True
        }, {
            'password': 0,
            'email': 0,
            'portfolio': 0
        }).limit(20))
        
        # Format results
        for user in users:
            user['id'] = str(user['_id'])
            del user['_id']
        
        return jsonify({'users': users}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@friends_bp.route('/requests', methods=['GET'])
@jwt_required()
def get_friend_requests():
    try:
        user_id = get_jwt_identity()
        
        # Get pending friend requests
        requests = list(db.friend_requests.find({
            '$or': [
                {'fromUserId': user_id, 'status': 'pending'},
                {'toUserId': user_id, 'status': 'pending'}
            ]
        }).sort('createdAt', -1))
        
        # Get sender/receiver details
        for req in requests:
            if req['fromUserId'] == user_id:
                # Sent request
                user = db.users.find_one(
                    {'_id': req['toUserId']},
                    {'username': 1, 'displayName': 1, 'avatar': 1}
                )
                req['recipient'] = {
                    'id': str(user['_id']),
                    'username': user['username'],
                    'displayName': user['displayName'],
                    'avatar': user.get('avatar')
                }
            else:
                # Received request
                user = db.users.find_one(
                    {'_id': req['fromUserId']},
                    {'username': 1, 'displayName': 1, 'avatar': 1}
                )
                req['sender'] = {
                    'id': str(user['_id']),
                    'username': user['username'],
                    'displayName': user['displayName'],
                    'avatar': user.get('avatar')
                }
            
            req['id'] = str(req['_id'])
            del req['_id']
        
        return jsonify({'requests': requests}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@friends_bp.route('/requests', methods=['POST'])
@jwt_required()
def send_friend_request():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        recipient_id = data.get('userId')
        message = data.get('message', '')
        
        if not recipient_id:
            return jsonify({'error': 'Recipient ID required'}), 400
        
        if recipient_id == user_id:
            return jsonify({'error': 'Cannot send friend request to yourself'}), 400
        
        # Check if users exist
        recipient = db.users.find_one({'_id': recipient_id, 'isActive': True})
        if not recipient:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if already friends
        user = db.users.find_one({'_id': user_id})
        if recipient_id in user.get('friends', []):
            return jsonify({'error': 'Already friends'}), 409
        
        # Check if request already exists
        existing_request = db.friend_requests.find_one({
            '$or': [
                {'fromUserId': user_id, 'toUserId': recipient_id},
                {'fromUserId': recipient_id, 'toUserId': user_id}
            ],
            'status': 'pending'
        })
        
        if existing_request:
            return jsonify({'error': 'Friend request already exists'}), 409
        
        # Create friend request
        friend_request = {
            'fromUserId': user_id,
            'toUserId': recipient_id,
            'message': message,
            'status': 'pending',
            'createdAt': datetime.utcnow(),
            'expiresAt': datetime.utcnow() + timedelta(days=7)
        }
        
        result = db.friend_requests.insert_one(friend_request)
        
        return jsonify({
            'message': 'Friend request sent successfully',
            'requestId': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@friends_bp.route('/requests/<request_id>/accept', methods=['POST'])
@jwt_required()
def accept_friend_request():
    try:
        user_id = get_jwt_identity()
        request_id = request.view_args['request_id']
        
        # Find the request
        friend_request = db.friend_requests.find_one({
            '_id': request_id,
            'toUserId': user_id,
            'status': 'pending'
        })
        
        if not friend_request:
            return jsonify({'error': 'Friend request not found'}), 404
        
        # Update request status
        db.friend_requests.update_one(
            {'_id': request_id},
            {'$set': {'status': 'accepted', 'respondedAt': datetime.utcnow()}}
        )
        
        # Add to friends list for both users
        db.users.update_one(
            {'_id': user_id},
            {'$addToSet': {'friends': friend_request['fromUserId']}}
        )
        
        db.users.update_one(
            {'_id': friend_request['fromUserId']},
            {'$addToSet': {'friends': user_id}}
        )
        
        return jsonify({'message': 'Friend request accepted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@friends_bp.route('/requests/<request_id>/decline', methods=['POST'])
@jwt_required()
def decline_friend_request():
    try:
        user_id = get_jwt_identity()
        request_id = request.view_args['request_id']
        
        # Update request status
        result = db.friend_requests.update_one(
            {'_id': request_id, 'toUserId': user_id},
            {'$set': {'status': 'declined', 'respondedAt': datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Friend request not found'}), 404
        
        return jsonify({'message': 'Friend request declined'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@friends_bp.route('/<friend_id>', methods=['DELETE'])
@jwt_required()
def remove_friend():
    try:
        user_id = get_jwt_identity()
        friend_id = request.view_args['friend_id']
        
        # Remove from both users' friends lists
        db.users.update_one(
            {'_id': user_id},
            {'$pull': {'friends': friend_id}}
        )
        
        db.users.update_one(
            {'_id': friend_id},
            {'$pull': {'friends': user_id}}
        )
        
        return jsonify({'message': 'Friend removed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@friends_bp.route('/<friend_id>/compare', methods=['GET'])
@jwt_required()
def compare_with_friend():
    try:
        user_id = get_jwt_identity()
        friend_id = request.view_args['friend_id']
        
        # Get both users' data
        user = db.users.find_one({'_id': user_id})
        friend = db.users.find_one({'_id': friend_id})
        
        if not user or not friend:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if they are friends
        if friend_id not in user.get('friends', []):
            return jsonify({'error': 'Not friends'}), 403
        
        comparison = {
            'friend': {
                'id': str(friend['_id']),
                'username': friend['username'],
                'displayName': friend['displayName'],
                'level': friend['level'],
                'xp': friend['xp']
            },
            'metrics': {
                'totalPL': {
                    'user': user.get('totalPL', 0),
                    'friend': friend.get('totalPL', 0),
                    'difference': user.get('totalPL', 0) - friend.get('totalPL', 0)
                },
                'winRate': {
                    'user': user.get('winRate', 0),
                    'friend': friend.get('winRate', 0),
                    'difference': user.get('winRate', 0) - friend.get('winRate', 0)
                },
                'totalTrades': {
                    'user': user.get('totalTrades', 0),
                    'friend': friend.get('totalTrades', 0),
                    'difference': user.get('totalTrades', 0) - friend.get('totalTrades', 0)
                },
                'level': {
                    'user': user.get('level', 1),
                    'friend': friend.get('level', 1),
                    'difference': user.get('level', 1) - friend.get('level', 1)
                },
                'streak': {
                    'user': user.get('streak', 0),
                    'friend': friend.get('streak', 0),
                    'difference': user.get('streak', 0) - friend.get('streak', 0)
                }
            }
        }
        
        return jsonify(comparison), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@friends_bp.route('/activities', methods=['GET'])
@jwt_required()
def get_friend_activities():
    try:
        user_id = get_jwt_identity()
        
        # Get user's friends
        user = db.users.find_one({'_id': user_id})
        friends_list = user.get('friends', [])
        
        if not friends_list:
            return jsonify({'activities': []}), 200
        
        # Get recent activities from friends
        activities = list(db.activities.find({
            'userId': {'$in': friends_list}
        }).sort('createdAt', -1).limit(50))
        
        # Format activities
        for activity in activities:
            activity['id'] = str(activity['_id'])
            del activity['_id']
        
        return jsonify({'activities': activities}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
