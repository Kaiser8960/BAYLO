import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import VideoCall from '../components/VideoCall';
import { generateMessages, createSessionRequestConversation } from '../utils/messagesData';
import { calculateSessionCost, deductTokens } from '../firebase/firestore';
import { useToast } from '../components/Toast';
import { isLeaderboardRanked } from '../utils/leaderboardUtils';

const Messages = ({ user, profile: initialProfile, onSignOut, onProfileUpdate }) => {
  const { showSuccess, showError, showWarning, ToastContainer } = useToast();
  const [profile, setProfile] = useState(initialProfile);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('All');
  const [newMessage, setNewMessage] = useState('');
  const [showConversationList, setShowConversationList] = useState(true); // For mobile: show list by default
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [isStartingCall, setIsStartingCall] = useState(false);

  const skills = ['All', 'Cooking', 'Guitar', 'Drawing', 'Fitness', 'Baking'];

  const location = useLocation();

  useEffect(() => {
    // Handle session request from Dashboard
    if (location.state?.isSessionRequest && location.state?.matchData) {
      // Store leaderboard status from location state
      const isLeaderboard = location.state?.isLeaderboardRanked || location.state?.matchData?.isLeaderboardRanked;
      
      // Create the session request conversation first (this adds it to cache)
      const sessionConv = createSessionRequestConversation(location.state.matchData);
      // Get updated conversations list from cache (includes the new session request)
      const conversations = generateMessages(); // Will use cache if it has dynamic conversations
      setConversations(conversations);
      // Find the session conversation in the updated list
      const updatedSessionConv = conversations.find(c => 
        c.id === sessionConv.id || 
        (c.participant.name === sessionConv.participant.name && c.isSessionRequest)
      ) || sessionConv;
      
      // Store leaderboard status in the conversation for later use
      if (updatedSessionConv) {
        updatedSessionConv.isLeaderboardRanked = isLeaderboard;
      }
      
      setSelectedConversation(updatedSessionConv);
      setShowConversationList(false);
    } else {
      const conversations = generateMessages();
      setConversations(conversations);
      
      // Check if a conversation ID was passed from navigation
      const conversationId = location.state?.conversationId;
      if (conversationId) {
        const selected = conversations.find(c => c.id === conversationId);
        if (selected) {
          setSelectedConversation(selected);
          setShowConversationList(false);
        } else if (conversations.length > 0) {
          setSelectedConversation(conversations[0]);
          setShowConversationList(false);
        }
      } else {
        // On mobile, show list by default if no conversation selected
        // On desktop, show first conversation
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          setSelectedConversation(null);
          setShowConversationList(true);
        } else if (conversations.length > 0) {
          setSelectedConversation(conversations[0]);
          setShowConversationList(false);
        }
      }
    }
  }, [location.state]);

  // Update profile when initialProfile changes (e.g., after profile update)
  useEffect(() => {
    if (initialProfile) {
      console.log('[Messages] Profile updated from parent:', {
        xp: initialProfile.xp,
        tokens: initialProfile.tokens,
        plan: initialProfile.plan
      });
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSkill === 'All' || 
                         (filterSkill === 'Requests' && conv.isSessionRequest === true) ||
                         conv.participant.skill === filterSkill;
    return matchesSearch && matchesFilter;
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // In a real app, this would send to Firebase
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleStartVideoCall = async () => {
    console.log('[VideoCall] handleStartVideoCall called');
    
    // Prevent double-clicks
    if (isStartingCall) {
      console.log('[VideoCall] Already starting call, ignoring duplicate request');
      return;
    }
    
    // Validate user
    if (!user) {
      console.error('[VideoCall] No user found');
      showError('You must be logged in to start a video call.');
      return;
    }
    
    // Validate conversation
    if (!selectedConversation) {
      console.error('[VideoCall] No conversation selected');
      showError('Please select a conversation to start a video call.');
      return;
    }
    
    // Validate profile
    if (!profile) {
      console.error('[VideoCall] Profile not loaded');
      showError('Profile is still loading. Please wait a moment and try again.');
      return;
    }
    
    // Validate profile has required fields
    if (typeof profile.tokens !== 'number') {
      console.error('[VideoCall] Profile tokens is not a number:', profile.tokens);
      showError('Profile data is incomplete. Please refresh the page and try again.');
      return;
    }
    
    if (!profile.plan) {
      console.warn('[VideoCall] Profile plan not set, defaulting to Free Trial');
    }
    
    const participant = selectedConversation.participant;
    if (!participant) {
      console.error('[VideoCall] Participant data missing');
      showError('Participant information is missing. Please select a different conversation.');
      return;
    }
    
    const mentorRating = participant.rating || 4.0;
    const userPlan = profile.plan || 'Free Trial';
    const baseCost = calculateSessionCost(mentorRating, userPlan);
    
    // Check if this is a leaderboard-ranked match
    const isLeaderboard = selectedConversation?.isLeaderboardRanked || 
                         (participant && isLeaderboardRanked({ name: participant.name }));
    
    // Add 5 tokens if leaderboard-ranked and user is Bai Premium
    const leaderboardBonus = (isLeaderboard && userPlan === 'Bai Premium') ? 5 : 0;
    const cost = baseCost + leaderboardBonus;
    
    console.log('[VideoCall] Session details:', {
      mentorRating,
      userPlan,
      baseCost,
      isLeaderboard,
      leaderboardBonus,
      cost,
      userTokens: profile.tokens
    });
    
    // Check if user has enough tokens
    const userTokens = profile.tokens;
    if (userTokens < cost) {
      console.warn('[VideoCall] Insufficient tokens:', { userTokens, cost });
      const tokensNeeded = cost - userTokens;
      const warningMessage = `⚠️ Insufficient Tokens!\n\nYou need ${cost} tokens but only have ${userTokens}.\nYou need ${tokensNeeded} more token${tokensNeeded !== 1 ? 's' : ''} to start this session.\n\nPlease recharge your tokens to continue.`;
      console.log('[VideoCall] Showing warning notification:', warningMessage);
      showWarning(warningMessage, 8000); // Show for 8 seconds
      return;
    }
    
    setIsStartingCall(true);
    
    try {
      console.log('[VideoCall] Attempting to deduct tokens...');
      // Deduct tokens before starting session
      const updatedProfile = await deductTokens(user.uid, cost);
      
      console.log('[VideoCall] Tokens deducted successfully:', {
        oldTokens: profile.tokens,
        newTokens: updatedProfile.tokens
      });
      
      // Validate updated profile
      if (!updatedProfile || typeof updatedProfile.tokens !== 'number') {
        throw new Error('Invalid profile data received after token deduction');
      }
      
      // Update local profile
      setProfile(updatedProfile);
      
      // Refresh global profile
      if (onProfileUpdate) {
        console.log('[VideoCall] Calling onProfileUpdate callback');
        onProfileUpdate();
      }
      
      // Start the video call - ensure participant has all required fields
      const participantData = {
        name: participant.name || 'Unknown',
        avatar: participant.avatar || '',
        skill: participant.skill || 'General',
        country: participant.country || '',
        isOnline: participant.isOnline !== undefined ? participant.isOnline : true,
        id: participant.id || selectedConversation.id,
        rating: participant.rating || 4.0
      };
      
      console.log('[VideoCall] Setting participant data:', participantData);
      setSelectedParticipant(participantData);
      
      console.log('[VideoCall] Activating video call');
      setIsVideoCallActive(true);
      
      showSuccess(`Session started! ${cost} tokens deducted.`);
    } catch (error) {
      console.error('[VideoCall] Error starting session:', error);
      console.error('[VideoCall] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to start session. Please try again.';
      if (error.message) {
        if (error.message.includes('profile not found')) {
          errorMessage = 'Your profile could not be found. Please refresh the page and try again.';
        } else if (error.message.includes('Insufficient tokens')) {
          errorMessage = error.message;
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showError(errorMessage);
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
    setSelectedParticipant(null);
  };

  // On mobile, show conversation list or chat view
  const showListOnMobile = showConversationList && !selectedConversation;
  const showChatOnMobile = selectedConversation && !showConversationList;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      <ToastContainer />
      <Header user={user} profile={profile} onSignOut={onSignOut} />
      <div className="flex flex-1 overflow-hidden pb-16 lg:pb-0">
        <Sidebar />
        
        {/* Main Messages Container */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Conversations List (Desktop) / Full Screen (Mobile) */}
          <div className={`${showListOnMobile ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 bg-white border-r border-gray-200 flex-col`}>
            {/* Header */}
            <div className="p-3 md:p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-navy">Messages</h1>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Messenger"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-100 rounded-lg md:rounded-xl border-0 focus:bg-white focus:ring-2 focus:ring-navy focus:ring-opacity-20 outline-none text-sm md:text-base"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 border-b border-gray-200">
              <div className="flex space-x-2">
                <button className={`px-4 md:px-5 py-1.5 md:py-2 text-sm md:text-base rounded-full transition-colors font-medium ${
                  filterSkill === 'All' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                }`} onClick={() => setFilterSkill('All')}>
                  All
                </button>
                <button className={`px-4 md:px-5 py-1.5 md:py-2 text-sm md:text-base rounded-full transition-colors font-medium ${
                  filterSkill === 'Requests' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                }`} onClick={() => setFilterSkill('Requests')}>
                  Requests
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 md:p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setShowConversationList(false); // Hide list on mobile when conversation is selected
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={conversation.participant.avatar}
                        alt={conversation.participant.name}
                        className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover"
                      />
                      {conversation.participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.participant.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage.text}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className={`${showChatOnMobile ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 md:p-4 lg:p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      {/* Back button for mobile */}
                      <button 
                        onClick={() => {
                          setShowConversationList(true);
                          setSelectedConversation(null);
                        }}
                        className="md:hidden p-2 hover:bg-gray-200 rounded-full mr-1"
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="relative">
                        <img
                          src={selectedConversation.participant.avatar}
                          alt={selectedConversation.participant.name}
                          className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover"
                        />
                        {selectedConversation.participant.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">{selectedConversation.participant.name}</h2>
                        <p className="text-sm md:text-base text-gray-600">{selectedConversation.participant.skill} • {selectedConversation.participant.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleStartVideoCall}
                        disabled={isStartingCall}
                        className="p-2 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isStartingCall ? "Starting call..." : "Start video call"}
                      >
                        {isStartingCall ? (
                          <svg className="w-5 h-5 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        )}
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-full">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-5 space-y-3 md:space-y-4 bg-gray-50">
                  {selectedConversation.messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] md:max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-2xl px-4 md:px-5 py-2.5 md:py-3 ${
                          message.isOwn 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-900 shadow-sm'
                        }`}>
                          <p className="text-sm md:text-base">{message.text}</p>
                        </div>
                        <div className={`text-xs md:text-sm text-gray-500 mt-1.5 md:mt-2 ${
                          message.isOwn ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-3 md:p-4 lg:p-5 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <button className="p-2 md:p-2.5 hover:bg-gray-100 rounded-full">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="p-2 md:p-2.5 hover:bg-gray-100 rounded-full">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Aa"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="w-full px-4 md:px-5 py-2.5 md:py-3 bg-gray-100 rounded-full border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none text-sm md:text-base"
                      />
                    </div>
                    <button 
                      onClick={handleSendMessage}
                      className="p-2.5 md:p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Video Call Component */}
      {isVideoCallActive && selectedParticipant && (
        <VideoCall
          participant={selectedParticipant}
          user={user}
          profile={profile}
          onEndCall={handleEndVideoCall}
          onBackToMessages={handleEndVideoCall}
          onProfileUpdate={onProfileUpdate}
        />
      )}
    </div>
  );
};

export default Messages;