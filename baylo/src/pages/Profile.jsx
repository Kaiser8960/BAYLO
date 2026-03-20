import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserProfile, saveProfile } from '../firebase/firestore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
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

const Profile = ({ user, profile: initialProfile, onSignOut }) => {
  const { showSuccess, showError, ToastContainer } = useToast();
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(!initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    country: '',
    skillsKnow: [],
    skillsLearn: [],
    gallery: [],
    certificates: []
  });
  const [saving, setSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  // Helper function to clean up skills - remove any skills not in ALL_SKILLS
  const cleanSkills = (skills) => {
    if (!Array.isArray(skills)) return [];
    return skills.filter(skill => ALL_SKILLS.includes(skill));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && !initialProfile) {
        try {
          const userProfile = await getUserProfile(user.uid);
          
          // Clean up any old/invalid skills
          const cleanedProfile = {
            ...userProfile,
            skillsKnow: cleanSkills(userProfile?.skillsKnow),
            skillsLearn: cleanSkills(userProfile?.skillsLearn)
          };
          
          // If skills were cleaned, save the cleaned profile
          if (cleanedProfile.skillsKnow.length !== (userProfile?.skillsKnow?.length || 0) ||
              cleanedProfile.skillsLearn.length !== (userProfile?.skillsLearn?.length || 0)) {
            await saveProfile(user.uid, cleanedProfile);
            console.log('Profile cleaned up - removed invalid skills');
          }
          
          setProfile(cleanedProfile);
          if (cleanedProfile) {
            setEditForm({
              firstName: cleanedProfile.firstName || '',
              lastName: cleanedProfile.lastName || '',
              age: cleanedProfile.age || '',
              country: cleanedProfile.country || '',
              skillsKnow: cleanedProfile.skillsKnow || [],
              skillsLearn: cleanedProfile.skillsLearn || [],
              gallery: cleanedProfile.gallery || [],
              certificates: cleanedProfile.certificates || []
            });
            setPreviewImages(cleanedProfile.gallery || []);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          showError('Failed to load profile data');
        }
      } else if (initialProfile) {
        // Use passed profile
        setProfile(initialProfile);
        setEditForm({
          firstName: initialProfile.firstName || '',
          lastName: initialProfile.lastName || '',
          age: initialProfile.age || '',
          country: initialProfile.country || '',
          skillsKnow: initialProfile.skillsKnow || [],
          skillsLearn: initialProfile.skillsLearn || [],
          gallery: initialProfile.gallery || [],
          certificates: initialProfile.certificates || []
        });
        setPreviewImages(initialProfile.gallery || []);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, initialProfile]);

  // Add a refresh function that can be called manually
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const userProfile = await getUserProfile(user.uid);
      
      // Clean up any old/invalid skills
      const cleanedProfile = {
        ...userProfile,
        skillsKnow: cleanSkills(userProfile?.skillsKnow),
        skillsLearn: cleanSkills(userProfile?.skillsLearn)
      };
      
      // If skills were cleaned, save the cleaned profile
      if (cleanedProfile.skillsKnow.length !== (userProfile?.skillsKnow?.length || 0) ||
          cleanedProfile.skillsLearn.length !== (userProfile?.skillsLearn?.length || 0)) {
        await saveProfile(user.uid, cleanedProfile);
        showSuccess('Profile cleaned up - removed invalid skills');
      }
      
      setProfile(cleanedProfile);
      if (cleanedProfile) {
        setEditForm({
          firstName: cleanedProfile.firstName || '',
          lastName: cleanedProfile.lastName || '',
          age: cleanedProfile.age || '',
          country: cleanedProfile.country || '',
          skillsKnow: cleanedProfile.skillsKnow || [],
          skillsLearn: cleanedProfile.skillsLearn || []
        });
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      showError('Failed to refresh profile data');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (profile) {
        setEditForm({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          age: profile.age || '',
          country: profile.country || '',
          skillsKnow: profile.skillsKnow || [],
          skillsLearn: profile.skillsLearn || [],
          gallery: profile.gallery || [],
          certificates: profile.certificates || []
        });
        setPreviewImages(profile.gallery || []);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Enforce skill limits based on plan
      const userPlan = profile?.plan || 'Free Trial';
      const maxSkillsKnow = getMaxSkills(userPlan);
      const maxSkillsLearn = getMaxSkills(userPlan);
      
      let skillsKnow = editForm.skillsKnow || [];
      let skillsLearn = editForm.skillsLearn || [];
      let hasError = false;
      
      // Limit skills based on plan
      if (maxSkillsKnow !== Infinity && skillsKnow.length > maxSkillsKnow) {
        skillsKnow = skillsKnow.slice(0, maxSkillsKnow);
        showError(`${userPlan} plan allows maximum ${maxSkillsKnow} skills to teach. Only the first ${maxSkillsKnow} were saved.`);
        hasError = true;
      }
      if (maxSkillsLearn !== Infinity && skillsLearn.length > maxSkillsLearn) {
        skillsLearn = skillsLearn.slice(0, maxSkillsLearn);
        showError(`${userPlan} plan allows maximum ${maxSkillsLearn} skills to learn. Only the first ${maxSkillsLearn} were saved.`);
        hasError = true;
      }
      
      const updatedProfile = {
        ...profile, // Keep existing profile data
        ...editForm, // Override with form data
        skillsKnow, // Use limited skills
        skillsLearn, // Use limited skills
        age: parseInt(editForm.age) || null,
        gallery: editForm.gallery || [],
        certificates: editForm.certificates || []
      };
      
      await saveProfile(user.uid, updatedProfile);
      
      // Fetch the updated profile from the database to ensure we have the latest data
      const freshProfile = await getUserProfile(user.uid);
      setProfile(freshProfile);
      
      // Update the edit form with the fresh data
      if (freshProfile) {
        setEditForm({
          firstName: freshProfile.firstName || '',
          lastName: freshProfile.lastName || '',
          age: freshProfile.age || '',
          country: freshProfile.country || '',
          skillsKnow: freshProfile.skillsKnow || [],
          skillsLearn: freshProfile.skillsLearn || [],
          gallery: freshProfile.gallery || [],
          certificates: freshProfile.certificates || []
        });
        setPreviewImages(freshProfile.gallery || []);
      }
      
      setIsEditing(false);
      if (!hasError) {
        showSuccess('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skill, type) => {
    const userPlan = profile?.plan || 'Free Trial';
    const maxSkills = getMaxSkills(userPlan);
    
    setEditForm(prev => {
      const currentSkills = prev[type] || [];
      
      // If removing a skill, allow it
      if (currentSkills.includes(skill)) {
        return {
          ...prev,
          [type]: currentSkills.filter(s => s !== skill)
        };
      }
      
      // If adding a skill, check limit
      if (maxSkills !== Infinity && currentSkills.length >= maxSkills) {
        const upgradeMessage = getUpgradeMessage(userPlan);
        if (upgradeMessage) {
          showError(upgradeMessage);
        } else {
          showError(`Maximum ${maxSkills} skills allowed for ${userPlan} plan.`);
        }
        return prev;
      }
      
      return {
        ...prev,
        [type]: [...currentSkills, skill]
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      <ToastContainer />
      <Header user={user} profile={profile} onSignOut={onSignOut} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Profile Header Section */}
            <div className="px-2 md:px-4 lg:px-8 mb-4 md:mb-6 lg:mb-8">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 p-3 md:p-4 lg:p-6 xl:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 lg:gap-6">
                    {/* Profile Image */}
                    <div className="relative">
                      <img 
                        src={profile?.profileImage || "https://i.pravatar.cc/100"} 
                        alt="Profile" 
                        className={`w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 rounded-xl md:rounded-2xl object-cover border-2 md:border-4 border-white shadow-lg ${
                          profile?.plan === 'Bai Premium' 
                            ? 'ring-2 md:ring-4 ring-yellow-400 ring-opacity-50' 
                            : ''
                        }`}
                      />
                      {profile?.plan === 'Bai Premium' && (
                        <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-yellow-400 rounded-full p-1 md:p-2">
                          <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Profile Info */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 lg:gap-4 mb-2 md:mb-3 lg:mb-4">
                        <div>
                          <h1 className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold text-navy mb-1">
                            {profile.firstName} {profile.lastName}
                          </h1>
                          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm lg:text-base text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {profile.country || 'Not specified'}
                            </span>
                            {profile.age && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Age {profile.age}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={refreshProfile}
                            className="px-2 md:px-3 lg:px-4 py-1.5 md:py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-xs md:text-sm lg:text-base"
                            title="Refresh profile data"
                          >
                            <svg className="w-3 h-3 md:w-4 md:h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                          </button>
                          {!isEditing && (
                            <button
                              onClick={handleEdit}
                              className="px-2 md:px-3 lg:px-4 py-1.5 md:py-2 bg-[#112250] text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm lg:text-base"
                            >
                              Edit Profile
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 border border-blue-200">
                          <div className="text-[10px] md:text-xs lg:text-sm text-blue-600 font-medium mb-0.5 md:mb-1">Level</div>
                          <div className="text-sm md:text-lg lg:text-2xl font-bold text-blue-900">
                            {(() => {
                              const xp = profile?.xp || 0;
                              const plan = profile?.plan || 'Free Trial';
                              const getMaxAccessibleTier = () => {
                                switch (plan) {
                                  case 'Bai Premium': return 'mentor';
                                  case 'Bai Plus': return 'intermediate';
                                  default: return 'novice';
                                }
                              };
                              const getCurrentTier = () => {
                                const maxAccessibleTier = getMaxAccessibleTier();
                                if (maxAccessibleTier === 'mentor' && xp >= 750) return 'Mentor';
                                if ((maxAccessibleTier === 'mentor' || maxAccessibleTier === 'intermediate') && xp >= 250) return 'Intermediate';
                                return 'Novice';
                              };
                              return getCurrentTier();
                            })()}
                          </div>
                        </div>
                        {/* Circular Progress Bar - Replaces XP Card */}
                        {(() => {
                          // Calculate tier and progress (same logic as ExpProgressBars)
                          const xp = profile?.xp || 0;
                          const plan = profile?.plan || 'Free Trial';
                          
                          const tiers = {
                            novice: { max: 250, name: 'Novice' },
                            intermediate: { max: 500, name: 'Intermediate' },
                            mentor: { max: 1000, name: 'Mentor' }
                          };

                          const getMaxAccessibleTier = () => {
                            switch (plan) {
                              case 'Bai Premium': return 'mentor';
                              case 'Bai Plus': return 'intermediate';
                              default: return 'novice';
                            }
                          };

                          const getCurrentTier = () => {
                            const maxAccessibleTier = getMaxAccessibleTier();
                            if (maxAccessibleTier === 'mentor' && xp >= 750) return 'mentor';
                            if ((maxAccessibleTier === 'mentor' || maxAccessibleTier === 'intermediate') && xp >= 250) return 'intermediate';
                            return 'novice';
                          };

                          const currentTierKey = getCurrentTier();
                          const tier = tiers[currentTierKey];
                          
                          // Use calculated tier name for level display
                          const displayLevel = tier.name;
                          
                          let current = 0;
                          let percentage = 0;

                          if (currentTierKey === 'novice') {
                            current = Math.min(xp, tier.max);
                            percentage = (current / tier.max) * 100;
                          } else if (currentTierKey === 'intermediate') {
                            // Intermediate: 0-500 XP (starts after completing Novice at 250 XP)
                            // XP in Intermediate = total XP - 250
                            const intermediateXP = xp - 250;
                            const maxAccessibleTier = getMaxAccessibleTier();
                            if (maxAccessibleTier === 'mentor') {
                              // Bai Premium users can go up to 750 total XP in Intermediate (500 tier XP)
                              current = Math.min(intermediateXP, tier.max);
                            } else {
                              // Bai Plus users capped at 500 total XP in Intermediate (250 tier XP)
                              current = Math.min(intermediateXP, tier.max);
                            }
                            percentage = (current / tier.max) * 100;
                          } else if (currentTierKey === 'mentor') {
                            current = Math.min(xp - 750, tier.max);
                            percentage = (current / tier.max) * 100;
                          }

                          return (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5 }}
                              className="bg-white rounded-xl p-2 md:p-3 border border-gray-200 flex flex-col"
                            >
                              <div className="text-xs md:text-sm font-semibold text-navy mb-2 w-full text-left">Experience</div>
                              <div className="flex-1 flex items-center">
                                {/* Horizontal Progress Bar */}
                                <div className="w-full relative h-6 md:h-7 rounded-full overflow-hidden bg-white border border-gray-200 shadow-sm">
                                  {/* Gradient Fill */}
                                  <motion.div
                                    className="absolute left-0 top-0 h-full rounded-full"
                                    style={{
                                      background: 'linear-gradient(to right, #112250, #2952c3)'
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                                  />
                                  
                                  {/* Text Overlay - white text with shadow like header progress bar */}
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
                                    <span
                                      className="text-[10px] md:text-sm font-bold whitespace-nowrap"
                                      style={{ 
                                        color: '#ffffff',
                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8)'
                                      }}
                                    >
                                      {current}/{tier.max}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })()}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 border border-green-200">
                          <div className="text-[10px] md:text-xs lg:text-sm text-green-600 font-medium mb-0.5 md:mb-1">Tokens</div>
                          <div className="text-sm md:text-lg lg:text-2xl font-bold text-green-900">{profile.tokens || 0}</div>
                        </div>
                        <div className={`rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 border ${
                          profile.plan === 'Free Trial' 
                            ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                            : profile.plan === 'Bai Plus'
                            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                            : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                        }`}>
                          <div className={`text-[10px] md:text-xs lg:text-sm font-medium mb-0.5 md:mb-1 ${
                            profile.plan === 'Free Trial' 
                              ? 'text-gray-600'
                              : profile.plan === 'Bai Plus'
                              ? 'text-blue-600'
                              : 'text-yellow-600'
                          }`}>Plan</div>
                          <div className={`text-sm md:text-lg lg:text-2xl font-bold ${
                            profile.plan === 'Free Trial' 
                              ? 'text-gray-900'
                              : profile.plan === 'Bai Plus'
                              ? 'text-blue-900'
                              : 'text-yellow-900'
                          }`}>{profile.plan || 'Free Trial'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Content Section */}
            <div className="px-2 md:px-4 lg:px-8">
              {/* Skills Section */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border p-2 md:p-3 lg:p-4 mb-3 md:mb-4">
                <h2 className="text-sm md:text-base lg:text-lg font-semibold text-navy mb-2 md:mb-3 lg:mb-4 flex items-center gap-1.5 md:gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#112250]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills
                </h2>
              
              {isEditing ? (
                <div className="space-y-6">
                  {/* Skills I Know */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                      Skills I Know ({formatSkillCount(editForm.skillsKnow.length, profile?.plan || 'Free Trial')})
                    </label>
                    {(() => {
                      const userPlan = profile?.plan || 'Free Trial';
                      const maxSkills = getMaxSkills(userPlan);
                      const upgradeMessage = getUpgradeMessage(userPlan);
                      const isAtLimit = maxSkills !== Infinity && editForm.skillsKnow.length >= maxSkills;
                      return isAtLimit && upgradeMessage ? (
                        <div className="mb-1.5 md:mb-2 p-1.5 md:p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-[10px] md:text-xs text-yellow-800">
                            {upgradeMessage}
                          </p>
                        </div>
                      ) : null;
                    })()}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2 max-h-40 md:max-h-48 overflow-auto p-2 md:p-3 border rounded-lg bg-gray-50">
                      {ALL_SKILLS.map((skill) => {
                        const userPlan = profile?.plan || 'Free Trial';
                        const maxSkills = getMaxSkills(userPlan);
                        const isSelected = editForm.skillsKnow.includes(skill);
                        const isDisabled = !isSelected && maxSkills !== Infinity && editForm.skillsKnow.length >= maxSkills;
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill, 'skillsKnow')}
                            disabled={isDisabled}
                            className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm border transition-colors ${
                              isSelected
                                ? 'bg-navy text-cream border-navy'
                                : isDisabled
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills I Want to Learn */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                      Skills I Want to Learn ({formatSkillCount(editForm.skillsLearn.length, profile?.plan || 'Free Trial')})
                    </label>
                    {(() => {
                      const userPlan = profile?.plan || 'Free Trial';
                      const maxSkills = getMaxSkills(userPlan);
                      const upgradeMessage = getUpgradeMessage(userPlan);
                      const isAtLimit = maxSkills !== Infinity && editForm.skillsLearn.length >= maxSkills;
                      return isAtLimit && upgradeMessage ? (
                        <div className="mb-1.5 md:mb-2 p-1.5 md:p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-[10px] md:text-xs text-yellow-800">
                            {upgradeMessage}
                          </p>
                        </div>
                      ) : null;
                    })()}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2 max-h-40 md:max-h-48 overflow-auto p-2 md:p-3 border rounded-lg bg-gray-50">
                      {ALL_SKILLS.map((skill) => {
                        const userPlan = profile?.plan || 'Free Trial';
                        const maxSkills = getMaxSkills(userPlan);
                        const isSelected = editForm.skillsLearn.includes(skill);
                        const isDisabled = !isSelected && maxSkills !== Infinity && editForm.skillsLearn.length >= maxSkills;
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill, 'skillsLearn')}
                            disabled={isDisabled}
                            className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm border transition-colors ${
                              isSelected
                                ? 'bg-navy text-cream border-navy'
                                : isDisabled
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Edit Form Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Premium Customization Section - Only for Bai Premium */}
                  {profile?.plan === 'Bai Premium' && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-navy mb-4 flex items-center">
                        <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Premium Customization
                      </h3>

                      {/* Photo Gallery */}
                      <div className="mb-4 md:mb-6">
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          Profile Gallery / Additional Photos
                        </label>
                        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-2 md:mb-3">
                          {previewImages.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img.url || img}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newGallery = editForm.gallery.filter((_, i) => i !== idx);
                                  setEditForm(prev => ({ ...prev, gallery: newGallery }));
                                  setPreviewImages(newGallery);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {previewImages.length < 6 && (
                            <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-24 cursor-pointer hover:border-navy transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const newImage = {
                                        url: event.target.result,
                                        name: file.name,
                                        size: file.size
                                      };
                                      const newGallery = [...editForm.gallery, newImage];
                                      setEditForm(prev => ({ ...prev, gallery: newGallery }));
                                      setPreviewImages(newGallery);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </label>
                          )}
                        </div>
                        <p className="text-[10px] md:text-xs text-gray-500">Upload up to 6 photos to showcase your work or achievements</p>
                      </div>

                      {/* Certificates */}
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          Certificates & Achievements
                        </label>
                        <div className="space-y-3">
                          {editForm.certificates.map((cert, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="Certificate Title"
                                  value={cert.title || ''}
                                  onChange={(e) => {
                                    const newCerts = [...editForm.certificates];
                                    newCerts[idx] = { ...newCerts[idx], title: e.target.value };
                                    setEditForm(prev => ({ ...prev, certificates: newCerts }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent mb-2"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Issuer"
                                    value={cert.issuer || ''}
                                    onChange={(e) => {
                                      const newCerts = [...editForm.certificates];
                                      newCerts[idx] = { ...newCerts[idx], issuer: e.target.value };
                                      setEditForm(prev => ({ ...prev, certificates: newCerts }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                                  />
                                  <input
                                    type="date"
                                    placeholder="Date"
                                    value={cert.date || ''}
                                    onChange={(e) => {
                                      const newCerts = [...editForm.certificates];
                                      newCerts[idx] = { ...newCerts[idx], date: e.target.value };
                                      setEditForm(prev => ({ ...prev, certificates: newCerts }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newCerts = editForm.certificates.filter((_, i) => i !== idx);
                                  setEditForm(prev => ({ ...prev, certificates: newCerts }));
                                }}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setEditForm(prev => ({
                                ...prev,
                                certificates: [...prev.certificates, { title: '', issuer: '', date: '' }]
                              }));
                            }}
                            className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-navy hover:text-navy transition-colors"
                          >
                            + Add Certificate
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 md:space-x-3">
                    <button
                      onClick={handleCancel}
                      className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-xs md:text-sm lg:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-navy text-cream rounded-lg font-medium hover:bg-navy-light transition-colors disabled:opacity-50 text-xs md:text-sm lg:text-base"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-lg md:rounded-xl p-3 md:p-4 lg:p-5 border border-green-200">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 lg:mb-4">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-sm md:text-base lg:text-lg font-semibold text-green-700">Can Teach</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {cleanSkills(profile.skillsKnow || []).map((skill) => (
                        <span key={skill} className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-green-100 text-green-700 text-xs md:text-sm font-medium border border-green-200">
                          {skill}
                        </span>
                      ))}
                      {cleanSkills(profile.skillsKnow || []).length === 0 && (
                        <span className="text-gray-500 text-xs md:text-sm italic">No skills added yet</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg md:rounded-xl p-3 md:p-4 lg:p-5 border border-blue-200">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 lg:mb-4">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="text-sm md:text-base lg:text-lg font-semibold text-blue-700">Wants to Learn</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {cleanSkills(profile.skillsLearn || []).map((skill) => (
                        <span key={skill} className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs md:text-sm font-medium border border-blue-200">
                          {skill}
                        </span>
                      ))}
                      {cleanSkills(profile.skillsLearn || []).length === 0 && (
                        <span className="text-gray-500 text-xs md:text-sm italic">No skills added yet</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Achievements Section - All Tiers */}
              {(() => {
                const getAchievements = () => {
                  const plan = profile?.plan || 'Free Trial';
                  const xp = profile?.xp || 0;
                  
                  if (plan === 'Free Trial') {
                    const achievements = [];
                    achievements.push({ name: 'Newcomer', icon: '🌟', description: 'Welcome to Baylo! Start your learning journey.', unlocked: true });
                    if (xp >= 100) {
                      achievements.push({ name: 'Rising Star', icon: '⭐', description: 'Reached 100 XP! You\'re on the rise.', unlocked: true });
                    } else {
                      achievements.push({ name: 'Rising Star', icon: '⭐', description: 'Reach 100 XP to unlock this achievement.', unlocked: false });
                    }
                    return achievements;
                  } else if (plan === 'Bai Plus') {
                    const achievements = [];
                    achievements.push({ name: 'Rising Prodigy', icon: '🚀', description: 'Completed Novice tier! Your potential shines.', unlocked: xp >= 250 });
                    achievements.push({ name: 'Excelsior', icon: '💎', description: 'Mastered Intermediate tier! Excellence achieved.', unlocked: xp >= 500 });
                    return achievements;
                  } else if (plan === 'Bai Premium') {
                    const achievements = [];
                    achievements.push({ name: 'Rising Prodigy', icon: '🚀', description: 'Completed Novice tier! Your potential shines.', unlocked: xp >= 250 });
                    achievements.push({ name: 'Excelsior', icon: '💎', description: 'Mastered Intermediate tier! Excellence achieved.', unlocked: xp >= 500 });
                    achievements.push({ name: 'Mentor Elite', icon: '👑', description: 'Achieved Mentor status! You\'re a true leader.', unlocked: xp >= 750 });
                    achievements.push({ name: 'Master Scholar', icon: '🏆', description: 'Reached 1000 XP! Mastery unlocked.', unlocked: xp >= 1000 });
                    return achievements;
                  }
                  return [];
                };

                const achievements = getAchievements();
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-xl md:rounded-2xl shadow-lg border p-3 md:p-4 lg:p-6 mb-3 md:mb-4 lg:mb-6"
                  >
                    <h2 className="text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-navy mb-2 md:mb-3 lg:mb-4 flex items-center gap-1.5 md:gap-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-[#112250]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Achievements
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-1.5 md:gap-2 lg:gap-3">
                      {achievements.map((achievement, idx) => (
                        <div key={idx} className={`flex items-start gap-1.5 md:gap-2 lg:gap-3 p-1.5 md:p-2 lg:p-3 rounded-lg border transition-shadow ${
                          achievement.unlocked
                            ? 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:shadow-md'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}>
                          <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center text-base md:text-lg lg:text-xl ${
                            achievement.unlocked
                              ? 'bg-gradient-to-br from-[#112250] to-[#2952c3]'
                              : 'bg-gray-300'
                          }`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold mb-0.5 text-xs md:text-sm lg:text-base ${
                              achievement.unlocked ? 'text-navy' : 'text-gray-500'
                            }`}>{achievement.name}</div>
                            <div className={`text-[10px] md:text-xs lg:text-sm ${
                              achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                            }`}>{achievement.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Certificates for Premium Users */}
              {profile?.plan === 'Bai Premium' && profile?.certificates && profile.certificates.length > 0 && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border p-3 md:p-4 lg:p-6 mb-3 md:mb-4 lg:mb-6">
                  <h2 className="text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-navy mb-2 md:mb-3 lg:mb-4 flex items-center gap-1.5 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#112250]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Certificates & Achievements
                  </h2>
                  <div className="space-y-2 md:space-y-3">
                    {profile.certificates.map((cert, idx) => (
                      <div key={idx} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#112250] to-[#2952c3] rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-navy mb-0.5 md:mb-1 text-xs md:text-sm lg:text-base">{cert.title || 'Untitled Certificate'}</div>
                          <div className="text-[10px] md:text-xs lg:text-sm text-gray-600">
                            {cert.issuer && <span>{cert.issuer}</span>}
                            {cert.issuer && cert.date && <span> · </span>}
                            {cert.date && <span>{new Date(cert.date).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Preview for Premium Users */}
              {profile?.plan === 'Bai Premium' && profile?.gallery && profile.gallery.length > 0 && (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border p-3 md:p-4 lg:p-6 mb-3 md:mb-4 lg:mb-6">
                  <h2 className="text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-navy mb-2 md:mb-3 lg:mb-4 flex items-center gap-1.5 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#112250]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Gallery
                  </h2>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2 lg:gap-3">
                    {profile.gallery.slice(0, 6).map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url || img}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-16 md:h-20 lg:h-24 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Profile;