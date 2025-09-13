# quiz_app.py - Flask app for Trading Quiz functionality
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv  
import os
from quiz_client import quiz_client
import uuid

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Trading Quiz API with Supabase"

# Quiz Endpoints
@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    """Get all quizzes, optionally filtered by difficulty"""
    try:
        difficulty = request.args.get('difficulty')
        quizzes = quiz_client.get_all_quizzes(difficulty)
        
        return jsonify({
            "success": True,
            "data": quizzes
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting quizzes: {str(e)}"
        }), 500

@app.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    """Get a specific quiz by ID"""
    try:
        quiz = quiz_client.get_quiz_by_id(quiz_id)
        
        if quiz:
            return jsonify({
                "success": True,
                "data": quiz
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Quiz not found"
            }), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting quiz: {str(e)}"
        }), 500

@app.route('/api/quizzes', methods=['POST'])
def create_quiz():
    """Create a new quiz (admin only)"""
    try:
        data = request.json
        
        required_fields = ['question', 'choices', 'correct_choice', 'xp_reward', 'difficulty']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400
        
        # Validate choices is a list
        if not isinstance(data['choices'], list) or len(data['choices']) < 2:
            return jsonify({
                "success": False,
                "message": "Choices must be a list with at least 2 options"
            }), 400
        
        # Validate correct_choice is within range
        if not (0 <= data['correct_choice'] < len(data['choices'])):
            return jsonify({
                "success": False,
                "message": "correct_choice must be a valid index for the choices array"
            }), 400
        
        # Validate difficulty
        if data['difficulty'] not in ['easy', 'medium', 'hard']:
            return jsonify({
                "success": False,
                "message": "difficulty must be 'easy', 'medium', or 'hard'"
            }), 400
        
        quiz = quiz_client.create_quiz(
            question=data['question'],
            choices=data['choices'],
            correct_choice=data['correct_choice'],
            xp_reward=data['xp_reward'],
            difficulty=data['difficulty']
        )
        
        if quiz:
            return jsonify({
                "success": True,
                "message": "Quiz created successfully",
                "data": quiz
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to create quiz"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating quiz: {str(e)}"
        }), 500

# User Profile Endpoints
@app.route('/api/users/profile', methods=['POST'])
def create_user_profile():
    """Create a new user profile"""
    try:
        data = request.json
        
        if 'username' not in data:
            return jsonify({
                "success": False,
                "message": "Username is required"
            }), 400
        
        # Generate user_id if not provided
        user_id = data.get('user_id', str(uuid.uuid4()))
        
        profile = quiz_client.create_user_profile(user_id, data['username'])
        
        if profile:
            return jsonify({
                "success": True,
                "message": "User profile created successfully",
                "data": profile
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to create user profile"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating user profile: {str(e)}"
        }), 500

@app.route('/api/users/<user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    """Get user profile"""
    try:
        profile = quiz_client.get_user_profile(user_id)
        
        if profile:
            return jsonify({
                "success": True,
                "data": profile
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "User profile not found"
            }), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting user profile: {str(e)}"
        }), 500

@app.route('/api/users/<user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    """Get user statistics"""
    try:
        stats = quiz_client.get_user_stats(user_id)
        
        if stats:
            return jsonify({
                "success": True,
                "data": stats
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "User statistics not found"
            }), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting user stats: {str(e)}"
        }), 500

# Quiz Interaction Endpoints
@app.route('/api/users/<user_id>/quiz/<int:quiz_id>/answer', methods=['POST'])
def submit_quiz_answer(user_id, quiz_id):
    """Submit an answer to a quiz"""
    try:
        data = request.json
        
        if 'selected_choice' not in data:
            return jsonify({
                "success": False,
                "message": "selected_choice is required"
            }), 400
        
        result = quiz_client.submit_quiz_answer(user_id, quiz_id, data['selected_choice'])
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error submitting quiz answer: {str(e)}"
        }), 500

@app.route('/api/users/<user_id>/quiz-progress', methods=['GET'])
def get_user_quiz_progress(user_id):
    """Get all quiz progress for a user"""
    try:
        progress = quiz_client.get_user_quiz_progress(user_id)
        
        return jsonify({
            "success": True,
            "data": progress
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting quiz progress: {str(e)}"
        }), 500

@app.route('/api/users/<user_id>/quiz/<int:quiz_id>/progress', methods=['GET'])
def get_quiz_progress(user_id, quiz_id):
    """Get progress for a specific quiz"""
    try:
        progress = quiz_client.get_quiz_progress(user_id, quiz_id)
        
        if progress:
            return jsonify({
                "success": True,
                "data": progress
            }), 200
        else:
            return jsonify({
                "success": True,
                "data": None,
                "message": "No progress found for this quiz"
            }), 200
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting quiz progress: {str(e)}"
        }), 500

# Balance Management
@app.route('/api/users/<user_id>/balance', methods=['POST'])
def update_user_balance(user_id):
    """Update user balance"""
    try:
        data = request.json
        
        if 'amount' not in data:
            return jsonify({
                "success": False,
                "message": "amount is required"
            }), 400
        
        result = quiz_client.update_user_balance(user_id, data['amount'])
        
        if result:
            return jsonify({
                "success": True,
                "message": "Balance updated successfully",
                "data": result
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to update balance"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating balance: {str(e)}"
        }), 500

# Leaderboard and Statistics
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard"""
    try:
        limit = request.args.get('limit', 50, type=int)
        leaderboard = quiz_client.get_leaderboard(limit)
        
        return jsonify({
            "success": True,
            "data": leaderboard
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting leaderboard: {str(e)}"
        }), 500

@app.route('/api/quiz-statistics', methods=['GET'])
def get_quiz_statistics():
    """Get quiz statistics"""
    try:
        stats = quiz_client.get_quiz_statistics()
        
        return jsonify({
            "success": True,
            "data": stats
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting quiz statistics: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
