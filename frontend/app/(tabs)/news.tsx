import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { newsService } from '../../services/newsService';

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

const CATEGORIES = [
  { id: 'all', name: 'All News', icon: 'newspaper' },
  { id: 'market', name: 'Market', icon: 'trending-up' },
  { id: 'options', name: 'Options', icon: 'trending-down' },
  { id: 'earnings', name: 'Earnings', icon: 'star' },
  { id: 'fed', name: 'Fed Policy', icon: 'trending-up' },
  { id: 'crypto', name: 'Crypto', icon: 'trending-up' },
];

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    loadNews();
  }, [selectedCategory, page]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await newsService.getMarketNews(selectedCategory === 'all' ? undefined : selectedCategory, page);
      if (page === 1) {
        setArticles(response.articles);
      } else {
        setArticles(prev => [...prev, ...response.articles]);
      }
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadNews();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadNews();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await newsService.searchNews(searchQuery);
      setArticles(searchResults);
      setHasMore(false);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10B981';
      case 'negative':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    switch (category?.icon) {
      case 'trending-up':
        return <MaterialIcons name="trending-up" size={16} color="#3B82F6" />;
      case 'trending-down':
        return <MaterialIcons name="trending-down" size={16} color="#EF4444" />;
      case 'star':
        return <Ionicons name="star" size={16} color="#F59E0B" />;
      default:
        return <Ionicons name="newspaper" size={16} color="#6B7280" />;
    }
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
          <Text style={styles.title}>Market News</Text>
          <Text style={styles.subtitle}>Stay informed with the latest market updates</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search news..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setPage(1);
                }}
              >
                {getCategoryIcon(category.id)}
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Articles List */}
        <View style={styles.articlesContainer}>
          {loading && articles.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading news...</Text>
            </View>
          ) : (
            articles.map(article => (
              <TouchableOpacity key={article.id} style={styles.articleCard}>
                <View style={styles.articleHeader}>
                  <View style={styles.articleMeta}>
                    <View style={styles.sourceContainer}>
                      <Text style={styles.sourceText}>{article.source}</Text>
                      <View style={[
                        styles.impactBadge,
                        { backgroundColor: getImpactColor(article.impact) }
                      ]}>
                        <Text style={styles.impactText}>{article.impact.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time" size={12} color="#6B7280" />
                      <Text style={styles.timeText}>{formatTimeAgo(article.publishedAt)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.sentimentContainer}>
                    <View style={[
                      styles.sentimentIndicator,
                      { backgroundColor: getSentimentColor(article.sentiment) }
                    ]} />
                    <Text style={[
                      styles.sentimentText,
                      { color: getSentimentColor(article.sentiment) }
                    ]}>
                      {article.sentiment.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSummary}>{article.summary}</Text>

                {article.symbols.length > 0 && (
                  <View style={styles.symbolsContainer}>
                    {article.symbols.map(symbol => (
                      <View key={symbol} style={styles.symbolBadge}>
                        <Text style={styles.symbolText}>{symbol}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.articleFooter}>
                  <Text style={styles.authorText}>By {article.author}</Text>
                  <TouchableOpacity style={styles.readMoreButton}>
                    <Ionicons name="open-outline" size={14} color="#3B82F6" />
                    <Text style={styles.readMoreText}>Read More</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}

          {hasMore && articles.length > 0 && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore} disabled={loading}>
              <Text style={styles.loadMoreText}>
                {loading ? 'Loading...' : 'Load More'}
              </Text>
            </TouchableOpacity>
          )}
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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategory: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 6,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  articlesContainer: {
    padding: 24,
    paddingTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  articleMeta: {
    flex: 1,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 8,
  },
  impactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentimentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: '700',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 24,
  },
  articleSummary: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  symbolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  symbolBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  symbolText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  authorText: {
    fontSize: 12,
    color: '#6B7280',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 4,
  },
  loadMoreButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
