import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// Available skills for leaderboard categories
const SKILL_CATEGORIES = [
  'Cooking',
  'Baking', 
  'Drawing',
  'Fitness',
  'Code Creation',
  'Singing',
  'Video Editing',
  'Guitar',
  'Graphic Design',
  'Dancing'
];

// Dummy leaderboard data
const generateLeaderboardData = (skill) => {
  const names = [
    'Sarah Chen', 'Alex Rodriguez', 'Yuki Tanaka', 'Maria Santos', 'David Kim',
    'Emma Wilson', 'James Liu', 'Sophia Park', 'Michael Chen', 'Lisa Zhang',
    'Ryan O\'Connor', 'Priya Patel', 'Ahmed Hassan', 'Isabella Garcia', 'Oliver Smith'
  ];
  
  const countries = [
    'Singapore', 'Philippines', 'Japan', 'Philippines', 'South Korea',
    'Australia', 'China', 'South Korea', 'China', 'China',
    'Ireland', 'India', 'Egypt', 'Mexico', 'United Kingdom'
  ];

  return names.map((name, index) => ({
    id: index + 1,
    name,
    country: countries[index],
    skill,
    xp: Math.floor(Math.random() * 2000) + 500,
    level: Math.floor(Math.random() * 10) + 1,
    avatar: `https://i.pravatar.cc/60?img=${index + 1}`
  })).sort((a, b) => b.xp - a.xp).map((item, index) => ({
    ...item,
    rank: index + 1,
    badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : null
  }));
};

const Leaderboard = ({ user, profile: initialProfile, onSignOut }) => {
  const [profile] = useState(initialProfile);
  const [selectedSkill, setSelectedSkill] = useState('Cooking');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setLeaderboardData(generateLeaderboardData(selectedSkill));
  }, [selectedSkill]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setIsDropdownOpen(false);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      <Header user={user} profile={profile} onSignOut={onSignOut} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-2 md:px-4 lg:px-8 py-4 md:py-6 lg:py-8 pb-20 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 md:mb-6 lg:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-2 md:mb-3">Leaderboard</h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-600">
                See how you rank among Baylo learners worldwide
              </p>
            </div>

            {/* Skill Category Selector - Dropdown */}
            <div className="mb-4 md:mb-6 lg:mb-8">
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-navy mb-3 md:mb-4">Choose Skill Category</h2>
              <div className="relative" ref={dropdownRef}>
                {/* Dropdown Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full md:w-auto min-w-[200px] md:min-w-[240px] px-4 md:px-5 py-3 md:py-3.5 bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl font-medium text-gray-700 hover:border-[#112250] transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md text-base md:text-lg"
                >
                  <span className="text-navy font-semibold">{selectedSkill}</span>
                  <motion.svg
                    className="w-4 h-4 md:w-5 md:h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 right-0 md:right-auto mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {SKILL_CATEGORIES.map((skill, index) => (
                          <motion.button
                            key={skill}
                            onClick={() => handleSkillSelect(skill)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.2 }}
                            className={`w-full text-left px-4 py-3 font-medium transition-colors duration-150 ${
                              selectedSkill === skill
                                ? 'bg-[#112250] text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                            } ${index !== SKILL_CATEGORIES.length - 1 ? 'border-b border-gray-100' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{skill}</span>
                              {selectedSkill === skill && (
                                <motion.svg
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </motion.svg>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Current User Rank */}
            {profile && (
              <div className="mb-4 md:mb-6 lg:mb-8">
                <div className="rounded-xl md:rounded-2xl shadow-lg p-4 md:p-5 lg:p-6 text-white" style={{ background: '#112250' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3">Your Rank in {selectedSkill}</h3>
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="text-2xl md:text-3xl lg:text-4xl font-bold">#{Math.floor(Math.random() * 50) + 1}</div>
                        <div>
                          <div className="text-sm md:text-base lg:text-lg font-semibold">{profile.firstName} {profile.lastName}</div>
                          <div className="text-xs md:text-sm opacity-90">{profile.country}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg md:text-xl lg:text-2xl font-bold">{Math.floor(Math.random() * 1000) + 200} XP</div>
                      <div className="text-xs md:text-sm opacity-90">Level {Math.floor(Math.random() * 5) + 1}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border overflow-hidden">
              <div className="px-4 md:px-5 lg:px-6 py-3 md:py-4 lg:py-5 bg-gray-50 border-b">
                <h3 className="text-base md:text-lg lg:text-xl font-semibold text-navy">
                  Top {selectedSkill} Learners
                </h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {leaderboardData.slice(0, 10).map((person, index) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-4 md:p-5 lg:p-6 hover:bg-gray-50 transition-colors ${
                      person.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {person.badge ? (
                          <div className="text-xl md:text-2xl lg:text-3xl">{person.badge}</div>
                        ) : (
                          <div className={`w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                            person.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {person.rank}
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover"
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm md:text-base lg:text-lg font-semibold text-navy truncate">{person.name}</h4>
                            <p className="text-xs md:text-sm text-gray-600">{person.country}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm md:text-base lg:text-lg font-bold text-navy">{person.xp} XP</div>
                            <div className="text-xs md:text-sm text-gray-500">Level {person.level}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              <div className="p-4 md:p-5 lg:p-6 text-center bg-gray-50">
                <button className="text-sm md:text-base lg:text-lg text-navy hover:text-navy-light font-medium">
                  View Full Leaderboard
                </button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;
