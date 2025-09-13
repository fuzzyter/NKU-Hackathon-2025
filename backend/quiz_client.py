from supabase import create_client, Client
from dotenv import load_dotenv
import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

load_dotenv()

class QuizSupabaseClient:
    def __init__(self):
        url: str = os.getenv("SUPABASE_URL")
        key: str = os.getenv("SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")
        
        self.supabase: Client = create_client(url, key)
    
    # Quiz Methods
    def get_all_quizzes(self, difficulty: Optional[str] = None) -> List[Dict]:
        """Get all quizzes, optionally filtered by difficulty"""
        try:
            query = self.supabase.table('quizzes').select('*')
            
            if difficulty:
                query = query.eq('difficulty', difficulty)
            
            result = query.order('id').execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting quizzes: {e}")
            return []
    
    def get_quiz_by_id(self, quiz_id: int) -> Optional[Dict]:
        """Get a specific quiz by ID"""
        try:
            result = self.supabase.table('quizzes').select('*').eq('id', quiz_id).single().execute()
            return result.data
        except Exception as e:
            print(f"Error getting quiz {quiz_id}: {e}")
            return None
    
    def create_quiz(self, question: str, choices: List[str], correct_choice: int, 
                   xp_reward: int, difficulty: str) -> Optional[Dict]:
        """Create a new quiz"""
        try:
            result = self.supabase.table('quizzes').insert({
                'question': question,
                'choices': choices,
                'correct_choice': correct_choice,
                'xp_reward': xp_reward,
                'difficulty': difficulty
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating quiz: {e}")
            return None
    
    # User Profile Methods
    def create_user_profile(self, user_id: str, username: str) -> Optional[Dict]:
        """Create a new user profile"""
        try:
            # Convert string user_id to UUID if needed
            if isinstance(user_id, str) and len(user_id) != 36:
                user_id = str(uuid.uuid4())
            
            result = self.supabase.table('users_profile').insert({
                'id': user_id,
                'username': username,
                'level': 1,
                'total_xp': 0,
                'balance': 0
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating user profile: {e}")
            return None
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile by user_id"""
        try:
            result = self.supabase.table('users_profile').select('*').eq('id', user_id).single().execute()
            return result.data
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    def update_user_xp(self, user_id: str, xp_to_add: int) -> Optional[Dict]:
        """Add XP to user and update level automatically"""
        try:
            # Get current user data
            user = self.get_user_profile(user_id)
            if not user:
                return None
            
            new_total_xp = user['total_xp'] + xp_to_add
            
            # Update user profile (level will be updated automatically by trigger)
            result = self.supabase.table('users_profile').update({
                'total_xp': new_total_xp
            }).eq('id', user_id).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error updating user XP: {e}")
            return None
    
    def update_user_balance(self, user_id: str, amount: int) -> Optional[Dict]:
        """Update user balance (can be positive or negative)"""
        try:
            user = self.get_user_profile(user_id)
            if not user:
                return None
            
            new_balance = max(0, user['balance'] + amount)  # Prevent negative balance
            
            result = self.supabase.table('users_profile').update({
                'balance': new_balance
            }).eq('id', user_id).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error updating user balance: {e}")
            return None
    
    # Quiz Progress Methods
    def submit_quiz_answer(self, user_id: str, quiz_id: int, selected_choice: int) -> Dict:
        """Submit a quiz answer and update progress"""
        try:
            # Get the quiz to check correct answer
            quiz = self.get_quiz_by_id(quiz_id)
            if not quiz:
                return {"success": False, "message": "Quiz not found"}
            
            is_correct = selected_choice == quiz['correct_choice']
            score = 1 if is_correct else 0
            xp_earned = quiz['xp_reward'] if is_correct else 0
            
            # Get existing progress
            existing_progress = self.supabase.table('user_quiz_progress').select('*').eq('user_id', user_id).eq('quiz_id', quiz_id).execute()
            
            if existing_progress.data:
                # Update existing progress
                progress = existing_progress.data[0]
                new_attempts = progress['attempts'] + 1
                new_best_score = max(progress['best_score'], score)
                new_earned_xp = progress['earned_xp']
                
                # Only add XP if this is the first correct answer
                if is_correct and progress['best_score'] == 0:
                    new_earned_xp += xp_earned
                    # Update user's total XP
                    self.update_user_xp(user_id, xp_earned)
                
                result = self.supabase.table('user_quiz_progress').update({
                    'attempts': new_attempts,
                    'best_score': new_best_score,
                    'earned_xp': new_earned_xp,
                    'last_attempted': datetime.now().isoformat()
                }).eq('id', progress['id']).execute()
                
            else:
                # Create new progress record
                if is_correct:
                    # Update user's total XP
                    self.update_user_xp(user_id, xp_earned)
                
                result = self.supabase.table('user_quiz_progress').insert({
                    'user_id': user_id,
                    'quiz_id': quiz_id,
                    'attempts': 1,
                    'best_score': score,
                    'earned_xp': xp_earned,
                    'last_attempted': datetime.now().isoformat()
                }).execute()
            
            return {
                "success": True,
                "correct": is_correct,
                "correct_choice": quiz['correct_choice'],
                "xp_earned": xp_earned if (not existing_progress.data or existing_progress.data[0]['best_score'] == 0) else 0,
                "explanation": f"The correct answer is: {quiz['choices'][quiz['correct_choice']]}"
            }
            
        except Exception as e:
            print(f"Error submitting quiz answer: {e}")
            return {"success": False, "message": str(e)}
    
    def get_user_quiz_progress(self, user_id: str) -> List[Dict]:
        """Get all quiz progress for a user"""
        try:
            result = self.supabase.table('user_quiz_progress').select(
                '*, quizzes(question, difficulty, xp_reward)'
            ).eq('user_id', user_id).order('last_attempted', desc=True).execute()
            
            return result.data or []
        except Exception as e:
            print(f"Error getting user quiz progress: {e}")
            return []
    
    def get_quiz_progress(self, user_id: str, quiz_id: int) -> Optional[Dict]:
        """Get progress for a specific quiz"""
        try:
            result = self.supabase.table('user_quiz_progress').select('*').eq('user_id', user_id).eq('quiz_id', quiz_id).single().execute()
            return result.data
        except Exception as e:
            print(f"Error getting quiz progress: {e}")
            return None
    
    # Leaderboard and Statistics
    def get_leaderboard(self, limit: int = 50) -> List[Dict]:
        """Get leaderboard data"""
        try:
            result = self.supabase.table('leaderboard').select('*').limit(limit).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting leaderboard: {e}")
            return []
    
    def get_user_stats(self, user_id: str) -> Optional[Dict]:
        """Get comprehensive user statistics"""
        try:
            result = self.supabase.table('user_progress_summary').select('*').eq('id', user_id).single().execute()
            return result.data
        except Exception as e:
            print(f"Error getting user stats: {e}")
            return None
    
    def get_quiz_statistics(self) -> List[Dict]:
        """Get statistics for all quizzes"""
        try:
            result = self.supabase.table('quiz_statistics').select('*').execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting quiz statistics: {e}")
            return []

# Global instance
quiz_client = QuizSupabaseClient()
