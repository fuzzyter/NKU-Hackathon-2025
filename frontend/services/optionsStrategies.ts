export interface OptionsStrategy {
  id: string;
  name: string;
  description: string;
  category: 'income' | 'directional' | 'volatility' | 'hedging';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxProfit: number | 'unlimited';
  maxLoss: number;
  breakevenPoints: number[];
  profitZone: {
    min: number;
    max: number;
  };
  requirements: {
    minPositions: number;
    maxPositions: number;
    sameExpiry: boolean;
    sameStrike: boolean;
  };
  setup: {
    positions: Array<{
      type: 'call' | 'put';
      action: 'buy' | 'sell';
      strike: number;
      quantity: number;
    }>;
  };
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  marketOutlook: 'bullish' | 'bearish' | 'neutral' | 'volatile';
}

export const OPTIONS_STRATEGIES: OptionsStrategy[] = [
  {
    id: 'covered_call',
    name: 'Covered Call',
    description: 'Sell a call option against stock you own to generate income',
    category: 'income',
    difficulty: 'beginner',
    maxProfit: 'unlimited',
    maxLoss: -1000, // Stock can go to zero
    breakevenPoints: [95], // Stock price - premium received
    profitZone: { min: 0, max: 105 },
    requirements: {
      minPositions: 2,
      maxPositions: 2,
      sameExpiry: true,
      sameStrike: true
    },
    setup: {
      positions: [
        { type: 'call', action: 'sell', strike: 105, quantity: 1 },
        { type: 'call', action: 'buy', strike: 0, quantity: 100 } // Represents 100 shares
      ]
    },
    greeks: { delta: 0.5, gamma: 0.02, theta: -0.05, vega: 0.1 },
    riskLevel: 'low',
    marketOutlook: 'neutral'
  },
  {
    id: 'cash_secured_put',
    name: 'Cash-Secured Put',
    description: 'Sell a put option with cash to cover assignment',
    category: 'income',
    difficulty: 'beginner',
    maxProfit: 250, // Premium received
    maxLoss: -9750, // Strike price - premium received
    breakevenPoints: [97.5], // Strike - premium
    profitZone: { min: 0, max: 100 },
    requirements: {
      minPositions: 1,
      maxPositions: 1,
      sameExpiry: false,
      sameStrike: false
    },
    setup: {
      positions: [
        { type: 'put', action: 'sell', strike: 100, quantity: 1 }
      ]
    },
    greeks: { delta: -0.5, gamma: 0.02, theta: 0.05, vega: 0.1 },
    riskLevel: 'medium',
    marketOutlook: 'bullish'
  },
  {
    id: 'long_straddle',
    name: 'Long Straddle',
    description: 'Buy both call and put at same strike to profit from volatility',
    category: 'volatility',
    difficulty: 'intermediate',
    maxProfit: 'unlimited',
    maxLoss: -500, // Total premium paid
    breakevenPoints: [95, 105], // Strike ± total premium
    profitZone: { min: 90, max: 110 },
    requirements: {
      minPositions: 2,
      maxPositions: 2,
      sameExpiry: true,
      sameStrike: true
    },
    setup: {
      positions: [
        { type: 'call', action: 'buy', strike: 100, quantity: 1 },
        { type: 'put', action: 'buy', strike: 100, quantity: 1 }
      ]
    },
    greeks: { delta: 0, gamma: 0.04, theta: -0.1, vega: 0.2 },
    riskLevel: 'high',
    marketOutlook: 'volatile'
  },
  {
    id: 'short_straddle',
    name: 'Short Straddle',
    description: 'Sell both call and put at same strike to profit from low volatility',
    category: 'volatility',
    difficulty: 'advanced',
    maxProfit: 500, // Total premium received
    maxLoss: 'unlimited',
    breakevenPoints: [95, 105], // Strike ± total premium
    profitZone: { min: 95, max: 105 },
    requirements: {
      minPositions: 2,
      maxPositions: 2,
      sameExpiry: true,
      sameStrike: true
    },
    setup: {
      positions: [
        { type: 'call', action: 'sell', strike: 100, quantity: 1 },
        { type: 'put', action: 'sell', strike: 100, quantity: 1 }
      ]
    },
    greeks: { delta: 0, gamma: -0.04, theta: 0.1, vega: -0.2 },
    riskLevel: 'high',
    marketOutlook: 'neutral'
  },
  {
    id: 'bull_call_spread',
    name: 'Bull Call Spread',
    description: 'Buy lower strike call, sell higher strike call for bullish outlook',
    category: 'directional',
    difficulty: 'intermediate',
    maxProfit: 200, // Spread width - net debit
    maxLoss: -300, // Net debit paid
    breakevenPoints: [103], // Lower strike + net debit
    profitZone: { min: 103, max: 110 },
    requirements: {
      minPositions: 2,
      maxPositions: 2,
      sameExpiry: true,
      sameStrike: false
    },
    setup: {
      positions: [
        { type: 'call', action: 'buy', strike: 100, quantity: 1 },
        { type: 'call', action: 'sell', strike: 110, quantity: 1 }
      ]
    },
    greeks: { delta: 0.3, gamma: 0.01, theta: -0.02, vega: 0.05 },
    riskLevel: 'medium',
    marketOutlook: 'bullish'
  },
  {
    id: 'bear_put_spread',
    name: 'Bear Put Spread',
    description: 'Buy higher strike put, sell lower strike put for bearish outlook',
    category: 'directional',
    difficulty: 'intermediate',
    maxProfit: 200, // Spread width - net debit
    maxLoss: -300, // Net debit paid
    breakevenPoints: [97], // Higher strike - net debit
    profitZone: { min: 90, max: 97 },
    requirements: {
      minPositions: 2,
      maxPositions: 2,
      sameExpiry: true,
      sameStrike: false
    },
    setup: {
      positions: [
        { type: 'put', action: 'buy', strike: 100, quantity: 1 },
        { type: 'put', action: 'sell', strike: 90, quantity: 1 }
      ]
    },
    greeks: { delta: -0.3, gamma: 0.01, theta: -0.02, vega: 0.05 },
    riskLevel: 'medium',
    marketOutlook: 'bearish'
  },
  {
    id: 'iron_condor',
    name: 'Iron Condor',
    description: 'Sell call spread and put spread for income in range-bound market',
    category: 'income',
    difficulty: 'advanced',
    maxProfit: 300, // Net credit received
    maxLoss: -200, // Spread width - net credit
    breakevenPoints: [95, 105], // Short strikes ± net credit
    profitZone: { min: 95, max: 105 },
    requirements: {
      minPositions: 4,
      maxPositions: 4,
      sameExpiry: true,
      sameStrike: false
    },
    setup: {
      positions: [
        { type: 'put', action: 'sell', strike: 95, quantity: 1 },
        { type: 'put', action: 'buy', strike: 90, quantity: 1 },
        { type: 'call', action: 'sell', strike: 105, quantity: 1 },
        { type: 'call', action: 'buy', strike: 110, quantity: 1 }
      ]
    },
    greeks: { delta: 0, gamma: -0.02, theta: 0.05, vega: -0.1 },
    riskLevel: 'medium',
    marketOutlook: 'neutral'
  },
  {
    id: 'protective_put',
    name: 'Protective Put',
    description: 'Buy put to protect long stock position',
    category: 'hedging',
    difficulty: 'beginner',
    maxProfit: 'unlimited',
    maxLoss: -200, // Put premium paid
    breakevenPoints: [102], // Stock price + put premium
    profitZone: { min: 100, max: 200 },
    requirements: {
      minPositions: 2,
      maxPositions: 2,
      sameExpiry: false,
      sameStrike: false
    },
    setup: {
      positions: [
        { type: 'put', action: 'buy', strike: 100, quantity: 1 },
        { type: 'call', action: 'buy', strike: 0, quantity: 100 } // Represents 100 shares
      ]
    },
    greeks: { delta: 0.5, gamma: 0.02, theta: -0.05, vega: 0.1 },
    riskLevel: 'low',
    marketOutlook: 'bullish'
  }
];

