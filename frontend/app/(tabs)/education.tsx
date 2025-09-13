import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { educationService } from '../../services/educationService';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  views: number;
  rating: number;
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: any[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
  passingScore: number;
  attempts: number;
  maxAttempts: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  modules: any[];
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  completionRate: number;
}

const CATEGORIES = [
  { id: 'all', name: 'All Content', icon: 'book' },
  { id: 'basics', name: 'Basics', icon: 'target' },
  { id: 'strategies', name: 'Strategies', icon: 'award' },
  { id: 'risk', name: 'Risk Management', icon: 'shield' },
  { id: 'advanced', name: 'Advanced', icon: 'star' },
];

export default function Education() {
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'videos' | 'quizzes' | 'paths'>('videos');

  useEffect(() => {
    loadContent();
  }, [selectedCategory]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const [videosData, quizzesData, pathsData] = await Promise.all([
        educationService.getVideoTutorials(selectedCategory === 'all' ? undefined : selectedCategory),
        educationService.getQuizzes(selectedCategory === 'all' ? undefined : selectedCategory),
        educationService.getLearningPaths()
      ]);
      setVideos(videosData);
      setQuizzes(quizzesData);
      setLearningPaths(pathsData);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadContent();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadContent();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await educationService.searchContent(searchQuery);
      setVideos(searchResults.videos);
      setQuizzes(searchResults.quizzes);
      setLearningPaths(searchResults.learningPaths);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    switch (category?.icon) {
      case 'target':
        return <MaterialIcons name="my-location" size={16} color="#3B82F6" />;
      case 'award':
        return <Ionicons name="ribbon" size={16} color="#F59E0B" />;
      case 'star':
        return <Ionicons name="star" size={16} color="#EF4444" />;
      default:
        return <Ionicons name="book" size={16} color="#6B7280" />;
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
          <Text style={styles.title}>Education Center</Text>
          <Text style={styles.subtitle}>Master options trading with expert content</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search videos, quizzes, and courses..."
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
                onPress={() => setSelectedCategory(category.id)}
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

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => setActiveTab('videos')}
          >
            <Ionicons name="play" size={16} color={activeTab === 'videos' ? '#3B82F6' : '#64748B'} />
            <Text style={[
              styles.tabText,
              activeTab === 'videos' && styles.activeTabText
            ]}>
              Videos ({videos.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'quizzes' && styles.activeTab]}
            onPress={() => setActiveTab('quizzes')}
          >
            <Ionicons name="ribbon" size={16} color={activeTab === 'quizzes' ? '#3B82F6' : '#64748B'} />
            <Text style={[
              styles.tabText,
              activeTab === 'quizzes' && styles.activeTabText
            ]}>
              Quizzes ({quizzes.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'paths' && styles.activeTab]}
            onPress={() => setActiveTab('paths')}
          >
            <Ionicons name="book" size={16} color={activeTab === 'paths' ? '#3B82F6' : '#64748B'} />
            <Text style={[
              styles.tabText,
              activeTab === 'paths' && styles.activeTabText
            ]}>
              Learning Paths ({learningPaths.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading content...</Text>
            </View>
          ) : (
            <>
              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <View style={styles.videosContainer}>
                  {videos.map(video => (
                    <TouchableOpacity key={video.id} style={styles.videoCard}>
                      <View style={styles.videoThumbnail}>
                        <LinearGradient
                          colors={['#3B82F6', '#1D4ED8']}
                          style={styles.playButton}
                        >
                          <Ionicons name="play" size={20} color="#FFFFFF" />
                        </LinearGradient>
                      </View>
                      
                      <View style={styles.videoContent}>
                        <View style={styles.videoHeader}>
                          <Text style={styles.videoTitle}>{video.title}</Text>
                          <View style={[
                            styles.difficultyBadge,
                            { backgroundColor: getDifficultyColor(video.difficulty) }
                          ]}>
                            <Text style={styles.difficultyText}>
                              {video.difficulty.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={styles.videoDescription}>{video.description}</Text>
                        
                        <View style={styles.videoMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="time" size={12} color="#64748B" />
                            <Text style={styles.metaText}>{formatDuration(video.duration)}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text style={styles.metaText}>{video.rating}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Text style={styles.metaText}>{video.views.toLocaleString()} views</Text>
                          </View>
                        </View>
                        
                        <Text style={styles.instructorText}>By {video.instructor}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Quizzes Tab */}
              {activeTab === 'quizzes' && (
                <View style={styles.quizzesContainer}>
                  {quizzes.map(quiz => (
                    <TouchableOpacity key={quiz.id} style={styles.quizCard}>
                      <View style={styles.quizHeader}>
                        <Text style={styles.quizTitle}>{quiz.title}</Text>
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: getDifficultyColor(quiz.difficulty) }
                        ]}>
                          <Text style={styles.difficultyText}>
                            {quiz.difficulty.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.quizDescription}>{quiz.description}</Text>
                      
                      <View style={styles.quizMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time" size={12} color="#64748B" />
                          <Text style={styles.metaText}>{quiz.timeLimit} min</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="my-location" size={12} color="#3B82F6" />
                          <Text style={styles.metaText}>{quiz.passingScore}% to pass</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Text style={styles.metaText}>
                            {quiz.attempts}/{quiz.maxAttempts} attempts
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.quizFooter}>
                        <Text style={styles.questionCount}>
                          {quiz.questions.length} questions
                        </Text>
                        <TouchableOpacity style={styles.startQuizButton}>
                          <Text style={styles.startQuizText}>Start Quiz</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Learning Paths Tab */}
              {activeTab === 'paths' && (
                <View style={styles.pathsContainer}>
                  {learningPaths.map(path => (
                    <TouchableOpacity key={path.id} style={styles.pathCard}>
                      <View style={styles.pathHeader}>
                        <Text style={styles.pathTitle}>{path.title}</Text>
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: getDifficultyColor(path.difficulty) }
                        ]}>
                          <Text style={styles.difficultyText}>
                            {path.difficulty.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.pathDescription}>{path.description}</Text>
                      
                      <View style={styles.pathMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time" size={12} color="#64748B" />
                          <Text style={styles.metaText}>{path.estimatedTime}h estimated</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="book" size={12} color="#3B82F6" />
                          <Text style={styles.metaText}>{path.modules.length} modules</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Text style={styles.metaText}>
                            {path.completionRate}% completed
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.pathModules}>
                        {path.modules.map((module, index) => (
                          <View key={module.id} style={styles.moduleItem}>
                            <View style={styles.moduleIcon}>
                              {module.completed ? (
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                              ) : module.locked ? (
                                <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                              ) : (
                                <Ionicons name="play" size={16} color="#3B82F6" />
                              )}
                            </View>
                            <Text style={[
                              styles.moduleTitle,
                              module.locked && styles.lockedText
                            ]}>
                              {module.title}
                            </Text>
                            <Text style={styles.moduleDuration}>
                              {formatDuration(module.duration)}
                            </Text>
                          </View>
                        ))}
                      </View>
                      
                      <TouchableOpacity style={styles.startPathButton}>
                        <Text style={styles.startPathText}>Start Learning Path</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#3B82F6',
  },
  contentContainer: {
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
  videosContainer: {
    gap: 16,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  videoThumbnail: {
    height: 120,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContent: {
    padding: 16,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  instructorText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  quizzesContainer: {
    gap: 16,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  quizDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  quizMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 12,
    color: '#64748B',
  },
  startQuizButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startQuizText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pathsContainer: {
    gap: 16,
  },
  pathCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  pathDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  pathMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  pathModules: {
    marginBottom: 16,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  moduleIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  lockedText: {
    color: '#9CA3AF',
  },
  moduleDuration: {
    fontSize: 12,
    color: '#64748B',
  },
  startPathButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startPathText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
