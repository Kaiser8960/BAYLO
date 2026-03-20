import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleAuthSuccess = (user) => {
    onAuthSuccess(user);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <LoginForm 
                    onSwitchToRegister={handleSwitchToRegister}
                    onLoginSuccess={handleAuthSuccess}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <RegisterForm 
                    onSwitchToLogin={handleSwitchToLogin}
                    onRegisterSuccess={handleAuthSuccess}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-content"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5 }}
                  className="text-center lg:text-left"
                >
                  <div className="space-y-6">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-tight">
                      Start your journey now
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                      Join Baylo and connect with amazing people who can teach you new skills 
                      while you share your expertise with others.
                    </p>
                    <button
                      onClick={handleSwitchToRegister}
                      className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
                    >
                      Sign Up
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register-content"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5 }}
                  className="text-center lg:text-left"
                >
                  <div className="space-y-6">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-tight">
                      Hello Bai.
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                      If you already have an account, log in here and have fun.
                    </p>
                    <button
                      onClick={handleSwitchToLogin}
                      className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
                    >
                      Sign In
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
