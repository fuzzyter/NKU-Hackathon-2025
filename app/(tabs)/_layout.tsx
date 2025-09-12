import { Tabs } from 'expo-router';
import { TrendingUp, Target, User, Trophy, Newspaper, Calculator, Crown, BookOpen } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quests',
          tabBarIcon: ({ size, color }) => (
            <Target size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: 'Strategy Lab',
          tabBarIcon: ({ size, color }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ size, color }) => (
            <Newspaper size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="risk"
        options={{
          title: 'Risk',
          tabBarIcon: ({ size, color }) => (
            <Calculator size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: 'Education',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ size, color }) => (
            <Crown size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ size, color }) => (
            <Trophy size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}