export class OptionsStrategyService {
  private static instance: OptionsStrategyService;

  static getInstance(): OptionsStrategyService {
    if (!OptionsStrategyService.instance) {
      OptionsStrategyService.instance = new OptionsStrategyService();
    }
    return OptionsStrategyService.instance;
  }

  getAllStrategies(): OptionsStrategy[] {
    return OPTIONS_STRATEGIES;
  }

  getStrategiesByCategory(category: string): OptionsStrategy[] {
    return OPTIONS_STRATEGIES.filter(strategy => strategy.category === category);
  }

  getStrategiesByDifficulty(difficulty: string): OptionsStrategy[] {
    return OPTIONS_STRATEGIES.filter(strategy => strategy.difficulty === difficulty);
  }

  getStrategyById(id: string): OptionsStrategy | undefined {
    return OPTIONS_STRATEGIES.find(strategy => strategy.id === id);
  }

  getRecommendedStrategies(marketOutlook: string, riskTolerance: string): OptionsStrategy[] {
    return OPTIONS_STRATEGIES.filter(strategy => {
      const outlookMatch = strategy.marketOutlook === marketOutlook || strategy.marketOutlook === 'neutral';
      const riskMatch = this.isRiskToleranceMatch(strategy.riskLevel, riskTolerance);
      return outlookMatch && riskMatch;
    });
  }

