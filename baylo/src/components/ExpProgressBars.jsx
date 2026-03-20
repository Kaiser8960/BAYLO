import MentorIcon from '../assets/mentorsgraphite.svg';
import IntermediateIcon from '../assets/intermediategraphite.svg';
import NoviceIcon from '../assets/novicegraphite.svg';

const ExpProgressBars = ({ xp = 0, plan = 'Free Trial' }) => {
  // Tier definitions - cumulative tiered system
  // Novice: 0-250 XP, Intermediate: 0-500 XP, Mentor: 0-1000 XP
  const tiers = {
    novice: { max: 250, name: 'Novice', icon: NoviceIcon },
    intermediate: { max: 500, name: 'Intermediate', icon: IntermediateIcon },
    mentor: { max: 1000, name: 'Mentor', icon: MentorIcon }
  };

  // Determine which tiers are accessible based on subscription
  const getMaxAccessibleTier = () => {
    switch (plan) {
      case 'Bai Premium':
        return 'mentor';
      case 'Bai Plus':
        return 'intermediate';
      case 'Free Trial':
      default:
        return 'novice';
    }
  };

  // Determine which tier the user is currently on based on XP
  const getCurrentTier = () => {
    const maxAccessibleTier = getMaxAccessibleTier();
    
    // Check in order: Mentor -> Intermediate -> Novice
    // Once a tier is complete, move to the next one
    if (maxAccessibleTier === 'mentor' && xp >= 250 + 500) {
      // User has completed Novice (250) and Intermediate (500), now in Mentor tier (750+ XP)
      return 'mentor';
    } else if ((maxAccessibleTier === 'mentor' || maxAccessibleTier === 'intermediate') && xp >= 250) {
      // User has completed Novice (250), now in Intermediate tier (250+ XP)
      return 'intermediate';
    } else {
      // User is in Novice tier (0-249 XP)
      return 'novice';
    }
  };

  // Calculate progress for the current tier
  const calculateCurrentTierProgress = () => {
    const currentTierKey = getCurrentTier();
    const tier = tiers[currentTierKey];
    const maxAccessibleTier = getMaxAccessibleTier();
    
    let current = 0;
    let percentage = 0;

    if (currentTierKey === 'novice') {
      // Novice: 0-250 XP
      current = Math.min(xp, tier.max);
      percentage = (current / tier.max) * 100;
    } else if (currentTierKey === 'intermediate') {
      // Intermediate: 0-500 XP (starts after completing Novice at 250 XP)
      // XP in Intermediate = total XP - 250
      // For Bai Premium users, they can exceed 500 in Intermediate tier (up to 750 total)
      const intermediateXP = xp - 250;
      if (maxAccessibleTier === 'mentor') {
        // Bai Premium users can go up to 750 total XP in Intermediate (500 tier XP)
        current = Math.min(intermediateXP, tier.max);
      } else {
        // Bai Plus users capped at 500 total XP in Intermediate (250 tier XP)
        current = Math.min(intermediateXP, tier.max);
      }
      percentage = (current / tier.max) * 100;
    } else if (currentTierKey === 'mentor') {
      // Mentor: 0-1000 XP (starts after completing Intermediate at 750 XP total)
      // XP in Mentor = total XP - 750
      current = Math.min(xp - 750, tier.max);
      percentage = (current / tier.max) * 100;
    }

    const isLocked = currentTierKey === 'mentor' && maxAccessibleTier !== 'mentor' ||
                     currentTierKey === 'intermediate' && maxAccessibleTier === 'novice';

    return { 
      current, 
      max: tier.max, 
      percentage, 
      isLocked,
      tierKey: currentTierKey,
      tierName: tier.name,
      icon: tier.icon
    };
  };

  const progress = calculateCurrentTierProgress();
  const Icon = progress.icon;

  return (
    <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
      {/* Progress Bar Container - Allow overlap on mobile */}
      <div className="relative h-5 md:h-6 rounded-full overflow-hidden bg-white border border-gray-200 shadow-sm min-w-[120px] md:min-w-[200px] max-w-[200px] md:max-w-[300px] w-[120px] md:w-auto">
        {/* Gradient Fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress.percentage}%`,
            background: '#112250'
          }}
        />
        
        {/* Text Overlay - white text for visibility */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
          <span
            className="text-[10px] md:text-sm font-bold whitespace-nowrap"
            style={{ 
              color: '#ffffff',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8)'
            }}
          >
            {progress.current}/{progress.max}
          </span>
        </div>
      </div>

      {/* Icon - Smaller on mobile, allow slight overlap with progress bar */}
      <div className="flex-shrink-0 relative -ml-2 md:ml-0 z-30">
        {progress.tierKey === 'mentor' && !progress.isLocked ? (
          <div 
            className="w-12 h-12 md:w-24 md:h-24"
            style={{
              maskImage: `url(${Icon})`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: `url(${Icon})`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              backgroundColor: '#3255d1'
            }}
          />
        ) : (
          <img
            src={Icon}
            alt={progress.tierName}
            className={`w-12 h-12 md:w-24 md:h-24 ${
              progress.isLocked ? 'grayscale opacity-50' : ''
            }`}
          />
        )}
      </div>
    </div>
  );
};

export default ExpProgressBars;

