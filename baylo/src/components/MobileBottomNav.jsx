import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const MobileBottomNav = () => {
  const location = useLocation();
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const navItems = [
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
      name: 'Dashboard', 
      path: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      isCenter: true
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
      name: 'Profile', 
      path: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  // Calculate indicator position when route changes
  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      
      // Find the active item - prioritize exact match first
      let activeItem = null;
      let activePath = null;
      
      // First try exact match
      for (const item of navItems) {
        if (location.pathname === item.path) {
          activePath = item.path;
          break;
        }
      }
      
      // If no exact match, try nested routes (longest match first)
      if (!activePath) {
        const sortedItems = [...navItems].sort((a, b) => b.path.length - a.path.length);
        for (const item of sortedItems) {
          if (location.pathname.startsWith(item.path + '/') || 
              (item.path !== '/' && location.pathname.startsWith(item.path))) {
            activePath = item.path;
            break;
          }
        }
      }
      
      if (!activePath) return;
      
      // Find the item element using the ref
      activeItem = itemRefs.current[activePath];
      
      if (activeItem && navRef.current) {
        const containerRect = navRef.current.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        
        setIndicatorStyle({
          left: itemRect.left - containerRect.left,
          width: itemRect.width
        });
      }
    };

    // Update immediately
    updateIndicator();
    
    // Also update on window resize to handle orientation changes
    window.addEventListener('resize', updateIndicator);
    
    // Small delay to ensure DOM is fully updated after navigation
    const timer = setTimeout(updateIndicator, 100);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname]);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg safe-area-bottom">
      <div ref={navRef} className="relative flex items-center justify-around h-16 px-2">
        {/* Sliding indicator */}
        <motion.div
          className="absolute bottom-0 h-1 bg-[#112250]"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />
        
        {navItems.map((item, index) => {
          // More precise active state checking
          const isActive = location.pathname === item.path || 
            (location.pathname.startsWith(item.path + '/') && item.path !== '/');
          
          const handleClick = () => {
            // Update indicator immediately on click using the ref
            requestAnimationFrame(() => {
              const clickedItem = itemRefs.current[item.path];
              if (clickedItem && navRef.current) {
                const containerRect = navRef.current.getBoundingClientRect();
                const itemRect = clickedItem.getBoundingClientRect();
                setIndicatorStyle({
                  left: itemRect.left - containerRect.left,
                  width: itemRect.width
                });
              }
            });
          };
          
          return (
            <Link
              key={item.name}
              ref={(el) => {
                if (el) itemRefs.current[item.path] = el;
              }}
              to={item.path}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                item.isCenter ? 'scale-110' : ''
              }`}
            >
              <motion.div
                animate={{
                  color: isActive ? '#112250' : '#6B7280'
                }}
                transition={{ duration: 0.2 }}
                className="mb-1"
              >
                {item.icon}
              </motion.div>
              <motion.span
                animate={{
                  color: isActive ? '#112250' : '#6B7280'
                }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-medium"
              >
                {item.name}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