  private isRiskToleranceMatch(strategyRisk: string, userRisk: string): boolean {
    const riskLevels = { low: 1, medium: 2, high: 3 };
    const strategyLevel = riskLevels[strategyRisk as keyof typeof riskLevels] || 1;
    const userLevel = riskLevels[userRisk as keyof typeof riskLevels] || 1;
    
    return strategyLevel <= userLevel;
  }

  calculateStrategyPL(
    strategy: OptionsStrategy,
    stockPrice: number,
    timeToExpiry: number = 0.25
  ): {
    profit: number;
    maxProfit: number;
    maxLoss: number;
    breakevenPoints: number[];
  } {
    let totalPL = 0;
    const breakevenPoints: number[] = [];

    strategy.setup.positions.forEach(position => {
      if (position.strike === 0) return; // Skip stock positions for now
      
      const intrinsicValue = position.type === 'call' 
        ? Math.max(0, stockPrice - position.strike)
        : Math.max(0, position.strike - stockPrice);
      
      const timeValue = this.calculateTimeValue(stockPrice, position.strike, timeToExpiry);
      const optionValue = intrinsicValue + timeValue;
      
      const positionPL = position.action === 'buy' 
        ? (optionValue - 2.5) * position.quantity * 100 // Assuming $2.50 premium
        : (2.5 - optionValue) * position.quantity * 100;
      
      totalPL += positionPL;
    });

    return {
      profit: Math.round(totalPL),
      maxProfit: typeof strategy.maxProfit === 'number' ? strategy.maxProfit : 10000,
      maxLoss: strategy.maxLoss,
      breakevenPoints: strategy.breakevenPoints
    };
  }

  private calculateTimeValue(stockPrice: number, strike: number, timeToExpiry: number): number {
    // Simplified time value calculation
    const volatility = 0.25;
    const timeValue = Math.sqrt(timeToExpiry) * volatility * stockPrice * 0.1;
    return Math.max(0.01, timeValue);
  }

  validateStrategySetup(positions: any[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (positions.length === 0) {
      errors.push('At least one position is required');
    }

    // Check for conflicting positions
    const calls = positions.filter(p => p.type === 'call');
    const puts = positions.filter(p => p.type === 'put');

    if (calls.length > 0 && puts.length > 0) {
      warnings.push('Mixed call and put positions detected');
    }

    // Check for excessive risk
    const totalQuantity = positions.reduce((sum, p) => sum + Math.abs(p.quantity), 0);
    if (totalQuantity > 10) {
      warnings.push('High position quantity detected');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const optionsStrategyService = OptionsStrategyService.getInstance();
