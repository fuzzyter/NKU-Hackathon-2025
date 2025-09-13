import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

interface PriceChartProps {
  data: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

const screenWidth = Dimensions.get('window').width;

export default function PriceChart({ data, symbol, currentPrice, change, changePercent }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chart data available</Text>
      </View>
    );
  }

  // Prepare chart data - use last 20 data points for better visibility
  const chartData = data.slice(-20).map(item => item.close);
  const labels = data.slice(-20).map((item, index) => {
    const date = new Date(item.timestamp);
    return index % 4 === 0 ? date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '';
  });

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 2,
    color: (opacity = 1) => change >= 0 ? `rgba(16, 185, 129, ${opacity})` : `rgba(239, 68, 68, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: change >= 0 ? '#10B981' : '#EF4444',
    },
    propsForBackgroundLines: {
      strokeDasharray: '5,5',
      stroke: '#E2E8F0',
      strokeWidth: 1,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{symbol}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${currentPrice.toFixed(2)}</Text>
          <Text style={[
            styles.change,
            { color: change >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            {change >= 0 ? '+' : ''}${change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: chartData,
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 48}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={false}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={true}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last 20 data points • 5-minute intervals
        </Text>
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
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
  },
});
