from supabase import create_client, Client
from dotenv import load_dotenv
import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime

load_dotenv()

class SupabaseClient:
    def __init__(self):
        url: str = os.getenv("SUPABASE_URL")
        key: str = os.getenv("SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")
        
        self.supabase: Client = create_client(url, key)
    
    # User Experience Data Methods
    def create_user_profile(self, user_data: Dict) -> Dict:
        """Create a new user profile with initial experience data"""
        try:
            result = self.supabase.table('user_profiles').insert({
                'user_id': user_data.get('user_id'),
                'username': user_data.get('username'),
                'email': user_data.get('email'),
                'total_exp': 0,
                'level': 1,
                'badges': [],
                'completed_quizzes': [],
                'learning_streak': 0,
                'last_active': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat()
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating user profile: {e}")
            return None
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile by user_id"""
        try:
            result = self.supabase.table('user_profiles').select('*').eq('user_id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    def update_user_exp(self, user_id: str, exp_gained: int, activity_type: str) -> Dict:
        """Update user experience points and level"""
        try:
            # Get current user data
            user = self.get_user_profile(user_id)
            if not user:
                return None
            
            new_total_exp = user['total_exp'] + exp_gained
            new_level = self.calculate_level(new_total_exp)
            
            # Record the experience gain
            self.supabase.table('experience_logs').insert({
                'user_id': user_id,
                'exp_gained': exp_gained,
                'activity_type': activity_type,
                'timestamp': datetime.now().isoformat(),
                'total_exp_after': new_total_exp
            }).execute()
            
            # Update user profile
            result = self.supabase.table('user_profiles').update({
                'total_exp': new_total_exp,
                'level': new_level,
                'last_active': datetime.now().isoformat()
            }).eq('user_id', user_id).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error updating user exp: {e}")
            return None
    
    def calculate_level(self, total_exp: int) -> int:
        """Calculate user level based on total experience"""
        # Level formula: level = floor(sqrt(total_exp / 100)) + 1
        import math
        return math.floor(math.sqrt(total_exp / 100)) + 1
    
    # Quiz Data Methods
    def save_quiz_attempt(self, quiz_attempt_data: Dict) -> Dict:
        """Save a quiz attempt"""
        try:
            result = self.supabase.table('quiz_attempts').insert({
                'user_id': quiz_attempt_data.get('user_id'),
                'quiz_id': quiz_attempt_data.get('quiz_id'),
                'score': quiz_attempt_data.get('score'),
                'max_score': quiz_attempt_data.get('max_score'),
                'percentage': quiz_attempt_data.get('percentage'),
                'time_taken': quiz_attempt_data.get('time_taken'),
                'answers': json.dumps(quiz_attempt_data.get('answers', [])),
                'passed': quiz_attempt_data.get('passed', False),
                'attempt_number': quiz_attempt_data.get('attempt_number', 1),
                'completed_at': datetime.now().isoformat()
            }).execute()
            
            # Update user's completed quizzes if passed
            if quiz_attempt_data.get('passed', False):
                self.update_user_quiz_completion(
                    quiz_attempt_data.get('user_id'),
                    quiz_attempt_data.get('quiz_id')
                )
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error saving quiz attempt: {e}")
            return None
    
    def update_user_quiz_completion(self, user_id: str, quiz_id: str):
        """Update user's completed quizzes list"""
        try:
            user = self.get_user_profile(user_id)
            if user:
                completed_quizzes = user.get('completed_quizzes', [])
                if quiz_id not in completed_quizzes:
                    completed_quizzes.append(quiz_id)
                    
                    self.supabase.table('user_profiles').update({
                        'completed_quizzes': completed_quizzes
                    }).eq('user_id', user_id).execute()
        except Exception as e:
            print(f"Error updating quiz completion: {e}")
    
    def get_user_quiz_attempts(self, user_id: str, quiz_id: str = None) -> List[Dict]:
        """Get quiz attempts for a user"""
        try:
            query = self.supabase.table('quiz_attempts').select('*').eq('user_id', user_id)
            if quiz_id:
                query = query.eq('quiz_id', quiz_id)
            
            result = query.order('completed_at', desc=True).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting quiz attempts: {e}")
            return []
    
    def get_leaderboard(self, limit: int = 100) -> List[Dict]:
        """Get leaderboard data"""
        try:
            result = self.supabase.table('user_profiles').select(
                'user_id, username, total_exp, level, badges, learning_streak'
            ).order('total_exp', desc=True).limit(limit).execute()
            
            return result.data or []
        except Exception as e:
            print(f"Error getting leaderboard: {e}")
            return []
    
    def award_badge(self, user_id: str, badge_id: str, badge_name: str) -> bool:
        """Award a badge to a user"""
        try:
            user = self.get_user_profile(user_id)
            if user:
                badges = user.get('badges', [])
                badge_data = {
                    'id': badge_id,
                    'name': badge_name,
                    'earned_at': datetime.now().isoformat()
                }
                
                # Check if badge already exists
                if not any(badge['id'] == badge_id for badge in badges):
                    badges.append(badge_data)
                    
                    self.supabase.table('user_profiles').update({
                        'badges': badges
                    }).eq('user_id', user_id).execute()
                    
                    return True
            return False
        except Exception as e:
            print(f"Error awarding badge: {e}")
            return False
    
    def get_user_stats(self, user_id: str) -> Dict:
        """Get comprehensive user statistics"""
        try:
            user = self.get_user_profile(user_id)
            if not user:
                return None
            
            # Get quiz statistics
            quiz_attempts = self.get_user_quiz_attempts(user_id)
            total_quizzes = len(set(attempt['quiz_id'] for attempt in quiz_attempts))
            passed_quizzes = len(user.get('completed_quizzes', []))
            
            # Get experience logs for activity
            exp_logs = self.supabase.table('experience_logs').select('*').eq('user_id', user_id).execute()
            total_activities = len(exp_logs.data) if exp_logs.data else 0
            
            return {
                'user_id': user_id,
                'username': user['username'],
                'level': user['level'],
                'total_exp': user['total_exp'],
                'badges_count': len(user.get('badges', [])),
                'completed_quizzes': passed_quizzes,
                'total_quiz_attempts': len(quiz_attempts),
                'quiz_success_rate': (passed_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0,
                'learning_streak': user.get('learning_streak', 0),
                'total_activities': total_activities,
                'last_active': user['last_active']
            }
        except Exception as e:
            print(f"Error getting user stats: {e}")
            return None

# Global instance
supabase_client = SupabaseClient()
