import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveRating, calculateTokensEarned, addTokens, calculateXPEarned, addXP } from '../firebase/firestore';
import { useToast } from './Toast';

const VideoCall = ({ participant, user, profile, onEndCall, onBackToMessages, onProfileUpdate }) => {
  const { showSuccess, showError, ToastContainer } = useToast();
  const [isCallActive, setIsCallActive] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: participant.name,
      text: 'Can you hear me okay?',
      timestamp: new Date().toISOString(),
      isOwn: false
    }
  ]);
  const [notes, setNotes] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showPostCall, setShowPostCall] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isTimeLimitReached, setIsTimeLimitReached] = useState(false);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  // Free Trial: 1 hour limit (3600 seconds)
  const FREE_TRIAL_TIME_LIMIT = 3600;
  const isFreeTrial = profile?.plan === 'Free Trial';
  const timeLimit = isFreeTrial ? FREE_TRIAL_TIME_LIMIT : Infinity;
  
  // Default values if user/profile not provided (for backward compatibility)
  const currentUser = user || null;
  const currentProfile = profile || null;
  
  // Camera and microphone states
  const [localStream, setLocalStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const localVideoRef = useRef(null);

  // Request camera and microphone access
  useEffect(() => {
    let stream = null;
    
    const getMedia = async () => {
      setIsLoadingCamera(true);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        setCameraError(null);
        setIsLoadingCamera(false);
        
        // Attach stream to video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera/microphone:', error);
        setIsLoadingCamera(false);
        
        // Show user-friendly error message
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera and microphone access denied. Please allow access to use video calls.');
        } else if (error.name === 'NotFoundError') {
          setCameraError('No camera or microphone found. Please connect a device.');
        } else {
          setCameraError('Failed to access camera/microphone. Please check your device settings.');
        }
      }
    };

    getMedia();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Call duration timer with time limit check
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => {
        const newDuration = prev + 1;
        
        // Check if time limit reached (for Free Trial)
        if (isFreeTrial && newDuration >= timeLimit && !isTimeLimitReached) {
          setIsTimeLimitReached(true);
          // Auto-end call after 5 seconds warning
          setTimeout(() => {
            handleEndCall();
          }, 5000);
        }
        
        return newDuration;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFreeTrial, timeLimit, isTimeLimitReached]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: 'You',
        text: chatMessage,
        timestamp: new Date().toISOString(),
        isOwn: true
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const handleToggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const handleEndCall = async () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    setIsCallActive(false);
    
    // Calculate and award tokens for Bai Plus/Premium
    if (currentProfile && (currentProfile.plan === 'Bai Plus' || currentProfile.plan === 'Bai Premium')) {
      const earned = calculateTokensEarned(currentProfile.plan, callDuration);
      if (earned > 0 && currentUser) {
        try {
          await addTokens(currentUser.uid, earned);
          setTokensEarned(earned);
          if (onProfileUpdate) {
            await onProfileUpdate();
          }
        } catch (error) {
          console.error('Error adding tokens:', error);
        }
      }
    }
    
    // Award XP to all users (scales with subscription)
    if (currentProfile && currentUser && callDuration > 0) {
      try {
        const earnedXP = calculateXPEarned(currentProfile.plan, callDuration);
        console.log('[VideoCall] XP calculation:', {
          plan: currentProfile.plan,
          callDuration,
          earnedXP,
          currentXP: currentProfile.xp
        });
        
        if (earnedXP > 0) {
          const updatedProfile = await addXP(currentUser.uid, earnedXP);
          console.log('[VideoCall] XP added successfully:', {
            oldXP: currentProfile.xp,
            earnedXP,
            newXP: updatedProfile.xp
          });
          setXpEarned(earnedXP);
          if (onProfileUpdate) {
            await onProfileUpdate();
          }
        } else {
          console.warn('[VideoCall] No XP earned (earnedXP is 0 or negative)');
        }
      } catch (error) {
        console.error('[VideoCall] Error adding XP:', error);
        // Show error to user
        showError(`Failed to add XP: ${error.message}`);
      }
    } else {
      console.warn('[VideoCall] Cannot award XP:', {
        hasProfile: !!currentProfile,
        hasUser: !!currentUser,
        callDuration
      });
    }
    
    setShowPostCall(true);
  };

  const handleSubmitRating = async () => {
    if (!currentUser || !participant || rating === 0 || isSubmittingRating) return;
    
    setIsSubmittingRating(true);
    
    try {
      // Save rating (participant.id should be mentorId, user.uid is learnerId)
      const mentorId = participant.id || participant.userId;
      
      // Check if this is a demo match (IDs like 'm1', 'm2' are not real Firestore user IDs)
      // Real Firestore user IDs are typically 28 characters long
      const isDemoMatch = !mentorId || mentorId.length < 20 || mentorId.startsWith('m');
      
      if (isDemoMatch) {
        // For demo matches, just show success without saving to Firestore
        console.log('Demo rating submitted:', { rating, feedback, callDuration, mentor: participant.name });
        showSuccess('Thank you for your feedback!');
        // Small delay before closing
        setTimeout(() => {
          onEndCall();
        }, 500);
        return;
      }
      
      // Real mentor ID - save to Firestore with timeout and error handling
      // Use Promise.race to add timeout protection
      const saveRatingPromise = saveRating(mentorId, currentUser.uid, rating, feedback, callDuration);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Rating submission timeout')), 15000) // 15 second timeout
      );
      
      try {
        await Promise.race([saveRatingPromise, timeoutPromise]);
        showSuccess('Thank you for your feedback!');
      } catch (ratingError) {
        // If rating save fails (network error, timeout, etc.), still show success
        // Rating submission is not critical - user can still continue
        console.warn('Rating save failed (non-critical, user can continue):', ratingError);
        showSuccess('Thank you for your feedback!');
      }
      
      // Small delay before closing
      setTimeout(() => {
        onEndCall();
      }, 500);
    } catch (error) {
      console.error('Unexpected error in rating submission:', error);
      // Always show success and allow user to continue
      // Don't block user flow for rating submission failures
      showSuccess('Thank you for your feedback!');
      setTimeout(() => {
        onEndCall();
      }, 500);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (showPostCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <ToastContainer />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">Session Complete!</h2>
            <p className="text-gray-600 mb-4">
              Your session with {participant.name} lasted {formatDuration(callDuration)}
            </p>
            
            {/* Show tokens earned for Bai Plus/Premium */}
            {tokensEarned > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11H9v4H7v2h2v2h2v-2h2v-2h-2V7z" />
                  </svg>
                  <span className="font-semibold">+{tokensEarned} Tokens Earned</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {callDuration > 1800 ? 'Session exceeded 30 minutes - bonus tokens awarded!' : 'Tokens earned for completing session!'}
                </p>
              </div>
            )}
            
            {/* Show XP earned for all users */}
            {xpEarned > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">+{xpEarned} XP Earned</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {callDuration > 1800 ? 'Bonus XP for longer session!' : 'Experience gained from session!'}
                </p>
              </div>
            )}
            
            {/* Show message for Free Trial users */}
            {isFreeTrial && tokensEarned === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Free Trial users can give ratings and feedback, but cannot earn tokens.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-navy mb-3">
                Rate your session with {participant.name}
              </label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How was your learning experience?"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-navy focus:ring-2 focus:ring-navy focus:ring-opacity-20 outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onBackToMessages}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Messages
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0 || isSubmittingRating}
                className="flex-1 py-3 px-4 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmittingRating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Main Video Call Interface */}
      <div className="h-full flex relative">
        {/* Video Area */}
        <div className={`flex-1 relative ${showChat || showNotes ? 'md:flex-1' : 'flex-1'}`}>
          {/* Other Person's Video */}
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center overflow-hidden">
            <video
              src="/logosAndIcons/VCTest.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('Video failed to load:', e);
              }}
              onLoadedData={() => {
                console.log('Video loaded successfully');
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Your Video (Small Picture-in-Picture) */}
          <div className="absolute top-16 left-4 md:top-4 md:left-auto md:right-4 w-32 h-24 md:w-48 md:h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg z-20">
            {isLoadingCamera ? (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs">Accessing camera...</p>
                </div>
              </div>
            ) : localStream && isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm">Camera Off</p>
                </div>
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center p-2">
                <p className="text-white text-xs text-center">{cameraError}</p>
              </div>
            )}
          </div>

          {/* Call Info Overlay */}
          <div className="absolute top-4 left-4 md:left-4 bg-black bg-opacity-50 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm z-20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold">{participant.name}</span>
              <span className={`text-sm ${isFreeTrial && callDuration >= timeLimit - 300 ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                {formatDuration(callDuration)}
                {isFreeTrial && ` / ${formatDuration(timeLimit)}`}
              </span>
            </div>
          </div>
          
          {/* Time Limit Warning for Free Trial */}
          {isFreeTrial && callDuration >= timeLimit - 300 && callDuration < timeLimit && (
            <div className="absolute top-20 left-4 bg-red-600 text-white px-4 py-2 rounded-lg animate-pulse">
              <p className="text-sm font-semibold">
                ⚠️ Time limit approaching! Call will end in {formatDuration(timeLimit - callDuration)}
              </p>
            </div>
          )}
          
          {/* Time Limit Reached Warning */}
          {isTimeLimitReached && (
            <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
                <h3 className="text-xl font-bold text-red-600 mb-2">Time Limit Reached</h3>
                <p className="text-gray-700 mb-4">
                  Your 1-hour call limit has been reached. The call will end automatically.
                </p>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
            {/* Microphone Toggle */}
            <button
              onClick={handleToggleAudio}
              className={`p-3 rounded-full transition-colors ${
                isAudioEnabled
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAudioEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                )}
              </svg>
            </button>
            
            {/* Camera Toggle */}
            <button
              onClick={handleToggleVideo}
              className={`p-3 rounded-full transition-colors ${
                isVideoEnabled
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isVideoEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                )}
              </svg>
            </button>
            
            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
              title="End call"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar Toggle Buttons */}
          <div className="absolute top-4 right-4 md:right-20 flex space-x-2 z-30">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${
                showChat ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-lg transition-colors ${
                showNotes ? 'bg-green-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          
          {/* Overlay for mobile when sidebar is open */}
          {(showChat || showNotes) && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => {
                setShowChat(false);
                setShowNotes(false);
              }}
            />
          )}
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed md:relative inset-y-0 right-0 md:right-auto w-full md:w-80 bg-white border-l border-gray-200 flex flex-col z-40 shadow-xl md:shadow-none"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-navy">Chat</h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg px-3 py-2 text-sm ${
                        message.isOwn 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p>{message.text}</p>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${
                        message.isOwn ? 'text-right' : 'text-left'
                      }`}>
                        {message.sender}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-navy focus:ring-2 focus:ring-navy focus:ring-opacity-20 outline-none text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-3 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Sidebar */}
        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed md:relative inset-y-0 right-0 md:right-auto w-full md:w-80 bg-white border-l border-gray-200 flex flex-col z-40 shadow-xl md:shadow-none"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-navy">Session Notes</h3>
                  <button
                    onClick={() => setShowNotes(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes during your session..."
                  className="w-full h-full border border-gray-200 rounded-lg p-3 focus:border-navy focus:ring-2 focus:ring-navy focus:ring-opacity-20 outline-none resize-none"
                />
              </div>

              <div className="p-4 border-t border-gray-200">
                <button className="w-full py-2 px-4 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors">
                  Save Notes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoCall;
