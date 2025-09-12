import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Star, TrendingUp, Search, Filter, Crown, Award, Target } from 'lucide-react-native';
import { leaderboardService } from '../../services/leaderboardService';

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

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<LeaderboardCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('total_profit');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaderboardData, categoriesData] = await Promise.all([
        leaderboardService.getLeaderboard(selectedCategory),
        leaderboardService.getCategories()
      ]);
      setLeaderboard(leaderboardData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await leaderboardService.searchUsers(searchQuery);
      setLeaderboard(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} color="#F59E0B" />;
    if (rank === 2) return <Medal size={20} color="#6B7280" />;
    if (rank === 3) return <Award size={20} color="#CD7F32" />;
    return <Text style={styles.rankNumber}>#{rank}</Text>;
  };

  const getPLColor = (value: number) => {
    return value >= 0 ? '#10B981' : '#EF4444';
  };

  const getSelectedCategory = () => {
    return categories.find(c => c.id === selectedCategory);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Leaderboard</Text>
            <TouchableOpacity 
              onPress={() => setShowSearch(!showSearch)}
              style={styles.searchButton}
            >
              <Search size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Compete with traders worldwide</Text>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search traders..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={handleSearch} style={styles.searchSubmitButton}>
                <Text style={styles.searchSubmitText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Description */}
        {getSelectedCategory() && (
          <View style={styles.categoryDescription}>
            <Text style={styles.categoryDescriptionText}>
              {getSelectedCategory()?.description}
            </Text>
          </View>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && !searchQuery && (
          <View style={styles.podiumContainer}>
            <Text style={styles.podiumTitle}>Top Performers</Text>
            <View style={styles.podium}>
              {/* 2nd Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumPosition, styles.secondPlace]}>
                  <Medal size={24} color="#6B7280" />
                  <Text style={styles.podiumRank}>2</Text>
                </View>
                <Text style={styles.podiumUsername}>{leaderboard[1].username}</Text>
                <Text style={[styles.podiumPL, { color: getPLColor(leaderboard[1].totalPL) }]}>
                  {formatCurrency(leaderboard[1].totalPL)}
                </Text>
              </View>

              {/* 1st Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumPosition, styles.firstPlace]}>
                  <Crown size={28} color="#F59E0B" />
                  <Text style={styles.podiumRank}>1</Text>
                </View>
                <Text style={styles.podiumUsername}>{leaderboard[0].username}</Text>
                <Text style={[styles.podiumPL, { color: getPLColor(leaderboard[0].totalPL) }]}>
                  {formatCurrency(leaderboard[0].totalPL)}
                </Text>
              </View>

              {/* 3rd Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumPosition, styles.thirdPlace]}>
                  <Award size={24} color="#CD7F32" />
                  <Text style={styles.podiumRank}>3</Text>
                </View>
                <Text style={styles.podiumUsername}>{leaderboard[2].username}</Text>
                <Text style={[styles.podiumPL, { color: getPLColor(leaderboard[2].totalPL) }]}>
                  {formatCurrency(leaderboard[2].totalPL)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>
            {searchQuery ? 'Search Results' : 'Full Rankings'}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading leaderboard...</Text>
            </View>
          ) : (
            leaderboard.map((entry, index) => (
              <TouchableOpacity key={entry.id} style={styles.leaderboardItem}>
                <View style={styles.rankContainer}>
                  {getRankIcon(entry.rank)}
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.username}>{entry.username}</Text>
                  <View style={styles.userMeta}>
                    <Text style={styles.levelText}>Level {entry.level}</Text>
                    <Text style={styles.tradesText}>{entry.totalTrades} trades</Text>
                  </View>
                </View>

                <View style={styles.statsContainer}>
                  <Text style={[styles.plValue, { color: getPLColor(entry.totalPL) }]}>
                    {formatCurrency(entry.totalPL)}
                  </Text>
                  <Text style={[styles.plPercent, { color: getPLColor(entry.totalPLPercent) }]}>
                    {formatPercent(entry.totalPLPercent)}
                  </Text>
                  <Text style={styles.winRateText}>
                    {entry.winRate}% win rate
                  </Text>
                </View>

                <View style={styles.badgesContainer}>
                  {entry.badges.slice(0, 2).map((badge, badgeIndex) => (
                    <View key={badgeIndex} style={styles.badge}>
                      <Star size={12} color="#F59E0B" />
                    </View>
                  ))}
                  {entry.badges.length > 2 && (
                    <Text style={styles.badgeCount}>+{entry.badges.length - 2}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <Text style={styles.quickStatsTitle}>Quick Stats</Text>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStatCard}>
              <TrendingUp size={24} color="#10B981" />
              <Text style={styles.quickStatValue}>
                {leaderboard.length > 0 ? formatCurrency(leaderboard[0].totalPL) : '$0'}
              </Text>
              <Text style={styles.quickStatLabel}>Top Trader</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Target size={24} color="#3B82F6" />
              <Text style={styles.quickStatValue}>
                {leaderboard.length > 0 ? `${leaderboard[0].winRate}%` : '0%'}
              </Text>
              <Text style={styles.quickStatLabel}>Best Win Rate</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Trophy size={24} color="#F59E0B" />
              <Text style={styles.quickStatValue}>
                {leaderboard.length > 0 ? leaderboard[0].streak : 0}
              </Text>
              <Text style={styles.quickStatLabel}>Longest Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  searchSubmitButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategory: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  categoryDescription: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoryDescriptionText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  podiumContainer: {
    padding: 24,
    paddingTop: 8,
  },
  podiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 16,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumPosition: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  firstPlace: {
    backgroundColor: '#FEF3C7',
    height: 80,
    width: 80,
    borderRadius: 40,
  },
  secondPlace: {
    backgroundColor: '#F3F4F6',
    height: 60,
  },
  thirdPlace: {
    backgroundColor: '#FEF2F2',
    height: 50,
  },
  podiumRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  podiumUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  podiumPL: {
    fontSize: 16,
    fontWeight: '700',
  },
  leaderboardContainer: {
    padding: 24,
    paddingTop: 8,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  levelText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  tradesText: {
    fontSize: 12,
    color: '#64748B',
  },
  statsContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  plValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  plPercent: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  winRateText: {
    fontSize: 10,
    color: '#64748B',
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  badgeCount: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  quickStatsContainer: {
    padding: 24,
    paddingTop: 8,
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
