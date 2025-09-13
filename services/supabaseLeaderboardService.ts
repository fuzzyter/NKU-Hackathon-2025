import { supabase } from '../lib/supabase'

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar?: string;
  totalPL: number;
  totalPLPercent: number;
  winRate: number;
  totalTrades: number;
  rank: number;
  level: number;
  xp: number;
  badges: string[];
  streak: number;
  joinDate: string;
  lastActive: string;
}

interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  sortBy: 'totalPL' | 'winRate' | 'totalTrades' | 'streak' | 'xp';
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'allTime';
}

interface UserStats {
  totalPL: number;
  totalPLPercent: number;
  winRate: number;
  totalTrades: number;
  averageTrade: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  xp: number;
  rank: number;
  percentile: number;
}

export class SupabaseLeaderboardService {
  private static instance: SupabaseLeaderboardService;

  static getInstance(): SupabaseLeaderboardService {
    if (!SupabaseLeaderboardService.instance) {
      SupabaseLeaderboardService.instance = new SupabaseLeaderboardService();
    }
    return SupabaseLeaderboardService.instance;
  }

  // 사용자 데이터를 Supabase에서 가져오기
  async getLeaderboard(categoryId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('total_pl', { ascending: false })
        .limit(limit);

      // 카테고리에 따른 정렬
      switch (categoryId) {
        case 'total_profit':
          query = query.order('total_pl', { ascending: false });
          break;
        case 'win_rate':
          query = query.order('win_rate', { ascending: false });
          break;
        case 'most_trades':
          query = query.order('total_trades', { ascending: false });
          break;
        case 'streak':
          query = query.order('current_streak', { ascending: false });
          break;
        case 'xp':
          query = query.order('xp', { ascending: false });
          break;
        default:
          query = query.order('total_pl', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // 데이터를 LeaderboardEntry 형식으로 변환
      return data?.map((user, index) => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar_url,
        totalPL: user.total_pl || 0,
        totalPLPercent: user.total_pl_percent || 0,
        winRate: user.win_rate || 0,
        totalTrades: user.total_trades || 0,
        rank: index + 1,
        level: user.level || 1,
        xp: user.xp || 0,
        badges: user.badges || [],
        streak: user.current_streak || 0,
        joinDate: user.created_at,
        lastActive: user.last_active || user.updated_at
      })) || [];

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // 에러 발생 시 빈 배열 반환
      return [];
    }
  }

  // 사용자 통계 가져오기
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('Error fetching user stats:', error);
        return null;
      }

      // 전체 사용자 수와 순위 계산
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { data: rankData } = await supabase
        .from('users')
        .select('id')
        .order('total_pl', { ascending: false });

      const rank = rankData?.findIndex(u => u.id === userId) + 1 || 1;
      const percentile = totalUsers ? Math.round(((totalUsers - rank + 1) / totalUsers) * 100) : 0;

      return {
        totalPL: user.total_pl || 0,
        totalPLPercent: user.total_pl_percent || 0,
        winRate: user.win_rate || 0,
        totalTrades: user.total_trades || 0,
        averageTrade: user.total_trades > 0 ? (user.total_pl || 0) / user.total_trades : 0,
        bestTrade: user.best_trade || 0,
        worstTrade: user.worst_trade || 0,
        currentStreak: user.current_streak || 0,
        longestStreak: user.longest_streak || 0,
        level: user.level || 1,
        xp: user.xp || 0,
        rank,
        percentile
      };

    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  // 사용자 생성 또는 업데이트
  async upsertUser(userData: Partial<LeaderboardEntry>): Promise<LeaderboardEntry | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userData.id,
          username: userData.username,
          avatar_url: userData.avatar,
          total_pl: userData.totalPL,
          total_pl_percent: userData.totalPLPercent,
          win_rate: userData.winRate,
          total_trades: userData.totalTrades,
          level: userData.level,
          xp: userData.xp,
          badges: userData.badges,
          current_streak: userData.streak,
          last_active: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting user:', error);
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        avatar: data.avatar_url,
        totalPL: data.total_pl,
        totalPLPercent: data.total_pl_percent,
        winRate: data.win_rate,
        totalTrades: data.total_trades,
        rank: 0, // 순위는 별도로 계산
        level: data.level,
        xp: data.xp,
        badges: data.badges,
        streak: data.current_streak,
        joinDate: data.created_at,
        lastActive: data.last_active
      };

    } catch (error) {
      console.error('Error upserting user:', error);
      return null;
    }
  }

  // 사용자 검색
  async searchUsers(query: string): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(20);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data?.map(user => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar_url,
        totalPL: user.total_pl || 0,
        totalPLPercent: user.total_pl_percent || 0,
        winRate: user.win_rate || 0,
        totalTrades: user.total_trades || 0,
        rank: 0,
        level: user.level || 1,
        xp: user.xp || 0,
        badges: user.badges || [],
        streak: user.current_streak || 0,
        joinDate: user.created_at,
        lastActive: user.last_active || user.updated_at
      })) || [];

    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // 최근 활동 가져오기
  async getRecentActivity(limit: number = 20): Promise<Array<{
    id: string;
    username: string;
    action: string;
    timestamp: string;
    details: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          id,
          action,
          details,
          created_at,
          users!inner(username)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }

      return data?.map(activity => ({
        id: activity.id,
        username: activity.users.username,
        action: activity.action,
        timestamp: activity.created_at,
        details: activity.details
      })) || [];

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // 활동 기록 추가
  async addActivity(userId: string, action: string, details: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          action,
          details
        });

      if (error) {
        console.error('Error adding activity:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error adding activity:', error);
      return false;
    }
  }
}

export const supabaseLeaderboardService = SupabaseLeaderboardService.getInstance();
