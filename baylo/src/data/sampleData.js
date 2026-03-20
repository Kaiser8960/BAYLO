// Sample Firestore data structure

// Collection: quizzes/{quizId}
const sampleQuiz = {
  mentorId: "user123",
  skillId: "javascript",
  questions: [
    {
      text: "What is the difference between let and var in JavaScript?",
      type: "text",
      options: []
    },
    {
      text: "Which method is used to add an element to the end of an array?",
      type: "mcq",
      options: ["push()", "pop()", "shift()", "unshift()"]
    },
    {
      text: "Explain the concept of closures in JavaScript.",
      type: "text",
      options: []
    }
  ],
  createdAt: "2024-01-15T10:30:00Z",
  isActive: true
};

// Collection: sessions/{sessionId}
const sampleSession = {
  mentorId: "user123",
  learnerId: "user456",
  skillId: "javascript",
  status: "completed", // "scheduled", "in-progress", "completed", "cancelled"
  scheduledAt: "2024-01-15T14:00:00Z",
  startedAt: "2024-01-15T14:05:00Z",
  endedAt: "2024-01-15T15:00:00Z",
  duration: 55, // minutes
  notes: "Great session! Covered closures, async/await, and ES6 features. Student should practice with promises.",
  notesUpdatedAt: "2024-01-15T15:05:00Z",
  rating: 4.8,
  feedback: "Excellent explanation of complex concepts"
};

// Collection: quizAttempts/{attemptId}
const sampleQuizAttempt = {
  userId: "user456",
  quizId: "quiz123",
  answers: {
    0: "let has block scope while var has function scope",
    1: "push()",
    2: "Closures allow inner functions to access outer function variables even after the outer function returns"
  },
  score: 95,
  completedAt: "2024-01-15T16:30:00Z"
};

// Collection: users/{userId} (updated with XP)
const sampleUser = {
  name: "John Doe",
  email: "john@example.com",
  xp: 450,
  level: "Apprentice",
  tokens: 120,
  isPremium: false,
  skillsToTeach: [
    { skill: "JavaScript", icon: "⚡", level: "Expert" },
    { skill: "React", icon: "⚛️", level: "Advanced" }
  ],
  skillsToLearn: [
    { skill: "UI/UX Design", icon: "🎨", level: "Beginner" },
    { skill: "Python", icon: "🐍", level: "Intermediate" }
  ],
  recentActivity: [
    {
      type: "quiz_completed",
      description: "Completed JavaScript Quiz",
      xpEarned: 20,
      timestamp: "2024-01-15T16:30:00Z"
    },
    {
      type: "session_completed",
      description: "Teaching session with Sarah",
      xpEarned: 15,
      timestamp: "2024-01-15T15:00:00Z"
    }
  ],
  createdAt: "2024-01-01T00:00:00Z"
};

// Collection: skills/{skillId}
const sampleSkills = [
  {
    id: "javascript",
    name: "JavaScript",
    icon: "⚡",
    category: "Programming",
    description: "Modern JavaScript development"
  },
  {
    id: "react",
    name: "React",
    icon: "⚛️",
    category: "Frontend",
    description: "React library for building user interfaces"
  },
  {
    id: "ui-ux",
    name: "UI/UX Design",
    icon: "🎨",
    category: "Design",
    description: "User interface and user experience design"
  },
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    category: "Programming",
    description: "Python programming language"
  }
];

export { sampleQuiz, sampleSession, sampleQuizAttempt, sampleUser, sampleSkills };
