import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { marketDataService } from '../../services/marketData';
import { optionsStrategyService } from '../../services/optionsStrategies';

interface OptionPosition {
  type: 'call' | 'put';
  action: 'buy' | 'sell';
  strike: number;
  premium: number;
  quantity: number;
}

interface PLPoint {
  price: number;
  profit: number;
}

export default function StrategyLab() {
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [stockPrice, setStockPrice] = useState<number>(150);
  const [optionChain, setOptionChain] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'call' | 'put' | null>(null);
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell' | null>(null);
  const [positions, setPositions] = useState<OptionPosition[]>([]);
  const [popularSymbols] = useState<string[]>(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL']);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [showStrategies, setShowStrategies] = useState<boolean>(false);

  React.useEffect(() => {
    loadMarketData();
  }, [symbol]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [quote, chain] = await Promise.all([
        marketDataService.getStockQuote(symbol),
        marketDataService.getOptionChain(symbol)
      ]);
      
      setStockPrice(quote.price);
      setOptionChain(chain);
    } catch (error) {
      Alert.alert('Error', 'Failed to load market data. Using demo data.');
      console.error('Market data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePL = (): PLPoint[] => {
    const points: PLPoint[] = [];
    const minPrice = 80;
    const maxPrice = 120;
    const step = 1;

    for (let price = minPrice; price <= maxPrice; price += step) {
      let totalPL = 0;

      positions.forEach(position => {
        const intrinsicValue = position.type === 'call' 
          ? Math.max(0, price - position.strike)
          : Math.max(0, position.strike - price);
        
        const positionValue = intrinsicValue * position.quantity * 100; // 100 shares per contract
        const premiumPaid = position.premium * position.quantity * 100;
        
        if (position.action === 'buy') {
          totalPL += positionValue - premiumPaid;
        } else {
          totalPL += premiumPaid - positionValue;
        }
      });

      points.push({ price, profit: totalPL });
    }

    return points;
  };

  const addPosition = () => {
    if (!selectedStrike || !selectedType || !selectedAction || !optionChain) return;

    const optionData = selectedType === 'call'
      ? optionChain.calls.find((c: any) => c.strike === selectedStrike)
      : optionChain.puts.find((p: any) => p.strike === selectedStrike);

    if (!optionData) return;

    const newPosition: OptionPosition = {
      type: selectedType,
      action: selectedAction,
      strike: selectedStrike,
      premium: optionData.lastPrice,
      quantity: 1,
    };

    setPositions([...positions, newPosition]);
    setSelectedStrike(null);
    setSelectedType(null);
    setSelectedAction(null);
  };

  const clearPositions = () => {
    setPositions([]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'high':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const plData = calculatePL();
  const maxProfit = Math.max(...plData.map(p => p.profit));
  const maxLoss = Math.min(...plData.map(p => p.profit));
  const breakeven = plData.find(p => Math.abs(p.profit) < 50)?.price || null;

  const currentPrice = stockPrice;
  const currentPL = plData.find(p => Math.abs(p.price - currentPrice) < 0.5)?.profit || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Strategy Lab</Text>
          <Text style={styles.subtitle}>Build strategies with real market data</Text>
        </View>

        {/* Symbol Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Symbol</Text>
            <TouchableOpacity onPress={loadMarketData} style={styles.refreshButton}>
              <Ionicons name="refresh" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          
          {/* Popular Symbols */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.symbolsContainer}>
            {popularSymbols.map(popularSymbol => (
              <TouchableOpacity
                key={popularSymbol}
                style={[
                  styles.symbolButton,
                  symbol === popularSymbol && styles.selectedSymbol
                ]}
                onPress={() => setSymbol(popularSymbol)}
              >
                <Text style={[
                  styles.symbolText,
                  symbol === popularSymbol && styles.selectedSymbolText
                ]}>
                  {popularSymbol}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stock Price Display */}
          <View style={styles.stockPriceCard}>
            <View style={styles.stockInfo}>
              <Text style={styles.currentSymbol}>{symbol}</Text>
              <Text style={styles.currentPrice}>${stockPrice.toFixed(2)}</Text>
            </View>
            {loading && (
              <View style={styles.loadingIndicator}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
          </View>
        </View>

        {/* P/L Chart Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profit/Loss Chart</Text>
          <View style={styles.chartContainer}>
            <LinearGradient
              colors={['#F8FAFC', '#FFFFFF']}
              style={styles.chart}
            >
              {positions.length === 0 ? (
                <View style={styles.emptyChart}>
                  <MaterialIcons name="trending-up" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyChartText}>Add positions to see P/L visualization</Text>
                </View>
              ) : (
                <View style={styles.chartContent}>
                  {/* Simple P/L visualization */}
                  <View style={styles.plLine}>
                    {plData.map((point, index) => (
                      <View
                        key={index}
                        style={[
                          styles.plPoint,
                          {
                            height: Math.max(2, Math.abs(point.profit) / 100),
                            backgroundColor: point.profit >= 0 ? '#10B981' : '#EF4444',
                          }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.chartAxisLabel}>Stock Price: $80 - $120</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Strategy Metrics */}
        {positions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategy Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  ${currentPL >= 0 ? '+' : ''}
                  {currentPL.toFixed(0)}
                </Text>
                <Text style={styles.metricLabel}>Current P/L</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: '#10B981' }]}>
                  {maxProfit === Infinity ? 'Unlimited' : `$${maxProfit.toFixed(0)}`}
                </Text>
                <Text style={styles.metricLabel}>Max Profit</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: '#EF4444' }]}>
                  ${maxLoss.toFixed(0)}
                </Text>
                <Text style={styles.metricLabel}>Max Loss</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {breakeven ? `$${breakeven}` : 'N/A'}
                </Text>
                <Text style={styles.metricLabel}>Breakeven</Text>
              </View>
            </View>
          </View>
        )}

        {/* Options Strategies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Options Strategies</Text>
            <TouchableOpacity 
              onPress={() => setShowStrategies(!showStrategies)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {showStrategies ? 'Hide' : 'Show'} Strategies
              </Text>
            </TouchableOpacity>
          </View>
          
          {showStrategies && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strategiesContainer}>
              {optionsStrategyService.getAllStrategies().map(strategy => (
                <TouchableOpacity
                  key={strategy.id}
                  style={[
                    styles.strategyCard,
                    selectedStrategy === strategy.id && styles.selectedStrategy
                  ]}
                  onPress={() => {
                    setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id);
                    if (selectedStrategy !== strategy.id) {
                      // Auto-populate positions based on strategy
                      const strategyPositions = strategy.setup.positions
                        .filter(p => p.strike > 0) // Filter out stock positions
                        .map(p => ({
                          type: p.type,
                          action: p.action,
                          strike: p.strike,
                          premium: 2.5, // Default premium
                          quantity: p.quantity
                        }));
                      setPositions(strategyPositions);
                    }
                  }}
                >
                  <Text style={[
                    styles.strategyName,
                    selectedStrategy === strategy.id && styles.selectedStrategyText
                  ]}>
                    {strategy.name}
                  </Text>
                  <Text style={[
                    styles.strategyDescription,
                    selectedStrategy === strategy.id && styles.selectedStrategyText
                  ]}>
                    {strategy.description}
                  </Text>
                  <View style={styles.strategyMeta}>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(strategy.difficulty) }
                    ]}>
                      <Text style={styles.difficultyText}>
                        {strategy.difficulty.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(strategy.riskLevel) }
                    ]}>
                      <Text style={styles.riskText}>
                        {strategy.riskLevel.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Option Chain */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Option Chain</Text>
          
          {!optionChain ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading option chain...</Text>
            </View>
          ) : (
            <>
          {/* Strike Selection */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strikesContainer}>
              {optionChain.calls.map((option: any) => (
              <TouchableOpacity
                key={option.strike}
                style={[
                  styles.strikeButton,
                  selectedStrike === option.strike && styles.selectedStrike
                ]}
                onPress={() => setSelectedStrike(option.strike)}
              >
                <Text style={[
                  styles.strikeText,
                  selectedStrike === option.strike && styles.selectedStrikeText
                ]}>
                  ${option.strike}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
            </>
          )}

          {/* Call/Put Selection */}
          <View style={styles.optionTypeContainer}>
            <TouchableOpacity
              style={[
                styles.optionTypeButton,
                selectedType === 'call' && styles.selectedOptionType
              ]}
              onPress={() => setSelectedType('call')}
            >
              <MaterialIcons name="trending-up" size={20} color={selectedType === 'call' ? '#FFFFFF' : '#10B981'} />
              <Text style={[
                styles.optionTypeText,
                selectedType === 'call' && styles.selectedOptionTypeText
              ]}>
                Call
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.optionTypeButton,
                selectedType === 'put' && styles.selectedOptionType
              ]}
              onPress={() => setSelectedType('put')}
            >
              <MaterialIcons name="trending-down" size={20} color={selectedType === 'put' ? '#FFFFFF' : '#EF4444'} />
              <Text style={[
                styles.optionTypeText,
                selectedType === 'put' && styles.selectedOptionTypeText
              ]}>
                Put
              </Text>
            </TouchableOpacity>
          </View>

          {/* Buy/Sell Selection */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                selectedAction === 'buy' && styles.selectedAction
              ]}
              onPress={() => setSelectedAction('buy')}
            >
              <Text style={[
                styles.actionText,
                selectedAction === 'buy' && styles.selectedActionText
              ]}>
                Buy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                selectedAction === 'sell' && styles.selectedAction
              ]}
              onPress={() => setSelectedAction('sell')}
            >
              <Text style={[
                styles.actionText,
                selectedAction === 'sell' && styles.selectedActionText
              ]}>
                Sell
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Position Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              (!selectedStrike || !selectedType || !selectedAction || !optionChain) && styles.disabledButton
            ]}
            onPress={addPosition}
            disabled={!selectedStrike || !selectedType || !selectedAction || !optionChain}
          >
            <LinearGradient
              colors={
                !selectedStrike || !selectedType || !selectedAction || !optionChain
                  ? ['#CBD5E1', '#94A3B8']
                  : ['#3B82F6', '#1D4ED8']
              }
              style={styles.addButtonGradient}
            >
              <MaterialIcons name="my-location" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Position</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Current Positions */}
        {positions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.positionsHeader}>
              <Text style={styles.sectionTitle}>Current Positions</Text>
              <TouchableOpacity onPress={clearPositions} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            
            {positions.map((position, index) => (
              <View key={index} style={styles.positionCard}>
                <View style={styles.positionHeader}>
                  <Text style={styles.positionTitle}>
                    {position.action.toUpperCase()} {position.type.toUpperCase()}
                  </Text>
                  <Text style={styles.positionStrike}>${position.strike}</Text>
                </View>
                <Text style={styles.positionDetails}>
                  Premium: ${position.premium} × {position.quantity} contract
                  {position.quantity > 1 ? 's' : ''}
                </Text>
                <Text style={styles.positionValue}>
                  Total: {position.action === 'buy' ? '-' : '+'}
                  ${(position.premium * position.quantity * 100).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="settings" size={20} color="#64748B" />
            <Text style={styles.secondaryButtonText}>Advanced Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              positions.length === 0 && styles.disabledButton
            ]}
            disabled={positions.length === 0}
          >
            <LinearGradient
              colors={positions.length === 0 ? ['#CBD5E1', '#94A3B8'] : ['#10B981', '#059669']}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Execute Strategy</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
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
  symbolsContainer: {
    marginBottom: 16,
  },
  symbolButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedSymbol: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  symbolText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedSymbolText: {
    color: '#FFFFFF',
  },
  stockPriceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stockInfo: {
    flex: 1,
  },
  currentSymbol: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  loadingIndicator: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chart: {
    height: 200,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyChartText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  chartContent: {
    flex: 1,
    width: '100%',
  },
  plLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
  },
  plPoint: {
    width: 2,
    minHeight: 2,
  },
  chartAxisLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  strikesContainer: {
    marginBottom: 16,
  },
  strikeButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedStrike: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  strikeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedStrikeText: {
    color: '#FFFFFF',
  },
  optionTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  optionTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedOptionType: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  selectedOptionTypeText: {
    color: '#FFFFFF',
  },
  actionContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedAction: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedActionText: {
    color: '#FFFFFF',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  positionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  positionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  positionStrike: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  positionDetails: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  positionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 8,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  toggleButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  strategiesContainer: {
    marginBottom: 16,
  },
  strategyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedStrategy: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  selectedStrategyText: {
    color: '#FFFFFF',
  },
  strategyDescription: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  strategyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});