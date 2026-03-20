import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

// Dummy Firestore-style data
const dummyProfiles = [
  {
    id: 'u1',
    name: 'Ava Nakamura',
    age: 24,
    avatar: 'https://i.pravatar.cc/300?img=1',
    level: 'Apprentice',
    xp: 920,
    rating: 4.8,
    reviewCount: 23,
    recentReview: "Great teacher! Explained React hooks perfectly.",
    teach: [
      { skill: 'JavaScript', icon: '⚡' },
      { skill: 'React', icon: '⚛️' },
      { skill: 'TypeScript', icon: '🔷' }
    ],
    learn: [
      { skill: 'UI/UX Design', icon: '🎨' },
      { skill: '3D Modeling', icon: '🎯' }
    ],
    badges: ['Plus', 'Early Adopter'],
    availability: 'Available',
    location: 'San Francisco, CA',
    distance: 2.3
  },
  {
    id: 'u2',
    name: 'Marcus Lee',
    age: 28,
    avatar: 'https://i.pravatar.cc/300?img=5',
    level: 'Novice',
    xp: 420,
    rating: 4.2,
    reviewCount: 8,
    recentReview: "Patient and thorough with data visualization concepts.",
    teach: [
      { skill: 'Python', icon: '🐍' },
      { skill: 'Data Visualization', icon: '📊' },
      { skill: 'SQL', icon: '🗄️' }
    ],
    learn: [
      { skill: 'Public Speaking', icon: '🎤' },
      { skill: 'Leadership', icon: '👑' }
    ],
    badges: ['Verified'],
    availability: 'Available',
    location: 'Seattle, WA',
    distance: 15.7
  },
  {
    id: 'u3',
    name: 'Sofia Ramirez',
    age: 26,
    avatar: 'https://i.pravatar.cc/300?img=8',
    level: 'Expert',
    xp: 2100,
    rating: 4.9,
    reviewCount: 45,
    recentReview: "Amazing illustrator! Her branding tips were invaluable.",
    teach: [
      { skill: 'Illustration', icon: '✏️' },
      { skill: 'Branding', icon: '🏷️' },
      { skill: 'Adobe Creative Suite', icon: '🎨' }
    ],
    learn: [
      { skill: 'Web Development', icon: '💻' },
      { skill: 'Digital Marketing', icon: '📈' }
    ],
    badges: ['Premium', 'Top Rated', 'Mentor'],
    availability: 'Busy',
    location: 'Austin, TX',
    distance: 8.1
  },
  {
    id: 'u4',
    name: 'David Chen',
    age: 31,
    avatar: 'https://i.pravatar.cc/300?img=12',
    level: 'Apprentice',
    xp: 1150,
    rating: 4.6,
    reviewCount: 19,
    recentReview: "Excellent at breaking down complex algorithms.",
    teach: [
      { skill: 'Algorithms', icon: '🧮' },
      { skill: 'Machine Learning', icon: '🤖' },
      { skill: 'Statistics', icon: '📈' }
    ],
    learn: [
      { skill: 'UI/UX Design', icon: '🎨' },
      { skill: 'Product Management', icon: '📋' }
    ],
    badges: ['Plus', 'Algorithm Expert'],
    availability: 'Available',
    location: 'New York, NY',
    distance: 12.4
  }
];

