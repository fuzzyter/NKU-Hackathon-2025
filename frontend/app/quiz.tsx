import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  [key: string]: Question[];
}

const QUIZ_DATA: QuizData = {
  'what-is-option': [
    {
      id: 1,
      question: "What is an option in financial markets?",
      options: [
        "A contract that gives the holder the right to buy or sell an asset at a specific price",
        "A type of stock that pays dividends",
        "A loan agreement between two parties",
        "A government bond with fixed interest"
      ],
      correctAnswer: 0,
      explanation: "An option is a financial contract that gives the holder the right (but not the obligation) to buy or sell an underlying asset at a predetermined price within a specific time period."
    },
    {
      id: 2,
      question: "What are the two main types of options?",
      options: [
        "Call and Put options",
        "Buy and Sell options",
        "Long and Short options",
        "High and Low options"
      ],
      correctAnswer: 0,
      explanation: "The two main types of options are Call options (right to buy) and Put options (right to sell)."
    },
    {
      id: 3,
      question: "What does 'strike price' mean in options trading?",
      options: [
        "The price at which the option can be exercised",
        "The current market price of the underlying asset",
        "The premium paid for the option",
        "The expiration date of the option"
      ],
      correctAnswer: 0,
      explanation: "The strike price (or exercise price) is the predetermined price at which the option holder can buy (call) or sell (put) the underlying asset."
    },
    {
      id: 4,
      question: "What happens to an option if it expires out-of-the-money?",
      options: [
        "It becomes worthless and expires",
        "It automatically exercises",
        "It gets extended for another month",
        "It converts to stock"
      ],
      correctAnswer: 0,
      explanation: "When an option expires out-of-the-money, it becomes worthless and expires without any value. The holder loses the premium paid."
    },
    {
      id: 5,
      question: "What is the 'premium' in options trading?",
      options: [
        "The price paid to buy the option",
        "The strike price of the option",
        "The current market price of the underlying asset",
        "The commission charged by the broker"
      ],
      correctAnswer: 0,
      explanation: "The premium is the price paid by the buyer to the seller for the option contract. It's the cost of purchasing the option."
    }
  ],
  'call-option': [
    {
      id: 1,
      question: "What is a call option?",
      options: [
        "The right to buy an asset at a specific price",
        "The right to sell an asset at a specific price",
        "The obligation to buy an asset at a specific price",
        "The obligation to sell an asset at a specific price"
      ],
      correctAnswer: 0,
      explanation: "A call option gives the holder the right (but not the obligation) to buy the underlying asset at the strike price before expiration."
    },
    {
      id: 2,
      question: "When would you buy a call option?",
      options: [
        "When you expect the stock price to rise",
        "When you expect the stock price to fall",
        "When you expect the stock price to stay the same",
        "When you want to short sell the stock"
      ],
      correctAnswer: 0,
      explanation: "You buy a call option when you're bullish on the underlying asset and expect its price to rise above the strike price."
    },
    {
      id: 3,
      question: "What is the maximum loss for a call option buyer?",
      options: [
        "The premium paid",
        "The strike price",
        "The current stock price",
        "Unlimited"
      ],
      correctAnswer: 0,
      explanation: "The maximum loss for a call option buyer is limited to the premium paid, as they can simply let the option expire worthless."
    },
    {
      id: 4,
      question: "What happens when a call option is 'in-the-money'?",
      options: [
        "The stock price is above the strike price",
        "The stock price is below the strike price",
        "The stock price equals the strike price",
        "The option has expired"
      ],
      correctAnswer: 0,
      explanation: "A call option is in-the-money when the current stock price is above the strike price, making it profitable to exercise."
    }
  ]
};

export default function QuizScreen() {
  const router = useRouter();
  const { questId } = useLocalSearchParams<{ questId: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);

  const questions = QUIZ_DATA[questId || 'what-is-option'] || [];
  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestion] = true;
    setAnsweredQuestions(newAnsweredQuestions);
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      Alert.alert(
        "Quiz Completed!",
        `You scored ${score + (selectedAnswer === currentQ.correctAnswer ? 1 : 0)} out of ${questions.length} questions.`,
        [
          {
            text: "Retake Quiz",
            onPress: () => {
              setCurrentQuestion(0);
              setSelectedAnswer(null);
              setShowResult(false);
              setScore(0);
              setAnsweredQuestions([]);
            }
          },
          {
            text: "Back to Quests",
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions([]);
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Quiz not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetakeQuiz}>
            <MaterialIcons name="refresh" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQ.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQ.options.map((option, index) => {
            let optionStyle = styles.option;
            let textStyle = styles.optionText;
            
            if (showResult) {
              if (index === currentQ.correctAnswer) {
                optionStyle = [styles.option, styles.correctOption];
                textStyle = [styles.optionText, styles.correctText];
              } else if (index === selectedAnswer && index !== currentQ.correctAnswer) {
                optionStyle = [styles.option, styles.incorrectOption];
                textStyle = [styles.optionText, styles.incorrectText];
              }
            } else if (selectedAnswer === index) {
              optionStyle = [styles.option, styles.selectedOption];
              textStyle = [styles.optionText, styles.selectedText];
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswerSelect(index)}
                disabled={showResult}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
                  <Text style={textStyle}>{option}</Text>
                </View>
                {showResult && index === currentQ.correctAnswer && (
                  <MaterialIcons name="check-circle" size={20} color="#10B981" />
                )}
                {showResult && index === selectedAnswer && index !== currentQ.correctAnswer && (
                  <MaterialIcons name="cancel" size={20} color="#EF4444" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {showResult && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>Explanation:</Text>
            <Text style={styles.explanationText}>{currentQ.explanation}</Text>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {!showResult ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                selectedAnswer === null && styles.disabledButton
              ]}
              onPress={handleSubmitAnswer}
              disabled={selectedAnswer === null}
            >
              <Text style={[
                styles.actionButtonText,
                selectedAnswer === null && styles.disabledButtonText
              ]}>
                Submit Answer
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleNextQuestion}
            >
              <Text style={styles.actionButtonText}>
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  retakeButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 26,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
    lineHeight: 22,
  },
  selectedText: {
    color: '#1E40AF',
  },
  correctText: {
    color: '#059669',
  },
  incorrectText: {
    color: '#DC2626',
  },
  explanationContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
