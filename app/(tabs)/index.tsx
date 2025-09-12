import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Lock, CircleCheck as CheckCircle, Star, Zap } from 'lucide-react-native';

const QUESTS = [
  {
    id: 1,
    title: 'What is an Option?',
    description: 'Learn the fundamentals of options contracts',
    xp: 50,
    status: 'completed',
    module: 'Options Basics',
    difficulty: 'Beginner'
  },
  {
    id: 2,
    title: 'The Call Option',
    description: 'Master bullish speculation with call options',
    xp: 75,
    status: 'available',
    module: 'Options Basics',
    difficulty: 'Beginner'
  },
  {
    id: 3,
    title: 'The Put Option',
    description: 'Learn bearish strategies with put options',
    xp: 75,
    status: 'locked',
    module: 'Options Basics',
    difficulty: 'Beginner'
  },
  {
    id: 4,
    title: 'The Covered Call',
    description: 'Generate income from stock holdings',
    xp: 100,
    status: 'locked',
    module: 'Income Generation',
    difficulty: 'Intermediate'
  },
  {
    id: 5,
    title: 'Cash-Secured Put',
    description: 'Get paid to buy stocks at lower prices',
    xp: 100,
    status: 'locked',
    module: 'Income Generation',
    difficulty: 'Intermediate'
  }
];

const USER_DATA = {
  name: 'Sarah Chen',
  level: 2,
  xp: 125,
  nextLevelXp: 200,
  totalQuests: 12,
  completedQuests: 1,
  streak: 3
};

export default function QuestDashboard() {
  const [selectedQuest, setSelectedQuest] = useState<number | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={24} color="#10B981" />;
      case 'available':
        return <Play size={24} color="#3B82F6" />;
      case 'locked':
        return <Lock size={24} color="#9CA3AF" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return ['#10B981', '#059669'];
      case 'available':
        return ['#3B82F6', '#2563EB'];
      case 'locked':
        return ['#9CA3AF', '#6B7280'];
      default:
        return ['#9CA3AF', '#6B7280'];
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return '#10B981';
      case 'Intermediate':
        return '#F59E0B';
      case 'Advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const progressPercentage = (USER_DATA.xp / USER_DATA.nextLevelXp) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{USER_DATA.name}!</Text>
          
          {/* Progress Card */}
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.progressCard}
          >
            <View style={styles.progressHeader}>
              <View style={styles.levelBadge}>
                <Star size={16} color="#FFFFFF" />
                <Text style={styles.levelText}>Level {USER_DATA.level}</Text>
              </View>
              <View style={styles.streakBadge}>
                <Zap size={14} color="#F59E0B" />
                <Text style={styles.streakText}>{USER_DATA.streak} day streak</Text>
              </View>
            </View>
            
            <Text style={styles.xpText}>{USER_DATA.xp} / {USER_DATA.nextLevelXp} XP</Text>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
                />
              </View>
            </View>
            
            <Text style={styles.progressSubtext}>
              {USER_DATA.completedQuests} of {USER_DATA.totalQuests} quests completed
            </Text>
          </LinearGradient>
        </View>

        {/* Quests Section */}
        <View style={styles.questsSection}>
          <Text style={styles.sectionTitle}>Your Learning Journey</Text>
          
          {QUESTS.map((quest) => (
            <TouchableOpacity
              key={quest.id}
              style={[
                styles.questCard,
                selectedQuest === quest.id && styles.selectedQuest,
                quest.status === 'locked' && styles.lockedQuest
              ]}
              onPress={() => setSelectedQuest(selectedQuest === quest.id ? null : quest.id)}
              disabled={quest.status === 'locked'}
            >
              <LinearGradient
                colors={getStatusColor(quest.status)}
                style={styles.questIcon}
              >
                {getStatusIcon(quest.status)}
              </LinearGradient>
              
              <View style={styles.questContent}>
                <View style={styles.questHeader}>
                  <Text style={[
                    styles.questTitle,
                    quest.status === 'locked' && styles.lockedText
                  ]}>
                    {quest.title}
                  </Text>
                  <View style={styles.questMeta}>
                    <Text style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(quest.difficulty) }
                    ]}>
                      {quest.difficulty}
                    </Text>
                    <Text style={styles.xpBadge}>+{quest.xp} XP</Text>
                  </View>
                </View>
                
                <Text style={[
                  styles.questDescription,
                  quest.status === 'locked' && styles.lockedText
                ]}>
                  {quest.description}
                </Text>
                
                <Text style={styles.moduleText}>{quest.module}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{USER_DATA.xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{USER_DATA.level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{USER_DATA.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
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
  welcomeText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  streakText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  questsSection: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  questCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedQuest: {
    borderColor: '#3B82F6',
  },
  lockedQuest: {
    opacity: 0.6,
  },
  questIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  questContent: {
    flex: 1,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  lockedText: {
    color: '#9CA3AF',
  },
  questMeta: {
    alignItems: 'flex-end',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
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
  questDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  moduleText: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statsSection: {
    padding: 24,
    paddingTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});