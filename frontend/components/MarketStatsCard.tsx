import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface MarketStatsCardProps {
  isOpen: boolean;
  lastUpdate: Date;
  totalGainers: number;
  totalLosers: number;
}

export default function MarketStatsCard({ 
  isOpen, 
  lastUpdate, 
  totalGainers, 
  totalLosers 
}: MarketStatsCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isOpen ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isOpen ? '#FFFFFF' : '#F3F4F6' }
            ]} />
            <Text style={styles.statusText}>
              {isOpen ? 'Market Open' : 'Market Closed'}
            </Text>
          </View>
          <Text style={styles.timeText}>
            {formatTime(lastUpdate)}
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="trending-up" size={20} color="#FFFFFF" />
            <Text style={styles.statValue}>{totalGainers}</Text>
            <Text style={styles.statLabel}>Gainers</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="trending-down" size={20} color="#FFFFFF" />
            <Text style={styles.statValue}>{totalLosers}</Text>
            <Text style={styles.statLabel}>Losers</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.statValue}>30s</Text>
            <Text style={styles.statLabel}>Auto-Refresh</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.8,
    marginTop: 2,
  },
});
