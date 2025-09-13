export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  xpReward: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  timeSpent: number; // in seconds
  completedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalXp: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedTime: number; // in minutes
}

export class QuizService {
  private static instance: QuizService;
  private quizzes: Quiz[] = [];

  static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  constructor() {
    this.initializeQuizzes();
  }

  private initializeQuizzes(): void {
    this.quizzes = [
      {
        id: 'what-is-option',
        title: 'What is an Option?',
        description: 'Test your understanding of basic options concepts',
        difficulty: 'beginner',
        category: 'Options Basics',
        estimatedTime: 5,
        totalXp: 50,
        questions: [
          {
            id: 'q1',
            question: 'What is an option contract?',
            options: [
              'A contract that gives the holder the right to buy or sell an asset at a specific price',
              'A contract that obligates the holder to buy or sell an asset',
              'A type of stock certificate',
              'A loan agreement'
            ],
            correctAnswer: 0,
            explanation: 'An option contract gives the holder the right (but not the obligation) to buy or sell an underlying asset at a predetermined price within a specific time period.',
            difficulty: 'beginner',
            category: 'Options Basics',
            xpReward: 10
          },
          {
            id: 'q2',
            question: 'What are the two main types of options?',
            options: [
              'Call and Put',
              'Buy and Sell',
              'Long and Short',
              'Bull and Bear'
            ],
            correctAnswer: 0,
            explanation: 'The two main types of options are Call options (right to buy) and Put options (right to sell).',
            difficulty: 'beginner',
            category: 'Options Basics',
            xpReward: 10
          },
          {
            id: 'q3',
            question: 'What is the strike price?',
            options: [
              'The current market price of the underlying asset',
              'The price at which the option can be exercised',
              'The premium paid for the option',
              'The expiration date of the option'
            ],
            correctAnswer: 1,
            explanation: 'The strike price (or exercise price) is the predetermined price at which the option holder can buy (call) or sell (put) the underlying asset.',
            difficulty: 'beginner',
            category: 'Options Basics',
            xpReward: 10
          },
          {
            id: 'q4',
            question: 'What happens to an option at expiration?',
            options: [
              'It automatically exercises if in-the-money',
              'It becomes worthless if out-of-the-money',
              'Both A and B',
              'It always exercises regardless of price'
            ],
            correctAnswer: 2,
            explanation: 'At expiration, options that are in-the-money are typically automatically exercised, while out-of-the-money options expire worthless.',
            difficulty: 'beginner',
            category: 'Options Basics',
            xpReward: 10
          },
          {
            id: 'q5',
            question: 'What is the premium in options trading?',
            options: [
              'The strike price of the option',
              'The price paid to buy the option',
              'The current price of the underlying asset',
              'The profit from the option'
            ],
            correctAnswer: 1,
            explanation: 'The premium is the price paid by the buyer to the seller for the option contract.',
            difficulty: 'beginner',
            category: 'Options Basics',
            xpReward: 10
          }
        ]
      },
      {
        id: 'call-option-basics',
        title: 'The Call Option',
        description: 'Master the fundamentals of call options',
        difficulty: 'beginner',
        category: 'Options Basics',
        estimatedTime: 7,
        totalXp: 75,
        questions: [
          {
            id: 'q1',
            question: 'What does buying a call option give you?',
            options: [
              'The right to sell the underlying asset',
              'The right to buy the underlying asset',
              'The obligation to buy the underlying asset',
              'The obligation to sell the underlying asset'
            ],
            correctAnswer: 1,
            explanation: 'Buying a call option gives you the right (but not the obligation) to buy the underlying asset at the strike price.',
            difficulty: 'beginner',
            category: 'Call Options',
            xpReward: 15
          },
          {
            id: 'q2',
            question: 'When is a call option "in-the-money"?',
            options: [
              'When the stock price is below the strike price',
              'When the stock price is above the strike price',
              'When the stock price equals the strike price',
              'When the option is about to expire'
            ],
            correctAnswer: 1,
            explanation: 'A call option is in-the-money when the current stock price is above the strike price, making it profitable to exercise.',
            difficulty: 'beginner',
            category: 'Call Options',
            xpReward: 15
          },
          {
            id: 'q3',
            question: 'What is the maximum loss for a call option buyer?',
            options: [
              'Unlimited',
              'The strike price',
              'The premium paid',
              'The current stock price'
            ],
            correctAnswer: 2,
            explanation: 'The maximum loss for a call option buyer is limited to the premium paid for the option.',
            difficulty: 'beginner',
            category: 'Call Options',
            xpReward: 15
          },
          {
            id: 'q4',
            question: 'What is the maximum profit potential for a call option buyer?',
            options: [
              'Limited to the premium paid',
              'Limited to the strike price',
              'Unlimited',
              'Limited to the current stock price'
            ],
            correctAnswer: 2,
            explanation: 'The maximum profit potential for a call option buyer is unlimited, as the stock price can theoretically rise indefinitely.',
            difficulty: 'beginner',
            category: 'Call Options',
            xpReward: 15
          },
          {
            id: 'q5',
            question: 'When would you typically buy a call option?',
            options: [
              'When you expect the stock price to fall',
              'When you expect the stock price to rise',
              'When you expect the stock price to stay the same',
              'When you want to generate income'
            ],
            correctAnswer: 1,
            explanation: 'You would buy a call option when you have a bullish outlook and expect the stock price to rise above the strike price.',
            difficulty: 'beginner',
            category: 'Call Options',
            xpReward: 15
          }
        ]
      },
      {
        id: 'put-option-basics',
        title: 'The Put Option',
        description: 'Learn bearish strategies with put options',
        difficulty: 'beginner',
        category: 'Options Basics',
        estimatedTime: 7,
        totalXp: 75,
        questions: [
          {
            id: 'q1',
            question: 'What does buying a put option give you?',
            options: [
              'The right to buy the underlying asset',
              'The right to sell the underlying asset',
              'The obligation to buy the underlying asset',
              'The obligation to sell the underlying asset'
            ],
            correctAnswer: 1,
            explanation: 'Buying a put option gives you the right (but not the obligation) to sell the underlying asset at the strike price.',
            difficulty: 'beginner',
            category: 'Put Options',
            xpReward: 15
          },
          {
            id: 'q2',
            question: 'When is a put option "in-the-money"?',
            options: [
              'When the stock price is above the strike price',
              'When the stock price is below the strike price',
              'When the stock price equals the strike price',
              'When the option is about to expire'
            ],
            correctAnswer: 1,
            explanation: 'A put option is in-the-money when the current stock price is below the strike price, making it profitable to exercise.',
            difficulty: 'beginner',
            category: 'Put Options',
            xpReward: 15
          },
          {
            id: 'q3',
            question: 'What is the maximum loss for a put option buyer?',
            options: [
              'Unlimited',
              'The strike price',
              'The premium paid',
              'The current stock price'
            ],
            correctAnswer: 2,
            explanation: 'The maximum loss for a put option buyer is limited to the premium paid for the option.',
            difficulty: 'beginner',
            category: 'Put Options',
            xpReward: 15
          },
          {
            id: 'q4',
            question: 'What is the maximum profit potential for a put option buyer?',
            options: [
              'Limited to the premium paid',
              'Limited to the strike price minus premium',
              'Unlimited',
              'Limited to the current stock price'
            ],
            correctAnswer: 1,
            explanation: 'The maximum profit for a put option buyer is limited to the strike price minus the premium paid (since stock price cannot go below zero).',
            difficulty: 'beginner',
            category: 'Put Options',
            xpReward: 15
          },
          {
            id: 'q5',
            question: 'When would you typically buy a put option?',
            options: [
              'When you expect the stock price to rise',
              'When you expect the stock price to fall',
              'When you expect the stock price to stay the same',
              'When you want to generate income'
            ],
            correctAnswer: 1,
            explanation: 'You would buy a put option when you have a bearish outlook and expect the stock price to fall below the strike price.',
            difficulty: 'beginner',
            category: 'Put Options',
            xpReward: 15
          }
        ]
      }
    ];
  }

  getQuizById(id: string): Quiz | null {
    return this.quizzes.find(quiz => quiz.id === id) || null;
  }

  getAllQuizzes(): Quiz[] {
    return this.quizzes;
  }

  getQuizzesByCategory(category: string): Quiz[] {
    return this.quizzes.filter(quiz => quiz.category === category);
  }

  getQuizzesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Quiz[] {
    return this.quizzes.filter(quiz => quiz.difficulty === difficulty);
  }

  calculateScore(answers: number[], quiz: Quiz): QuizResult {
    const correctAnswers = answers.filter((answer, index) => 
      answer === quiz.questions[index].correctAnswer
    ).length;

    const score = (correctAnswers / quiz.questions.length) * 100;
    const xpEarned = Math.floor(score / 100 * quiz.totalXp);

    return {
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      xpEarned,
      timeSpent: 0, // Will be set by the component
      completedAt: new Date()
    };
  }

  getRandomQuestion(quizId: string): QuizQuestion | null {
    const quiz = this.getQuizById(quizId);
    if (!quiz || quiz.questions.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * quiz.questions.length);
    return quiz.questions[randomIndex];
  }
}

export const quizService = QuizService.getInstance();
