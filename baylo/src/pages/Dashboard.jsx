import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile, calculateSessionCost } from '../firebase/firestore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { dummyMatches } from '../data/dummyMatches';
import { useToast } from '../components/Toast';
import { isLeaderboardRanked } from '../utils/leaderboardUtils';

const Dashboard = ({ user, profile: initialProfile, onSignOut, onProfileUpdate }) => {
  const { showSuccess, showError, ToastContainer } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [loadingProfile, setLoadingProfile] = useState(!initialProfile);
  const [showAllMatches, setShowAllMatches] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && !initialProfile) {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        setLoadingProfile(false);
      } else if (initialProfile) {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user, initialProfile]);

  // Get recommended matches grouped by skill (users who can teach what you want to learn)
  const getRecommendedMatches = () => {
    if (!profile || !profile.skillsLearn || profile.skillsLearn.length === 0) return [];
    
    const matchesBySkill = {};
    const allMatches = [];
    const seenMatchIds = new Set();
    const isPremiumUser = profile?.plan === 'Bai Premium';
    
    // For each skill the user wants to learn, find matches that can teach it
    profile.skillsLearn.forEach(skill => {
      let skillMatches = dummyMatches.filter(match => 
        match.skillsKnow.includes(skill) && !seenMatchIds.has(match.id)
      );
      
      // Filter out premium matches if user is not on Bai Premium plan
      if (!isPremiumUser) {
        skillMatches = skillMatches.filter(match => !match.isPremium);
      }
      
      // Take up to 3 matches per skill
      const limitedMatches = skillMatches.slice(0, 3);
      limitedMatches.forEach(match => {
        seenMatchIds.add(match.id);
        allMatches.push(match);
      });
      
      if (limitedMatches.length > 0) {
        matchesBySkill[skill] = limitedMatches;
      }
    });
    
    // Remove duplicates and return all matches
    return Array.from(new Map(allMatches.map(match => [match.id, match])).values());
  };

  const allRecommendedMatches = getRecommendedMatches();
  const displayedMatches = allRecommendedMatches.slice(0, 4); // Show only 4 initially

  const handleRequestSession = (match) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    if (!profile) {
      console.error('Profile not loaded yet');
      return;
    }
    
    // Check if match is leaderboard-ranked
    const isLeaderboard = match.isLeaderboardRanked || isLeaderboardRanked(match);
    const isPremiumUser = profile?.plan === 'Bai Premium';
    
    // If leaderboard-ranked and user is not Bai Premium, block the request
    if (isLeaderboard && !isPremiumUser) {
      showError('Bai Premium required to request sessions with leaderboard-ranked mentors. Upgrade to Bai Premium to access this feature.');
      return;
    }
    
    // Navigate to Messages page with session request data
    navigate('/messages', {
      state: {
        isSessionRequest: true,
        isLeaderboardRanked: isLeaderboard,
        matchData: {
          id: match.id,
          name: match.name,
          profileImage: match.profileImage,
          skillsKnow: match.skillsKnow,
          skillsLearn: match.skillsLearn,
          country: match.country,
          rating: match.rating,
          isLeaderboardRanked: isLeaderboard
        }
      }
    });
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      <ToastContainer />
      <Header user={user} profile={profile} onSignOut={onSignOut} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-2 md:px-4 lg:px-8 py-4 md:py-6 lg:py-8 pb-20 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-4 md:space-y-6"
          >
            {/* RECOMMENDED MATCHES Section */}
            <div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-navy">RECOMMENDED MATCHES</h2>
                {allRecommendedMatches.length > 4 && (
                  <button
                    onClick={() => setShowAllMatches(true)}
                    className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base font-medium text-navy hover:text-purple-600 transition-colors"
                  >
                    <span>See More</span>
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              
              {displayedMatches.length > 0 ? (
                <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-3 md:p-4 lg:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                    {displayedMatches.map((match) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-lg md:rounded-xl p-2.5 md:p-3 lg:p-4 hover:shadow-md transition-all relative ${
                          match.isPremium
                            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 shadow-lg shadow-yellow-200/50'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {/* Premium Badge - Only show for Bai Premium users */}
                        {match.isPremium && profile?.plan === 'Bai Premium' && (
                          <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[8px] md:text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md z-10 whitespace-nowrap">
                            ⭐ PREMIUM
                          </div>
                        )}
                        {/* Leaderboard Rank Badge - Only for Bai Premium users */}
                        {(() => {
                          const isLeaderboard = match.isLeaderboardRanked || isLeaderboardRanked(match);
                          return isLeaderboard && profile?.plan === 'Bai Premium' ? (
                            <div className="absolute -top-1.5 -left-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-[8px] md:text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md z-10 whitespace-nowrap" style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>
                              🏆 TOP 10
                            </div>
                          ) : null;
                        })()}
                        
                        <div className="flex items-center space-x-2 mb-2.5 md:mb-3">
                          <img
                            src={match.profileImage}
                            alt={match.name}
                            className={`w-9 h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full ${
                              match.isPremium && profile?.plan === 'Bai Premium'
                                ? 'border-[2px] md:border-[3px] border-yellow-500 ring-1 md:ring-2 ring-yellow-400 ring-opacity-75 shadow-md' 
                                : ''
                            }`}
                          />
                          <div>
                            <div className="text-sm md:text-base lg:text-lg font-semibold text-navy">{match.name}</div>
                            <div className="text-xs md:text-sm text-gray-600">{match.country}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5 md:space-y-2 mb-2.5 md:mb-3">
                          <div>
                            <div className="text-[10px] md:text-xs font-medium text-gray-500 mb-1">Teaches</div>
                            <div className="flex flex-wrap gap-1">
                              {match.skillsKnow.slice(0, 2).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 md:py-1 text-[10px] md:text-xs bg-green-100 text-green-700 rounded-md font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] md:text-xs font-medium text-gray-500 mb-1">Wants to Learn</div>
                            <div className="flex flex-wrap gap-1">
                              {match.skillsLearn.slice(0, 2).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 md:py-1 text-[10px] md:text-xs bg-blue-100 text-blue-700 rounded-md font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Session Cost Display */}
                        <div className="mb-2.5 md:mb-3 p-1.5 md:p-2 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center justify-between text-[10px] md:text-xs">
                            <span className="text-purple-700 font-medium">Session Cost:</span>
                            <span className="text-purple-900 font-bold">
                              {calculateSessionCost(match.rating || 4.0, profile?.plan)} tokens
                            </span>
                          </div>
                          {(profile?.plan === 'Bai Plus' || profile?.plan === 'Bai Premium') && (
                            <div className="text-[10px] md:text-xs text-purple-600 mt-0.5 md:mt-1">
                              Based on {match.rating ? `${match.rating}★` : '4.0★'} rating
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-2">
                          <button 
                            onClick={() => handleRequestSession(match)}
                            className="flex-1 py-1.5 md:py-2 px-2 md:px-3 text-white rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition-opacity"
                            style={{ background: '#112250' }}
                          >
                            Request Session
                          </button>
                          <button className="flex-1 py-1.5 md:py-2 px-2 md:px-3 border border-navy text-navy rounded-lg text-xs md:text-sm font-medium hover:bg-navy hover:text-cream transition-colors">
                            View Profile
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <div className="text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No matches yet!</h3>
                    <p className="text-gray-500 mb-4">
                      Try adding more skills to your profile to find better matches.
                    </p>
                    <Link
                      to="/profile"
                      className="inline-block py-2 px-4 bg-navy text-cream rounded-lg font-medium hover:bg-navy-light transition-colors"
                    >
                      Update Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* RECENT ACTIVITIES Section */}
            <div className="pb-4 md:pb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-navy mb-3 md:mb-4">RECENT ACTIVITIES</h2>
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-3 md:p-4 lg:p-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base md:text-lg font-medium text-gray-900 truncate">Completed Quiz: JavaScript Basics</div>
                      <div className="text-sm md:text-base text-gray-500">+20 XP • 2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base md:text-lg font-medium text-gray-900 truncate">Session with Sarah Johnson</div>
                      <div className="text-sm md:text-base text-gray-500">Learning: Photography • 1 day ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base md:text-lg font-medium text-gray-900 truncate">Earned Badge: Quick Learner</div>
                      <div className="text-sm md:text-base text-gray-500">Completed 5 quizzes • 3 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* All Matches Modal */}
      {showAllMatches && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4" onClick={() => setShowAllMatches(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-xl md:text-2xl font-bold text-navy">All Available Matches</h2>
              <button
                onClick={() => setShowAllMatches(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {allRecommendedMatches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allRecommendedMatches.map((match) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-lg p-3 md:p-4 hover:shadow-md transition-all relative ${
                        match.isPremium && profile?.plan === 'Bai Premium'
                          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 shadow-lg shadow-yellow-200/50'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {/* Premium Badge - Only show for Bai Premium users */}
                      {match.isPremium && profile?.plan === 'Bai Premium' && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[8px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                          ⭐ PREMIUM
                        </div>
                      )}
                      {/* Leaderboard Rank Badge - Only for Bai Premium users */}
                      {(() => {
                        const isLeaderboard = match.isLeaderboardRanked || isLeaderboardRanked(match);
                        return isLeaderboard && profile?.plan === 'Bai Premium' ? (
                          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-[8px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-md z-10" style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>
                            🏆 TOP 10
                          </div>
                        ) : null;
                      })()}
                      
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={match.profileImage}
                          alt={match.name}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${
                            match.isPremium 
                              ? 'border-[3px] border-yellow-500 ring-2 ring-yellow-400 ring-opacity-75 shadow-md' 
                              : ''
                          }`}
                        />
                        <div>
                          <div className="text-sm md:text-base font-semibold text-navy">{match.name}</div>
                          <div className="text-xs md:text-sm text-gray-600">{match.country}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Teaches</div>
                          <div className="flex flex-wrap gap-1">
                            {match.skillsKnow.slice(0, 2).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Wants to Learn</div>
                          <div className="flex flex-wrap gap-1">
                            {match.skillsLearn.slice(0, 2).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Session Cost Display */}
                      <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-purple-700 font-medium">Session Cost:</span>
                          <span className="text-purple-900 font-bold">
                            {(() => {
                              const baseCost = calculateSessionCost(match.rating || 4.0, profile?.plan);
                              const isLeaderboard = match.isLeaderboardRanked || isLeaderboardRanked(match);
                              const leaderboardBonus = (isLeaderboard && profile?.plan === 'Bai Premium') ? 5 : 0;
                              return baseCost + leaderboardBonus;
                            })()} tokens
                          </span>
                        </div>
                        {(profile?.plan === 'Bai Plus' || profile?.plan === 'Bai Premium') && (
                          <div className="text-xs text-purple-600 mt-1">
                            Based on {match.rating ? `${match.rating}★` : '4.0★'} rating
                            {(() => {
                              const isLeaderboard = match.isLeaderboardRanked || isLeaderboardRanked(match);
                              return isLeaderboard && profile?.plan === 'Bai Premium' ? ' (+5 leaderboard bonus)' : '';
                            })()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-2">
                        <button 
                          onClick={() => {
                            setShowAllMatches(false);
                            handleRequestSession(match);
                          }}
                          className="flex-1 py-2 px-3 text-white rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition-opacity"
                          style={{ background: '#112250' }}
                        >
                          Request Session
                        </button>
                        <button className="flex-1 py-2 px-3 border border-navy text-navy rounded-lg text-xs md:text-sm font-medium hover:bg-navy hover:text-cream transition-colors">
                          View Profile
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No matches found</h3>
                    <p className="text-gray-500">
                      Try adding more skills to your profile to find better matches.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;