interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
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
  questions: QuizQuestion[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  attempts: number;
  maxAttempts: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  modules: LearningModule[];
  estimatedTime: number; // in hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  completionRate: number;
}

interface LearningModule {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'article' | 'interactive';
  contentId: string;
  duration: number; // in minutes
  completed: boolean;
  locked: boolean;
}

const VIDEO_TUTORIALS: VideoTutorial[] = [
  {
    id: '1',
    title: 'Options Trading Basics: What Are Options?',
    description: 'Learn the fundamental concepts of options trading, including calls, puts, and basic terminology.',
    duration: 15,
    thumbnail: 'https://via.placeholder.com/300x200?text=Options+Basics',
    videoUrl: 'https://example.com/video/1',
    category: 'basics',
    difficulty: 'beginner',
    instructor: 'Sarah Chen',
    views: 15420,
    rating: 4.8,
    tags: ['options', 'basics', 'calls', 'puts'],
    prerequisites: [],
    learningObjectives: [
      'Understand what options are',
      'Learn the difference between calls and puts',
      'Master basic options terminology'
    ]
  },
  {
    id: '2',
    title: 'The Greeks: Delta, Gamma, Theta, and Vega',
    description: 'Deep dive into the Greeks and how they affect option pricing and risk management.',
    duration: 25,
    thumbnail: 'https://via.placeholder.com/300x200?text=The+Greeks',
    videoUrl: 'https://example.com/video/2',
    category: 'advanced',
    difficulty: 'advanced',
    instructor: 'Michael Rodriguez',
    views: 8920,
    rating: 4.9,
    tags: ['greeks', 'delta', 'gamma', 'theta', 'vega'],
    prerequisites: ['1'],
    learningObjectives: [
      'Understand each Greek and its impact',
      'Learn how to use Greeks for risk management',
      'Calculate option sensitivity to market changes'
    ]
  },
  {
    id: '3',
    title: 'Covered Call Strategy Explained',
    description: 'Step-by-step guide to implementing covered call strategies for income generation.',
    duration: 20,
    thumbnail: 'https://via.placeholder.com/300x200?text=Covered+Calls',
    videoUrl: 'https://example.com/video/3',
    category: 'strategies',
    difficulty: 'intermediate',
    instructor: 'Lisa Wang',
    views: 12350,
    rating: 4.7,
    tags: ['covered-calls', 'income', 'strategies'],
    prerequisites: ['1'],
    learningObjectives: [
      'Learn when to use covered calls',
      'Understand risk and reward profile',
      'Practice selecting strike prices'
    ]
  },
  {
    id: '4',
    title: 'Risk Management in Options Trading',
    description: 'Essential risk management techniques every options trader should know.',
    duration: 18,
    thumbnail: 'https://via.placeholder.com/300x200?text=Risk+Management',
    videoUrl: 'https://example.com/video/4',
    category: 'risk',
    difficulty: 'intermediate',
    instructor: 'David Kim',
    views: 9870,
    rating: 4.8,
    tags: ['risk-management', 'position-sizing', 'stop-losses'],
    prerequisites: ['1'],
    learningObjectives: [
      'Learn position sizing techniques',
      'Understand risk-reward ratios',
      'Master stop-loss strategies'
    ]
  }
];

const QUIZZES: Quiz[] = [
  {
    id: '1',
    title: 'Options Basics Quiz',
    description: 'Test your knowledge of fundamental options concepts.',
    questions: [
      {
        id: '1',
        question: 'What is a call option?',
        type: 'multiple_choice',
        options: [
          'The right to buy a stock at a specific price',
          'The right to sell a stock at a specific price',
          'The obligation to buy a stock at a specific price',
          'The obligation to sell a stock at a specific price'
        ],
        correctAnswer: 0,
        explanation: 'A call option gives the holder the right, but not the obligation, to buy a stock at the strike price.',
        points: 10
      },
      {
        id: '2',
        question: 'What happens to an option when it expires out of the money?',
        type: 'multiple_choice',
        options: [
          'It becomes worthless',
          'It automatically exercises',
          'It gets extended',
          'It becomes a stock position'
        ],
        correctAnswer: 0,
        explanation: 'When an option expires out of the money, it becomes worthless and expires.',
        points: 10
      },
      {
        id: '3',
        question: 'True or False: Options trading is always riskier than stock trading.',
        type: 'true_false',
        correctAnswer: 'false',
        explanation: 'While options can be risky, they can also be used to reduce risk through hedging strategies.',
        points: 10
      }
    ],
    category: 'basics',
    difficulty: 'beginner',
    timeLimit: 10,
    passingScore: 70,
    attempts: 0,
    maxAttempts: 3
  },
  {
    id: '2',
    title: 'The Greeks Mastery Quiz',
    description: 'Advanced quiz on option Greeks and their applications.',
    questions: [
      {
        id: '1',
        question: 'Which Greek measures the rate of change of delta?',
        type: 'multiple_choice',
        options: ['Delta', 'Gamma', 'Theta', 'Vega'],
        correctAnswer: 1,
        explanation: 'Gamma measures the rate of change of delta with respect to the underlying asset price.',
        points: 15
      },
      {
        id: '2',
        question: 'True or False: Theta is always negative for long options.',
        type: 'true_false',
        correctAnswer: 'true',
        explanation: 'Theta represents time decay, which always works against long option positions.',
        points: 15
      }
    ],
    category: 'advanced',
    difficulty: 'advanced',
    timeLimit: 15,
    passingScore: 80,
    attempts: 0,
    maxAttempts: 2
  }
];

