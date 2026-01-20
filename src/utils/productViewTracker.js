/**
 * Product View Tracker Utility
 * 
 * Tracks recently viewed products for AI personalization
 * Stores in localStorage for persistence across sessions
 */

const MAX_RECENT_PRODUCTS = 10; // Keep last 10 viewed products
const STORAGE_KEY = 'recentlyViewed';

/**
 * Add a product to recently viewed list
 * @param {Object} product - Product object with id, name, price
 */
export const trackProductView = (product) => {
  try {
    // Get existing list
    const recent = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Remove if already exists (to update position)
    const filtered = recent.filter(p => p.id !== product.id);
    
    // Add to front of list
    const updated = [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        viewedAt: new Date().toISOString()
      },
      ...filtered
    ].slice(0, MAX_RECENT_PRODUCTS); // Keep only last N items
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    console.log('👁️ Product view tracked:', product.name);
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};

/**
 * Get recently viewed products
 * @returns {Array} List of recently viewed products
 */
export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
};

/**
 * Clear recently viewed products
 */
export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Recently viewed cleared');
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};

/**
 * Check if product was recently viewed
 * @param {string} productId - Product ID
 * @returns {boolean} True if product was viewed recently
 */
export const wasRecentlyViewed = (productId) => {
  try {
    const recent = getRecentlyViewed();
    return recent.some(p => p.id === productId);
  } catch (error) {
    return false;
  }
};
