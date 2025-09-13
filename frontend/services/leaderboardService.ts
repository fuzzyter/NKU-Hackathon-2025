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

const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  {
    id: 'total_profit',
    name: 'Total Profit',
    description: 'Highest total profit/loss',
    sortBy: 'totalPL',
    timeFrame: 'allTime'
  },
  {
    id: 'win_rate',
    name: 'Win Rate',
    description: 'Highest percentage of winning trades',
    sortBy: 'winRate',
    timeFrame: 'allTime'
  },
  {
    id: 'most_trades',
    name: 'Most Active',
    description: 'Most trades completed',
    sortBy: 'totalTrades',
    timeFrame: 'allTime'
  },
  {
    id: 'streak',
    name: 'Current Streak',
    description: 'Longest current winning streak',
    sortBy: 'streak',
    timeFrame: 'allTime'
  },
  {
    id: 'weekly',
    name: 'This Week',
    description: 'Best performers this week',
    sortBy: 'totalPL',
    timeFrame: 'weekly'
  },
  {
    id: 'monthly',
    name: 'This Month',
    description: 'Best performers this month',
    sortBy: 'totalPL',
    timeFrame: 'monthly'
  }
];

export class LeaderboardService {
  private static instance: LeaderboardService;
  private mockData: LeaderboardEntry[] = [];

  static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  constructor() {
    this.generateMockData();
  }

  private generateMockData(): void {
    const usernames = [
      'TradingPro', 'OptionsMaster', 'BullTrader', 'BearHunter', 'VolatilityKing',
      'RiskManager', 'ProfitSeeker', 'MarketWizard', 'StrategyGuru', 'TradingNinja',
      'OptionsQueen', 'DeltaTrader', 'GammaGamer', 'ThetaTimer', 'VegaViper',
      'StrikeMaster', 'PremiumHunter', 'SpreadSpecialist', 'IronCondor', 'StraddleStar'
    ];

    this.mockData = usernames.map((username, index) => ({
      id: `user_${index + 1}`,
      username,
      avatar: `https://via.placeholder.com/40x40?text=${username.charAt(0)}`,
      totalPL: Math.floor(Math.random() * 50000) - 10000, // -$10k to +$40k
      totalPLPercent: Math.floor(Math.random() * 200) - 50, // -50% to +150%
      winRate: Math.floor(Math.random() * 40) + 50, // 50% to 90%
      totalTrades: Math.floor(Math.random() * 500) + 50, // 50 to 550 trades
      rank: index + 1,
      level: Math.floor(Math.random() * 20) + 1, // Level 1-20
      xp: Math.floor(Math.random() * 10000) + 1000, // 1k to 11k XP
      badges: this.generateRandomBadges(),
      streak: Math.floor(Math.random() * 20) + 1, // 1-20 day streak
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));

    // Sort by total PL for initial ranking
    this.mockData.sort((a, b) => b.totalPL - a.totalPL);
    this.mockData.forEach((entry, index) => {
      entry.rank = index + 1;
    });
  }

  private generateRandomBadges(): string[] {
    const allBadges = [
      'First Trade', 'Profit Maker', 'Risk Manager', 'Options Expert',
      'Streak Master', 'High Roller', 'Consistent Trader', 'Volatility King',
      'Strategy Master', 'Level 10', 'Level 20', 'Perfect Week'
    ];
    
    const numBadges = Math.floor(Math.random() * 5) + 1; // 1-5 badges
    return allBadges.sort(() => 0.5 - Math.random()).slice(0, numBadges);
  }

  async getLeaderboard(categoryId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    const category = LEADERBOARD_CATEGORIES.find(c => c.id === categoryId);
    if (!category) {
      throw new Error('Invalid category');
    }

    let sortedData = [...this.mockData];

    // Sort based on category
    switch (category.sortBy) {
      case 'totalPL':
        sortedData.sort((a, b) => b.totalPL - a.totalPL);
        break;
      case 'winRate':
        sortedData.sort((a, b) => b.winRate - a.winRate);
        break;
      case 'totalTrades':
        sortedData.sort((a, b) => b.totalTrades - a.totalTrades);
        break;
      case 'streak':
        sortedData.sort((a, b) => b.streak - a.streak);
        break;
      case 'xp':
        sortedData.sort((a, b) => b.xp - a.xp);
        break;
    }

    // Apply time frame filter (simplified)
    if (category.timeFrame !== 'allTime') {
      const now = new Date();
      const timeFilter = this.getTimeFilter(category.timeFrame);
      sortedData = sortedData.filter(entry => {
        const lastActive = new Date(entry.lastActive);
        return lastActive >= timeFilter;
      });
    }

    // Update ranks
    sortedData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return sortedData.slice(0, limit);
  }

  private getTimeFilter(timeFrame: string): Date {
    const now = new Date();
    switch (timeFrame) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    const user = this.mockData.find(entry => entry.id === userId);
    if (!user) return null;

    const totalUsers = this.mockData.length;
    const rank = user.rank;
    const percentile = Math.round(((totalUsers - rank + 1) / totalUsers) * 100);

    return {
      totalPL: user.totalPL,
      totalPLPercent: user.totalPLPercent,
      winRate: user.winRate,
      totalTrades: user.totalTrades,
      averageTrade: user.totalTrades > 0 ? user.totalPL / user.totalTrades : 0,
      bestTrade: Math.floor(Math.random() * 5000) + 1000, // Mock best trade
      worstTrade: -Math.floor(Math.random() * 2000) - 500, // Mock worst trade
      currentStreak: user.streak,
      longestStreak: Math.floor(Math.random() * 50) + user.streak, // Mock longest streak
      level: user.level,
      xp: user.xp,
      rank,
      percentile
    };
  }

  async getCategories(): Promise<LeaderboardCategory[]> {
    return LEADERBOARD_CATEGORIES;
  }

  async searchUsers(query: string): Promise<LeaderboardEntry[]> {
    return this.mockData.filter(entry =>
      entry.username.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20);
  }

  async getUserRank(userId: string, categoryId: string): Promise<number> {
    const leaderboard = await this.getLeaderboard(categoryId);
    const user = leaderboard.find(entry => entry.id === userId);
    return user ? user.rank : -1;
  }

  async getTopPerformers(limit: number = 10): Promise<LeaderboardEntry[]> {
    return this.getLeaderboard('total_profit', limit);
  }

  async getRecentActivity(limit: number = 20): Promise<Array<{
    id: string;
    username: string;
    action: string;
    timestamp: string;
    details: string;
  }>> {
    const actions = [
      'completed a profitable trade',
      'reached a new level',
      'earned a new badge',
      'achieved a winning streak',
      'learned a new strategy',
      'completed a quest'
    ];

    return this.mockData.slice(0, limit).map((user, index) => ({
      id: `activity_${index}`,
      username: user.username,
      action: actions[Math.floor(Math.random() * actions.length)],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      details: `+${Math.floor(Math.random() * 1000) + 100} XP`
    }));
  }
}

export const leaderboardService = LeaderboardService.getInstance();
