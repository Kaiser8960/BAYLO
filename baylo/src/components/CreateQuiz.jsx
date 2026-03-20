import { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

const CreateQuiz = ({ mentorId, skillId, onQuizCreated }) => {
  const [questions, setQuestions] = useState([
    { id: 1, text: '', type: 'text', options: [] }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    if (questions.length < 3) {
      setQuestions([...questions, {
        id: questions.length + 1,
        text: '',
        type: 'text',
        options: []
      }]);
    }
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: [...q.options, ''] }
        : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? value : opt
            )
          }
        : q
    ));
  };

  const removeQuestion = (questionId) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const validateQuiz = () => {
    for (const question of questions) {
      if (!question.text.trim()) {
        alert('All questions must have text');
        return false;
      }
      if (question.type === 'mcq' && question.options.length < 2) {
        alert('MCQ questions must have at least 2 options');
        return false;
      }
      if (question.type === 'mcq' && question.options.some(opt => !opt.trim())) {
        alert('All MCQ options must be filled');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateQuiz()) return;
    
    setIsSubmitting(true);
    
    try {
      const quizData = {
        mentorId,
        skillId,
        questions: questions.map(q => ({
          text: q.text.trim(),
          type: q.type,
          options: q.type === 'mcq' ? q.options.map(opt => opt.trim()) : []
        })),
        createdAt: new Date(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'quizzes'), quizData);
      console.log('Quiz created with ID:', docRef.id);
      
      alert('Quiz created successfully!');
      onQuizCreated?.(docRef.id);
      
      // Reset form
      setQuestions([{ id: 1, text: '', type: 'text', options: [] }]);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6">
      <h2 className="text-2xl font-bold text-navy mb-6">Create Quiz</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy">Question {index + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                  placeholder="Enter your question here..."
                  className="input-field h-20 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                  className="input-field"
                >
                  <option value="text">Text Answer</option>
                  <option value="mcq">Multiple Choice</option>
                </select>
              </div>

              {question.type === 'mcq' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Answer Options
                    </label>
                    <button
                      type="button"
                      onClick={() => addOption(question.id)}
                      className="text-sm text-navy hover:text-navy-light"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        className="input-field"
                        required
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {questions.length < 3 && (
          <button
            type="button"
            onClick={addQuestion}
            className="btn-secondary w-full"
          >
            + Add Question ({questions.length}/3)
          </button>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1"
          >
            {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
          <button
            type="button"
            onClick={() => onQuizCreated?.(null)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
