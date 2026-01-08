/**
 * Sketchfab API Token Manager
 * Handles rotation of multiple Sketchfab API tokens to avoid rate limits
 * Similar to Groq API Key Manager but for Sketchfab
 */

class SketchfabTokenManager {
  constructor() {
    // Get tokens from environment variable (comma-separated)
    const tokensString = import.meta.env.VITE_SKETCHFAB_API_TOKENS || '';
    this.tokens = tokensString
      .split(',')
      .map(token => token.trim())
      .filter(token => token.length > 0);

    if (this.tokens.length === 0) {
      console.error('❌ No Sketchfab API tokens found in VITE_SKETCHFAB_API_TOKENS');
    }

    this.currentIndex = 0;
    this.blockedTokens = new Map(); // Map<token, unblockTime>
    this.tokenUsage = new Map(); // Map<token, usageCount>

    // Initialize usage counters
    this.tokens.forEach(token => {
      this.tokenUsage.set(token, 0);
    });

    console.log(`🔑 Sketchfab Token Manager initialized with ${this.tokens.length} token(s)`);
  }

  /**
   * Get the next available token
   * @returns {string} Next available Sketchfab API token
   */
  getNextToken() {
    if (this.tokens.length === 0) {
      throw new Error('No Sketchfab API tokens available');
    }

    // Clean up expired blocks
    const now = Date.now();
    for (const [token, unblockTime] of this.blockedTokens.entries()) {
      if (now >= unblockTime) {
        this.blockedTokens.delete(token);
        console.log('✅ Sketchfab token unblocked:', token.substring(0, 8) + '...');
      }
    }

    // Find next available token (not blocked)
    let attempts = 0;
    while (attempts < this.tokens.length) {
      const token = this.tokens[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.tokens.length;

      if (!this.blockedTokens.has(token)) {
        // Track usage
        const usage = this.tokenUsage.get(token) || 0;
        this.tokenUsage.set(token, usage + 1);
        
        return token;
      }

      attempts++;
    }

    // All tokens are blocked, return the one that will unblock soonest
    let soonestToken = this.tokens[0];
    let soonestTime = Infinity;
    
    for (const [token, unblockTime] of this.blockedTokens.entries()) {
      if (unblockTime < soonestTime) {
        soonestTime = unblockTime;
        soonestToken = token;
      }
    }

    console.warn('⚠️ All Sketchfab tokens blocked, using soonest available');
    return soonestToken;
  }

  /**
   * Block a token for a specified duration (when rate limited)
   * @param {string} token - Token to block
   * @param {number} durationMs - Duration in milliseconds (default: 60 seconds)
   */
  blockToken(token, durationMs = 60000) {
    const unblockTime = Date.now() + durationMs;
    this.blockedTokens.set(token, unblockTime);
    console.warn(
      `🚫 Sketchfab token blocked for ${durationMs / 1000}s:`,
      token.substring(0, 8) + '...'
    );
  }

  /**
   * Get statistics about token usage
   * @returns {Object} Usage statistics
   */
  getStats() {
    const stats = {
      totalTokens: this.tokens.length,
      blockedTokens: this.blockedTokens.size,
      availableTokens: this.tokens.length - this.blockedTokens.size,
      usage: {}
    };

    for (const [token, count] of this.tokenUsage.entries()) {
      const key = token.substring(0, 8) + '...';
      stats.usage[key] = count;
    }

    return stats;
  }

  /**
   * Check if any tokens are available
   * @returns {boolean}
   */
  hasAvailableTokens() {
    const now = Date.now();
    return this.tokens.some(token => {
      const unblockTime = this.blockedTokens.get(token);
      return !unblockTime || now >= unblockTime;
    });
  }
}

// Create singleton instance
const sketchfabTokenManager = new SketchfabTokenManager();

export default sketchfabTokenManager;
