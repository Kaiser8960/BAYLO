/**
 * Get the maximum number of skills allowed based on subscription plan
 * @param {string} plan - User's subscription plan ('Free Trial', 'Bai Plus', 'Bai Premium')
 * @returns {number} Maximum number of skills allowed (or Infinity for unlimited)
 */
export function getMaxSkills(plan) {
  switch (plan) {
    case 'Free Trial':
      return 2;
    case 'Bai Plus':
      return 5;
    case 'Bai Premium':
      return Infinity; // Unlimited
    default:
      return 2; // Default to Free Trial limit
  }
}

/**
 * Get upgrade message based on current plan
 * @param {string} plan - User's current subscription plan
 * @returns {string} Upgrade message or null if no upgrade available
 */
export function getUpgradeMessage(plan) {
  switch (plan) {
    case 'Free Trial':
      return 'Upgrade to Bai Plus to add up to 5 skills, or Bai Premium for unlimited skills';
    case 'Bai Plus':
      return 'Upgrade to Bai Premium for unlimited skills';
    case 'Bai Premium':
      return null; // No upgrade available
    default:
      return 'Upgrade to Bai Plus to add up to 5 skills, or Bai Premium for unlimited skills';
  }
}

/**
 * Format skill count display based on plan
 * @param {number} count - Current number of skills selected
 * @param {string} plan - User's subscription plan
 * @returns {string} Formatted display string (e.g., "2 / 2 max" or "5 skills")
 */
export function formatSkillCount(count, plan) {
  const maxSkills = getMaxSkills(plan);
  if (maxSkills === Infinity) {
    return `${count} skill${count !== 1 ? 's' : ''}`;
  }
  return `${count} / ${maxSkills} max`;
}

