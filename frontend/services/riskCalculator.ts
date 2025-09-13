interface RiskCalculationInputs {
  accountValue: number;
  riskPerTrade: number; // as percentage
  stopLossPrice: number;
  entryPrice: number;
  positionType: 'long' | 'short';
  optionType?: 'call' | 'put';
  optionStrike?: number;
  optionPremium?: number;
  contracts?: number;
}

interface RiskCalculationResult {
  positionSize: number;
  maxLoss: number;
  riskRewardRatio: number;
  positionValue: number;
  sharesOrContracts: number;
  riskAmount: number;
  recommendedStopLoss: number;
  warnings: string[];
  suggestions: string[];
}

interface PortfolioRiskAnalysis {
  totalPortfolioValue: number;
  totalRisk: number;
  riskPercentage: number;
  diversificationScore: number;
  maxDrawdown: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  recommendations: string[];
}

export class RiskCalculator {
  private static instance: RiskCalculator;

  static getInstance(): RiskCalculator {
    if (!RiskCalculator.instance) {
      RiskCalculator.instance = new RiskCalculator();
    }
    return RiskCalculator.instance;
  }

  calculatePositionSize(inputs: RiskCalculationInputs): RiskCalculationResult {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    const riskAmount = (inputs.accountValue * inputs.riskPerTrade) / 100;
    const priceDifference = Math.abs(inputs.entryPrice - inputs.stopLossPrice);
    
    if (priceDifference === 0) {
      warnings.push('Stop loss price cannot be the same as entry price');
      return {
        positionSize: 0,
        maxLoss: 0,
        riskRewardRatio: 0,
        positionValue: 0,
        sharesOrContracts: 0,
        riskAmount,
        recommendedStopLoss: inputs.entryPrice * 0.95, // 5% stop loss
        warnings,
        suggestions: ['Set a stop loss at least 2-5% away from entry price']
      };
    }

    let sharesOrContracts: number;
    let positionValue: number;
    let maxLoss: number;

    if (inputs.optionType && inputs.optionStrike && inputs.optionPremium) {
      // Options calculation
      const contracts = Math.floor(riskAmount / (inputs.optionPremium * 100));
      sharesOrContracts = contracts;
      positionValue = contracts * inputs.optionPremium * 100;
      maxLoss = positionValue; // Maximum loss for long options is the premium paid
    } else {
      // Stock calculation
      sharesOrContracts = Math.floor(riskAmount / priceDifference);
      positionValue = sharesOrContracts * inputs.entryPrice;
      maxLoss = sharesOrContracts * priceDifference;
    }

    // Risk validation
    if (maxLoss > riskAmount * 1.1) {
      warnings.push('Calculated risk exceeds target risk amount');
    }

    if (positionValue > inputs.accountValue * 0.3) {
      warnings.push('Position size exceeds 30% of account value');
      suggestions.push('Consider reducing position size for better diversification');
    }

    if (inputs.riskPerTrade > 2) {
      warnings.push('Risk per trade exceeds recommended 2%');
      suggestions.push('Consider reducing risk per trade to 1-2%');
    }

    // Calculate risk-reward ratio (simplified)
    const potentialProfit = inputs.positionType === 'long' 
      ? (inputs.entryPrice * 1.1 - inputs.entryPrice) * sharesOrContracts // 10% profit target
      : (inputs.entryPrice - inputs.entryPrice * 0.9) * sharesOrContracts;
    
    const riskRewardRatio = potentialProfit / maxLoss;

    if (riskRewardRatio < 1) {
      suggestions.push('Consider improving risk-reward ratio to at least 1:1');
    }

    return {
      positionSize: positionValue,
      maxLoss,
      riskRewardRatio: Math.round(riskRewardRatio * 100) / 100,
      positionValue,
      sharesOrContracts,
      riskAmount,
      recommendedStopLoss: inputs.positionType === 'long' 
        ? inputs.entryPrice * 0.95 
        : inputs.entryPrice * 1.05,
      warnings,
      suggestions
    };
  }

