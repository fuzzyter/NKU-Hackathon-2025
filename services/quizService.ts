// Quiz Service for Trading Quiz App
export interface Quiz {
  id: number;
  question: string;
  choices: string[];
  correct_choice: number;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  total_xp: number;
  balance: number;
  created_at: string;
}

export interface QuizProgress {
  id: number;
  user_id: string;
  quiz_id: number;
  attempts: number;
  best_score: number;
  earned_xp: number;
  last_attempted: string;
  quizzes?: {
    question: string;
    difficulty: string;
    xp_reward: number;
  };
}

export interface QuizAnswerResult {
  success: boolean;
  correct: boolean;
  correct_choice: number;
  xp_earned: number;
  explanation: string;
  message?: string;
}

export interface UserStats {
  id: string;
  username: string;
  level: number;
  total_xp: number;
  balance: number;
  quizzes_attempted: number;
  quizzes_completed: number;
  xp_from_quizzes: number;
  avg_score: number;
  last_quiz_attempt: string;
}

export interface LeaderboardEntry {
  username: string;
  level: number;
  total_xp: number;
  balance: number;
  created_at: string;
  rank: number;
}

export interface QuizStatistics {
  id: number;
  question: string;
  difficulty: string;
  xp_reward: number;
  total_attempts: number;
  successful_attempts: number;
  success_rate: number;
  avg_attempts_per_user: number;
}

// API Base URL - Update this to match your Flask backend
const API_BASE_URL = 'http://localhost:5002/api';

export class QuizService {
  private static instance: QuizService;

  public static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
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

  // Quiz Methods
  async getAllQuizzes(difficulty?: 'easy' | 'medium' | 'hard'): Promise<Quiz[]> {
    try {
      const queryParam = difficulty ? `?difficulty=${difficulty}` : '';
      const response = await this.apiCall(`/quizzes${queryParam}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting quizzes:', error);
      return [];
    }
  }

  async getQuizById(quizId: number): Promise<Quiz | null> {
    try {
      const response = await this.apiCall(`/quizzes/${quizId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting quiz:', error);
      return null;
    }
  }

  async createQuiz(quiz: {
    question: string;
    choices: string[];
    correct_choice: number;
    xp_reward: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }): Promise<Quiz | null> {
    try {
      const response = await this.apiCall('/quizzes', {
        method: 'POST',
        body: JSON.stringify(quiz),
      });
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error creating quiz:', error);
      return null;
    }
  }

  // User Profile Methods
  async createUserProfile(username: string, userId?: string): Promise<UserProfile | null> {
    try {
      const response = await this.apiCall('/users/profile', {
        method: 'POST',
        body: JSON.stringify({ username, user_id: userId }),
      });
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await this.apiCall(`/users/${userId}/profile`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const response = await this.apiCall(`/users/${userId}/stats`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Quiz Interaction Methods
  async submitQuizAnswer(userId: string, quizId: number, selectedChoice: number): Promise<QuizAnswerResult> {
    try {
      const response = await this.apiCall(`/users/${userId}/quiz/${quizId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ selected_choice: selectedChoice }),
      });
      return response;
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      return {
        success: false,
        correct: false,
        correct_choice: -1,
        xp_earned: 0,
        explanation: '',
        message: 'Failed to submit answer',
      };
    }
  }

  async getUserQuizProgress(userId: string): Promise<QuizProgress[]> {
    try {
      const response = await this.apiCall(`/users/${userId}/quiz-progress`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting user quiz progress:', error);
      return [];
    }
  }

  async getQuizProgress(userId: string, quizId: number): Promise<QuizProgress | null> {
    try {
      const response = await this.apiCall(`/users/${userId}/quiz/${quizId}/progress`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error getting quiz progress:', error);
      return null;
    }
  }

  // Balance Management
  async updateUserBalance(userId: string, amount: number): Promise<UserProfile | null> {
    try {
      const response = await this.apiCall(`/users/${userId}/balance`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error updating user balance:', error);
      return null;
    }
  }

  // Leaderboard and Statistics
  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      const response = await this.apiCall(`/leaderboard?limit=${limit}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getQuizStatistics(): Promise<QuizStatistics[]> {
    try {
      const response = await this.apiCall('/quiz-statistics');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting quiz statistics:', error);
      return [];
    }
  }

  // Utility Methods
  calculateLevel(totalXp: number): number {
    // Level formula: level = floor(xp / 100) + 1
    return Math.max(1, Math.floor(totalXp / 100) + 1);
  }

  getXpForNextLevel(currentLevel: number): number {
    // XP needed for next level: (level - 1) * 100
    return currentLevel * 100;
  }

  getXpProgress(totalXp: number, currentLevel: number): number {
    const currentLevelXp = (currentLevel - 1) * 100;
    const nextLevelXp = currentLevel * 100;
    const progressXp = totalXp - currentLevelXp;
    const neededXp = nextLevelXp - currentLevelXp;
    
    return Math.min(100, (progressXp / neededXp) * 100);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  }

  getDifficultyIcon(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  }
}

// Export singleton instance
export const quizService = QuizService.getInstance();
