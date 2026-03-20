import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOutUser } from '../firebase/auth';

const Navigation = ({ user, onSignOut }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    const result = await signOutUser();
    if (result.success) {
      onSignOut();
    }
    setIsLoading(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/matches', label: 'Find Matches', icon: '🔍' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/subscription', label: 'Plans', icon: '💎' },
    { path: '/quiz-demo', label: 'Learning Tools', icon: '📚' }
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-navy-purple rounded-lg flex items-center justify-center">
              <span className="text-cream font-bold text-sm">B</span>
            </div>
            <span className="text-2xl font-bold text-navy">Baylo</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-navy text-cream'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-navy'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 hidden sm:block">
              Welcome, {user?.displayName || user?.email}
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="btn-secondary text-sm"
            >
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-navy text-cream'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-navy'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