  calculatePortfolioRisk(positions: Array<{
    symbol: string;
    value: number;
    risk: number;
    correlation?: number;
  }>, accountValue: number): PortfolioRiskAnalysis {
    const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    const totalRisk = positions.reduce((sum, pos) => sum + pos.risk, 0);
    const riskPercentage = (totalRisk / accountValue) * 100;

    // Calculate diversification score (simplified)
    const uniqueSymbols = new Set(positions.map(p => p.symbol)).size;
    const diversificationScore = Math.min(100, (uniqueSymbols / 10) * 100);

    // Calculate max drawdown (simplified)
    const maxDrawdown = Math.min(100, (totalRisk / accountValue) * 100);

    let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    if (riskPercentage < 5) riskLevel = 'low';
    else if (riskPercentage < 15) riskLevel = 'medium';
    else if (riskPercentage < 25) riskLevel = 'high';
    else riskLevel = 'extreme';

    const recommendations: string[] = [];
    
    if (riskPercentage > 20) {
      recommendations.push('Portfolio risk is too high. Consider reducing position sizes.');
    }
    
    if (diversificationScore < 50) {
      recommendations.push('Portfolio lacks diversification. Consider adding more positions.');
    }
    
    if (positions.length > 20) {
      recommendations.push('Too many positions. Consider consolidating for better management.');
    }

    return {
      totalPortfolioValue: totalValue,
      totalRisk,
      riskPercentage: Math.round(riskPercentage * 100) / 100,
      diversificationScore: Math.round(diversificationScore),
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      riskLevel,
      recommendations
    };
  }

  calculateKellyCriterion(
    winRate: number, // as decimal (0.6 for 60%)
    avgWin: number,
    avgLoss: number
  ): number {
    if (avgLoss === 0) return 0;
    
    const b = avgWin / avgLoss; // win/loss ratio
    const p = winRate; // win rate
    const q = 1 - p; // loss rate
    
    const kelly = (b * p - q) / b;
    
    // Cap at 25% to prevent over-leveraging
    return Math.max(0, Math.min(0.25, kelly));
  }

  calculatePositionSizing(
    accountValue: number,
    stockPrice: number,
    stopLossPrice: number,
    riskPerTrade: number
  ): {
    shares: number;
    positionValue: number;
    riskAmount: number;
  } {
    const riskAmount = (accountValue * riskPerTrade) / 100;
    const priceDifference = Math.abs(stockPrice - stopLossPrice);
    const shares = Math.floor(riskAmount / priceDifference);
    const positionValue = shares * stockPrice;

    return {
      shares,
      positionValue,
      riskAmount
    };
  }

  validateRiskParameters(inputs: RiskCalculationInputs): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (inputs.accountValue <= 0) {
      errors.push('Account value must be greater than 0');
    }

    if (inputs.riskPerTrade <= 0 || inputs.riskPerTrade > 10) {
      errors.push('Risk per trade must be between 0.1% and 10%');
    }

    if (inputs.entryPrice <= 0) {
      errors.push('Entry price must be greater than 0');
    }

    if (inputs.stopLossPrice <= 0) {
      errors.push('Stop loss price must be greater than 0');
    }

    if (inputs.positionType === 'long' && inputs.stopLossPrice >= inputs.entryPrice) {
      errors.push('For long positions, stop loss must be below entry price');
    }

    if (inputs.positionType === 'short' && inputs.stopLossPrice <= inputs.entryPrice) {
      errors.push('For short positions, stop loss must be above entry price');
    }

    if (inputs.riskPerTrade > 2) {
      warnings.push('Risk per trade exceeds recommended 2%');
    }

    if (inputs.optionType && (!inputs.optionStrike || !inputs.optionPremium)) {
      errors.push('Option strike and premium are required for option calculations');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const riskCalculator = RiskCalculator.getInstance();
