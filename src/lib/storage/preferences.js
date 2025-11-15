/**
 * Preferences storage utility for persisting user settings
 * Uses localStorage with graceful fallbacks
 */

const STORAGE_KEY = 'modelSelector';

/**
 * Get all preferences from localStorage
 * @returns {Object} Preferences object
 */
function getPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return {};
  }
}

/**
 * Save preferences to localStorage
 * @param {Object} preferences - Preferences object to save
 * @returns {boolean} Success status
 */
function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Get accuracy threshold preference
 * @returns {number} Threshold value (0-95), default 0
 */
export function getAccuracyThreshold() {
  const prefs = getPreferences();
  const threshold = prefs.accuracyThreshold;

  // Validate and return
  if (typeof threshold === 'number' && threshold >= 0 && threshold <= 95) {
    return threshold;
  }

  return 0; // Default: show all models
}

/**
 * Save accuracy threshold preference
 * @param {number} threshold - Threshold value (0-95)
 * @returns {boolean} Success status
 */
export function saveAccuracyThreshold(threshold) {
  // Validate input
  if (typeof threshold !== 'number' || threshold < 0 || threshold > 95) {
    console.error('Invalid threshold value:', threshold);
    return false;
  }

  const prefs = getPreferences();
  prefs.accuracyThreshold = threshold;
  return savePreferences(prefs);
}

/**
 * Clear all preferences (useful for testing/reset)
 * @returns {boolean} Success status
 */
export function clearPreferences() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
    return false;
  }
}
