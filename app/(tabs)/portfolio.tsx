import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, DollarSign, Eye, Calendar, Target } from 'lucide-react-native';
import { marketDataService } from '../../services/marketData';

interface Position {
  id: string;
  symbol: string;
  type: 'stock' | 'option';
  optionDetails?: {
    type: 'call' | 'put';
    strike: number;
    expiry: string;
    action: 'buy' | 'sell';
  };
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
}

const MOCK_POSITIONS: Position[] = [
  {
    id: '1',
    symbol: 'AAPL',
    type: 'stock',
    quantity: 100,
    avgPrice: 150.00,
    currentPrice: 155.25,
    totalValue: 15525,
    unrealizedPL: 525,
    unrealizedPLPercent: 3.5,
  },
  {
    id: '2',
    symbol: 'TSLA',
    type: 'option',
    optionDetails: {
      type: 'call',
      strike: 250,
      expiry: '2024-03-15',
      action: 'buy',
    },
    quantity: 2,
    avgPrice: 12.50,
    currentPrice: 15.75,
    totalValue: 3150,
    unrealizedPL: 650,
    unrealizedPLPercent: 26.0,
  },
  {
    id: '3',
    symbol: 'NVDA',
    type: 'option',
    optionDetails: {
      type: 'put',
      strike: 800,
      expiry: '2024-02-16',
      action: 'sell',
    },
    quantity: 1,
    avgPrice: 25.00,
    currentPrice: 18.50,
    totalValue: -1850,
    unrealizedPL: 650,
    unrealizedPLPercent: 26.0,
  },
];

const PORTFOLIO_SUMMARY = {
  totalValue: 67825,
  dayChange: 1245,
  dayChangePercent: 1.87,
  totalPL: 8325,
  totalPLPercent: 14.0,
  cashBalance: 45000,
  buyingPower: 90000,
};

