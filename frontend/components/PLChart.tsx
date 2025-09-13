import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

interface PLPoint {
  price: number;
  profit: number;
}

interface PLChartProps {
  plData: PLPoint[];
  currentPrice: number;
  currentPL: number;
  maxProfit: number;
  maxLoss: number;
  breakeven: number | null;
}

const screenWidth = Dimensions.get('window').width;

export default function PLChart({ 
  plData, 
  currentPrice, 
  currentPL, 
  maxProfit, 
  maxLoss, 
  breakeven 
}: PLChartProps) {
  if (!plData || plData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Add positions to see P&L visualization</Text>
      </View>
    );
  }

  // Prepare chart data
  const prices = plData.map(point => point.price);
  const profits = plData.map(point => point.profit);
  
  // Create labels for price axis
  const labels = prices.map((price, index) => {
    if (index % 5 === 0) {
      return `$${price}`;
    }
    return '';
  });

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
    propsForBackgroundLines: {
      strokeDasharray: '5,5',
      stroke: '#E2E8F0',
      strokeWidth: 1,
    },
  };

  // Find current price position on chart
  const currentPriceIndex = prices.findIndex(price => Math.abs(price - currentPrice) < 0.5);
  const currentPLValue = currentPriceIndex >= 0 ? profits[currentPriceIndex] : currentPL;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profit/Loss Chart</Text>
        <View style={styles.currentPLContainer}>
          <Text style={styles.currentPLLabel}>Current P&L:</Text>
          <Text style={[
            styles.currentPLValue,
            { color: currentPLValue >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            ${currentPLValue >= 0 ? '+' : ''}{currentPLValue.toFixed(0)}
          </Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: profits,
                strokeWidth: 3,
              },
            ],
          }}
          width={screenWidth - 48}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={false}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={true}
        />
        
        {/* Current price indicator */}
        <View style={styles.currentPriceIndicator}>
          <View style={[
            styles.currentPriceLine,
            { left: currentPriceIndex >= 0 ? `${(currentPriceIndex / (prices.length - 1)) * 100}%` : '50%' }
          ]} />
          <Text style={styles.currentPriceText}>
            Current: ${currentPrice.toFixed(2)}
          </Text>
        </View>
      </View>
      
      {/* Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Max Profit</Text>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>
            {maxProfit === Infinity ? 'Unlimited' : `$${maxProfit.toFixed(0)}`}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Max Loss</Text>
          <Text style={[styles.metricValue, { color: '#EF4444' }]}>
            ${maxLoss.toFixed(0)}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Breakeven</Text>
          <Text style={styles.metricValue}>
            {breakeven ? `$${breakeven}` : 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  currentPLContainer: {
    alignItems: 'flex-end',
  },
  currentPLLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  currentPLValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  currentPriceIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  currentPriceLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#EF4444',
    opacity: 0.7,
  },
  currentPriceText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
});
