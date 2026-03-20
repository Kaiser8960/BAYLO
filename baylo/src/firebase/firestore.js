import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';

export async function getUserProfile(userId) {
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    // Return null on error (permission denied, network error, etc.)
    return null;
  }
}

export async function saveProfile(userId, profile) {
  try {
    const ref = doc(db, 'users', userId);
    
    // Get existing profile to preserve important fields
    const existingProfile = await getUserProfile(userId);
    
    const data = {
      firstName: profile.firstName?.trim() || '',
      lastName: profile.lastName?.trim() || '',
      age: Number(profile.age) || null,
      country: profile.country || '',
      skillsKnow: Array.isArray(profile.skillsKnow) ? profile.skillsKnow : [],
      skillsLearn: Array.isArray(profile.skillsLearn) ? profile.skillsLearn : [],
      // Premium features
      gallery: Array.isArray(profile.gallery) ? profile.gallery : [],
      certificates: Array.isArray(profile.certificates) ? profile.certificates : [],
      // Preserve existing values for these fields, but allow override from profile parameter
      xp: profile.xp !== undefined ? profile.xp : (existingProfile?.xp || 0),
      tokens: profile.tokens !== undefined ? profile.tokens : (existingProfile?.tokens || 0),
      plan: profile.plan || existingProfile?.plan || 'Free Trial',
      level: profile.level || existingProfile?.level || 'Novice',
      createdAt: existingProfile?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(ref, data, { merge: true });
    return data;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error; // Re-throw so calling code can handle it
  }
}

/**
 * Update user subscription plan and allocate tokens based on the plan
 * @param {string} userId - User ID
 * @param {string} planName - Name of the plan ('Free Trial', 'Bai Plus', 'Bai Premium')
 * @returns {Promise<Object>} Updated profile data
 */
export async function updateSubscriptionPlan(userId, planName) {
  try {
    const ref = doc(db, 'users', userId);
    const existingProfile = await getUserProfile(userId) || {};
    
    // Define token allocation for each plan
    const tokenAllocation = {
      'Free Trial': 10,
      'Bai Plus': 150,
      'Bai Premium': 250
    };
    
    // Get tokens to allocate
    const tokensToAllocate = tokenAllocation[planName] || 0;
    
    // If switching plans, allocate new tokens
    // If staying on same plan, keep existing tokens
    const newTokens = existingProfile?.plan !== planName 
      ? tokensToAllocate 
      : (existingProfile?.tokens || 0);
    
    // If switching to Free Trial, enforce skill limits
    let skillsKnow = existingProfile?.skillsKnow || [];
    let skillsLearn = existingProfile?.skillsLearn || [];
    
    if (planName === 'Free Trial') {
      // Limit to 2 skills max for Free Trial
      if (skillsKnow.length > 2) {
        skillsKnow = skillsKnow.slice(0, 2);
      }
      if (skillsLearn.length > 2) {
        skillsLearn = skillsLearn.slice(0, 2);
      }
    }
    
    // Build update data - ensure all required fields are present
    const data = {
      ...existingProfile,
      plan: planName,
      tokens: newTokens,
      skillsKnow,
      skillsLearn,
      updatedAt: serverTimestamp(),
      // Preserve other important fields
      firstName: existingProfile?.firstName || '',
      lastName: existingProfile?.lastName || '',
      age: existingProfile?.age || null,
      country: existingProfile?.country || '',
      xp: existingProfile?.xp || 0,
      level: existingProfile?.level || 'Novice',
      createdAt: existingProfile?.createdAt || serverTimestamp(),
    };
    
    // Use setDoc without merge to ensure complete replacement
    await setDoc(ref, data);
    
    // Return the updated profile
    return data;
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw error;
  }
}

/**
 * Calculate session cost based on mentor rating and user plan
 * Higher ratings = higher cost
 * Tiered pricing: Free Trial (0.5x), Bai Plus (1.0x), Bai Premium (1.5x)
 * @param {number} mentorRating - Mentor's average rating (1-5)
 * @param {string} userPlan - User's subscription plan
 * @returns {number} Token cost for the session
 */
export function calculateSessionCost(mentorRating, userPlan) {
  // Base cost: 5 tokens
  // Rating multiplier: 1.0x for 1 star, up to 2.0x for 5 stars
  const baseCost = 5;
  const ratingMultiplier = 1 + (mentorRating - 1) * 0.25; // 1.0 to 2.0
  
  // Plan multiplier
  let planMultiplier = 1.0;
  if (userPlan === 'Free Trial') {
    planMultiplier = 0.5;
  } else if (userPlan === 'Bai Premium') {
    planMultiplier = 1.5;
  }
  // Bai Plus defaults to 1.0
  
  const totalCost = baseCost * ratingMultiplier * planMultiplier;
  return Math.ceil(totalCost);
}

/**
 * Deduct tokens from user's account
 * @param {string} userId - User ID
 * @param {number} amount - Amount of tokens to deduct
 * @returns {Promise<Object>} Updated profile with new token balance
 */
export async function deductTokens(userId, amount) {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }
    
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      throw new Error(`Invalid token amount: ${amount}. Amount must be a positive number.`);
    }
    
    console.log('[deductTokens] Starting token deduction:', { userId, amount });
    
    const ref = doc(db, 'users', userId);
    const existingProfile = await getUserProfile(userId);
    
    if (!existingProfile) {
      console.error('[deductTokens] Profile not found for user:', userId);
      throw new Error('User profile not found. Please ensure you are logged in and your profile exists.');
    }
    
    // Validate tokens field
    const currentTokens = existingProfile.tokens;
    if (typeof currentTokens !== 'number') {
      console.error('[deductTokens] Invalid tokens value:', currentTokens);
      throw new Error('Profile tokens data is invalid. Please refresh your profile and try again.');
    }
    
    if (currentTokens < 0) {
      console.warn('[deductTokens] Negative tokens detected, resetting to 0');
      // Reset to 0 if negative (shouldn't happen, but handle gracefully)
    }
    
    console.log('[deductTokens] Current token balance:', currentTokens);
    
    if (currentTokens < amount) {
      console.warn('[deductTokens] Insufficient tokens:', { currentTokens, amount });
      throw new Error(`Insufficient tokens. You have ${currentTokens} tokens but need ${amount}.`);
    }
    
    const newTokens = currentTokens - amount;
    console.log('[deductTokens] New token balance will be:', newTokens);
    
    // Update profile with new token balance
    const updatedData = {
      ...existingProfile,
      tokens: newTokens,
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(ref, updatedData, { merge: true });
    
    console.log('[deductTokens] Tokens deducted successfully');
    
    // Return updated profile with new token balance
    const updatedProfile = { ...existingProfile, tokens: newTokens };
    
    // Validate the returned profile
    if (typeof updatedProfile.tokens !== 'number') {
      throw new Error('Failed to update tokens. Please try again.');
    }
    
    return updatedProfile;
  } catch (error) {
    console.error('[deductTokens] Error deducting tokens:', error);
    console.error('[deductTokens] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId,
      amount
    });
    
    // Re-throw with more context if it's not already a descriptive error
    if (error.message && (
      error.message.includes('profile not found') ||
      error.message.includes('Insufficient tokens') ||
      error.message.includes('Invalid')
    )) {
      throw error; // Already has a good message
    }
    
    // Provide a generic error with context
    throw new Error(`Failed to deduct tokens: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Add tokens to user's account
 * @param {string} userId - User ID
 * @param {number} amount - Amount of tokens to add
 * @returns {Promise<Object>} Updated profile with new token balance
 */
export async function addTokens(userId, amount) {
  try {
    const ref = doc(db, 'users', userId);
    const existingProfile = await getUserProfile(userId);
    
    if (!existingProfile) {
      throw new Error('User profile not found');
    }
    
    const currentTokens = existingProfile.tokens || 0;
    const newTokens = currentTokens + amount;
    
    await setDoc(ref, {
      ...existingProfile,
      tokens: newTokens,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return { ...existingProfile, tokens: newTokens };
  } catch (error) {
    console.error('Error adding tokens:', error);
    throw error;
  }
}

/**
 * Save a rating and feedback for a mentor
 * @param {string} mentorId - Mentor's user ID
 * @param {string} learnerId - Learner's user ID
 * @param {number} rating - Rating (1-5)
 * @param {string} feedback - Optional feedback text
 * @param {number} sessionDuration - Session duration in seconds
 * @returns {Promise<void>}
 */
export async function saveRating(mentorId, learnerId, rating, feedback = '', sessionDuration = 0) {
  try {
    // Validate inputs
    if (!mentorId || !learnerId || !rating || rating < 1 || rating > 5) {
      throw new Error('Invalid rating data');
    }
    
    // Save rating to ratings collection with timeout
    const saveRatingPromise = addDoc(collection(db, 'ratings'), {
      mentorId,
      learnerId,
      rating,
      feedback: feedback || '',
      sessionDuration: sessionDuration || 0,
      createdAt: serverTimestamp(),
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Rating save timeout')), 10000) // 10 second timeout
    );
    
    await Promise.race([saveRatingPromise, timeoutPromise]);
    
    // Update mentor's average rating (non-blocking - don't fail if this fails)
    try {
      const mentorRef = doc(db, 'users', mentorId);
      const mentorProfile = await getUserProfile(mentorId);
      
      // Only update if mentor profile exists
      if (mentorProfile) {
        // Get all ratings for this mentor with timeout
        const ratingsQuery = query(collection(db, 'ratings'), where('mentorId', '==', mentorId));
        const getRatingsPromise = getDocs(ratingsQuery);
        const ratingsTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Ratings query timeout')), 8000) // 8 second timeout
        );
        
        const ratingsSnapshot = await Promise.race([getRatingsPromise, ratingsTimeoutPromise]);
        
        let totalRating = 0;
        let ratingCount = 0;
        
        ratingsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.rating) {
            totalRating += data.rating;
            ratingCount += 1;
          }
        });
        
        const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
        
        // Update average rating with timeout
        const updatePromise = setDoc(mentorRef, {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          updatedAt: serverTimestamp(),
        }, { merge: true });
        
        const updateTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Update timeout')), 8000) // 8 second timeout
        );
        
        await Promise.race([updatePromise, updateTimeoutPromise]);
      }
    } catch (updateError) {
      // Log but don't throw - rating was saved successfully, average update is optional
      console.warn('Could not update mentor average rating (non-critical):', updateError);
    }
    
  } catch (error) {
    console.error('Error saving rating:', error);
    throw error;
  }
}

/**
 * Calculate tokens earned after a session
 * @param {string} plan - User's subscription plan
 * @param {number} sessionDuration - Session duration in seconds
 * @returns {number} Tokens earned
 */
export function calculateTokensEarned(plan, sessionDuration) {
  // Only Bai Plus and Bai Premium earn tokens
  if (plan === 'Free Trial') {
    return 0;
  }
  
  // Base tokens: 5 tokens per session
  // Bonus: +2 tokens if session is longer than 30 minutes
  const baseTokens = 5;
  const minutes = sessionDuration / 60;
  const bonusTokens = minutes > 30 ? 2 : 0;
  
  return baseTokens + bonusTokens;
}

/**
 * Calculate XP earned after a session (scales with subscription)
 * @param {string} plan - User's subscription plan
 * @param {number} sessionDuration - Session duration in seconds
 * @returns {number} XP earned
 */
export function calculateXPEarned(plan, sessionDuration) {
  const minutes = sessionDuration / 60;
  
  // Base XP scales with subscription tier
  let baseXP = 0;
  let multiplier = 1;
  
  switch (plan) {
    case 'Bai Premium':
      baseXP = 15; // Highest base XP
      multiplier = 1.5; // 50% bonus
      break;
    case 'Bai Plus':
      baseXP = 10; // Medium base XP
      multiplier = 1.2; // 20% bonus
      break;
    case 'Free Trial':
    default:
      baseXP = 5; // Lowest base XP
      multiplier = 1.0; // No bonus
      break;
  }
  
  // Bonus XP for longer sessions (scales with plan)
  let bonusXP = 0;
  if (minutes > 30) {
    bonusXP = plan === 'Bai Premium' ? 10 : plan === 'Bai Plus' ? 5 : 2;
  }
  
  const totalXP = Math.round((baseXP + bonusXP) * multiplier);
  return totalXP;
}

/**
 * Add XP to user's account
 * @param {string} userId - User ID
 * @param {number} amount - Amount of XP to add
 * @returns {Promise<Object>} Updated profile with new XP
 */
export async function addXP(userId, amount) {
  try {
    const ref = doc(db, 'users', userId);
    const existingProfile = await getUserProfile(userId);
    
    if (!existingProfile) {
      throw new Error('User profile not found');
    }
    
    const currentXP = existingProfile.xp || 0;
    const newXP = currentXP + amount;
    
    await setDoc(ref, {
      ...existingProfile,
      xp: newXP,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return { ...existingProfile, xp: newXP };
  } catch (error) {
    console.error('Error adding XP:', error);
    throw error;
  }
}


