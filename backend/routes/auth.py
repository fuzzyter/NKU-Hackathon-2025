from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
import bcrypt
import re
from datetime import datetime
import os

auth_bp = Blueprint('auth', __name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client.trading_simulator

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 8

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['email', 'password', 'username']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        email = data['email'].lower()
        password = data['password']
        username = data['username']
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        if not validate_password(password):
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Check if user already exists
        if db.users.find_one({'$or': [{'email': email}, {'username': username}]}):
            return jsonify({'error': 'User already exists'}), 409
        
        # Hash password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        # Create user document
        user_doc = {
            'email': email,
            'username': username,
            'password': hashed_password,
            'displayName': data.get('displayName', username),
            'level': 1,
            'xp': 0,
            'totalPL': 0,
            'totalPLPercent': 0,
            'winRate': 0,
            'totalTrades': 0,
            'streak': 0,
            'badges': [],
            'portfolio': {
                'totalValue': 10000,  # Starting balance
                'cashBalance': 10000,
                'positions': []
            },
            'createdAt': datetime.utcnow(),
            'lastActive': datetime.utcnow(),
            'isActive': True
        }
        
        # Insert user
        result = db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Create access token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': {
                'id': user_id,
                'email': email,
                'username': username,
                'displayName': user_doc['displayName'],
                'level': user_doc['level'],
                'xp': user_doc['xp']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not all(key in data for key in ['email', 'password']):
            return jsonify({'error': 'Email and password required'}), 400
        
        email = data['email'].lower()
        password = data['password']
        
        # Find user
        user = db.users.find_one({'email': email, 'isActive': True})
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Update last active
        db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'lastActive': datetime.utcnow()}}
        )
        
        # Create access token
        access_token = create_access_token(identity=str(user['_id']))
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'username': user['username'],
                'displayName': user['displayName'],
                'level': user['level'],
                'xp': user['xp']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        
        user = db.users.find_one({'_id': user_id}, {'password': 0})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user['id'] = str(user['_id'])
        del user['_id']
        
        return jsonify({'user': user}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Fields that can be updated
        allowed_fields = ['displayName', 'avatar']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        update_data['updatedAt'] = datetime.utcnow()
        
        result = db.users.update_one(
            {'_id': user_id},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'No changes made'}), 400
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # In a real app, you might want to blacklist the token
    return jsonify({'message': 'Logged out successfully'}), 200