export default function Portfolio() {
  const [selectedTab, setSelectedTab] = useState<'positions' | 'history'>('positions');
  const [realTimeData, setRealTimeData] = useState<{[key: string]: number}>({});

  React.useEffect(() => {
    // Update real-time prices for positions
    const updatePrices = async () => {
      const symbols = [...new Set(MOCK_POSITIONS.map(p => p.symbol))];
      const priceUpdates: {[key: string]: number} = {};
      
      for (const symbol of symbols) {
        try {
          const quote = await marketDataService.getStockQuote(symbol);
          priceUpdates[symbol] = quote.price;
        } catch (error) {
          console.warn(`Failed to update price for ${symbol}:`, error);
        }
      }
      
      setRealTimeData(priceUpdates);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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

  const getUpdatedPosition = (position: Position): Position => {
    const realPrice = realTimeData[position.symbol];
    if (!realPrice) return position;

    const updatedPosition = { ...position };
    updatedPosition.currentPrice = realPrice;
    
    if (position.type === 'stock') {
      updatedPosition.totalValue = realPrice * position.quantity;
      updatedPosition.unrealizedPL = (realPrice - position.avgPrice) * position.quantity;
      updatedPosition.unrealizedPLPercent = ((realPrice - position.avgPrice) / position.avgPrice) * 100;
    } else if (position.type === 'option' && position.optionDetails) {
      // Simplified option pricing update
      const intrinsicValue = position.optionDetails.type === 'call' 
        ? Math.max(0, realPrice - position.optionDetails.strike)
        : Math.max(0, position.optionDetails.strike - realPrice);
      
      const estimatedPrice = intrinsicValue + (position.avgPrice - Math.max(0, position.currentPrice - position.optionDetails.strike));
      updatedPosition.currentPrice = Math.max(0.01, estimatedPrice);
      updatedPosition.totalValue = updatedPosition.currentPrice * position.quantity * 100;
      updatedPosition.unrealizedPL = (updatedPosition.currentPrice - position.avgPrice) * position.quantity * 100;
      updatedPosition.unrealizedPLPercent = ((updatedPosition.currentPrice - position.avgPrice) / position.avgPrice) * 100;
    }

    return updatedPosition;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>Track your virtual trading performance</Text>
        </View>

        {/* Portfolio Summary */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            style={styles.summaryCard}
          >
            <View style={styles.summaryHeader}>
              <Text style={styles.totalValueText}>
                {formatCurrency(PORTFOLIO_SUMMARY.totalValue)}
              </Text>
              <View style={[
                styles.changeContainer,
                { backgroundColor: PORTFOLIO_SUMMARY.dayChange >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
              ]}>
                {PORTFOLIO_SUMMARY.dayChange >= 0 ? 
                  <TrendingUp size={16} color="#10B981" /> : 
                  <TrendingDown size={16} color="#EF4444" />
                }
                <Text style={[
                  styles.changeText,
                  { color: PORTFOLIO_SUMMARY.dayChange >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {formatCurrency(Math.abs(PORTFOLIO_SUMMARY.dayChange))} ({formatPercent(PORTFOLIO_SUMMARY.dayChangePercent)})
                </Text>
              </View>
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total P/L</Text>
                <Text style={[
                  styles.statValue,
                  { color: PORTFOLIO_SUMMARY.totalPL >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {formatCurrency(PORTFOLIO_SUMMARY.totalPL)}
                </Text>
                <Text style={[
                  styles.statPercent,
                  { color: PORTFOLIO_SUMMARY.totalPL >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {formatPercent(PORTFOLIO_SUMMARY.totalPLPercent)}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Cash Balance</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(PORTFOLIO_SUMMARY.cashBalance)}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Buying Power</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(PORTFOLIO_SUMMARY.buyingPower)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'positions' && styles.activeTab]}
            onPress={() => setSelectedTab('positions')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'positions' && styles.activeTabText
            ]}>
              Current Positions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
            onPress={() => setSelectedTab('history')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'history' && styles.activeTabText
            ]}>
              Trading History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Positions List */}
        {selectedTab === 'positions' && (
          <View style={styles.section}>
            {MOCK_POSITIONS.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={48} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>No positions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Complete quests in the Strategy Lab to build your portfolio
                </Text>
              </View>
            ) : (
              MOCK_POSITIONS.map((originalPosition) => {
                const position = getUpdatedPosition(originalPosition);
                return (
                  <View key={position.id} style={styles.positionCard}>
                  <View style={styles.positionHeader}>
                    <View style={styles.symbolContainer}>
                      <Text style={styles.symbolText}>{position.symbol}</Text>
                      {position.type === 'option' && position.optionDetails && (
                        <View style={[
                          styles.optionBadge,
                          { backgroundColor: position.optionDetails.type === 'call' ? '#10B981' : '#EF4444' }
                        ]}>
                          <Text style={styles.optionBadgeText}>
                            {position.optionDetails.action === 'buy' ? '+' : '-'}
                            {position.optionDetails.type.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.plContainer}>
                      <Text style={[
                        styles.plValue,
                        { color: position.unrealizedPL >= 0 ? '#10B981' : '#EF4444' }
                      ]}>
                        {position.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPL)}
                      </Text>
                      <Text style={[
                        styles.plPercent,
                        { color: position.unrealizedPL >= 0 ? '#10B981' : '#EF4444' }
                      ]}>
                        {formatPercent(position.unrealizedPLPercent)}
                      </Text>
                    </View>
                  </View>

                  {position.type === 'option' && position.optionDetails && (
                    <View style={styles.optionDetails}>
                      <View style={styles.optionDetail}>
                        <Text style={styles.optionDetailLabel}>Strike</Text>
                        <Text style={styles.optionDetailValue}>
                          ${position.optionDetails.strike}
                        </Text>
                      </View>
                      <View style={styles.optionDetail}>
                        <Text style={styles.optionDetailLabel}>Expiry</Text>
                        <Text style={styles.optionDetailValue}>
                          {position.optionDetails.expiry}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.positionStats}>
                    <View style={styles.positionStat}>
                      <Text style={styles.positionStatLabel}>Quantity</Text>
                      <Text style={styles.positionStatValue}>
                        {position.quantity} {position.type === 'option' ? 'contracts' : 'shares'}
                      </Text>
                    </View>
                    <View style={styles.positionStat}>
                      <Text style={styles.positionStatLabel}>Avg Price</Text>
                      <Text style={styles.positionStatValue}>
                        ${position.avgPrice.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.positionStat}>
                      <Text style={styles.positionStatLabel}>Current Price</Text>
                      <Text style={styles.positionStatValue}>
                        ${position.currentPrice.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.positionStat}>
                      <Text style={styles.positionStatLabel}>Total Value</Text>
                      <Text style={styles.positionStatValue}>
                        {formatCurrency(Math.abs(position.totalValue))}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.viewDetailsButton}>
                    <Eye size={16} color="#3B82F6" />
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
                );
              })
            )}
          </View>
        )}

        {/* Trading History */}
        {selectedTab === 'history' && (
          <View style={styles.section}>
            <View style={styles.emptyState}>
              <Calendar size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No trading history yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your completed trades will appear here
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.quickActionGradient}
            >
              <TrendingUp size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>New Position</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.quickActionGradient}
            >
              <DollarSign size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Add Funds</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  summaryCard: {
    borderRadius: 16,
    padding: 20,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totalValueText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statPercent: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#1E293B',
  },
  positionCard: {
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
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  optionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  optionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  plContainer: {
    alignItems: 'flex-end',
  },
  plValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  plPercent: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  optionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  optionDetail: {
    alignItems: 'center',
  },
  optionDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  optionDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  positionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  positionStat: {
    alignItems: 'center',
  },
  positionStatLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  positionStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 8,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});