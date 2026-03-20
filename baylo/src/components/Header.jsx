import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserProfile } from '../firebase/firestore';
import BayloLogo from './BayloLogo';
import TokenIcon from './TokenIcon';
import ExpProgressBars from './ExpProgressBars';

const Header = ({ user, profile: initialProfile, onSignOut }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(!initialProfile);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && !initialProfile) {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        setLoading(false);
      } else if (initialProfile) {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, initialProfile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <header className="bg-white border-b-2 border-gray-300">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex space-x-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const displayName = profile?.firstName 
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <header className="bg-white border-b-2 border-gray-300">
        <div className="px-4 md:px-8 py-3 md:py-5">
          <div className="flex justify-between items-center gap-2">
            {/* Left Side: Logo with Baylo text */}
            <div className="flex items-center flex-shrink-0">
              <img 
                src="/BayloLogo.svg" 
                alt="Baylo Logo" 
                className="w-10 h-10 md:w-16 md:h-16 mr-1 md:mr-3 flex-shrink-0"
              />
              <span className="text-base md:text-3xl font-bold flex-shrink-0" style={{ color: '#112250' }}>Baylo</span>
            </div>

            {/* Right Side: TOKENS, LEVEL EXP, PFP */}
            <div className="flex items-center gap-1 md:gap-2 md:space-x-3 flex-1 min-w-0 justify-end overflow-visible">
              {/* TOKENS - Compact on mobile */}
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 h-5 md:h-6 rounded-full shadow-sm flex-shrink-0" style={{ background: '#112250' }}>
                <TokenIcon className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                <span className="text-xs md:text-sm font-bold text-white whitespace-nowrap">
                  {profile?.tokens || 0}
                </span>
              </div>

              {/* EXP Progress Bars - Always visible */}
              <div className="flex-shrink-0 overflow-visible">
                <ExpProgressBars 
                  xp={profile?.xp || 0} 
                  plan={profile?.plan || 'Free Trial'} 
                />
              </div>

              {/* Profile Picture (PFP) */}
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="hover:opacity-80 transition-opacity"
                >
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden ${
                    profile?.plan === 'Bai Premium' 
                      ? 'border-2 border-yellow-400 ring-2 ring-yellow-400 ring-opacity-50 shadow-lg' 
                      : 'border-2 border-gray-200'
                  }`}>
                    <img
                      src={profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6D28D9&color=fff`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Your Profile
                      </a>
                      <a
                        href="/plans"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Subscription
                      </a>
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={onSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
