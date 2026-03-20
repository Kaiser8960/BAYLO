// Shared utility for generating messages/conversations data
let conversationsCache = null;

export const generateMessages = () => {
  // Start with hardcoded conversations
  const hardcodedConversations = [
    {
      id: 1,
      participant: {
        name: 'Maria Santos',
        avatar: 'https://i.pravatar.cc/60?img=4',
        skill: 'Cooking',
        country: 'Philippines',
        isOnline: true
      },
      lastMessage: {
        text: 'Great session today! Don\'t forget to practice the knife techniques we discussed.',
        timestamp: '2024-01-15T11:30:00Z',
        sender: 'Maria Santos',
        isRead: false
      },
      messages: [
        {
          id: 1,
          sender: 'Maria Santos',
          text: 'Hi! Ready for our cooking session today?',
          timestamp: '2024-01-15T10:00:00Z',
          isOwn: false
        },
        {
          id: 2,
          sender: 'You',
          text: 'Yes! I\'m excited to learn more about knife techniques.',
          timestamp: '2024-01-15T10:02:00Z',
          isOwn: true
        },
        {
          id: 3,
          sender: 'Maria Santos',
          text: 'Perfect! We\'ll start with proper grip and then move to different cutting techniques.',
          timestamp: '2024-01-15T10:03:00Z',
          isOwn: false
        },
        {
          id: 4,
          sender: 'Maria Santos',
          text: 'Great session today! Don\'t forget to practice the knife techniques we discussed.',
          timestamp: '2024-01-15T11:30:00Z',
          isOwn: false
        }
      ],
      unreadCount: 1
    },
    {
      id: 2,
      participant: {
        name: 'David Kim',
        avatar: 'https://i.pravatar.cc/60?img=5',
        skill: 'Guitar',
        country: 'South Korea',
        isOnline: false
      },
      lastMessage: {
        text: 'The chord progression sounds much better now! Keep practicing.',
        timestamp: '2024-01-13T16:00:00Z',
        sender: 'David Kim',
        isRead: true
      },
      messages: [
        {
          id: 1,
          sender: 'David Kim',
          text: 'How\'s the guitar practice going?',
          timestamp: '2024-01-12T14:00:00Z',
          isOwn: false
        },
        {
          id: 2,
          sender: 'You',
          text: 'It\'s going well! I\'m still working on the chord transitions.',
          timestamp: '2024-01-12T14:05:00Z',
          isOwn: true
        },
        {
          id: 3,
          sender: 'David Kim',
          text: 'That\'s normal! Try practicing with a metronome at 60 BPM.',
          timestamp: '2024-01-12T14:07:00Z',
          isOwn: false
        },
        {
          id: 4,
          sender: 'You',
          text: 'Thanks for the tip! I\'ll try that.',
          timestamp: '2024-01-12T14:10:00Z',
          isOwn: true
        },
        {
          id: 5,
          sender: 'David Kim',
          text: 'The chord progression sounds much better now! Keep practicing.',
          timestamp: '2024-01-13T16:00:00Z',
          isOwn: false
        }
      ],
      unreadCount: 0
    },
    {
      id: 3,
      participant: {
        name: 'Sophia Park',
        avatar: 'https://i.pravatar.cc/60?img=8',
        skill: 'Drawing',
        country: 'South Korea',
        isOnline: true
      },
      lastMessage: {
        text: 'Your digital art is improving! The color theory concepts are really showing.',
        timestamp: '2024-01-11T15:30:00Z',
        sender: 'Sophia Park',
        isRead: true
      },
      messages: [
        {
          id: 1,
          sender: 'Sophia Park',
          text: 'I loved your latest digital painting! The composition is great.',
          timestamp: '2024-01-10T09:00:00Z',
          isOwn: false
        },
        {
          id: 2,
          sender: 'You',
          text: 'Thank you! I\'ve been practicing the techniques you taught me.',
          timestamp: '2024-01-10T09:05:00Z',
          isOwn: true
        },
        {
          id: 3,
          sender: 'Sophia Park',
          text: 'Your digital art is improving! The color theory concepts are really showing.',
          timestamp: '2024-01-11T15:30:00Z',
          isOwn: false
        }
      ],
      unreadCount: 0
    },
    {
      id: 4,
      participant: {
        name: 'Alex Rodriguez',
        avatar: 'https://i.pravatar.cc/60?img=2',
        skill: 'Fitness',
        country: 'Philippines',
        isOnline: false
      },
      lastMessage: {
        text: 'Remember to focus on form over speed. Quality reps are key!',
        timestamp: '2024-01-09T10:00:00Z',
        sender: 'Alex Rodriguez',
        isRead: true
      },
      messages: [
        {
          id: 1,
          sender: 'Alex Rodriguez',
          text: 'How are you feeling after yesterday\'s workout?',
          timestamp: '2024-01-08T08:00:00Z',
          isOwn: false
        },
        {
          id: 2,
          sender: 'You',
          text: 'A bit sore but good! I can feel the progress.',
          timestamp: '2024-01-08T08:15:00Z',
          isOwn: true
        },
        {
          id: 3,
          sender: 'Alex Rodriguez',
          text: 'That\'s great! Soreness means you\'re building strength.',
          timestamp: '2024-01-08T08:20:00Z',
          isOwn: false
        },
        {
          id: 4,
          sender: 'Alex Rodriguez',
          text: 'Remember to focus on form over speed. Quality reps are key!',
          timestamp: '2024-01-09T10:00:00Z',
          isOwn: false
        }
      ],
      unreadCount: 0
    },
    {
      id: 5,
      participant: {
        name: 'Emma Wilson',
        avatar: 'https://i.pravatar.cc/60?img=6',
        skill: 'Baking',
        country: 'Australia',
        isOnline: true
      },
      lastMessage: {
        text: 'The bread looks amazing! You\'ve mastered the kneading technique.',
        timestamp: '2024-01-05T12:00:00Z',
        sender: 'Emma Wilson',
        isRead: true
      },
      messages: [
        {
          id: 1,
          sender: 'Emma Wilson',
          text: 'Ready to bake some bread today?',
          timestamp: '2024-01-05T10:00:00Z',
          isOwn: false
        },
        {
          id: 2,
          sender: 'You',
          text: 'Yes! I\'ve been practicing the kneading technique.',
          timestamp: '2024-01-05T10:05:00Z',
          isOwn: true
        },
        {
          id: 3,
          sender: 'Emma Wilson',
          text: 'Perfect! Let\'s start with the dough preparation.',
          timestamp: '2024-01-05T10:10:00Z',
          isOwn: false
        },
        {
          id: 4,
          sender: 'Emma Wilson',
          text: 'The bread looks amazing! You\'ve mastered the kneading technique.',
          timestamp: '2024-01-05T12:00:00Z',
          isOwn: false
        }
      ],
      unreadCount: 0
    }
  ];

  // If cache exists, merge with hardcoded conversations (preserve dynamically added ones)
  let conversations;
  if (conversationsCache && conversationsCache.length > 0) {
    // Get hardcoded conversation IDs
    const hardcodedIds = new Set(hardcodedConversations.map(c => c.id));
    // Get dynamically added conversations (not in hardcoded list)
    const dynamicConversations = conversationsCache.filter(c => !hardcodedIds.has(c.id));
    // Merge: hardcoded + dynamic
    conversations = [...hardcodedConversations, ...dynamicConversations];
  } else {
    conversations = [...hardcodedConversations];
  }

  // Add isSessionRequest flag (default to false for existing conversations)
  conversations.forEach(conv => {
    if (!conv.hasOwnProperty('isSessionRequest')) {
      conv.isSessionRequest = false;
    }
  });

  const sorted = conversations.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  conversationsCache = sorted;
  return sorted;
};

