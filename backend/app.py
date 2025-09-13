# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv  
import os
from supabase_client import supabase_client
import uuid

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Options Trading Education API with Supabase"

# User Profile Endpoints
@app.route('/api/user/profile', methods=['POST'])
def create_user_profile():
    """Create a new user profile"""
    try:
        user_data = request.json
        
        # Generate user_id if not provided
        if 'user_id' not in user_data:
            user_data['user_id'] = str(uuid.uuid4())
        
        result = supabase_client.create_user_profile(user_data)
        
        if result:
            return jsonify({
                "success": True,
                "message": "User profile created successfully",
                "data": result
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

@app.route('/api/user/profile/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Get user profile by user_id"""
    try:
        result = supabase_client.get_user_profile(user_id)
        
        if result:
            return jsonify({
                "success": True,
                "data": result
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

@app.route('/api/user/<user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    """Get comprehensive user statistics"""
    try:
        stats = supabase_client.get_user_stats(user_id)
        
        if stats:
            return jsonify({
                "success": True,
                "data": stats
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting user stats: {str(e)}"
        }), 500

# Experience Endpoints
@app.route('/api/user/<user_id>/experience', methods=['POST'])
def update_user_experience():
    """Update user experience points"""
    try:
        user_id = request.view_args['user_id']
        data = request.json
        
        exp_gained = data.get('exp_gained', 0)
        activity_type = data.get('activity_type', 'unknown')
        
        if exp_gained <= 0:
            return jsonify({
                "success": False,
                "message": "Experience gained must be positive"
            }), 400
        
        result = supabase_client.update_user_exp(user_id, exp_gained, activity_type)
        
        if result:
            return jsonify({
                "success": True,
                "message": "Experience updated successfully",
                "data": result
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to update experience"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating experience: {str(e)}"
        }), 500

# Quiz Endpoints
@app.route('/api/quiz/attempt', methods=['POST'])
def submit_quiz_attempt():
    """Submit a quiz attempt"""
    try:
        quiz_data = request.json
        
        # Validate required fields
        required_fields = ['user_id', 'quiz_id', 'score', 'max_score', 'answers']
        for field in required_fields:
            if field not in quiz_data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400
        
        # Calculate percentage and passed status
        quiz_data['percentage'] = (quiz_data['score'] / quiz_data['max_score']) * 100
        quiz_data['passed'] = quiz_data['percentage'] >= quiz_data.get('passing_score', 70)
        
        result = supabase_client.save_quiz_attempt(quiz_data)
        
        if result:
            # Award experience for quiz completion
            exp_gained = 50 if quiz_data['passed'] else 25  # More exp for passing
            supabase_client.update_user_exp(
                quiz_data['user_id'], 
                exp_gained, 
                'quiz_completion'
            )
            
            return jsonify({
                "success": True,
                "message": "Quiz attempt saved successfully",
                "data": result,
                "exp_gained": exp_gained
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save quiz attempt"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error saving quiz attempt: {str(e)}"
        }), 500

@app.route('/api/user/<user_id>/quiz-attempts', methods=['GET'])
def get_user_quiz_attempts(user_id):
    """Get quiz attempts for a user"""
    try:
        quiz_id = request.args.get('quiz_id')
        attempts = supabase_client.get_user_quiz_attempts(user_id, quiz_id)
        
        return jsonify({
            "success": True,
            "data": attempts
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting quiz attempts: {str(e)}"
        }), 500

@app.route('/api/user/<user_id>/quiz-attempts/<quiz_id>', methods=['GET'])
def get_specific_quiz_attempts(user_id, quiz_id):
    """Get attempts for a specific quiz"""
    try:
        attempts = supabase_client.get_user_quiz_attempts(user_id, quiz_id)
        
        return jsonify({
            "success": True,
            "data": attempts
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting quiz attempts: {str(e)}"
        }), 500

# Leaderboard Endpoints
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard data"""
    try:
        limit = request.args.get('limit', 100, type=int)
        leaderboard_data = supabase_client.get_leaderboard(limit)
        
        return jsonify({
            "success": True,
            "data": leaderboard_data
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting leaderboard: {str(e)}"
        }), 500

# Badge/Achievement Endpoints
@app.route('/api/user/<user_id>/badge', methods=['POST'])
def award_badge(user_id):
    """Award a badge to a user"""
    try:
        data = request.json
        badge_id = data.get('badge_id')
        badge_name = data.get('badge_name')
        
        if not badge_id or not badge_name:
            return jsonify({
                "success": False,
                "message": "badge_id and badge_name are required"
            }), 400
        
        success = supabase_client.award_badge(user_id, badge_id, badge_name)
        
        if success:
            # Award experience for earning badge
            supabase_client.update_user_exp(user_id, 100, 'badge_earned')
            
            return jsonify({
                "success": True,
                "message": "Badge awarded successfully"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to award badge or badge already exists"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error awarding badge: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)