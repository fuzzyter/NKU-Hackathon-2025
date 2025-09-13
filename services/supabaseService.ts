import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  email?: string;
  total_exp: number;
  level: number;
  badges: Badge[];
  completed_quizzes: string[];
  learning_streak: number;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  earned_at: string;
}

export interface ExperienceLog {
  id: string;
  user_id: string;
  exp_gained: number;
  activity_type: string;
  total_exp_after: number;
  timestamp: string;
  metadata?: any;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  percentage: number;
  time_taken?: number;
  answers: any[];
  passed: boolean;
  attempt_number: number;
  completed_at: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  content_id: string;
  content_type: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent: number;
  last_accessed: string;
  completed_at?: string;
}

export interface UserStats {
  user_id: string;
  username: string;
  level: number;
  total_exp: number;
  badges_count: number;
  completed_quizzes: number;
  total_quiz_attempts: number;
  quiz_success_rate: number;
  learning_streak: number;
  total_activities: number;
  last_active: string;
}

// API Base URL - Update this to match your Flask backend
const API_BASE_URL = 'http://localhost:5001/api';

// Supabase Service Class
export class SupabaseService {
  private static instance: SupabaseService;

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // API Helper method
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `API call failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  }

  // User Profile Methods
  async createUserProfile(userData: {
    user_id?: string;
    username: string;
    email?: string;
  }): Promise<UserProfile | null> {
    try {
      const response = await this.apiCall('/user/profile', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await this.apiCall(`/user/profile/${userId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const response = await this.apiCall(`/user/${userId}/stats`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Experience Methods
  async addExperience(userId: string, expGained: number, activityType: string): Promise<boolean> {
    try {
      const response = await this.apiCall(`/user/${userId}/experience`, {
        method: 'POST',
        body: JSON.stringify({
          exp_gained: expGained,
          activity_type: activityType,
        }),
      });

      return response.success;
    } catch (error) {
      console.error('Error adding experience:', error);
      return false;
    }
  }

  // Quiz Methods
  async submitQuizAttempt(quizAttempt: {
    user_id: string;
    quiz_id: string;
    score: number;
    max_score: number;
    time_taken?: number;
    answers: any[];
    passing_score?: number;
    attempt_number?: number;
  }): Promise<{ success: boolean; data?: QuizAttempt; exp_gained?: number }> {
    try {
      const response = await this.apiCall('/quiz/attempt', {
        method: 'POST',
        body: JSON.stringify(quizAttempt),
      });

      return {
        success: response.success,
        data: response.data,
        exp_gained: response.exp_gained,
      };
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      return { success: false };
    }
  }

  async getUserQuizAttempts(userId: string, quizId?: string): Promise<QuizAttempt[]> {
    try {
      const endpoint = quizId 
        ? `/user/${userId}/quiz-attempts/${quizId}`
        : `/user/${userId}/quiz-attempts`;
        
      const response = await this.apiCall(endpoint);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting quiz attempts:', error);
      return [];
    }
  }

  // Leaderboard Methods
  async getLeaderboard(limit: number = 100): Promise<UserProfile[]> {
    try {
      const response = await this.apiCall(`/leaderboard?limit=${limit}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Badge Methods
  async awardBadge(userId: string, badgeId: string, badgeName: string): Promise<boolean> {
    try {
      const response = await this.apiCall(`/user/${userId}/badge`, {
        method: 'POST',
        body: JSON.stringify({
          badge_id: badgeId,
          badge_name: badgeName,
        }),
      });

      return response.success;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  // Direct Supabase Methods (for advanced usage)
  async directQuery(table: string, query: any): Promise<any> {
    try {
      const { data, error } = await supabase.from(table).select(query);
      
      if (error) {
        console.error('Direct query error:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Direct query failed:', error);
      return null;
    }
  }

  // Utility Methods
  calculateLevel(totalExp: number): number {
    // Level formula: level = floor(sqrt(total_exp / 100)) + 1
    return Math.floor(Math.sqrt(totalExp / 100)) + 1;
  }

  getExpForNextLevel(currentLevel: number): number {
    // Reverse of level formula: exp = (level - 1)^2 * 100
    return Math.pow(currentLevel, 2) * 100;
  }

  getExpProgress(totalExp: number, currentLevel: number): number {
    const currentLevelExp = this.getExpForNextLevel(currentLevel - 1);
    const nextLevelExp = this.getExpForNextLevel(currentLevel);
    const progressExp = totalExp - currentLevelExp;
    const neededExp = nextLevelExp - currentLevelExp;
    
    return Math.min(100, (progressExp / neededExp) * 100);
  }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance();
