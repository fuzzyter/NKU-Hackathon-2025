import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface MarketMoversChartProps {
  gainers: Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  }>;
  losers: Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  }>;
}

const screenWidth = Dimensions.get('window').width;

export default function MarketMoversChart({ gainers, losers }: MarketMoversChartProps) {
  if (!gainers.length && !losers.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No market data available</Text>
      </View>
    );
  }

  // Prepare data for top 5 gainers and losers
  const topGainers = gainers.slice(0, 5);
  const topLosers = losers.slice(0, 5);
  
  const gainerLabels = topGainers.map(stock => stock.symbol);
  const gainerData = topGainers.map(stock => stock.changePercent);
  
  const loserLabels = topLosers.map(stock => stock.symbol);
  const loserData = topLosers.map(stock => Math.abs(stock.changePercent));

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  const loserChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Movers Performance</Text>
      
      <View style={styles.chartsContainer}>
        {/* Top Gainers Chart */}
        {topGainers.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Top Gainers</Text>
            <BarChart
              data={{
                labels: gainerLabels,
                datasets: [
                  {
                    data: gainerData,
                  },
                ],
              }}
              width={screenWidth - 48}
              height={150}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars={true}
              fromZero={true}
            />
          </View>
        )}

        {/* Top Losers Chart */}
        {topLosers.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Top Losers</Text>
            <BarChart
              data={{
                labels: loserLabels,
                datasets: [
                  {
                    data: loserData,
                  },
                ],
              }}
              width={screenWidth - 48}
              height={150}
              chartConfig={loserChartConfig}
              style={styles.chart}
              showValuesOnTopOfBars={true}
              fromZero={true}
            />
          </View>
        )}
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartsContainer: {
    gap: 16,
  },
  chartSection: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