// Helper function to find existing conversation by participant name or ID
export const findConversationByParticipant = (participantName, participantId = null) => {
  const conversations = conversationsCache || generateMessages();
  return conversations.find(conv => 
    conv.participant.name === participantName || 
    (participantId && conv.participant.id === participantId)
  );
};

// Create or update conversation for session request
export const createSessionRequestConversation = (matchData) => {
  // Ensure we have the latest conversations
  if (!conversationsCache) {
    generateMessages();
  }
  const conversations = [...conversationsCache];
  
  // Check if conversation already exists
  let existingConv = findConversationByParticipant(matchData.name, matchData.id);
  
  const now = new Date();
  const requestTimestamp = now.toISOString();
  const responseTimestamp = new Date(now.getTime() + 1000).toISOString(); // 1 second later
  
  // Create initial messages
  const requestMessages = [
    {
      id: Date.now(),
      sender: 'You',
      text: 'Hey, are you available?',
      timestamp: requestTimestamp,
      isOwn: true
    },
    {
      id: Date.now() + 1,
      sender: matchData.name,
      text: 'Yes, I\'m available',
      timestamp: responseTimestamp,
      isOwn: false
    }
  ];
  
  if (existingConv) {
    // Update existing conversation
    const convIndex = conversations.findIndex(c => c.id === existingConv.id);
    if (convIndex !== -1) {
      conversations[convIndex].messages = [...requestMessages, ...conversations[convIndex].messages];
      conversations[convIndex].isSessionRequest = true;
      conversations[convIndex].lastMessage = {
        text: 'Yes, I\'m available',
        timestamp: responseTimestamp,
        sender: matchData.name,
        isRead: false
      };
      conversations[convIndex].unreadCount = 1;
      conversationsCache = conversations;
      return conversations[convIndex];
    }
  }
  
  // Create new conversation
  const newConversation = {
    id: Date.now(),
    participant: {
      name: matchData.name,
      avatar: matchData.profileImage,
      skill: matchData.skillsKnow?.[0] || 'General',
      country: matchData.country,
      isOnline: true,
      id: matchData.id,
      rating: matchData.rating
    },
    lastMessage: {
      text: 'Yes, I\'m available',
      timestamp: responseTimestamp,
      sender: matchData.name,
      isRead: false
    },
    messages: requestMessages,
    unreadCount: 1,
    isSessionRequest: true
  };
  
  // Add to cache
  conversations.unshift(newConversation);
  conversationsCache = conversations;
  return newConversation;
};
