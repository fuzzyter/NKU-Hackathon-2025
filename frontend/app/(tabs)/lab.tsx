import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { marketDataService } from '../../services/marketData';

interface OptionPosition {
  id: string;
  symbol: string;
  type: 'call' | 'put';
  action: 'buy' | 'sell';
  strike: number;
  premium: number;
  quantity: number;
  totalCost: number;
  currentValue: number;
  profitLoss: number;
  timestamp: Date;
}

interface DemoAccount {
  cash: number;
  totalValue: number;
  positions: OptionPosition[];
  totalPL: number;
}

export default function StrategyLab() {
  // Demo Account State
  const [demoAccount, setDemoAccount] = useState<DemoAccount>({
    cash: 10000, // Starting with $10,000 demo cash
    totalValue: 10000,
    positions: [],
    totalPL: 0
  });

  // Trading State
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [stockPrice, setStockPrice] = useState<number>(150);
  const [stockChange, setStockChange] = useState<number>(0);
  const [stockChangePercent, setStockChangePercent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Option Selection
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'call' | 'put' | null>(null);
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell' | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  
  // Popular symbols for quick selection
  const [popularSymbols] = useState<string[]>(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL']);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMarketData();
    updatePortfolioValue();
    
    // Set up real-time updates every 30 seconds
    intervalRef.current = setInterval(() => {
      loadMarketData();
      updatePortfolioValue();
      setLastUpdate(new Date());
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const quote = await marketDataService.getStockQuote(symbol);
      setStockPrice(quote.price);
      setStockChange(quote.change);
      setStockChangePercent(quote.changePercent);
    } catch (error) {
      Alert.alert('Error', 'Failed to load market data. Using demo data.');
      console.error('Market data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolioValue = () => {
    setDemoAccount(prev => {
      let totalPL = 0;
      const updatedPositions = prev.positions.map(position => {
        const intrinsicValue = position.type === 'call' 
          ? Math.max(0, stockPrice - position.strike)
          : Math.max(0, position.strike - stockPrice);
        
        const currentValue = intrinsicValue * position.quantity * 100;
        const profitLoss = position.action === 'buy' 
          ? currentValue - position.totalCost
          : position.totalCost - currentValue;
        
        totalPL += profitLoss;
        
        return {
          ...position,
          currentValue,
          profitLoss
        };
      });

      return {
        ...prev,
        positions: updatedPositions,
        totalPL,
        totalValue: prev.cash + totalPL
      };
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMarketData();
    updatePortfolioValue();
    setRefreshing(false);
    setLastUpdate(new Date());
  };

  const executeTrade = () => {
    if (!selectedStrike || !selectedType || !selectedAction) {
      Alert.alert('Error', 'Please select strike price, option type, and action');
      return;
    }

    // Calculate option premium (simplified)
    const intrinsicValue = selectedType === 'call' 
      ? Math.max(0, stockPrice - selectedStrike)
      : Math.max(0, selectedStrike - stockPrice);
    
    const timeValue = Math.max(0.5, (Math.random() * 5)); // Random time value
    const premium = intrinsicValue + timeValue;
    const totalCost = premium * quantity * 100;

    // Check if user has enough cash
    if (selectedAction === 'buy' && totalCost > demoAccount.cash) {
      Alert.alert('Insufficient Funds', `You need $${totalCost.toFixed(2)} but only have $${demoAccount.cash.toFixed(2)}`);
      return;
    }

    // Create new position
    const newPosition: OptionPosition = {
      id: Date.now().toString(),
      symbol,
      type: selectedType,
      action: selectedAction,
      strike: selectedStrike,
      premium,
      quantity,
      totalCost,
      currentValue: 0,
      profitLoss: 0,
      timestamp: new Date()
    };

    // Update account
    setDemoAccount(prev => {
      const newCash = selectedAction === 'buy' 
        ? prev.cash - totalCost 
        : prev.cash + totalCost;
      
      const newPositions = selectedAction === 'sell' 
        ? prev.positions.filter(p => !(p.symbol === symbol && p.type === selectedType && p.strike === selectedStrike))
        : [...prev.positions, newPosition];

      return {
        ...prev,
        cash: newCash,
        positions: newPositions
      };
    });

    // Reset selection
    setSelectedStrike(null);
    setSelectedType(null);
    setSelectedAction(null);
    setQuantity(1);

    Alert.alert(
      'Trade Executed', 
      `${selectedAction.toUpperCase()} ${quantity} ${selectedType.toUpperCase()} ${symbol} $${selectedStrike} @ $${premium.toFixed(2)}`
    );
  };

  const closePosition = (positionId: string) => {
    setDemoAccount(prev => {
      const position = prev.positions.find(p => p.id === positionId);
      if (!position) return prev;

      const intrinsicValue = position.type === 'call' 
        ? Math.max(0, stockPrice - position.strike)
        : Math.max(0, position.strike - stockPrice);
      
      const currentValue = intrinsicValue * position.quantity * 100;
      const newCash = position.action === 'buy' 
        ? prev.cash + currentValue
        : prev.cash - currentValue;

      return {
        ...prev,
        cash: newCash,
        positions: prev.positions.filter(p => p.id !== positionId)
      };
    });
  };

  // Generate strike prices around current stock price
  const generateStrikes = () => {
    const strikes = [];
    const baseStrike = Math.round(stockPrice / 5) * 5;
    for (let i = -5; i <= 5; i++) {
      const strike = baseStrike + (i * 5);
      if (strike > 0) strikes.push(strike);
    }
    return strikes.sort((a, b) => a - b);
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
          <Text style={styles.title}>Trading Simulator</Text>
          <Text style={styles.subtitle}>Practice options trading with demo cash</Text>
        </View>

        {/* Demo Account Balance */}
        <View style={styles.section}>
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.balanceGradient}
            >
              <Text style={styles.balanceTitle}>Demo Account</Text>
              <Text style={styles.balanceAmount}>${demoAccount.totalValue.toFixed(2)}</Text>
              <View style={styles.balanceDetails}>
                <Text style={styles.balanceDetail}>Cash: ${demoAccount.cash.toFixed(2)}</Text>
                <Text style={[
                  styles.balanceDetail,
                  { color: demoAccount.totalPL >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  P&L: {demoAccount.totalPL >= 0 ? '+' : ''}${demoAccount.totalPL.toFixed(2)}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Stock Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Stock</Text>
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

          {/* Current Stock Price */}
          <View style={styles.stockPriceCard}>
            <View style={styles.stockInfo}>
              <Text style={styles.currentSymbol}>{symbol}</Text>
              <Text style={styles.currentPrice}>${stockPrice.toFixed(2)}</Text>
              <Text style={[
                styles.changeText,
                { color: stockChange >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                {stockChange >= 0 ? '+' : ''}${stockChange.toFixed(2)} ({stockChangePercent.toFixed(2)}%)
              </Text>
            </View>
            {loading && (
              <View style={styles.loadingIndicator}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Option Trading Interface */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Place Trade</Text>
          
          {/* Strike Price Selection */}
          <View style={styles.strikeSection}>
            <Text style={styles.inputLabel}>Strike Price</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strikesContainer}>
              {generateStrikes().map(strike => (
                <TouchableOpacity
                  key={strike}
                  style={[
                    styles.strikeButton,
                    selectedStrike === strike && styles.selectedStrike
                  ]}
                  onPress={() => setSelectedStrike(strike)}
                >
                  <Text style={[
                    styles.strikeText,
                    selectedStrike === strike && styles.selectedStrikeText
                  ]}>
                    ${strike}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Option Type Selection */}
          <View style={styles.optionTypeSection}>
            <Text style={styles.inputLabel}>Option Type</Text>
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
          </View>

          {/* Buy/Sell Selection */}
          <View style={styles.actionSection}>
            <Text style={styles.inputLabel}>Action</Text>
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
          </View>

          {/* Quantity Selection */}
          <View style={styles.quantitySection}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Execute Trade Button */}
          <TouchableOpacity
            style={[
              styles.executeButton,
              (!selectedStrike || !selectedType || !selectedAction) && styles.disabledButton
            ]}
            onPress={executeTrade}
            disabled={!selectedStrike || !selectedType || !selectedAction}
          >
            <LinearGradient
              colors={
                !selectedStrike || !selectedType || !selectedAction
                  ? ['#CBD5E1', '#94A3B8']
                  : ['#10B981', '#059669']
              }
              style={styles.executeButtonGradient}
            >
              <MaterialIcons name="swap-horiz" size={20} color="#FFFFFF" />
              <Text style={styles.executeButtonText}>Execute Trade</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Current Positions */}
        {demoAccount.positions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Positions</Text>
            {demoAccount.positions.map((position) => (
              <View key={position.id} style={styles.positionCard}>
                <View style={styles.positionHeader}>
                  <Text style={styles.positionTitle}>
                    {position.action.toUpperCase()} {position.type.toUpperCase()}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => closePosition(position.id)}
                  >
                    <MaterialIcons name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.positionSymbol}>{position.symbol} ${position.strike}</Text>
                <Text style={styles.positionDetails}>
                  Premium: ${position.premium.toFixed(2)} × {position.quantity} contract{position.quantity > 1 ? 's' : ''}
                </Text>
                <Text style={styles.positionDetails}>
                  Cost: ${position.totalCost.toFixed(2)}
                </Text>
                <Text style={[
                  styles.positionPL,
                  { color: position.profitLoss >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  P&L: {position.profitLoss >= 0 ? '+' : ''}${position.profitLoss.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  
  // Balance Card
  balanceCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: 20,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  balanceDetail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // Symbol Selection
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

  // Stock Price Card
  stockPriceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stockInfo: {
    alignItems: 'center',
  },
  currentSymbol: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },

  // Trading Interface
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  strikeSection: {
    marginBottom: 20,
  },
  strikesContainer: {
    marginBottom: 8,
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

  optionTypeSection: {
    marginBottom: 20,
  },
  optionTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
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

  actionSection: {
    marginBottom: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
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

  quantitySection: {
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  quantityButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    minWidth: 40,
    textAlign: 'center',
  },

  // Execute Button
  executeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  executeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Position Cards
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
  closeButton: {
    padding: 4,
  },
  positionSymbol: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 4,
  },
  positionDetails: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  positionPL: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
});