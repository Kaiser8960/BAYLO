// Available skills for leaderboard categories
const SKILL_CATEGORIES = [
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

// Generate leaderboard data for a specific skill (same logic as Leaderboard.jsx)
const generateLeaderboardData = (skill) => {
  const names = [
    'Sarah Chen', 'Alex Rodriguez', 'Yuki Tanaka', 'Maria Santos', 'David Kim',
    'Emma Wilson', 'James Liu', 'Sophia Park', 'Michael Chen', 'Lisa Zhang',
    'Ryan O\'Connor', 'Priya Patel', 'Ahmed Hassan', 'Isabella Garcia', 'Oliver Smith'
  ];
  
  const countries = [
    'Singapore', 'Philippines', 'Japan', 'Philippines', 'South Korea',
    'Australia', 'China', 'South Korea', 'China', 'China',
    'Ireland', 'India', 'Egypt', 'Mexico', 'United Kingdom'
  ];

  return names.map((name, index) => ({
    id: index + 1,
    name,
    country: countries[index],
    skill,
    xp: Math.floor(Math.random() * 2000) + 500,
    level: Math.floor(Math.random() * 10) + 1,
    avatar: `https://i.pravatar.cc/60?img=${index + 1}`
  })).sort((a, b) => b.xp - a.xp).map((item, index) => ({
    ...item,
    rank: index + 1,
    badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : null
  }));
};

/**
 * Check if a match is ranked in the top 10 of any skill category leaderboard
 * @param {Object} match - Match object with name property
 * @returns {boolean} - True if match is in top 10 of any skill category
 */
export function isLeaderboardRanked(match) {
  if (!match || !match.name) return false;
  
  // Check each skill category
  for (const skill of SKILL_CATEGORIES) {
    const leaderboardData = generateLeaderboardData(skill);
    const top10 = leaderboardData.slice(0, 10);
    
    // Check if match name appears in top 10
    const isInTop10 = top10.some(person => person.name === match.name);
    if (isInTop10) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get the rank of a match in a specific skill category
 * @param {Object} match - Match object with name property
 * @param {string} skill - Skill category to check
 * @returns {number|null} - Rank number (1-10) or null if not in top 10
 */
export function getMatchRank(match, skill) {
  if (!match || !match.name) return null;
  
  const leaderboardData = generateLeaderboardData(skill);
  const top10 = leaderboardData.slice(0, 10);
  
  const person = top10.find(p => p.name === match.name);
  return person ? person.rank : null;
}

