/**
 * API Key Manager - Rotates through multiple Groq API keys to avoid rate limits
 * 
 * Usage:
 * 1. Add multiple API keys to .env as VITE_GROQ_API_KEYS (comma-separated)
 * 2. Import getNextApiKey() instead of directly using import.meta.env.VITE_GROQ_API_KEY
 * 3. When a key hits rate limit, it's automatically blocked for 60 seconds
 */

class ApiKeyManager {
  constructor() {
    // Get all API keys from environment (comma-separated)
    const keysString = import.meta.env.VITE_GROQ_API_KEYS || import.meta.env.VITE_GROQ_API_KEY || '';
    this.apiKeys = keysString.split(',').map(key => key.trim()).filter(key => key.length > 0);
    
    // Track which keys are currently rate-limited
    this.blockedKeys = new Map(); // key -> unblock timestamp
    
    // Current key index for round-robin rotation
    this.currentIndex = 0;
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      rateLimitHits: 0,
      keyUsage: {},
    };
    
    // Initialize stats for each key
    this.apiKeys.forEach(key => {
      const keyId = this.getKeyId(key);
      this.stats.keyUsage[keyId] = {
        requests: 0,
        rateLimits: 0,
        lastUsed: null,
      };
    });
    
    console.log(`🔑 API Key Manager initialized with ${this.apiKeys.length} key(s)`);
  }
  
  /**
   * Get a short identifier for a key (last 6 characters)
   */
  getKeyId(key) {
    return key.slice(-6);
  }
  
  /**
   * Check if a key is currently rate-limited
   */
  isKeyBlocked(key) {
    const unblockTime = this.blockedKeys.get(key);
    if (!unblockTime) return false;
    
    // Check if block period has expired
    if (Date.now() >= unblockTime) {
      this.blockedKeys.delete(key);
      console.log(`✅ API key ...${this.getKeyId(key)} unblocked`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Mark a key as rate-limited for 60 seconds
   */
  blockKey(key, durationMs = 60000) {
    const unblockTime = Date.now() + durationMs;
    this.blockedKeys.set(key, unblockTime);
    
    const keyId = this.getKeyId(key);
    this.stats.rateLimitHits++;
    this.stats.keyUsage[keyId].rateLimits++;
    
    const remainingSeconds = Math.ceil(durationMs / 1000);
    console.warn(`⏳ API key ...${keyId} rate-limited for ${remainingSeconds}s`);
  }
  
  /**
   * Get the next available API key (round-robin, skipping blocked keys)
   */
  getNextApiKey() {
    this.stats.totalRequests++;
    
    // If only one key, return it (even if blocked)
    if (this.apiKeys.length === 1) {
      const key = this.apiKeys[0];
      const keyId = this.getKeyId(key);
      this.stats.keyUsage[keyId].requests++;
      this.stats.keyUsage[keyId].lastUsed = new Date().toISOString();
      return key;
    }
    
    // Try to find an available key (not blocked)
    let attempts = 0;
    while (attempts < this.apiKeys.length) {
      const key = this.apiKeys[this.currentIndex];
      
      // Move to next key for next request
      this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
      
      // Check if this key is available
      if (!this.isKeyBlocked(key)) {
        const keyId = this.getKeyId(key);
        this.stats.keyUsage[keyId].requests++;
        this.stats.keyUsage[keyId].lastUsed = new Date().toISOString();
        this.stats.successfulRequests++;
        
        console.log(`🔑 Using API key ...${keyId} (${attempts + 1}/${this.apiKeys.length})`);
        return key;
      }
      
      attempts++;
    }
    
    // All keys are blocked - return the one that will unblock soonest
    console.warn('⚠️ All API keys are rate-limited! Using least recently blocked...');
    const sortedKeys = [...this.blockedKeys.entries()]
      .sort((a, b) => a[1] - b[1]);
    
    if (sortedKeys.length > 0) {
      const [key, unblockTime] = sortedKeys[0];
      const waitSeconds = Math.ceil((unblockTime - Date.now()) / 1000);
      console.log(`⏳ Next key available in ${waitSeconds}s`);
      return key;
    }
    
    // Fallback to first key
    return this.apiKeys[0];
  }
  
  /**
   * Report that a request succeeded (for statistics)
   */
  reportSuccess(key) {
    const keyId = this.getKeyId(key);
    console.log(`✅ Request successful with key ...${keyId}`);
  }
  
  /**
   * Report that a request hit rate limit
   */
  reportRateLimit(key) {
    this.blockKey(key);
  }
  
  /**
   * Get current statistics
   */
  getStats() {
    const availableKeys = this.apiKeys.filter(key => !this.isKeyBlocked(key)).length;
    
    return {
      ...this.stats,
      totalKeys: this.apiKeys.length,
      availableKeys,
      blockedKeys: this.blockedKeys.size,
      blockDetails: Array.from(this.blockedKeys.entries()).map(([key, unblockTime]) => ({
        keyId: this.getKeyId(key),
        unblockIn: Math.ceil((unblockTime - Date.now()) / 1000) + 's',
      })),
    };
  }
  
  /**
   * Log statistics to console
   */
  logStats() {
    const stats = this.getStats();
    console.log('📊 API Key Manager Statistics:');
    console.table({
      'Total Keys': stats.totalKeys,
      'Available Keys': stats.availableKeys,
      'Blocked Keys': stats.blockedKeys,
      'Total Requests': stats.totalRequests,
      'Successful Requests': stats.successfulRequests,
      'Rate Limit Hits': stats.rateLimitHits,
    });
    
    if (stats.blockedKeys > 0) {
      console.log('⏳ Blocked Keys:');
      console.table(stats.blockDetails);
    }
    
    console.log('📈 Key Usage:');
    console.table(stats.keyUsage);
  }
}

// Create singleton instance
const apiKeyManager = new ApiKeyManager();

// Export functions
export const getNextApiKey = () => apiKeyManager.getNextApiKey();
export const reportSuccess = (key) => apiKeyManager.reportSuccess(key);
export const reportRateLimit = (key) => apiKeyManager.reportRateLimit(key);
export const getApiKeyStats = () => apiKeyManager.getStats();
export const logApiKeyStats = () => apiKeyManager.logStats();

export default apiKeyManager;
