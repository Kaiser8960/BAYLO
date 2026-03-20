import { useState } from 'react';
import { motion } from 'framer-motion';
import CreateQuiz from '../components/CreateQuiz';
import TakeQuiz from '../components/TakeQuiz';
import SessionNotes from '../components/SessionNotes';

const QuizAndNotesDemo = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [sessionId] = useState('demo-session-123');

  const tabs = [
    { id: 'create', label: 'Create Quiz', icon: '📝' },
    { id: 'take', label: 'Take Quiz', icon: '🎯' },
    { id: 'notes', label: 'Session Notes', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-navy mb-6">Quiz & Session Features Demo</h1>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-navy text-cream'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'create' && (
            <CreateQuiz
              mentorId="demo-mentor-123"
              skillId="javascript"
              onQuizCreated={(quizId) => {
                console.log('Quiz created:', quizId);
                alert(`Quiz created with ID: ${quizId}`);
              }}
            />
          )}

          {activeTab === 'take' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border p-6">
                <h2 className="text-xl font-bold text-navy mb-4">Available Quizzes</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-navy">JavaScript Basics</h3>
                    <p className="text-sm text-gray-600 mb-3">3 questions • Text & MCQ</p>
                    <button
                      onClick={() => setSelectedQuizId('demo-quiz-1')}
                      className="btn-primary w-full"
                    >
                      Take Quiz
                    </button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-navy">React Fundamentals</h3>
                    <p className="text-sm text-gray-600 mb-3">2 questions • MCQ only</p>
                    <button
                      onClick={() => setSelectedQuizId('demo-quiz-2')}
                      className="btn-primary w-full"
                    >
                      Take Quiz
                    </button>
                  </div>
                </div>
              </div>

              {selectedQuizId && (
                <TakeQuiz
                  quizId={selectedQuizId}
                  userId="demo-user-456"
                  onQuizCompleted={(score) => {
                    console.log('Quiz completed with score:', score);
                    if (score !== null) {
                      alert(`Quiz completed! Score: ${score}%. You earned 20 XP!`);
                    }
                    setSelectedQuizId(null);
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <SessionNotes
              sessionId={sessionId}
              initialNotes="This was a great session! We covered:\n- JavaScript closures\n- Async/await patterns\n- ES6 features\n\nNext steps:\n- Practice with promises\n- Build a small project\n- Review callback functions"
              onNotesSaved={(notes) => {
                console.log('Notes saved:', notes);
                alert('Session notes saved successfully!');
              }}
            />
          )}
        </motion.div>

        {/* Feature Overview */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border p-6">
          <h2 className="text-xl font-bold text-navy mb-4">Features Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-navy mb-2">📝 Create Quiz</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Up to 3 questions per quiz</li>
                <li>• Text and multiple choice options</li>
                <li>• Client-side validation</li>
                <li>• Saves to Firestore</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-navy mb-2">🎯 Take Quiz</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• One question at a time</li>
                <li>• Progress tracking</li>
                <li>• Score calculation</li>
                <li>• +20 XP on completion</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-navy mb-2">📋 Session Notes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Rich text area</li>
                <li>• Character limit (2000)</li>
                <li>• Auto-save functionality</li>
                <li>• Tips for great notes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAndNotesDemo;
