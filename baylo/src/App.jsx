import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import LoadingSpinner from './components/LoadingSpinner';
import { getUserProfile } from './firebase/firestore';
import LandingPage from './pages/LandingPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './pages/Dashboard';
import MatchesList from './pages/MatchesList';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import QuizAndNotesDemo from './pages/QuizAndNotesDemo';
import SetupProfile from './pages/SetupProfile';
import FindMatches from './pages/FindMatches';
import LearningTools from './pages/LearningTools';
import Plans from './pages/Plans';
import Leaderboard from './pages/Leaderboard';
import Notes from './pages/Notes';
import Messages from './pages/Messages';
import MobileBottomNav from './components/MobileBottomNav';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // null = loading, {} = not found, obj = loaded
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // Track if auth has been checked at least once

  useEffect(() => {
    // Maximum loading time - always allow app to render after 3 seconds
    const maxLoadingTimer = setTimeout(() => {
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
        setProfile((prev) => prev === null ? {} : prev); // Set empty profile if still null
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      // Prevent rapid state changes from causing redirect loops
      if (!authChecked) {
        setAuthChecked(true);
      }
      
      setUser(u);
      if (u) {
        // Store user session in localStorage
        localStorage.setItem('baylo_user', JSON.stringify({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName
        }));
        
        // Only show loading spinner on initial load
        if (isInitialLoad) {
          setLoading(true);
        }
        
        try {
          // Fetch profile with timeout - use Promise.race but handle timeout gracefully
          const profilePromise = getUserProfile(u.uid);
          const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => resolve(null), 5000) // 5 second timeout, resolve with null instead of rejecting
          );
          
          const prof = await Promise.race([profilePromise, timeoutPromise]);
          setProfile(prof || {}); // if null, becomes {}
        } catch (error) {
          // Only log actual errors, not timeouts
          if (error.message !== 'Timeout') {
            console.error('Error loading profile:', error);
          }
          // Set empty profile to allow app to continue
          setProfile({});
        } finally {
          if (isInitialLoad) {
            clearTimeout(maxLoadingTimer);
            setLoading(false);
            setIsInitialLoad(false);
          }
        }
      } else {
        // Clear localStorage on sign out
        localStorage.removeItem('baylo_user');
        setProfile(null);
        if (isInitialLoad) {
          clearTimeout(maxLoadingTimer);
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    });
    return () => {
      clearTimeout(maxLoadingTimer);
      unsubscribe();
    };
  }, [isInitialLoad]);

  const handleAuthSuccess = (user) => {
    setUser(user);
  };

  const handleSignOut = () => {
    setUser(null);
    setProfile(null);
  };

  // Function to refresh profile from Firestore
  const refreshProfile = async () => {
    if (!user) return;
    try {
      const prof = await getUserProfile(user.uid);
      setProfile(prof || {});
    } catch (error) {
      // Silently handle errors during refresh - don't spam console
      // The profile will remain as is if refresh fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error refreshing profile:', error);
      }
    }
  };

  // Only show loading spinner during initial auth check
  // Once loading is false, allow routes to render even if profile is empty
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent user={user} profile={profile} authChecked={authChecked} handleAuthSuccess={handleAuthSuccess} handleSignOut={handleSignOut} refreshProfile={refreshProfile} setProfile={setProfile} />
    </Router>
  );
}

// Component that uses useLocation hook (must be inside Router)
function AppContent({ user, profile, authChecked, handleAuthSuccess, handleSignOut, refreshProfile, setProfile }) {
  const location = useLocation();
  const isSetupProfile = location.pathname === '/setup-profile';
  
  return (
    <div className="App">
      {user && !isSetupProfile && <MobileBottomNav />}
      <Routes>
          {/* Landing Page - Public (loads immediately) */}
          <Route 
            path="/" 
            element={
              !authChecked || (user && profile === null) ? (
                <LoadingSpinner />
              ) : user ? (
                (profile && profile.firstName)
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/setup-profile" replace />
              ) : (
                <LandingPage />
              )
            } 
          />
          
          {/* Auth Routes - Public (loads immediately) */}
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginForm onLoginSuccess={handleAuthSuccess} />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RegisterForm onRegisterSuccess={handleAuthSuccess} />
              )
            } 
          />
          
          {/* Authenticated routes */}
          <Route 
            path="/setup-profile" 
            element={
              !authChecked ? (
                <LoadingSpinner />
              ) : user ? (
                // Only redirect to dashboard if profile is loaded and has firstName
                // If profile is null (still loading) or empty object (no profile), show setup
                (profile !== null && profile !== undefined && profile.firstName)
                  ? <Navigate to="/dashboard" replace />
                  : <SetupProfile onProfileComplete={setProfile} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                (profile && profile.firstName)
                  ? <Dashboard user={user} profile={profile} onSignOut={handleSignOut} onProfileUpdate={refreshProfile} />
                  : <Navigate to="/setup-profile" replace />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/matches" 
            element={
              user ? (
                <MatchesList user={user} profile={profile} onSignOut={handleSignOut} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/find-matches" 
            element={
              user ? (
                <FindMatches user={user} profile={profile} onSignOut={handleSignOut} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/profile" 
            element={
              user ? (
                <Profile user={user} profile={profile} onSignOut={handleSignOut} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              user ? (
                <Leaderboard user={user} profile={profile} onSignOut={handleSignOut} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/notes" 
            element={
              user ? (
                <Notes user={user} profile={profile} onSignOut={handleSignOut} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/messages" 
            element={
              user ? (
                <Messages user={user} profile={profile} onSignOut={handleSignOut} onProfileUpdate={refreshProfile} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/learning-tools" 
            element={
              user ? (
                <LearningTools user={user} profile={profile} onSignOut={handleSignOut} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/plans" 
            element={
              user ? (
                <Plans user={user} profile={profile} onSignOut={handleSignOut} onProfileUpdate={refreshProfile} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/subscription" 
            element={
              user ? (
                <Subscription />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/quiz-demo" 
            element={
              user ? (
                <QuizAndNotesDemo />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
