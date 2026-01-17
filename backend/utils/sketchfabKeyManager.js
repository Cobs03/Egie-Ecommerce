/**
 * Sketchfab API Key Manager
 * Rotates through multiple Sketchfab API tokens to avoid rate limits
 * Similar to Groq API key rotation system
 */

class SketchfabKeyManager {
  constructor() {
    // Load API tokens from environment variable (comma-separated)
    const keysString = process.env.SKETCHFAB_API_TOKENS || process.env.SKETCHFAB_API_TOKEN || '';
    this.apiKeys = keysString.split(',').map(key => key.trim()).filter(key => key.length > 0);
    
    if (this.apiKeys.length === 0) {
      console.warn('⚠️ WARNING: No Sketchfab API tokens configured!');
    } else {
      console.log(`✅ Loaded ${this.apiKeys.length} Sketchfab API token(s)`);
    }

    // Track current index for round-robin rotation
    this.currentIndex = 0;

    // Track rate-limited keys with their block expiry time
    this.blockedKeys = new Map();

    // Statistics tracking
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      rateLimitHits: 0,
      keyUsage: {}
    };

    // Initialize stats for each key
    this.apiKeys.forEach((key, index) => {
      const keyId = `Key ${index + 1}`;
      this.stats.keyUsage[keyId] = {
        requests: 0,
        rateLimits: 0,
        lastUsed: null
      };
    });
  }

  /**
   * Get the next available API key in rotation
   * Skips blocked keys and returns the next unblocked one
   */
  getNextApiKey() {
    if (this.apiKeys.length === 0) {
      throw new Error('No Sketchfab API tokens configured');
    }

    // If only one key, return it
    if (this.apiKeys.length === 1) {
      const keyId = 'Key 1';
      this.stats.keyUsage[keyId].requests++;
      this.stats.keyUsage[keyId].lastUsed = Date.now();
      return this.apiKeys[0];
    }

    // Clean up expired blocks
    this.cleanupExpiredBlocks();

    // Try to find an unblocked key
    let attempts = 0;
    while (attempts < this.apiKeys.length) {
      const key = this.apiKeys[this.currentIndex];
      const keyId = `Key ${this.currentIndex + 1}`;

      // Move to next index for next call
      this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
      attempts++;

      // Check if this key is blocked
      if (!this.blockedKeys.has(key)) {
        // Key is available, use it
        this.stats.keyUsage[keyId].requests++;
        this.stats.keyUsage[keyId].lastUsed = Date.now();
        return key;
      }
    }

    // All keys are blocked - use the one that was blocked longest ago
    console.warn('⚠️ All Sketchfab API keys are rate-limited! Using least recently blocked key.');
    
    let oldestBlockedKey = null;
    let oldestBlockTime = Infinity;

    this.blockedKeys.forEach((blockTime, key) => {
      if (blockTime < oldestBlockTime) {
        oldestBlockTime = blockTime;
        oldestBlockedKey = key;
      }
    });

    const keyIndex = this.apiKeys.indexOf(oldestBlockedKey);
    const keyId = `Key ${keyIndex + 1}`;
    this.stats.keyUsage[keyId].requests++;
    this.stats.keyUsage[keyId].lastUsed = Date.now();

    return oldestBlockedKey;
  }

  /**
   * Report that a key hit rate limit (429 error)
   * Block it for 60 seconds (Sketchfab's typical rate limit window)
   */
  reportRateLimit(apiKey) {
    const blockUntil = Date.now() + (60 * 1000); // 60 seconds
    this.blockedKeys.set(apiKey, blockUntil);
    
    this.stats.rateLimitHits++;
    const keyIndex = this.apiKeys.indexOf(apiKey);
    if (keyIndex !== -1) {
      const keyId = `Key ${keyIndex + 1}`;
      this.stats.keyUsage[keyId].rateLimits++;
      console.warn(`⏸️ Sketchfab ${keyId} rate limited. Blocked for 60s. Switching to next key...`);
    }

    // Log stats every 10 rate limit hits
    if (this.stats.rateLimitHits % 10 === 0) {
      this.logStats();
    }
  }

  /**
   * Report successful request (for statistics)
   */
  reportSuccess(apiKey) {
    this.stats.totalRequests++;
    this.stats.successfulRequests++;

    // Log stats every 50 successful requests
    if (this.stats.successfulRequests % 50 === 0) {
      this.logStats();
    }
  }

  /**
   * Clean up expired key blocks
   */
  cleanupExpiredBlocks() {
    const now = Date.now();
    const keysToUnblock = [];

    this.blockedKeys.forEach((blockUntil, key) => {
      if (now >= blockUntil) {
        keysToUnblock.push(key);
      }
    });

    keysToUnblock.forEach(key => {
      this.blockedKeys.delete(key);
      const keyIndex = this.apiKeys.indexOf(key);
      if (keyIndex !== -1) {
        console.log(`✅ Sketchfab Key ${keyIndex + 1} unblocked and available again`);
      }
    });
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.stats,
      blockedKeys: Array.from(this.blockedKeys.keys()).map(key => {
        const keyIndex = this.apiKeys.indexOf(key);
        return `Key ${keyIndex + 1}`;
      }),
      availableKeys: this.apiKeys.length - this.blockedKeys.size
    };
  }

  /**
   * Log statistics to console
   */
  logStats() {
    const stats = this.getStats();
    console.log('\n📊 [Sketchfab Key Manager] Statistics:');
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Successful: ${stats.successfulRequests}`);
    console.log(`   Rate Limits: ${stats.rateLimitHits}`);
    console.log(`   Available Keys: ${stats.availableKeys}/${this.apiKeys.length}`);
    console.log('\n   Per-Key Usage:');
    
    Object.entries(stats.keyUsage).forEach(([keyId, usage]) => {
      const lastUsedText = usage.lastUsed 
        ? `${Math.floor((Date.now() - usage.lastUsed) / 1000)}s ago`
        : 'never';
      console.log(`     ${keyId}: ${usage.requests} requests, ${usage.rateLimits} rate limits, last used ${lastUsedText}`);
    });
    console.log('');
  }
}

// Create singleton instance
const sketchfabKeyManager = new SketchfabKeyManager();

module.exports = {
  getNextApiKey: () => sketchfabKeyManager.getNextApiKey(),
  reportRateLimit: (key) => sketchfabKeyManager.reportRateLimit(key),
  reportSuccess: (key) => sketchfabKeyManager.reportSuccess(key),
  getStats: () => sketchfabKeyManager.getStats(),
  logStats: () => sketchfabKeyManager.logStats()
};
