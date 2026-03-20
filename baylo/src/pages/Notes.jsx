import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// Example session notes data
const generateSessionNotes = () => {
  const sessions = [
    {
      id: 1,
      title: 'Cooking Basics with Maria',
      date: '2024-01-15',
      skill: 'Cooking',
      mentor: 'Maria Santos',
      mentorAvatar: 'https://i.pravatar.cc/60?img=4',
      notes: [
        'Learned proper knife techniques - always keep fingers curled under',
        'Mastered the art of making perfect pasta dough',
        'Important: Always taste as you cook, not just at the end',
        'Key tip: Use cold water for pasta, hot water for rice'
      ],
      tags: ['knife-skills', 'pasta', 'techniques'],
      duration: '45 minutes',
      rating: 5
    },
    {
      id: 2,
      title: 'Guitar Chord Progressions',
      date: '2024-01-12',
      skill: 'Guitar',
      mentor: 'David Kim',
      mentorAvatar: 'https://i.pravatar.cc/60?img=5',
      notes: [
        'Practiced C-G-Am-F progression - very common in pop music',
        'Finger placement is crucial for clean chord transitions',
        'Metronome practice at 60 BPM helped with timing',
        'Next session: Learn barre chords'
      ],
      tags: ['chords', 'progressions', 'timing'],
      duration: '60 minutes',
      rating: 4
    },
    {
      id: 3,
      title: 'Digital Art Fundamentals',
      date: '2024-01-10',
      skill: 'Drawing',
      mentor: 'Sophia Park',
      mentorAvatar: 'https://i.pravatar.cc/60?img=8',
      notes: [
        'Understanding layers in digital art - organize by elements',
        'Color theory basics - complementary colors create contrast',
        'Brush settings matter more than expensive tools',
        'Practice daily sketches for muscle memory'
      ],
      tags: ['digital-art', 'color-theory', 'layers'],
      duration: '90 minutes',
      rating: 5
    },
    {
      id: 4,
      title: 'Fitness Form & Technique',
      date: '2024-01-08',
      skill: 'Fitness',
      mentor: 'Alex Rodriguez',
      mentorAvatar: 'https://i.pravatar.cc/60?img=2',
      notes: [
        'Proper squat form: feet shoulder-width, knees track over toes',
        'Core engagement is key for all exercises',
        'Start with bodyweight before adding resistance',
        'Rest days are just as important as workout days'
      ],
      tags: ['form', 'technique', 'bodyweight'],
      duration: '75 minutes',
      rating: 4
    },
    {
      id: 5,
      title: 'Baking Perfect Bread',
      date: '2024-01-05',
      skill: 'Baking',
      mentor: 'Emma Wilson',
      mentorAvatar: 'https://i.pravatar.cc/60?img=6',
      notes: [
        'Temperature control is everything in bread making',
        'Kneading develops gluten - windowpane test shows readiness',
        'Proofing time varies with room temperature',
        'Steam in oven creates crispy crust'
      ],
      tags: ['bread', 'kneading', 'proofing'],
      duration: '120 minutes',
      rating: 5
    }
  ];

  return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const Notes = ({ user, profile: initialProfile, onSignOut }) => {
  const [profile] = useState(initialProfile);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('All');

  const skills = ['All', 'Cooking', 'Guitar', 'Drawing', 'Fitness', 'Baking'];

  useEffect(() => {
    setSessionNotes(generateSessionNotes());
  }, []);

  const filteredNotes = sessionNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.notes.some(noteText => noteText.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = filterSkill === 'All' || note.skill === filterSkill;
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      <Header user={user} profile={profile} onSignOut={onSignOut} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-navy mb-2">Session Notes</h1>
              <p className="text-lg text-gray-600">
                Review and organize your learning notes from previous sessions
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy focus:ring-opacity-20 outline-none"
                  />
                </div>
                <div className="sm:w-48">
                  <select
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy focus:ring-opacity-20 outline-none"
                  >
                    {skills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedNote(note)}
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-navy mb-1">{note.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{note.skill}</span>
                          <span>•</span>
                          <span>{note.duration}</span>
                          <span>•</span>
                          <span>{new Date(note.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < note.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                    {/* Mentor Info */}
                    <div className="flex items-center space-x-3">
                      <img
                        src={note.mentorAvatar}
                        alt={note.mentor}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-gray-700">with {note.mentor}</span>
                    </div>
                  </div>

                  {/* Notes Preview */}
                  <div className="p-6">
                    <div className="space-y-2">
                      {note.notes.slice(0, 2).map((noteText, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-navy rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-600 line-clamp-2">{noteText}</p>
                        </div>
                      ))}
                      {note.notes.length > 2 && (
                        <p className="text-sm text-navy font-medium">
                          +{note.notes.length - 2} more notes
                        </p>
                      )}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No notes found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-navy mb-2">{selectedNote.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{selectedNote.skill}</span>
                    <span>•</span>
                    <span>{selectedNote.duration}</span>
                    <span>•</span>
                    <span>{new Date(selectedNote.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Mentor Info */}
              <div className="flex items-center space-x-3 mt-4">
                <img
                  src={selectedNote.mentorAvatar}
                  alt={selectedNote.mentor}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <span className="font-medium text-gray-700">Mentor: {selectedNote.mentor}</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < selectedNote.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <h3 className="text-lg font-semibold text-navy mb-4">Session Notes</h3>
              <div className="space-y-3">
                {selectedNote.notes.map((noteText, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-navy rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{noteText}</p>
                  </div>
                ))}
              </div>
              
              {/* Tags */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-navy text-white text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Notes;
