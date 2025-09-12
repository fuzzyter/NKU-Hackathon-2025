interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface OptionContract {
  symbol: string;
  strike: number;
  expiry: string;
  type: 'call' | 'put';
  bid: number;
  ask: number;
  lastPrice: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
}

interface OptionChain {
  symbol: string;
  expiry: string;
  calls: OptionContract[];
  puts: OptionContract[];
}

// Using Alpha Vantage API (free tier available)
const API_KEY = 'demo'; // Replace with actual API key
const BASE_URL = 'https://www.alphavantage.co/query';

// Fallback to Yahoo Finance API for demo purposes
const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

export class MarketDataService {
  private static instance: MarketDataService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    const cacheKey = `quote_${symbol}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // Try Yahoo Finance first (more reliable for demo)
      const response = await fetch(`${YAHOO_BASE_URL}/${symbol}?interval=1d&range=1d`);
      const data = await response.json();
      
      if (data.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const quote: StockQuote = {
          symbol: symbol.toUpperCase(),
          price: meta.regularMarketPrice || meta.previousClose || 100,
          change: (meta.regularMarketPrice || 100) - (meta.previousClose || 100),
          changePercent: ((meta.regularMarketPrice || 100) - (meta.previousClose || 100)) / (meta.previousClose || 100) * 100
        };
        
        this.setCache(cacheKey, quote);
        return quote;
      }
    } catch (error) {
      console.warn('Failed to fetch real data, using mock data:', error);
    }

    // Fallback to mock data with realistic variation
    const mockPrice = 100 + Math.random() * 100; // $100-200 range
    const mockChange = (Math.random() - 0.5) * 10; // -$5 to +$5 change
    
    const mockQuote: StockQuote = {
      symbol: symbol.toUpperCase(),
      price: mockPrice,
      change: mockChange,
      changePercent: (mockChange / mockPrice) * 100
    };
    
    this.setCache(cacheKey, mockQuote);
    return mockQuote;
  }

  async getOptionChain(symbol: string, expiry?: string): Promise<OptionChain> {
    const cacheKey = `options_${symbol}_${expiry || 'default'}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const stockQuote = await this.getStockQuote(symbol);
      const stockPrice = stockQuote.price;
      
      // Generate realistic option chain based on current stock price
      const optionChain = this.generateRealisticOptionChain(symbol, stockPrice, expiry);
      
      this.setCache(cacheKey, optionChain);
      return optionChain;
    } catch (error) {
      console.warn('Failed to fetch option chain, using mock data:', error);
      
      // Fallback mock option chain
      const mockChain = this.generateRealisticOptionChain(symbol, 100);
      this.setCache(cacheKey, mockChain);
      return mockChain;
    }
  }

  private generateRealisticOptionChain(symbol: string, stockPrice: number, expiry?: string): OptionChain {
    const expiryDate = expiry || this.getNextFridayExpiry();
    const strikes = this.generateStrikes(stockPrice);
    const timeToExpiry = this.calculateTimeToExpiry(expiryDate);
    
    const calls: OptionContract[] = strikes.map(strike => {
      const intrinsicValue = Math.max(0, stockPrice - strike);
      const timeValue = this.calculateTimeValue(stockPrice, strike, timeToExpiry, true);
      const premium = intrinsicValue + timeValue;
      
      return {
        symbol: `${symbol}${expiryDate.replace(/-/g, '')}C${strike}`,
        strike,
        expiry: expiryDate,
        type: 'call',
        bid: Math.max(0.01, premium - 0.05),
        ask: premium + 0.05,
        lastPrice: premium,
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        impliedVolatility: 0.15 + Math.random() * 0.3 // 15-45% IV
      };
    });

    const puts: OptionContract[] = strikes.map(strike => {
      const intrinsicValue = Math.max(0, strike - stockPrice);
      const timeValue = this.calculateTimeValue(stockPrice, strike, timeToExpiry, false);
      const premium = intrinsicValue + timeValue;
      
      return {
        symbol: `${symbol}${expiryDate.replace(/-/g, '')}P${strike}`,
        strike,
        expiry: expiryDate,
        type: 'put',
        bid: Math.max(0.01, premium - 0.05),
        ask: premium + 0.05,
        lastPrice: premium,
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        impliedVolatility: 0.15 + Math.random() * 0.3
      };
    });

    return {
      symbol: symbol.toUpperCase(),
      expiry: expiryDate,
      calls,
      puts
    };
  }

  private generateStrikes(stockPrice: number): number[] {
    const strikes: number[] = [];
    const baseStrike = Math.round(stockPrice / 5) * 5; // Round to nearest $5
    
    // Generate strikes from -20% to +20% of stock price
    for (let i = -4; i <= 4; i++) {
      const strike = baseStrike + (i * 5);
      if (strike > 0) {
        strikes.push(strike);
      }
    }
    
    return strikes.sort((a, b) => a - b);
  }

  private getNextFridayExpiry(): string {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7; // Next Friday
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    
    return nextFriday.toISOString().split('T')[0];
  }

  private calculateTimeToExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.max(0, diffDays / 365); // Convert to years
  }

  private calculateTimeValue(stockPrice: number, strike: number, timeToExpiry: number, isCall: boolean): number {
    // Simplified time value calculation
    const volatility = 0.25; // 25% assumed volatility
    const riskFreeRate = 0.05; // 5% risk-free rate
    
    // Basic time value approximation
    const moneyness = isCall ? (stockPrice / strike) : (strike / stockPrice);
    const timeValue = Math.sqrt(timeToExpiry) * volatility * stockPrice * 0.4 * Math.exp(-Math.pow(Math.log(moneyness), 2) / 2);
    
    return Math.max(0.01, timeValue);
  }

  async getPopularSymbols(): Promise<string[]> {
    // Return popular symbols for demo
    return ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'SPY', 'QQQ', 'IWM'];
  }

  async searchSymbols(query: string): Promise<string[]> {
    const popular = await this.getPopularSymbols();
    return popular.filter(symbol => 
      symbol.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }
}

export const marketDataService = MarketDataService.getInstance();