const MatchesList = ({ user, onSignOut }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Ranking logic stub: (1) matching skills, (2) rating, (3) XP
  const filteredAndRankedProfiles = useMemo(() => {
    let filtered = dummyProfiles.filter(profile => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        profile.teach.some(skill => skill.skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        profile.learn.some(skill => skill.skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Level filter
      const matchesLevel = selectedLevel === 'All' || profile.level === selectedLevel;
      
      // Rating filter
      const matchesRating = profile.rating >= minRating;
      
      // Distance filter
      const matchesDistance = profile.distance <= maxDistance;
      
      // Availability filter
      const matchesAvailability = availabilityFilter === 'All' || profile.availability === availabilityFilter;
      
      return matchesSearch && matchesLevel && matchesRating && matchesDistance && matchesAvailability;
    });

    // Ranking logic: (1) matching skills count, (2) rating, (3) XP
    return filtered.sort((a, b) => {
      // Count matching skills with search query
      const aMatches = searchQuery === '' ? 0 : 
        a.teach.filter(skill => skill.skill.toLowerCase().includes(searchQuery.toLowerCase())).length +
        a.learn.filter(skill => skill.skill.toLowerCase().includes(searchQuery.toLowerCase())).length;
      
      const bMatches = searchQuery === '' ? 0 : 
        b.teach.filter(skill => skill.skill.toLowerCase().includes(searchQuery.toLowerCase())).length +
        b.learn.filter(skill => skill.skill.toLowerCase().includes(searchQuery.toLowerCase())).length;
      
      // Primary: matching skills count
      if (aMatches !== bMatches) return bMatches - aMatches;
      
      // Secondary: rating
      if (a.rating !== b.rating) return b.rating - a.rating;
      
      // Tertiary: XP
      return b.xp - a.xp;
    });
  }, [searchQuery, selectedLevel, minRating, maxDistance, availabilityFilter]);

  const handleBookSession = (profileId) => {
    console.log('Book session for:', profileId);
    // TODO: Implement booking logic
  };

  const handleMessage = (profileId) => {
    console.log('Message:', profileId);
    // TODO: Implement messaging logic
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navigation user={user} onSignOut={onSignOut} />
      
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-navy mb-6">Find Your Learning Matches</h1>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Skills to Learn
              </label>
              <input
                type="text"
                placeholder="e.g., JavaScript, UI/UX, Python..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
              />
            </div>
            
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="input-field"
              >
                <option value="All">All Levels</option>
                <option value="Novice">Novice</option>
                <option value="Apprentice">Apprentice</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="input-field"
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>
            
            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Distance (miles)
              </label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="input-field"
              >
                <option value={10}>10 miles</option>
                <option value={25}>25 miles</option>
                <option value={50}>50 miles</option>
                <option value={100}>100 miles</option>
              </select>
            </div>
          </div>
          
          {/* Availability Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <div className="flex gap-4">
              {['All', 'Available', 'Busy'].map((status) => (
                <button
                  key={status}
                  onClick={() => setAvailabilityFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    availabilityFilter === status
                      ? 'bg-navy text-cream'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found {filteredAndRankedProfiles.length} matches
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Profile Cards */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndRankedProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Header with Photo and Basic Info */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-navy">{profile.name}</h3>
                        <p className="text-gray-600">{profile.age} • {profile.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-semibold">{profile.rating}</span>
                          <span className="text-gray-500 text-sm">({profile.reviewCount})</span>
                        </div>
                        <div className="text-sm text-gray-600">{profile.distance} miles away</div>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.badges.map((badge) => (
                        <span
                          key={badge}
                          className={`px-2 py-1 text-xs rounded-full ${
                            badge === 'Premium' ? 'bg-purple-100 text-purple-700' :
                            badge === 'Plus' ? 'bg-indigo-100 text-indigo-700' :
                            badge === 'Top Rated' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="px-6 pb-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">I teach</h4>
                    <div className="space-y-1">
                      {profile.teach.map((skill) => (
                        <div key={skill.skill} className="flex items-center gap-2 text-sm">
                          <span>{skill.icon}</span>
                          <span className="text-gray-700">{skill.skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">I want to learn</h4>
                    <div className="space-y-1">
                      {profile.learn.map((skill) => (
                        <div key={skill.skill} className="flex items-center gap-2 text-sm">
                          <span>{skill.icon}</span>
                          <span className="text-gray-700">{skill.skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* XP and Level */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Level: {profile.level}</span>
                  <span className="text-sm font-medium text-gray-700">{profile.xp} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo via-accent to-purple h-2 rounded-full"
                    style={{ width: `${Math.min(100, (profile.xp / 2000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Recent Review */}
              <div className="px-6 pb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 italic">"{profile.recentReview}"</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleBookSession(profile.id)}
                    className="btn-primary flex-1"
                  >
                    Book Session
                  </button>
                  <button
                    onClick={() => handleMessage(profile.id)}
                    className="btn-secondary flex-1"
                  >
                    Message
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredAndRankedProfiles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No matches found</div>
            <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesList;
