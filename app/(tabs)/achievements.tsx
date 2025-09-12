import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Target, TrendingUp, Shield, Zap, Award, Lock } from 'lucide-react-native';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'trading' | 'learning' | 'strategy' | 'milestone';
  xp: number;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first quest',
    icon: 'target',
    category: 'learning',
    xp: 50,
    unlocked: true,
    unlockedDate: '2024-01-15',
    rarity: 'common',
  },
  {
    id: '2',
    title: 'Options Explorer',
    description: 'Learn about calls and puts',
    icon: 'trending-up',
    category: 'learning',
    xp: 100,
    unlocked: true,
    unlockedDate: '2024-01-16',
    rarity: 'common',
  },
  {
    id: '3',
    title: 'Income Generator',
    description: 'Earn $1,000 in premium through covered calls',
    icon: 'dollar-sign',
    category: 'trading',
    xp: 200,
    unlocked: false,
    progress: 450,
    maxProgress: 1000,
    rarity: 'rare',
  },
  {
    id: '4',
    title: 'The Hedger',
    description: 'Successfully protect a position with a protective put',
    icon: 'shield',
    category: 'strategy',
    xp: 150,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: '5',
    title: 'Speed Learner',
    description: 'Complete 5 quests in one day',
    icon: 'zap',
    category: 'learning',
    xp: 300,
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    rarity: 'epic',
  },
  {
    id: '6',
    title: 'Greeks Master',
    description: 'Master all the Greeks (Delta, Gamma, Theta, Vega)',
    icon: 'star',
    category: 'learning',
    xp: 500,
    unlocked: false,
    progress: 1,
    maxProgress: 4,
    rarity: 'legendary',
  },
  {
    id: '7',
    title: 'Profit Maker',
    description: 'Achieve $5,000 in total profits',
    icon: 'award',
    category: 'milestone',
    xp: 750,
    unlocked: false,
    progress: 2150,
    maxProgress: 5000,
    rarity: 'epic',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'trophy' },
  { id: 'learning', name: 'Learning', icon: 'target' },
  { id: 'trading', name: 'Trading', icon: 'trending-up' },
  { id: 'strategy', name: 'Strategy', icon: 'shield' },
  { id: 'milestone', name: 'Milestones', icon: 'award' },
];

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getIconComponent = (iconName: string, size: number, color: string) => {
    const icons: any = {
      'target': Target,
      'trending-up': TrendingUp,
      'shield': Shield,
      'zap': Zap,
      'star': Star,
      'award': Award,
      'trophy': Trophy,
    };
    const IconComponent = icons[iconName] || Target;
    return <IconComponent size={size} color={color} />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return ['#64748B', '#475569'];
      case 'rare':
        return ['#3B82F6', '#1D4ED8'];
      case 'epic':
        return ['#8B5CF6', '#7C3AED'];
      case 'legendary':
        return ['#F59E0B', '#D97706'];
      default:
        return ['#64748B', '#475569'];
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#64748B';
      case 'rare':
        return '#3B82F6';
      case 'epic':
        return '#8B5CF6';
      case 'legendary':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(achievement => achievement.category === selectedCategory);

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalXP = ACHIEVEMENTS.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>Track your learning milestones</Text>
        </View>

        {/* Progress Summary */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.summaryCard}
          >
            <View style={styles.summaryHeader}>
              <Trophy size={32} color="#FFFFFF" />
              <View style={styles.summaryStats}>
                <Text style={styles.summaryTitle}>Your Progress</Text>
                <Text style={styles.summaryText}>
                  {unlockedCount} of {ACHIEVEMENTS.length} achievements unlocked
                </Text>
              </View>
            </View>
            
            <View style={styles.xpContainer}>
              <View style={styles.xpItem}>
                <Text style={styles.xpValue}>{totalXP}</Text>
                <Text style={styles.xpLabel}>Total XP Earned</Text>
              </View>
              <View style={styles.xpItem}>
                <Text style={styles.xpValue}>
                  {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%
                </Text>
                <Text style={styles.xpLabel}>Completion</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                {getIconComponent(
                  category.icon, 
                  16, 
                  selectedCategory === category.id ? '#FFFFFF' : '#64748B'
                )}
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

        {/* Achievements List */}
        <View style={styles.section}>
          {filteredAchievements.map(achievement => (
            <View key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementHeader}>
                <LinearGradient
                  colors={achievement.unlocked ? getRarityColor(achievement.rarity) : ['#E2E8F0', '#CBD5E1']}
                  style={styles.achievementIcon}
                >
                  {achievement.unlocked ? (
                    getIconComponent(achievement.icon, 24, '#FFFFFF')
                  ) : (
                    <Lock size={24} color="#94A3B8" />
                  )}
                </LinearGradient>
                
                <View style={styles.achievementContent}>
                  <View style={styles.achievementTitleRow}>
                    <Text style={[
                      styles.achievementTitle,
                      !achievement.unlocked && styles.lockedText
                    ]}>
                      {achievement.title}
                    </Text>
                    <View style={styles.achievementMeta}>
                      <Text style={[
                        styles.rarityText,
                        { color: achievement.unlocked ? getRarityTextColor(achievement.rarity) : '#94A3B8' }
                      ]}>
                        {achievement.rarity.toUpperCase()}
                      </Text>
                      <Text style={styles.xpBadge}>+{achievement.xp} XP</Text>
                    </View>
                  </View>
                  
                  <Text style={[
                    styles.achievementDescription,
                    !achievement.unlocked && styles.lockedText
                  ]}>
                    {achievement.description}
                  </Text>
                  
                  {achievement.unlocked && achievement.unlockedDate && (
                    <Text style={styles.unlockedDate}>
                      Unlocked on {achievement.unlockedDate}
                    </Text>
                  )}
                  
                  {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { width: `${(achievement.progress / achievement.maxProgress) * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {achievement.progress} / {achievement.maxProgress}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Rarity Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rarity Guide</Text>
          <View style={styles.rarityContainer}>
            {['common', 'rare', 'epic', 'legendary'].map(rarity => (
              <View key={rarity} style={styles.rarityItem}>
                <LinearGradient
                  colors={getRarityColor(rarity)}
                  style={styles.rarityBadge}
                >
                  <Text style={styles.rarityBadgeText}>
                    {rarity.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <Text style={[
                  styles.rarityName,
                  { color: getRarityTextColor(rarity) }
                ]}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </Text>
              </View>
            ))}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryStats: {
    marginLeft: 16,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  xpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpItem: {
    alignItems: 'center',
  },
  xpValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  xpLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 6,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  lockedText: {
    color: '#94A3B8',
  },
  achievementMeta: {
    alignItems: 'flex-end',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  xpBadge: {
    backgroundColor: '#F1F5F9',
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  unlockedDate: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  rarityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rarityItem: {
    alignItems: 'center',
  },
  rarityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rarityBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rarityName: {
    fontSize: 12,
    fontWeight: '600',
  },
});