import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { generateMessages } from '../utils/messagesData';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    // Get recent matches from messages (limit to 3 most recent)
    const conversations = generateMessages();
    setRecentMatches(conversations.slice(0, 3));
  }, []);

  const handleMatchClick = (conversationId) => {
    navigate('/messages', { state: { conversationId } });
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Leaderboard', 
      path: '/leaderboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    { 
      name: 'Messages', 
      path: '/messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    { 
      name: 'Notes', 
      path: '/notes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'Plans', 
      path: '/plans',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Profile', 
      path: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 h-full flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112250] focus:border-transparent"
            />
          </div>
        </div>

        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`nav-link-hover ${isActive ? 'active' : ''} flex items-center space-x-3 px-3 py-2 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Linked Section - Recent Matches */}
        {recentMatches.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 font-medium mb-3">Recent Matches</div>
            <div className="space-y-2">
              {recentMatches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleMatchClick(match.id)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 group"
                >
                  <img
                    src={match.participant.avatar}
                    alt={match.participant.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="truncate group-hover:text-[#112250] transition-colors">
                    {match.participant.name}
                  </span>
                  {match.unreadCount > 0 && (
                    <span className="ml-auto bg-[#112250] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {match.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
