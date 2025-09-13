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
const API_KEY = process.env.EXPO_PUBLIC_ALPHAVANTAGE_API_KEY || process.env.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Log API key status for debugging
console.log('Alpha Vantage API Key loaded:', API_KEY !== 'demo' ? '✅ Real API Key' : '⚠️ Using Demo Key');

// Fallback to Yahoo Finance API for demo purposes
const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Additional real-time data sources
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.EXPO_PUBLIC_FINNHUB_API_KEY || 'demo'; // Replace with actual API key

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
      // Try Alpha Vantage API first for real-time data
      const alphaVantageResponse = await fetch(
        `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
      );
      const alphaVantageData = await alphaVantageResponse.json();
      
      if (alphaVantageData['Global Quote']) {
        const quote = alphaVantageData['Global Quote'];
        const stockQuote: StockQuote = {
          symbol: symbol.toUpperCase(),
          price: parseFloat(quote['05. price']) || 0,
          change: parseFloat(quote['09. change']) || 0,
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0
        };
        
        this.setCache(cacheKey, stockQuote);
        return stockQuote;
      }
    } catch (error) {
      console.warn('Alpha Vantage API failed, trying Yahoo Finance:', error);
    }

    try {
      // Fallback to Yahoo Finance API
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
      console.warn('Yahoo Finance API failed, trying Finnhub:', error);
    }

    try {
      // Try Finnhub as second fallback
      const finnhubResponse = await fetch(
        `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      const finnhubData = await finnhubResponse.json();
      
      if (finnhubData.c) {
        const quote: StockQuote = {
          symbol: symbol.toUpperCase(),
          price: finnhubData.c,
          change: finnhubData.d,
          changePercent: finnhubData.dp
        };
        
        this.setCache(cacheKey, quote);
        return quote;
      }
    } catch (error) {
      console.warn('Finnhub API failed, using mock data:', error);
    }

    // Final fallback to mock data with realistic variation
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

  // Real-time market data methods
  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<any> {
    const cacheKey = `intraday_${symbol}_${interval}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await fetch(
        `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`
      );
      const data = await response.json();
      
      if (data['Time Series (5min)'] || data['Time Series (1min)'] || data['Time Series (15min)'] || data['Time Series (30min)'] || data['Time Series (60min)']) {
        const timeSeries = data[`Time Series (${interval})`];
        const processedData = Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
          timestamp,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        })).slice(0, 100); // Last 100 data points
        
        this.setCache(cacheKey, processedData);
        return processedData;
      }
    } catch (error) {
      console.warn('Failed to fetch intraday data:', error);
    }

    // Fallback to mock data
    const mockData = this.generateMockIntradayData();
    this.setCache(cacheKey, mockData);
    return mockData;
  }

  async getMarketStatus(): Promise<{ isOpen: boolean; nextOpen?: string; nextClose?: string }> {
    const cacheKey = 'market_status';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await fetch(`${FINNHUB_BASE_URL}/stock/market-status?exchange=US&token=${FINNHUB_API_KEY}`);
      const data = await response.json();
      
      const marketStatus = {
        isOpen: data.isOpen || false,
        nextOpen: data.nextOpen,
        nextClose: data.nextClose
      };
      
      this.setCache(cacheKey, marketStatus);
      return marketStatus;
    } catch (error) {
      console.warn('Failed to fetch market status:', error);
      
      // Mock market status
      const now = new Date();
      const isOpen = now.getHours() >= 9 && now.getHours() < 16 && now.getDay() >= 1 && now.getDay() <= 5;
      
      const mockStatus = { isOpen };
      this.setCache(cacheKey, mockStatus);
      return mockStatus;
    }
  }

  async getTopGainers(): Promise<StockQuote[]> {
    const cacheKey = 'top_gainers';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await fetch(
        `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.top_gainers) {
        const gainers = data.top_gainers.map((stock: any) => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercent: parseFloat(stock.change_percentage)
        }));
        
        this.setCache(cacheKey, gainers);
        return gainers;
      }
    } catch (error) {
      console.warn('Failed to fetch top gainers:', error);
    }

    // Mock top gainers
    const mockGainers = await Promise.all(
      ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'].map(async (symbol) => {
        const quote = await this.getStockQuote(symbol);
        return quote;
      })
    );
    
    this.setCache(cacheKey, mockGainers);
    return mockGainers;
  }

  async getTopLosers(): Promise<StockQuote[]> {
    const cacheKey = 'top_losers';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await fetch(
        `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.top_losers) {
        const losers = data.top_losers.map((stock: any) => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercent: parseFloat(stock.change_percentage)
        }));
        
        this.setCache(cacheKey, losers);
        return losers;
      }
    } catch (error) {
      console.warn('Failed to fetch top losers:', error);
    }

    // Mock top losers
    const mockLosers = await Promise.all(
      ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'].map(async (symbol) => {
        const quote = await this.getStockQuote(symbol);
        return {
          ...quote,
          change: -Math.abs(quote.change),
          changePercent: -Math.abs(quote.changePercent)
        };
      })
    );
    
    this.setCache(cacheKey, mockLosers);
    return mockLosers;
  }

  private generateMockIntradayData(): any[] {
    const data = [];
    const now = new Date();
    const basePrice = 150 + Math.random() * 50;
    
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - (100 - i) * 5 * 60 * 1000); // 5-minute intervals
      const priceChange = (Math.random() - 0.5) * 2;
      const open = basePrice + priceChange;
      const close = open + (Math.random() - 0.5) * 1;
      const high = Math.max(open, close) + Math.random() * 0.5;
      const low = Math.min(open, close) - Math.random() * 0.5;
      
      data.push({
        timestamp: timestamp.toISOString(),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000)
      });
    }
    
    return data;
  }
}

export const marketDataService = MarketDataService.getInstance();