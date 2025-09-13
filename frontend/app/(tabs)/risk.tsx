import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { riskCalculator } from '../../services/riskCalculator';

interface RiskInputs {
  accountValue: string;
  riskPerTrade: string;
  entryPrice: string;
  stopLossPrice: string;
  positionType: 'long' | 'short';
  optionType?: 'call' | 'put';
  optionStrike: string;
  optionPremium: string;
  contracts: string;
}

export default function RiskCalculator() {
  const [inputs, setInputs] = useState<RiskInputs>({
    accountValue: '10000',
    riskPerTrade: '2',
    entryPrice: '100',
    stopLossPrice: '95',
    positionType: 'long',
    optionType: undefined,
    optionStrike: '',
    optionPremium: '',
    contracts: '1'
  });

  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);

  const calculateRisk = () => {
    const validation = riskCalculator.validateRiskParameters({
      accountValue: parseFloat(inputs.accountValue),
      riskPerTrade: parseFloat(inputs.riskPerTrade),
      entryPrice: parseFloat(inputs.entryPrice),
      stopLossPrice: parseFloat(inputs.stopLossPrice),
      positionType: inputs.positionType,
      optionType: inputs.optionType,
      optionStrike: inputs.optionStrike ? parseFloat(inputs.optionStrike) : undefined,
      optionPremium: inputs.optionPremium ? parseFloat(inputs.optionPremium) : undefined,
      contracts: inputs.contracts ? parseInt(inputs.contracts) : undefined
    });

    if (!validation.isValid) {
      Alert.alert('Invalid Input', validation.errors.join('\n'));
      return;
    }

    if (validation.warnings.length > 0) {
      Alert.alert('Warning', validation.warnings.join('\n'));
    }

    const result = riskCalculator.calculatePositionSize({
      accountValue: parseFloat(inputs.accountValue),
      riskPerTrade: parseFloat(inputs.riskPerTrade),
      entryPrice: parseFloat(inputs.entryPrice),
      stopLossPrice: parseFloat(inputs.stopLossPrice),
      positionType: inputs.positionType,
      optionType: inputs.optionType,
      optionStrike: inputs.optionStrike ? parseFloat(inputs.optionStrike) : undefined,
      optionPremium: inputs.optionPremium ? parseFloat(inputs.optionPremium) : undefined,
      contracts: inputs.contracts ? parseInt(inputs.contracts) : undefined
    });

    setCalculationResult(result);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'extreme': return '#DC2626';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Risk Calculator</Text>
          <Text style={styles.subtitle}>Calculate position sizes and manage risk</Text>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Value ($)</Text>
            <TextInput
              style={styles.input}
              value={inputs.accountValue}
              onChangeText={(text) => setInputs(prev => ({ ...prev, accountValue: text }))}
              keyboardType="numeric"
              placeholder="10000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Risk Per Trade (%)</Text>
            <TextInput
              style={styles.input}
              value={inputs.riskPerTrade}
              onChangeText={(text) => setInputs(prev => ({ ...prev, riskPerTrade: text }))}
              keyboardType="numeric"
              placeholder="2"
            />
          </View>
        </View>

        {/* Position Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position Type</Text>
          <View style={styles.positionTypeContainer}>
            <TouchableOpacity
              style={[
                styles.positionTypeButton,
                inputs.positionType === 'long' && styles.selectedPositionType
              ]}
              onPress={() => setInputs(prev => ({ ...prev, positionType: 'long' }))}
            >
              <MaterialIcons name="trending-up" size={20} color={inputs.positionType === 'long' ? '#FFFFFF' : '#10B981'} />
              <Text style={[
                styles.positionTypeText,
                inputs.positionType === 'long' && styles.selectedPositionTypeText
              ]}>
                Long
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.positionTypeButton,
                inputs.positionType === 'short' && styles.selectedPositionType
              ]}
              onPress={() => setInputs(prev => ({ ...prev, positionType: 'short' }))}
            >
              <MaterialIcons name="trending-down" size={20} color={inputs.positionType === 'short' ? '#FFFFFF' : '#EF4444'} />
              <Text style={[
                styles.positionTypeText,
                inputs.positionType === 'short' && styles.selectedPositionTypeText
              ]}>
                Short
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Asset Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asset Type</Text>
          <View style={styles.assetTypeContainer}>
            <TouchableOpacity
              style={[
                styles.assetTypeButton,
                !showOptions && styles.selectedAssetType
              ]}
              onPress={() => setShowOptions(false)}
            >
              <MaterialIcons name="attach-money" size={20} color={!showOptions ? '#FFFFFF' : '#3B82F6'} />
              <Text style={[
                styles.assetTypeText,
                !showOptions && styles.selectedAssetTypeText
              ]}>
                Stock
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.assetTypeButton,
                showOptions && styles.selectedAssetType
              ]}
              onPress={() => setShowOptions(true)}
            >
              <MaterialIcons name="my-location" size={20} color={showOptions ? '#FFFFFF' : '#3B82F6'} />
              <Text style={[
                styles.assetTypeText,
                showOptions && styles.selectedAssetTypeText
              ]}>
                Options
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Entry Price ($)</Text>
            <TextInput
              style={styles.input}
              value={inputs.entryPrice}
              onChangeText={(text) => setInputs(prev => ({ ...prev, entryPrice: text }))}
              keyboardType="numeric"
              placeholder="100"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Stop Loss Price ($)</Text>
            <TextInput
              style={styles.input}
              value={inputs.stopLossPrice}
              onChangeText={(text) => setInputs(prev => ({ ...prev, stopLossPrice: text }))}
              keyboardType="numeric"
              placeholder="95"
            />
          </View>

          {showOptions && (
            <>
              <View style={styles.optionTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionTypeButton,
                    inputs.optionType === 'call' && styles.selectedOptionType
                  ]}
                  onPress={() => setInputs(prev => ({ ...prev, optionType: 'call' }))}
                >
                  <Text style={[
                    styles.optionTypeText,
                    inputs.optionType === 'call' && styles.selectedOptionTypeText
                  ]}>
                    Call
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionTypeButton,
                    inputs.optionType === 'put' && styles.selectedOptionType
                  ]}
                  onPress={() => setInputs(prev => ({ ...prev, optionType: 'put' }))}
                >
                  <Text style={[
                    styles.optionTypeText,
                    inputs.optionType === 'put' && styles.selectedOptionTypeText
                  ]}>
                    Put
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Strike Price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={inputs.optionStrike}
                  onChangeText={(text) => setInputs(prev => ({ ...prev, optionStrike: text }))}
                  keyboardType="numeric"
                  placeholder="105"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Option Premium ($)</Text>
                <TextInput
                  style={styles.input}
                  value={inputs.optionPremium}
                  onChangeText={(text) => setInputs(prev => ({ ...prev, optionPremium: text }))}
                  keyboardType="numeric"
                  placeholder="2.50"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Number of Contracts</Text>
                <TextInput
                  style={styles.input}
                  value={inputs.contracts}
                  onChangeText={(text) => setInputs(prev => ({ ...prev, contracts: text }))}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>
            </>
          )}
        </View>

        {/* Calculate Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.calculateButton} onPress={calculateRisk}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.calculateButtonGradient}
            >
              <Ionicons name="calculator" size={20} color="#FFFFFF" />
              <Text style={styles.calculateButtonText}>Calculate Risk</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {calculationResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Analysis Results</Text>
            
            <View style={styles.resultsContainer}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Position Size</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(calculationResult.positionSize)}
                </Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Max Loss</Text>
                <Text style={[styles.resultValue, { color: '#EF4444' }]}>
                  {formatCurrency(calculationResult.maxLoss)}
                </Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Risk Amount</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(calculationResult.riskAmount)}
                </Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Risk/Reward Ratio</Text>
                <Text style={styles.resultValue}>
                  {calculationResult.riskRewardRatio}:1
                </Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>
                  {showOptions ? 'Contracts' : 'Shares'}
                </Text>
                <Text style={styles.resultValue}>
                  {calculationResult.sharesOrContracts}
                </Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Recommended Stop Loss</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(calculationResult.recommendedStopLoss)}
                </Text>
              </View>
            </View>

            {/* Warnings */}
            {calculationResult.warnings.length > 0 && (
              <View style={styles.warningsContainer}>
                <Text style={styles.warningsTitle}>⚠️ Warnings</Text>
                {calculationResult.warnings.map((warning: string, index: number) => (
                  <Text key={index} style={styles.warningText}>• {warning}</Text>
                ))}
              </View>
            )}

            {/* Suggestions */}
            {calculationResult.suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>💡 Suggestions</Text>
                {calculationResult.suggestions.map((suggestion: string, index: number) => (
                  <Text key={index} style={styles.suggestionText}>• {suggestion}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Risk Management Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Management Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <Shield size={24} color="#10B981" />
              <Text style={styles.tipText}>
                Never risk more than 2% of your account on a single trade
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Target size={24} color="#3B82F6" />
              <Text style={styles.tipText}>
                Always set stop losses before entering a position
              </Text>
            </View>
            <View style={styles.tipCard}>
              <AlertTriangle size={24} color="#F59E0B" />
              <Text style={styles.tipText}>
                Diversify your portfolio across different sectors
              </Text>
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  positionTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  positionTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedPositionType: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  positionTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  selectedPositionTypeText: {
    color: '#FFFFFF',
  },
  assetTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  assetTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedAssetType: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  assetTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  selectedAssetTypeText: {
    color: '#FFFFFF',
  },
  optionTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionTypeButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedOptionType: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedOptionTypeText: {
    color: '#FFFFFF',
  },
  calculateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  calculateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  warningsContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#0369A1',
    marginBottom: 4,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
});
