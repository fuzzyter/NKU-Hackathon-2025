import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
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

// Supabase Service Class
export class SupabaseService {
  private static instance: SupabaseService;

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // User Profile Methods
  async createUserProfile(userData: {
    user_id: string;
    username: string;
    email?: string;
  }): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userData.user_id,
          username: userData.username,
          email: userData.email,
          total_exp: 0,
          level: 1,
          badges: [],
          completed_quizzes: [],
          learning_streak: 0,
          last_active: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  // Experience Methods
  async addExperience(userId: string, expGained: number, activityType: string, metadata?: any): Promise<boolean> {
    try {
      // Get current user profile
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return false;

      const newTotalExp = userProfile.total_exp + expGained;
      const newLevel = this.calculateLevel(newTotalExp);

      // Start a transaction
      const { error: logError } = await supabase
        .from('experience_logs')
        .insert({
          user_id: userId,
          exp_gained: expGained,
          activity_type: activityType,
          total_exp_after: newTotalExp,
          timestamp: new Date().toISOString(),
          metadata: metadata || {},
        });

      if (logError) {
        console.error('Error logging experience:', logError);
        return false;
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          total_exp: newTotalExp,
          level: newLevel,
          last_active: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user exp:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding experience:', error);
      return false;
    }
  }

  calculateLevel(totalExp: number): number {
    // Level formula: level = floor(sqrt(total_exp / 100)) + 1
    return Math.floor(Math.sqrt(totalExp / 100)) + 1;
  }

  // Quiz Methods
  async saveQuizAttempt(quizAttempt: {
    user_id: string;
    quiz_id: string;
    score: number;
    max_score: number;
    time_taken?: number;
    answers: any[];
    passing_score?: number;
    attempt_number?: number;
  }): Promise<QuizAttempt | null> {
    try {
      const percentage = (quizAttempt.score / quizAttempt.max_score) * 100;
      const passed = percentage >= (quizAttempt.passing_score || 70);

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: quizAttempt.user_id,
          quiz_id: quizAttempt.quiz_id,
          score: quizAttempt.score,
          max_score: quizAttempt.max_score,
          percentage,
          time_taken: quizAttempt.time_taken,
          answers: quizAttempt.answers,
          passed,
          attempt_number: quizAttempt.attempt_number || 1,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving quiz attempt:', error);
        return null;
      }

      // If passed, update user's completed quizzes
      if (passed) {
        await this.updateCompletedQuizzes(quizAttempt.user_id, quizAttempt.quiz_id);
        // Award experience
        await this.addExperience(quizAttempt.user_id, 50, 'quiz_completion', { quiz_id: quizAttempt.quiz_id });
      } else {
        // Award smaller experience for attempt
        await this.addExperience(quizAttempt.user_id, 25, 'quiz_attempt', { quiz_id: quizAttempt.quiz_id });
      }

      return data;
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      return null;
    }
  }

  async updateCompletedQuizzes(userId: string, quizId: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return false;

      const completedQuizzes = userProfile.completed_quizzes || [];
      if (!completedQuizzes.includes(quizId)) {
        completedQuizzes.push(quizId);

        const { error } = await supabase
          .from('user_profiles')
          .update({ completed_quizzes: completedQuizzes })
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating completed quizzes:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating completed quizzes:', error);
      return false;
    }
  }

  async getUserQuizAttempts(userId: string, quizId?: string): Promise<QuizAttempt[]> {
    try {
      let query = supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (quizId) {
        query = query.eq('quiz_id', quizId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting quiz attempts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting quiz attempts:', error);
      return [];
    }
  }

  // Leaderboard Methods
  async getLeaderboard(limit: number = 100): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, total_exp, level, badges, learning_streak')
        .order('total_exp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Badge Methods
  async awardBadge(userId: string, badgeId: string, badgeName: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return false;

      const badges = userProfile.badges || [];
      const badgeExists = badges.some(badge => badge.id === badgeId);

      if (!badgeExists) {
        badges.push({
          id: badgeId,
          name: badgeName,
          earned_at: new Date().toISOString(),
        });

        const { error } = await supabase
          .from('user_profiles')
          .update({ badges })
          .eq('user_id', userId);

        if (error) {
          console.error('Error awarding badge:', error);
          return false;
        }

        // Award experience for earning badge
        await this.addExperience(userId, 100, 'badge_earned', { badge_id: badgeId });
      }

      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  // Stats Methods
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return null;

      const quizAttempts = await this.getUserQuizAttempts(userId);
      const totalQuizzes = new Set(quizAttempts.map(attempt => attempt.quiz_id)).size;
      const passedQuizzes = userProfile.completed_quizzes?.length || 0;

      const { data: expLogs } = await supabase
        .from('experience_logs')
        .select('id')
        .eq('user_id', userId);

      const totalActivities = expLogs?.length || 0;

      return {
        user_id: userId,
        username: userProfile.username,
        level: userProfile.level,
        total_exp: userProfile.total_exp,
        badges_count: userProfile.badges?.length || 0,
        completed_quizzes: passedQuizzes,
        total_quiz_attempts: quizAttempts.length,
        quiz_success_rate: totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0,
        learning_streak: userProfile.learning_streak,
        total_activities: totalActivities,
        last_active: userProfile.last_active,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Learning Progress Methods
  async updateLearningProgress(
    userId: string,
    contentId: string,
    contentType: string,
    status: 'not_started' | 'in_progress' | 'completed',
    progressPercentage: number = 0,
    timeSpent: number = 0
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: userId,
          content_id: contentId,
          content_type: contentType,
          status,
          progress_percentage: progressPercentage,
          time_spent: timeSpent,
          last_accessed: new Date().toISOString(),
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .select();

      if (error) {
        console.error('Error updating learning progress:', error);
        return false;
      }

      // Award experience for completing content
      if (status === 'completed') {
        const expAmount = contentType === 'video' ? 30 : contentType === 'quiz' ? 50 : 20;
        await this.addExperience(userId, expAmount, `${contentType}_completed`, { content_id: contentId });
      }

      return true;
    } catch (error) {
      console.error('Error updating learning progress:', error);
      return false;
    }
  }

  async getLearningProgress(userId: string): Promise<LearningProgress[]> {
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

      if (error) {
        console.error('Error getting learning progress:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting learning progress:', error);
      return [];
    }
  }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance();
