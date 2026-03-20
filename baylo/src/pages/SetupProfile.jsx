import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, saveProfile } from '../firebase/firestore';
import { useToast } from '../components/Toast';
import BayloLogo from '../components/BayloLogo';
import { getMaxSkills, getUpgradeMessage, formatSkillCount } from '../utils/skillLimits';

const ALL_SKILLS = [
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

const COUNTRIES = [
  'Philippines',
  'China', 
  'Taiwan',
  'Japan',
  'Singapore',
  'Thailand',
  'Vietnam',
  'Hong Kong'
];

const StepHeader = ({ step }) => (
  <div className="mb-8 text-center">
    <div className="text-sm text-gray-600 mb-2">Step {step} of 2</div>
    <h1 className="text-3xl font-bold text-navy mb-2">Setup your Baylo profile</h1>
    <p className="text-gray-600">
      {step === 1 ? 'Tell us about yourself' : 'What skills do you have or want to learn?'}
    </p>
  </div>
);

const MultiSelect = ({ label, value, setValue, maxSkills, currentPlan, onLimitReached }) => {
  const toggle = (skill) => {
    if (value.includes(skill)) {
      // Remove skill
      setValue((prev) => prev.filter(s => s !== skill));
    } else {
      // Add skill - check limit
      if (maxSkills !== Infinity && value.length >= maxSkills) {
        if (onLimitReached) {
          onLimitReached();
        }
        return;
      }
      setValue((prev) => [...prev, skill]);
    }
  };

  const isDisabled = maxSkills !== Infinity && value.length >= maxSkills;
  const upgradeMessage = getUpgradeMessage(currentPlan);

  return (
    <div>
      <label className="block text-lg font-semibold text-navy mb-4">
        {label} ({formatSkillCount(value.length, currentPlan)})
      </label>
      {isDisabled && upgradeMessage && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {upgradeMessage}
          </p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-auto p-4 border border-gray-200 rounded-xl bg-gray-50">
        {ALL_SKILLS.map((skill) => {
          const isSelected = value.includes(skill);
          const isDisabledButton = !isSelected && isDisabled;
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggle(skill)}
              disabled={isDisabledButton}
              className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
                isSelected
                  ? 'bg-navy text-white border-navy shadow-md'
                  : isDisabledButton
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300 hover:border-navy'
              }`}
            >
              {skill}
            </button>
          );
        })}
      </div>
      <div className="text-sm text-gray-600 mt-3 text-center">
        Selected: {value.length} skill{value.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

const AnimatedDropdown = ({ label, value, setValue, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setValue(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-navy mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`input-field w-full text-left flex items-center justify-between ${
          isOpen ? 'ring-2 ring-navy border-transparent' : ''
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <motion.svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-60 overflow-auto">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    value === option ? 'bg-navy text-white hover:bg-navy-light' : 'text-gray-900'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SetupProfile = ({ onProfileComplete = null }) => {
  const navigate = useNavigate();
  const { showSuccess, showError, ToastContainer } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [skillsKnow, setSkillsKnow] = useState([]);
  const [skillsLearn, setSkillsLearn] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    let safetyTimeout = null;
    
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        if (isMounted) {
          navigate('/');
        }
        return;
      }
      
      if (isMounted) {
        setUser(u);
      }
      
      // Safety timeout - always show form after 7 seconds max
      safetyTimeout = setTimeout(() => {
        if (isMounted) {
          console.warn('SetupProfile safety timeout reached, showing form');
          setLoading(false);
        }
      }, 7000);
      
      // If profile exists, go dashboard
      try {
        // Add timeout to prevent infinite loading
        const profilePromise = getUserProfile(u.uid);
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => resolve(null), 5000) // 5 second timeout
        );
        
        const profile = await Promise.race([profilePromise, timeoutPromise]);
        
        // Clear safety timeout if we got a response
        if (safetyTimeout) {
          clearTimeout(safetyTimeout);
          safetyTimeout = null;
        }
        
        if (isMounted) {
          if (profile && profile.firstName) {
            navigate('/dashboard');
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading profile in SetupProfile:', error);
        // Clear safety timeout on error
        if (safetyTimeout) {
          clearTimeout(safetyTimeout);
          safetyTimeout = null;
        }
        // Continue to show setup profile even if there's an error
        if (isMounted) {
          setLoading(false);
        }
      }
    });
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (safetyTimeout) clearTimeout(safetyTimeout);
      unsub();
    };
  }, [navigate]);

  const canProceedStep1 = firstName.trim() && lastName.trim() && age && country;
  const canFinish = skillsKnow.length > 0 || skillsLearn.length > 0;

  const handleSubmit = async () => {
    if (!user) return;
    if (!canFinish) return;
    setSaving(true);
    try {
      const newProfile = {
        firstName, 
        lastName, 
        age: parseInt(age), 
        country, 
        skillsKnow, 
        skillsLearn,
        xp: 0,
        tokens: 30,
        plan: "Free Trial"
      };
      await saveProfile(user.uid, newProfile);
      
      // Show welcome toast
      showSuccess(`Welcome to Baylo, ${firstName}! Your profile is ready.`);
      
      // Notify parent to update profile state
      if (onProfileComplete) onProfileComplete({ ...newProfile, uid: user.uid });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      showError('Failed to save profile. Please try again');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-2xl font-bold text-navy">
              <BayloLogo size="medium" className="mr-3" />
              Baylo
            </div>
            <div className="text-sm text-gray-600">
              Profile Setup
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                <StepHeader step={1} />
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">First Name</label>
                    <input 
                      className="input-field" 
                      value={firstName} 
                      onChange={(e)=>setFirstName(e.target.value)} 
                      placeholder="Juan" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">Last Name</label>
                    <input 
                      className="input-field" 
                      value={lastName} 
                      onChange={(e)=>setLastName(e.target.value)} 
                      placeholder="Dela Cruz" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">Age</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={age} 
                      onChange={(e)=>setAge(e.target.value)} 
                      placeholder="21" 
                    />
                  </div>
                  <div>
                    <AnimatedDropdown
                      label="Country"
                      value={country}
                      setValue={setCountry}
                      options={COUNTRIES}
                      placeholder="Select your country"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <button 
                    disabled={!canProceedStep1} 
                    onClick={()=>setStep(2)} 
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
                <StepHeader step={2} />
                <div className="space-y-6">
                  <MultiSelect 
                    label="Skills I Know" 
                    value={skillsKnow} 
                    setValue={setSkillsKnow}
                    maxSkills={getMaxSkills('Free Trial')}
                    currentPlan="Free Trial"
                    onLimitReached={() => showError('Free Trial plan allows maximum 2 skills. Upgrade to add more skills.')}
                  />
                  <MultiSelect 
                    label="Skills I Want to Learn" 
                    value={skillsLearn} 
                    setValue={setSkillsLearn}
                    maxSkills={getMaxSkills('Free Trial')}
                    currentPlan="Free Trial"
                    onLimitReached={() => showError('Free Trial plan allows maximum 2 skills. Upgrade to add more skills.')}
                  />
                </div>
                <div className="flex justify-between mt-8">
                  <button 
                    onClick={()=>setStep(1)} 
                    className="btn-secondary px-8 py-3"
                  >
                    Back
                  </button>
                  <button 
                    disabled={!canFinish || saving} 
                    onClick={handleSubmit} 
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
                  >
                    {saving ? 'Saving...' : 'Finish Setup'}
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

export default SetupProfile;


