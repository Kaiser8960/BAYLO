import { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SessionNotes = ({ sessionId, initialNotes = '', onNotesSaved }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!notes.trim()) {
      alert('Please enter some notes before saving');
      return;
    }

    setIsSaving(true);
    
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        notes: notes.trim(),
        notesUpdatedAt: new Date()
      });

      console.log('Session notes saved');
      setIsSaved(true);
      onNotesSaved?.(notes.trim());
      
      // Reset saved state after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border p-6"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-navy mb-2">Session Notes</h2>
        <p className="text-gray-600">
          Record key takeaways, action items, and insights from this session.
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you learn? What are your next steps? Any questions or insights to remember?"
          className="input-field h-40 resize-none"
          maxLength={2000}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {notes.length}/2000 characters
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isSaved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center text-green-600 text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Notes saved!
            </motion.div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !notes.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">💡 Tips for great notes:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Summarize key concepts you learned</li>
          <li>• Note any questions you still have</li>
          <li>• Record action items or next steps</li>
          <li>• Include resources or tools mentioned</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default SessionNotes;