const LEARNING_PATHS: LearningPath[] = [
  {
    id: '1',
    title: 'Options Trading Fundamentals',
    description: 'Complete beginner course covering all the basics of options trading.',
    modules: [
      { id: '1', title: 'What Are Options?', type: 'video', contentId: '1', duration: 15, completed: false, locked: false },
      { id: '2', title: 'Calls vs Puts', type: 'video', contentId: '2', duration: 12, completed: false, locked: false },
      { id: '3', title: 'Options Terminology', type: 'quiz', contentId: '1', duration: 10, completed: false, locked: false },
      { id: '4', title: 'Basic Strategies', type: 'video', contentId: '3', duration: 20, completed: false, locked: true }
    ],
    estimatedTime: 2,
    difficulty: 'beginner',
    prerequisites: [],
    completionRate: 0
  },
  {
    id: '2',
    title: 'Advanced Options Strategies',
    description: 'Master complex options strategies and risk management techniques.',
    modules: [
      { id: '1', title: 'The Greeks Deep Dive', type: 'video', contentId: '2', duration: 25, completed: false, locked: false },
      { id: '2', title: 'Risk Management', type: 'video', contentId: '4', duration: 18, completed: false, locked: false },
      { id: '3', title: 'Greeks Quiz', type: 'quiz', contentId: '2', duration: 15, completed: false, locked: false }
    ],
    estimatedTime: 3,
    difficulty: 'advanced',
    prerequisites: ['1'],
    completionRate: 0
  }
];

export class EducationService {
  private static instance: EducationService;

  static getInstance(): EducationService {
    if (!EducationService.instance) {
      EducationService.instance = new EducationService();
    }
    return EducationService.instance;
  }

  async getVideoTutorials(category?: string): Promise<VideoTutorial[]> {
    if (category) {
      return VIDEO_TUTORIALS.filter(video => video.category === category);
    }
    return VIDEO_TUTORIALS;
  }

  async getVideoTutorial(id: string): Promise<VideoTutorial | undefined> {
    return VIDEO_TUTORIALS.find(video => video.id === id);
  }

  async getQuizzes(category?: string): Promise<Quiz[]> {
    if (category) {
      return QUIZZES.filter(quiz => quiz.category === category);
    }
    return QUIZZES;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return QUIZZES.find(quiz => quiz.id === id);
  }

  async getLearningPaths(): Promise<LearningPath[]> {
    return LEARNING_PATHS;
  }

  async getLearningPath(id: string): Promise<LearningPath | undefined> {
    return LEARNING_PATHS.find(path => path.id === id);
  }

  async submitQuizAnswers(quizId: string, answers: { [questionId: string]: any }): Promise<{
    score: number;
    percentage: number;
    passed: boolean;
    correctAnswers: { [questionId: string]: any };
    explanations: { [questionId: string]: string };
  }> {
    const quiz = await this.getQuiz(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    let correctCount = 0;
    const correctAnswers: { [questionId: string]: any } = {};
    const explanations: { [questionId: string]: string } = {};

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      correctAnswers[question.id] = question.correctAnswer;
      explanations[question.id] = question.explanation;
    });

    const percentage = (correctCount / quiz.questions.length) * 100;
    const passed = percentage >= quiz.passingScore;

    return {
      score: correctCount,
      percentage: Math.round(percentage),
      passed,
      correctAnswers,
      explanations
    };
  }

  async getRecommendedContent(userLevel: string, completedContent: string[]): Promise<{
    videos: VideoTutorial[];
    quizzes: Quiz[];
    learningPaths: LearningPath[];
  }> {
    const allVideos = await this.getVideoTutorials();
    const allQuizzes = await this.getQuizzes();
    const allPaths = await this.getLearningPaths();

    // Filter based on user level and completed content
    const recommendedVideos = allVideos.filter(video => 
      video.difficulty === userLevel && !completedContent.includes(video.id)
    );

    const recommendedQuizzes = allQuizzes.filter(quiz => 
      quiz.difficulty === userLevel && !completedContent.includes(quiz.id)
    );

    const recommendedPaths = allPaths.filter(path => 
      path.difficulty === userLevel
    );

    return {
      videos: recommendedVideos.slice(0, 5),
      quizzes: recommendedQuizzes.slice(0, 3),
      learningPaths: recommendedPaths.slice(0, 2)
    };
  }

  async searchContent(query: string): Promise<{
    videos: VideoTutorial[];
    quizzes: Quiz[];
    learningPaths: LearningPath[];
  }> {
    const lowerQuery = query.toLowerCase();
    
    const videos = VIDEO_TUTORIALS.filter(video => 
      video.title.toLowerCase().includes(lowerQuery) ||
      video.description.toLowerCase().includes(lowerQuery) ||
      video.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    const quizzes = QUIZZES.filter(quiz => 
      quiz.title.toLowerCase().includes(lowerQuery) ||
      quiz.description.toLowerCase().includes(lowerQuery)
    );

    const learningPaths = LEARNING_PATHS.filter(path => 
      path.title.toLowerCase().includes(lowerQuery) ||
      path.description.toLowerCase().includes(lowerQuery)
    );

    return { videos, quizzes, learningPaths };
  }

  getCategories(): string[] {
    return ['all', 'basics', 'strategies', 'risk', 'advanced'];
  }
}

export const educationService = EducationService.getInstance();
