import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const TakeQuiz = ({ quizId, userId, onQuizCompleted }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (quizDoc.exists()) {
          setQuiz(quizDoc.data());
        } else {
          alert('Quiz not found');
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
        alert('Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    // Simple scoring: for now, just count answered questions
    // In a real app, you'd have correct answers stored
    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = quiz.questions.length;
    const calculatedScore = Math.round((answeredQuestions / totalQuestions) * 100);
    
    setScore(calculatedScore);
    setShowResults(true);
  };

  const handleCompleteQuiz = async () => {
    setIsSubmitting(true);
    
    try {
      // Update user XP (+20 XP on completion)
      await updateDoc(doc(db, 'users', userId), {
        xp: increment(20)
      });

      // Save quiz attempt
      await addDoc(collection(db, 'quizAttempts'), {
        userId,
        quizId,
        answers,
        score,
        completedAt: new Date()
      });

      console.log('Quiz completed! +20 XP awarded');
      alert(`Quiz completed! You earned 20 XP. Score: ${score}%`);
      
      onQuizCompleted?.(score);
    } catch (error) {
      console.error('Error completing quiz:', error);
      alert('Failed to save quiz results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-6 text-center">
        <p className="text-red-600">Quiz not found</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const currentAnswer = answers[currentQuestionIndex] || '';

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg border p-6 text-center"
      >
        <div className="mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-navy mb-2">Quiz Complete!</h2>
          <div className="text-4xl font-bold text-token mb-2">{score}%</div>
          <p className="text-gray-600">You earned 20 XP!</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCompleteQuiz}
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? 'Saving Results...' : 'Complete Quiz'}
          </button>
          <button
            onClick={() => onQuizCompleted?.(null)}
            className="btn-secondary w-full"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-navy">Quiz</h2>
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-indigo via-accent to-purple h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-navy mb-4">
          {currentQuestion.text}
        </h3>

        {currentQuestion.type === 'text' ? (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
            placeholder="Enter your answer here..."
            className="input-field h-32 resize-none"
          />
        ) : (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                  className="w-4 h-4 text-navy"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          className="btn-primary"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next'}
        </button>
      </div>
    </motion.div>
  );
};

export default TakeQuiz;
