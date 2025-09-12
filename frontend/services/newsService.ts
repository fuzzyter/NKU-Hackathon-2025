interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  source: string;
  url: string;
  imageUrl?: string;
  category: 'market' | 'options' | 'earnings' | 'fed' | 'crypto' | 'general';
  sentiment: 'positive' | 'negative' | 'neutral';
  symbols: string[];
  impact: 'high' | 'medium' | 'low';
}

interface NewsResponse {
  articles: NewsArticle[];
  totalCount: number;
  page: number;
  hasMore: boolean;
}

export class NewsService {
  private static instance: NewsService;
  private cache: Map<string, { data: NewsResponse; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 300000; // 5 minutes cache

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: NewsResponse): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getMarketNews(category?: string, page: number = 1): Promise<NewsResponse> {
    const cacheKey = `news_${category || 'all'}_${page}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // In a real app, you would use a news API like NewsAPI, Alpha Vantage News, or similar
      const mockNews = this.generateMockNews(category, page);
      this.setCache(cacheKey, mockNews);
      return mockNews;
    } catch (error) {
      console.warn('Failed to fetch news, using mock data:', error);
      const mockNews = this.generateMockNews(category, page);
      this.setCache(cacheKey, mockNews);
      return mockNews;
    }
  }

  async getNewsForSymbol(symbol: string): Promise<NewsArticle[]> {
    const allNews = await this.getMarketNews();
    return allNews.articles.filter(article => 
      article.symbols.some(s => s.toUpperCase() === symbol.toUpperCase())
    );
  }

  private generateMockNews(category?: string, page: number = 1): NewsResponse {
    const allArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'Federal Reserve Holds Interest Rates Steady Amid Economic Uncertainty',
        summary: 'The Fed maintains current rates while monitoring inflation trends and labor market conditions.',
        content: 'The Federal Reserve announced today that it will maintain the current federal funds rate at 5.25-5.50%, citing ongoing concerns about inflation and economic stability. Fed Chair Jerome Powell emphasized the need for continued vigilance in monetary policy...',
        author: 'Sarah Johnson',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'Financial Times',
        url: 'https://example.com/news/1',
        imageUrl: 'https://via.placeholder.com/400x200?text=Fed+Rates',
        category: 'fed',
        sentiment: 'neutral',
        symbols: ['SPY', 'QQQ', 'IWM'],
        impact: 'high'
      },
      {
        id: '2',
        title: 'Apple Reports Strong Q4 Earnings, Beats Revenue Expectations',
        summary: 'AAPL stock surges 5% in after-hours trading following better-than-expected quarterly results.',
        content: 'Apple Inc. reported fourth-quarter earnings that exceeded analyst expectations, with revenue reaching $89.5 billion compared to the projected $87.2 billion. The company cited strong iPhone sales and growing services revenue...',
        author: 'Michael Chen',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: 'Reuters',
        url: 'https://example.com/news/2',
        imageUrl: 'https://via.placeholder.com/400x200?text=AAPL+Earnings',
        category: 'earnings',
        sentiment: 'positive',
        symbols: ['AAPL'],
        impact: 'high'
      },
      {
        id: '3',
        title: 'Options Trading Volume Hits Record High as Volatility Increases',
        summary: 'Retail options activity surges 40% month-over-month as traders seek to capitalize on market volatility.',
        content: 'Options trading volume reached unprecedented levels this month, with retail traders accounting for a significant portion of the activity. The surge comes as market volatility remains elevated...',
        author: 'David Rodriguez',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: 'MarketWatch',
        url: 'https://example.com/news/3',
        imageUrl: 'https://via.placeholder.com/400x200?text=Options+Trading',
        category: 'options',
        sentiment: 'positive',
        symbols: ['SPY', 'QQQ', 'VIX'],
        impact: 'medium'
      },
      {
        id: '4',
        title: 'Tesla Stock Drops 8% Following Production Concerns',
        summary: 'TSLA shares fall sharply after reports of production delays at the Shanghai factory.',
        content: 'Tesla Inc. shares experienced a significant decline today following reports of production issues at its Shanghai manufacturing facility. The company expects a 15% reduction in Q4 deliveries...',
        author: 'Lisa Wang',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: 'Bloomberg',
        url: 'https://example.com/news/4',
        imageUrl: 'https://via.placeholder.com/400x200?text=Tesla+Production',
        category: 'market',
        sentiment: 'negative',
        symbols: ['TSLA'],
        impact: 'high'
      },
      {
        id: '5',
        title: 'Bitcoin Surges Past $45,000 as Institutional Adoption Grows',
        summary: 'Cryptocurrency markets show strong momentum with major corporations announcing Bitcoin holdings.',
        content: 'Bitcoin reached a new monthly high today, trading above $45,000 for the first time in weeks. The surge comes as several major corporations announced increased Bitcoin allocations...',
        author: 'Alex Thompson',
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        source: 'CoinDesk',
        url: 'https://example.com/news/5',
        imageUrl: 'https://via.placeholder.com/400x200?text=Bitcoin+Surge',
        category: 'crypto',
        sentiment: 'positive',
        symbols: ['BTC-USD'],
        impact: 'medium'
      },
      {
        id: '6',
        title: 'NVIDIA Reports Record Data Center Revenue in Q3',
        summary: 'NVDA stock jumps 12% after reporting strong AI chip demand and data center growth.',
        content: 'NVIDIA Corporation reported record quarterly revenue of $18.1 billion, driven primarily by strong demand for AI and data center products. The company\'s data center revenue grew 206% year-over-year...',
        author: 'Jennifer Liu',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: 'CNBC',
        url: 'https://example.com/news/6',
        imageUrl: 'https://via.placeholder.com/400x200?text=NVIDIA+AI',
        category: 'earnings',
        sentiment: 'positive',
        symbols: ['NVDA'],
        impact: 'high'
      }
    ];

    let filteredArticles = allArticles;
    
    if (category && category !== 'all') {
      filteredArticles = allArticles.filter(article => article.category === category);
    }

    // Simulate pagination
    const articlesPerPage = 10;
    const startIndex = (page - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    return {
      articles: paginatedArticles,
      totalCount: filteredArticles.length,
      page,
      hasMore: endIndex < filteredArticles.length
    };
  }

  async searchNews(query: string): Promise<NewsArticle[]> {
    const allNews = await this.getMarketNews();
    return allNews.articles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.summary.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  getCategories(): string[] {
    return ['all', 'market', 'options', 'earnings', 'fed', 'crypto', 'general'];
  }
}

export const newsService = NewsService.getInstance();
