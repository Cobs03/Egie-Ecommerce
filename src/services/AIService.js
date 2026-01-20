import { supabase } from '../lib/supabase';
import ThirdPartyAuditService from './ThirdPartyAuditService';
import PrivacyUtils from '../utils/PrivacyUtils';

/**
 * AIService - AI Shopping Assistant Service
 *
 * 🧠 INTELLIGENT FEATURES (Enhanced with Database Intelligence):
 * 
 * 1. **Purchase History Analysis** 📊
 *    - Analyzes user's past purchases
 *    - Recommends compatible upgrades
 *    - Avoids suggesting already-owned items
 *    - Matches historical budget patterns
 * 
 * 2. **Product Review Integration** ⭐
 *    - Scores products based on customer ratings
 *    - Prioritizes highly-rated items (4+ stars)
 *    - Considers review count for reliability
 *    - Boosts recommendations for proven products
 * 
 * 3. **Real-time Stock Intelligence** 📦
 *    - Filters out-of-stock items automatically
 *    - Prioritizes in-stock products
 *    - Warns about limited stock (< 5 units)
 *    - Adjusts scoring based on availability
 * 
 * 4. **Trending Products Detection** 🔥
 *    - Identifies best sellers (last 30 days)
 *    - Recommends popular items first
 *    - Category-specific trending analysis
 *    - Sales count tracking
 * 
 * 5. **Active Promotions** 🎁
 *    - Auto-suggests applicable vouchers
 *    - Highlights products on sale
 *    - Shows discount percentages
 *    - Maximizes customer savings
 * 
 * 6. **PC Build Compatibility** 🖥️
 *    - Tracks user's existing components
 *    - Ensures component compatibility
 *    - Prevents redundant purchases
 *    - Smart upgrade suggestions
 * 
 * 7. **Browsing Context Awareness** 👁️
 *    - Remembers recently viewed products
 *    - Infers user interests and budget
 *    - Provides contextual recommendations
 *    - Improves response relevance
 * 
 * 8. **Smart Scoring Algorithm** 🎯
 *    - Base score: 100 points
 *    - Rating bonus: +10 per star (max 50)
 *    - Review count bonus: +0.5 per review (max 25)
 *    - In-stock bonus: +20 points
 *    - Out-of-stock penalty: -50 points
 *
 * 🛡️ FALLBACK & ERROR HANDLING STRATEGY:
 * 
 * **Graceful Degradation Philosophy:**
 * - AI assistant ALWAYS works, even if database features fail
 * - Each intelligence feature has independent fallbacks
 * - Partial data loading: If one feature fails, others still work
 * - Safe defaults: Empty arrays instead of crashes
 * 
 * **3-Tier Fallback System:**
 * 
 * Tier 1: Individual Feature Fallbacks
 * - getUserPurchaseHistory() → returns []
 * - getPopularProducts() → returns []
 * - getActivePromotions() → returns []
 * - getProductWithReviews() → returns { avgRating: 0, reviewCount: 0 }
 * - getUserPCComponents() → returns []
 * 
 * Tier 2: Partial Data Loading
 * - If purchase history fails, AI still gets popular products
 * - If reviews fail, AI still gets promotions
 * - Each data source loaded independently with .catch()
 * - Success/failure logged per feature
 * 
 * Tier 3: Complete Fallback
 * - If ALL user data fails → userData = null
 * - AI continues with just product catalog
 * - Basic recommendations still work
 * - No user personalization, but assistant functional
 * 
 * **Error Recovery Examples:**
 * 
 * Scenario 1: Database connection lost
 * ├─ Review enrichment fails
 * ├─ Fallback: Products scored without reviews (base score only)
 * └─ Result: AI still recommends products
 * 
 * Scenario 2: User table unavailable
 * ├─ Purchase history fails (returns [])
 * ├─ User components fails (returns [])
 * ├─ Popular products still works (different table)
 * └─ Result: AI gives trending recommendations
 * 
 * Scenario 3: Complete user data failure
 * ├─ All user intelligence features fail
 * ├─ userData remains null
 * ├─ System prompt built without user context
 * └─ Result: AI works like before enhancement (generic mode)
 *
 * **Monitoring & Logging:**
 * - ✅ Success: Feature loaded successfully
 * - ⊘ Skipped: Feature returned empty (normal)
 * - ⚠️ Warning: Feature failed with error
 * - 📊 Summary: Overall intelligence status logged
 *
 * Core Functions:
 * - chat() - Intelligent conversation with full context
 * - fetchProducts() - Get active products from database
 * - getUserPurchaseHistory() - Analyze user buying patterns
 * - getPopularProducts() - Find trending items
 * - getActivePromotions() - List current deals
 * - getUserPCComponents() - Track owned components
 * - buildIntelligentSystemPrompt() - Create context-aware prompts
 * - searchProductsByIntent() - Intent-based product matching
 */

class AIService {
  constructor() {
    // Load API keys from .env - supports multiple keys separated by commas
    const apiKeysString = import.meta.env.VITE_GROQ_API_KEYS || import.meta.env.VITE_GROQ_API_KEY || '';
    this.apiKeys = apiKeysString
      .split(',')
      .map(key => key.trim())
      .filter(key => key && key !== 'undefined'); // Remove empty or undefined keys
    
    this.currentKeyIndex = 0;
    this.apiKey = this.apiKeys[this.currentKeyIndex];
    this.apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama-3.3-70b-versatile'; // Latest Llama 3.3 model (Nov 2024)
    // Alternative models (all active as of Nov 2024):
    // 'llama-3.1-8b-instant' - Fastest
    // 'llama-3.2-90b-text-preview' - Most powerful
    // 'mixtral-8x7b-32768' - Good for long context
    // 'gemma2-9b-it' - Balanced performance
    
    console.log(`🔑 Groq API initialized with ${this.apiKeys.length} key(s)`);
  }
  
  /**
   * Rotate to the next API key when rate limit is hit
   * @returns {boolean} True if rotated to new key, false if all keys exhausted
   */
  rotateApiKey() {
    const nextIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    
    // If we've cycled through all keys, return false
    if (nextIndex === 0 && this.currentKeyIndex !== 0) {
      console.warn('⚠️ All Groq API keys exhausted');
      return false;
    }
    
    this.currentKeyIndex = nextIndex;
    this.apiKey = this.apiKeys[this.currentKeyIndex];
    console.log(`🔄 Rotated to API key #${this.currentKeyIndex + 1}`);
    return true;
  }
  
  /**
   * Reset key rotation (call this periodically or on success)
   */
  resetKeyRotation() {
    this.currentKeyIndex = 0;
    this.apiKey = this.apiKeys[0];
  }

  /**
   * Fetch all products from Supabase
   * @returns {Promise<Array>} Array of products
   */
  async fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands (
            id,
            name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get user's purchase history
   * @param {string} userId - User ID
   * @param {number} limit - Number of orders to fetch
   * @returns {Promise<Array>} Array of orders with products
   */
  async getUserPurchaseHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          order_items (
            id,
            quantity,
            price,
            product_id,
            products (
              id,
              name,
              price,
              categories (
                name,
                slug
              )
            )
          )
        `)
        .eq('user_id', userId)
        .in('status', ['completed', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching purchase history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserPurchaseHistory:', error);
      return [];
    }
  }

  /**
   * Get popular/trending products
   * @param {string} category - Category slug (optional)
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} Array of popular products with sales count
   */
  async getPopularProducts(category = null, limit = 10) {
    try {
      // Get orders from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            stock_quantity,
            categories (
              name,
              slug
            )
          ),
          orders!inner (
            created_at,
            status
          )
        `)
        .gte('orders.created_at', thirtyDaysAgo.toISOString())
        .in('orders.status', ['completed', 'delivered']);

      if (error) {
        console.error('Error fetching popular products:', error);
        return [];
      }

      // Aggregate sales by product
      const salesByProduct = {};
      orderItems?.forEach(item => {
        if (!item.products) return;
        
        const pid = item.product_id;
        if (!salesByProduct[pid]) {
          salesByProduct[pid] = {
            product: item.products,
            totalSold: 0
          };
        }
        salesByProduct[pid].totalSold += item.quantity;
      });

      // Filter by category if specified
      let popularList = Object.values(salesByProduct);
      if (category) {
        popularList = popularList.filter(item => 
          item.product.categories?.slug === category
        );
      }

      // Sort by total sold and return top items
      return popularList
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit)
        .map(item => ({
          ...item.product,
          salesCount: item.totalSold
        }));
    } catch (error) {
      console.error('Error in getPopularProducts:', error);
      return [];
    }
  }

  /**
   * Get active promotions and vouchers
   * @returns {Promise<Array>} Array of active vouchers
   */
  async getActivePromotions() {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('is_active', true)
        .gte('valid_to', new Date().toISOString())
        .order('discount_value', { ascending: false });

      if (error) {
        console.error('Error fetching promotions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActivePromotions:', error);
      return [];
    }
  }

  /**
   * Get product with review data
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product with review summary
   */
  async getProductWithReviews(productId) {
    try {
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error || !reviews || reviews.length === 0) {
        return { avgRating: 0, reviewCount: 0 };
      }

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      return {
        avgRating: parseFloat(avgRating.toFixed(2)),
        reviewCount: reviews.length
      };
    } catch (error) {
      return { avgRating: 0, reviewCount: 0 };
    }
  }

  /**
   * Get user's existing PC components from purchase history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of purchased components
   */
  async getUserPCComponents(userId) {
    try {
      const pcCategories = ['processor', 'motherboard', 'graphics-card', 'ram', 'ssd', 'hdd', 'power-supply', 'case'];
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          products (
            id,
            name,
            price,
            categories (
              name,
              slug
            )
          ),
          orders!inner (
            user_id,
            created_at,
            status
          )
        `)
        .eq('orders.user_id', userId)
        .in('orders.status', ['completed', 'delivered']);

      if (error || !data) return [];

      // Filter for PC components only
      return data
        .filter(item => {
          const categorySlug = item.products?.categories?.slug;
          return categorySlug && pcCategories.includes(categorySlug);
        })
        .map(item => item.products);
    } catch (error) {
      console.error('Error in getUserPCComponents:', error);
      return [];
    }
  }

  async fetchProductCategories() {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Fetch store information (FAQs, policies, contact info) from database
   * @param {string|null} category - Optional category filter ('shipping', 'returns', 'payment', etc.)
   * @returns {Promise<Array>} Array of store information
   */
  async fetchStoreInformation(category = null) {
    try {
      let query = supabase
        .from('store_information')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return [];
      }
      
      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Fetch website settings (dynamic store info)
   * @returns {Promise<Object>} Website settings with contact info, address, hours, etc.
   */
  async fetchWebsiteSettings() {
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (error) {
        return null;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Search store information based on user query
   * @param {string} userQuery - User's question or search term
   * @returns {Promise<Array>} Relevant store information
   */
  async searchStoreInfo(userQuery) {
    try {
      const storeInfo = await this.fetchStoreInformation();
      const websiteSettings = await this.fetchWebsiteSettings();
      const lowerQuery = userQuery.toLowerCase();
      
      // Find relevant FAQs based on keywords
      let relevant = storeInfo.filter(info => {
        const questionMatch = info.question.toLowerCase().includes(lowerQuery);
        const answerMatch = info.answer.toLowerCase().includes(lowerQuery);
        const keywordMatch = info.keywords?.some(kw => 
          lowerQuery.includes(kw.toLowerCase()) || kw.toLowerCase().includes(lowerQuery)
        );
        
        return questionMatch || answerMatch || keywordMatch;
      });
      
      // Replace placeholders with actual website settings
      if (websiteSettings) {
        relevant = relevant.map(info => ({
          ...info,
          answer: this.replaceDynamicPlaceholders(info.answer, websiteSettings)
        }));
      }
      
      // If we found matches, return them, otherwise return top 5 general FAQs
      return relevant.length > 0 ? relevant : storeInfo.slice(0, 5);
    } catch (error) {
      return [];
    }
  }

  /**
   * Replace dynamic placeholders in answers with actual website settings
   * @param {string} answer - The FAQ answer text
   * @param {Object} settings - Website settings object
   * @returns {string} Answer with replaced values
   */
  replaceDynamicPlaceholders(answer, settings) {
    if (!settings) return answer;
    
    // Replace common placeholders with actual data
    return answer
      .replace(/Block 21 Lot 23 Caypombo, Sta\. Maria, Bulacan/gi, settings.contact_address || 'our location')
      .replace(/\+639151855519/g, settings.contact_phone || 'our phone number')
      .replace(/egiegameshop2025@gmail\.com/g, settings.contact_email || 'our email')
      .replace(/Mon-Sunday: 8:00 AM - 5:00 PM/gi, settings.showroom_hours || 'our business hours')
      .replace(/8:00 AM to 5:00 PM/gi, settings.showroom_hours || 'our business hours');
  }

  /**
   * Detect if user is asking a store policy/FAQ question
   * @param {string} userMessage - User's message
   * @returns {boolean} True if it's likely a policy/FAQ question
   */
  isStoreInfoQuery(userMessage) {
    const lowerMsg = userMessage.toLowerCase();
    
    // Keywords that indicate store policy questions
    const storeInfoKeywords = [
      'return', 'refund', 'exchange', 'policy',
      'shipping', 'delivery', 'how long', 'when will',
      'payment', 'pay', 'gcash', 'cod', 'cash on delivery',
      'warranty', 'guarantee', 'defect', 'broke', 'broken', 'stopped working',
      'not working', 'malfunction', 'replace', 'replacement', 'repair',
      'store', 'location', 'address', 'where are you', 'visit',
      'contact', 'support', 'email', 'phone', 'hours', 'number',
      'open', 'close', 'operating', 'working hours',
      'track', 'order status', 'where is my order',
      'cancel', 'change order',
      'facebook', 'instagram', 'social media',
      'phone number', 'contact number', 'mobile', 'landline',
      'damaged', 'faulty', 'doa', 'dead on arrival'
    ];
    
    return storeInfoKeywords.some(keyword => lowerMsg.includes(keyword));
  }

  /**
   * Get customer order information (for order tracking)
   * @param {string} orderNumber - Order number to look up
   * @returns {Promise<Object>} Order data or error
   */
  async getCustomerOrder(orderNumber) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { 
          data: null, 
          error: 'Please sign in to view your orders' 
        };
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_addresses (
            recipient_name,
            phone_number,
            street_address,
            city,
            province
          ),
          order_items (
            quantity,
            price_at_purchase,
            products (
              name,
              image_url
            )
          )
        `)
        .eq('order_number', orderNumber)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        return { 
          data: null, 
          error: 'Order not found. Please check your order number.' 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.message 
      };
    }
  }

  /**
   * Format order status for customer in a friendly way
   * @param {Object} order - Order object from database
   * @returns {string} Formatted order status message
   */
  formatOrderStatus(order) {
    const statusMessages = {
      'pending': 'Your order is pending confirmation. We\'ll update you soon!',
      'confirmed': 'Order confirmed! We\'re preparing your items for shipment.',
      'processing': 'Your order is being packed and will ship soon.',
      'ready_for_pickup': 'Great news! Your order is ready for pickup at our store.',
      'shipped': 'Your order is on the way! Expected delivery in 3-7 days.',
      'delivered': 'Your order has been delivered. Hope you love it!',
      'cancelled': 'This order was cancelled.',
      'completed': 'Order completed. Thank you for shopping with us!'
    };
    
    const deliveryETA = {
      'pending': '1-2 business days to confirm',
      'confirmed': '1-3 business days to ship',
      'processing': '1-2 business days',
      'ready_for_pickup': 'Available now during store hours',
      'shipped': '3-7 business days',
      'delivered': 'Already delivered',
      'cancelled': 'N/A',
      'completed': 'Completed'
    };
    
    const paymentStatusMsg = {
      'pending': 'Payment Pending',
      'paid': 'Payment Confirmed ✓',
      'failed': 'Payment Failed - Please contact support',
      'refunded': 'Payment Refunded'
    };
    
    return `📦 **Order #${order.order_number}**

**Status:** ${statusMessages[order.status] || order.status}
**Expected:** ${deliveryETA[order.status]}
**Payment:** ${paymentStatusMsg[order.payment_status] || order.payment_status}
**Total:** ₱${order.total_amount.toLocaleString()}
**Delivery:** ${order.delivery_type === 'local_delivery' ? 'Home Delivery' : 'Store Pickup'}
**Order Date:** ${new Date(order.created_at).toLocaleDateString()}

${order.delivery_type === 'local_delivery' && order.shipping_addresses ? 
  `**Delivering to:** ${order.shipping_addresses.street_address}, ${order.shipping_addresses.city}` : 
  ''}

Need help with this order? Contact support at support@egiegameshop.com with your order number.`;
  }

  /**
   * AI-powered intent detection - understands natural language without hardcoded keywords
   * @param {string} userMessage - User's natural language query
   * @returns {Promise<Object>} Intent object with type, category, budget, etc.
   */
  async detectIntent(userMessage) {
    // Try simple pattern matching first to avoid API calls for basic queries
    const simpleIntent = this.trySimpleIntentDetection(userMessage);
    if (simpleIntent) {
      console.log('⚡ Fast intent detection (no API call):', simpleIntent);
      return simpleIntent;
    }
    
    // For complex queries, use AI
    try {
      const intentPrompt = `You are an intent detection AI for a computer hardware store. Analyze the user's message and extract their intent.

User message: "${userMessage}"

Respond with ONLY a JSON object (no markdown, no explanation) with these fields:
{
  "intentType": "product_search" | "comparison" | "recommendation" | "build_help" | "general_question" | "greeting",
  "category": "the main product category they're asking about (e.g., laptop, processor, gpu, ram, motherboard, ssd, mouse, keyboard, monitor, headset, etc.) - be specific and use singular form",
  "budget": {
    "min": number or null,
    "max": number or null,
    "type": "exact" | "range" | "under" | "around" | "above" | null
  },
  "brands": ["extracted brand names if mentioned"],
  "features": ["specific features or specs mentioned like 'rgb', 'wireless', '16gb', 'gaming', etc."],
  "keywords": ["important search terms extracted from the message"],
  "useCase": "gaming" | "work" | "school" | "general" | null,
  "confidence": 0.0 to 1.0
}

CRITICAL BUDGET EXTRACTION RULES (FOLLOW EXACTLY):
1. "around X" or "around X pesos" → Calculate ±10% range with BOTH min AND max
   - "around 30k" → {"min": 27000, "max": 33000, "type": "around"}
   - "around 40k" → {"min": 36000, "max": 44000, "type": "around"}
   - "around PHP 25000" → {"min": 22500, "max": 27500, "type": "around"}

2. "under X" or "below X" → Only max
   - "under 50k" → {"max": 50000, "type": "under"}
   - "below 20k" → {"max": 20000, "type": "under"}

3. "above X" or "over X" → Only min
   - "above 20k" → {"min": 20000, "type": "above"}
   - "over 15k" → {"min": 15000, "type": "above"}

4. "between X and Y" → Both min and max
   - "between 40k and 60k" → {"min": 40000, "max": 60000, "type": "range"}

5. Always multiply 'k' by 1000 (30k = 30000, 40k = 40000)

6. **IMPORTANT**: "affordable" or "budget" WITHOUT a specific number → Empty budget {} (let AI decide what's affordable based on actual prices)
   - This allows the system to show all products sorted by price, not apply arbitrary limits

Examples:
- "show me laptops" → {"intentType":"product_search","category":"laptop","budget":{},...}
- "affordable laptop" → {"intentType":"product_search","category":"laptop","budget":{},"features":["affordable"],...}
- "laptop around 40k" → {"intentType":"product_search","category":"laptop","budget":{"min":36000,"max":44000,"type":"around"},...}
- "affordable laptop around 30k" → {"intentType":"product_search","category":"laptop","budget":{"min":27000,"max":33000,"type":"around"},...}
- "gaming processor under 20k" → {"intentType":"product_search","category":"processor","budget":{"max":20000,"type":"under"},"useCase":"gaming",...}
- "compare rtx 3060 vs 4060" → {"intentType":"comparison","category":"gpu","keywords":["rtx 3060","4060"],...}

Be flexible with:
- Typos and broken English
- Alternative names (e.g., "mobo" = motherboard, "vid card" = gpu, "mem" = ram)
- Informal language (e.g., "something to type with" = keyboard)
- Related terms (e.g., "memory stick" could be ram or storage depending on context)
- Budget variations (30k, 30000, PHP 30k, around thirty thousand, etc.)`;;

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: intentPrompt }],
          temperature: 0.3, // Lower temp for more consistent parsing
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error('Intent detection failed');
      }

      const data = await response.json();
      const intentText = data.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      const cleanedIntent = intentText.replace(/```json\n?|```\n?/g, '').trim();
      
      try {
        const intent = JSON.parse(cleanedIntent);
        return intent;
      } catch (parseError) {
        // Fallback to basic intent with simple keyword extraction
        return this.createFallbackIntent(userMessage);
      }
    } catch (error) {
      // Fallback intent with simple keyword extraction
      return this.createFallbackIntent(userMessage);
    }
  }

  /**
   * Try simple intent detection without API call
   * Returns intent if query is simple enough, null otherwise
   */
  trySimpleIntentDetection(userMessage) {
    const messageLower = userMessage.toLowerCase().trim();
    
    // Skip for complex queries that need AI
    const complexPatterns = [
      'compare', 'vs', 'versus', 'difference between',
      'recommend', 'suggest', 'what should i',
      'build', 'assemble', 'compatible',
      'best for', 'good for', 'better'
    ];
    
    if (complexPatterns.some(pattern => messageLower.includes(pattern))) {
      return null; // Use AI for complex queries
    }
    
    // Simple product search patterns
    const isSimpleSearch = 
      messageLower.startsWith('show') ||
      messageLower.startsWith('do you have') ||
      messageLower.startsWith('any') ||
      messageLower.startsWith('available') ||
      messageLower.includes('looking for') ||
      /^(laptop|processor|gpu|ram|ssd|hdd|monitor|keyboard|mouse|headset)/i.test(messageLower);
    
    if (isSimpleSearch) {
      return this.createFallbackIntent(userMessage);
    }
    
    return null; // Use AI
  }

  /**
   * Create fallback intent when AI detection fails
   * Uses simple keyword matching to extract category
   */
  createFallbackIntent(userMessage) {
    const messageLower = userMessage.toLowerCase();
    
    // Common product categories
    const categoryKeywords = {
      'laptop': ['laptop', 'notebook', 'portable computer'],
      'processor': ['processor', 'cpu', 'ryzen', 'intel', 'i3', 'i5', 'i7', 'i9'],
      'gpu': ['gpu', 'graphics card', 'video card', 'rtx', 'gtx', 'radeon', 'geforce'],
      'ram': ['ram', 'memory', 'ddr4', 'ddr5'],
      'ssd': ['ssd', 'solid state'],
      'hdd': ['hdd', 'hard drive', 'hard disk'],
      'motherboard': ['motherboard', 'mobo', 'mainboard'],
      'power supply': ['power supply', 'psu'],
      'case': ['case', 'chassis', 'tower'],
      'monitor': ['monitor', 'display', 'screen'],
      'keyboard': ['keyboard', 'keys'],
      'mouse': ['mouse', 'mice'],
      'headset': ['headset', 'headphone', 'earphone'],
      'speaker': ['speaker', 'audio'],
      'webcam': ['webcam', 'camera']
    };
    
    // Detect category
    let detectedCategory = null;
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => messageLower.includes(kw))) {
        detectedCategory = category;
        break;
      }
    }
    
    // Simple budget detection
    let budget = {};
    const budgetMatch = messageLower.match(/(\d+)k?/);
    if (budgetMatch && (messageLower.includes('under') || messageLower.includes('below'))) {
      const amount = budgetMatch[1].includes('k') ? parseInt(budgetMatch[1]) * 1000 : parseInt(budgetMatch[1]);
      budget = { max: amount, type: 'under' };
    }
    
    return {
      intentType: detectedCategory ? 'product_search' : 'general_question',
      category: detectedCategory,
      budget: budget,
      brands: [],
      features: messageLower.includes('affordable') || messageLower.includes('budget') 
        ? ['affordable'] 
        : [],
      keywords: [], // Don't include full message as keyword
      useCase: null,
      confidence: 0.6
    };
  }

  /**
   * Intelligent product search using AI-detected intent
   * @param {Object} intent - Intent object from detectIntent()
   * @returns {Promise<Array>} Array of matching products
   */
  async searchProductsByIntent(intent) {
    try {
      const allProducts = await this.fetchProducts();
      
      if (allProducts.length === 0) {
        return [];
      }

      // For simple category-only searches OR basic budget queries, use fallback (faster and more accurate)
      const isSimpleCategorySearch = intent.category && 
        !intent.budget?.max && 
        !intent.budget?.min && 
        intent.brands.length === 0 && 
        intent.features.length === 0;
      
      // Also use fallback for basic budget + category (more reliable than AI scoring)
      const isBasicBudgetSearch = intent.category && 
        (intent.budget?.max || intent.budget?.min) &&
        intent.brands.length === 0 && 
        intent.features.length === 0;

      if (isSimpleCategorySearch || isBasicBudgetSearch) {
        return this.fallbackSearch(allProducts, intent);
      }

      // For complex queries, use AI scoring
      // First, get component types for strict filtering
      const productsWithComponents = allProducts.slice(0, 50).map(p => {
        let componentType = '';
        try {
          if (p.selected_components) {
            const components = typeof p.selected_components === 'string' 
              ? JSON.parse(p.selected_components) 
              : p.selected_components;
            if (Array.isArray(components) && components.length > 0) {
              componentType = components[0].name || '';
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
        return { ...p, componentType };
      });

      const scoringPrompt = `You are a product matching AI for a computer hardware store. Match products to user intent STRICTLY by category type.

User Intent:
- Category: ${intent.category || 'any'}
- Budget: ${JSON.stringify(intent.budget)}
- Brands: ${intent.brands.join(', ') || 'any'}
- Features: ${intent.features.join(', ') || 'any'}
- Use Case: ${intent.useCase || 'general'}
- Keywords: ${intent.keywords.join(', ')}

Products (ID | Name | Price | Component Type):
${productsWithComponents.map((p, idx) => `${idx}. [ID:${p.id}] ${p.name} - ₱${p.price.toLocaleString()} - Type: "${p.componentType}" - ${p.brands?.name || 'Unknown'} - Stock: ${p.stock_quantity}`).join('\n')}

CRITICAL CATEGORY MATCHING RULES:
1. **ONLY match products where Component Type matches the requested category**
2. If user asks for "laptop" → ONLY include products with Component Type: "Laptop"
3. If user asks for "gpu" → ONLY include products with Component Type: "Graphics Card" or "GPU"
4. If user asks for "processor" → ONLY include products with Component Type: "Processor" or "CPU"
5. If user asks for "ssd" → ONLY include products with Component Type: "SSD"
6. **DO NOT include GPUs, processors, or components when user asks for laptops**
7. **DO NOT include laptops when user asks for components**

Respond with ONLY a JSON array of product IDs that match, ordered by relevance (best first).
Format: [id1, id2, id3, ...]

Consider:
- Component Type MUST match category (this is the most important rule)
- Budget constraints strictly (but if no budget specified, include all prices)
- Brand preferences if specified
- Feature requirements
- Use case suitability
- Stock availability (include out-of-stock but note it)`;

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: scoringPrompt }],
          temperature: 0.2,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        return this.fallbackSearch(allProducts, intent);
      }

      const data = await response.json();
      const resultText = data.choices[0].message.content.trim();
      
      // Parse the AI response
      const cleanedResult = resultText.replace(/```json\n?|```\n?/g, '').trim();
      
      try {
        const matchedIds = JSON.parse(cleanedResult);
        const matchedProducts = allProducts.filter(p => matchedIds.includes(p.id));
        
        // Sort by the order AI provided
        matchedProducts.sort((a, b) => matchedIds.indexOf(a.id) - matchedIds.indexOf(b.id));
        
        return matchedProducts;
      } catch (parseError) {
        return this.fallbackSearch(allProducts, intent);
      }
    } catch (error) {
      return this.fallbackSearch(await this.fetchProducts(), intent);
    }
  }

  /**
   * Fallback search using traditional text matching (backup when AI fails)
   * @param {Array} products - All products
   * @param {Object} intent - Intent object
   * @returns {Promise<Array>} Filtered products
   */
  async fallbackSearch(products, intent) {
    let filtered = products;

    // Filter by category if specified
    if (intent.category) {
      let categoryLower = intent.category.toLowerCase();
      
      // Normalize plural to singular for consistent matching
      const pluralToSingular = {
        'processors': 'processor',
        'laptops': 'laptop',
        'keyboards': 'keyboard',
        'mice': 'mouse',
        'monitors': 'monitor',
        'speakers': 'speaker',
        'cases': 'case',
        'ssds': 'ssd',
        'hdds': 'hdd',
        'gpus': 'gpu',
        'cpus': 'cpu',
        'motherboards': 'motherboard',
        'graphics cards': 'graphics card',
        'power supplies': 'power supply'
      };
      
      categoryLower = pluralToSingular[categoryLower] || categoryLower;
      // Category-specific matching
      filtered = filtered.filter(p => {
        const name = p.name.toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const brandName = (p.brands?.name || '').toLowerCase();
        
        // Check selected_components (component type like "Laptop", "Processor", etc.)
        let componentType = '';
        try {
          if (p.selected_components) {
            const components = typeof p.selected_components === 'string' 
              ? JSON.parse(p.selected_components) 
              : p.selected_components;
            if (Array.isArray(components) && components.length > 0) {
              componentType = (components[0].name || '').toLowerCase();
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
        
        // For specific component categories, ONLY match by component type (strict matching)
        // This prevents laptops with "SSD specs" from matching "ssd category"
        const strictCategories = ['ssd', 'hdd', 'ram', 'processor', 'cpu', 'gpu', 'graphics card', 
                                  'motherboard', 'mobo', 'power supply', 'psu', 'case', 
                                  'cooling', 'monitor', 'keyboard', 'mouse', 'speaker'];
        
        if (strictCategories.includes(categoryLower)) {
          // Strict match: component type must match the category
          // Use flexible matching - check if category is contained in component type or vice versa
          const categoryMatch = componentType.includes(categoryLower) || categoryLower.includes(componentType);
          return categoryMatch;
        }
        
        // Special handling for laptops - STRICT matching to avoid peripherals
        if (categoryLower === 'laptop') {
          // ONLY match if component type is explicitly 'laptop'
          // OR if product name starts with laptop-related terms
          const isLaptopComponent = componentType.includes('laptop');
          const nameStartsWithLaptop = /^(laptop|notebook|gaming laptop|business laptop)/i.test(name);
          const hasLaptopInName = name.includes('laptop');
          
          // Exclude anything that's clearly a peripheral/accessory
          const isPeripheral = name.includes('headset') || name.includes('mouse') || 
                              name.includes('keyboard') || name.includes('speaker') ||
                              name.includes('webcam') || name.includes('charger') ||
                              componentType.includes('headset') || componentType.includes('mouse') ||
                              componentType.includes('keyboard') || componentType.includes('speaker');
          
          return (isLaptopComponent || (nameStartsWithLaptop && hasLaptopInName)) && !isPeripheral;
        }
        
        // For other categories (generic terms), use broader text search
        const searchText = `${name} ${desc} ${brandName} ${componentType}`;
        return searchText.includes(categoryLower);
      });
      
    }

    // Filter by keywords (only if different from category)
    // Exclude common intent words that aren't actual product attributes
    const intentOnlyWords = ['affordable', 'budget', 'cheap', 'cheapest', 'expensive', 'premium', 
                             'best', 'good', 'quality', 'available', 'stock', 'have', 'show', 'find'];
    
    if (intent.keywords && intent.keywords.length > 0) {
      const keywordsToSearch = intent.keywords.filter(kw => {
        const kwLower = kw.toLowerCase();
        // Skip if it's the category name
        if (intent.category && kwLower === intent.category.toLowerCase()) return false;
        // Skip if it's an intent-only word (not a product attribute)
        if (intentOnlyWords.includes(kwLower)) return false;
        return true;
      });
      
      if (keywordsToSearch.length > 0) {
        console.log(`🔍 Filtering by keywords: ${keywordsToSearch.join(', ')}`);
        filtered = filtered.filter(p => {
          const searchText = `${p.name} ${p.description || ''} ${p.brands?.name || ''}`.toLowerCase();
          return keywordsToSearch.some(kw => searchText.includes(kw.toLowerCase()));
        });
      }
    }

    // Filter by budget
    if (intent.budget) {
      const beforeBudgetFilter = filtered.length;
      
      if (intent.budget.max) {
        filtered = filtered.filter(p => {
          const productPrice = parseFloat(p.price);
          const maxBudget = parseFloat(intent.budget.max);
          const matches = productPrice <= maxBudget;
          
          if (!matches) {
            console.log(`❌ Excluded: ${p.name} (₱${productPrice.toLocaleString()}) > max ₱${maxBudget.toLocaleString()}`);
          }
          
          return matches;
        });
        console.log(`💰 Budget max filter (₱${intent.budget.max.toLocaleString()}): ${filtered.length} products (removed ${beforeBudgetFilter - filtered.length})`);
      }
      
      if (intent.budget.min) {
        const beforeMinFilter = filtered.length;
        filtered = filtered.filter(p => {
          const productPrice = parseFloat(p.price);
          const minBudget = parseFloat(intent.budget.min);
          const matches = productPrice >= minBudget;
          
          if (!matches) {
            console.log(`❌ Excluded: ${p.name} (₱${productPrice.toLocaleString()}) < min ₱${minBudget.toLocaleString()}`);
          }
          
          return matches;
        });
        console.log(`💰 Budget min filter (₱${intent.budget.min.toLocaleString()}): ${filtered.length} products (removed ${beforeMinFilter - filtered.length})`);
      }
      
      if (filtered.length > 0) {
        console.log(`✅ Products within budget range:`, filtered.map(p => `${p.name} - ₱${parseFloat(p.price).toLocaleString()}`));
      }
    }

    // Filter by brands
    if (intent.brands && intent.brands.length > 0) {
      filtered = filtered.filter(p => {
        const brandName = (p.brands?.name || '').toLowerCase();
        return intent.brands.some(b => brandName.includes(b.toLowerCase()));
      });
    }

    // Check if user mentioned "affordable" or "budget" without specific price
    const hasAffordableIntent = intent.features?.some(f => 
      ['affordable', 'budget', 'cheap', 'cheapest'].includes(f.toLowerCase())
    ) || intent.keywords?.some(kw => 
      ['affordable', 'budget', 'cheap', 'cheapest'].includes(kw.toLowerCase())
    );

    // Enrich products with review data for better scoring (with fallback)
    try {
      const enrichedProducts = await Promise.all(filtered.map(async (product) => {
        const reviewData = await this.getProductWithReviews(product.id).catch(() => ({ avgRating: 0, reviewCount: 0 }));
        return {
          ...product,
          avgRating: reviewData.avgRating || 0,
          reviewCount: reviewData.reviewCount || 0,
          // Calculate AI score: base 100 + rating bonus + review count bonus - out of stock penalty
          aiScore: 100 + 
                   ((reviewData.avgRating || 0) * 10) + 
                   (Math.min(reviewData.reviewCount || 0, 50) * 0.5) + 
                   (product.stock_quantity > 0 ? 20 : -50)
        };
      }));
      
      filtered = enrichedProducts;
      console.log('⭐ Products enriched with review data');
    } catch (enrichError) {
      console.warn('⚠️ Review enrichment failed, using products without reviews:', enrichError.message);
      // Continue with non-enriched products (graceful degradation)
      // Add default scores for sorting
      filtered = filtered.map(p => ({
        ...p,
        avgRating: 0,
        reviewCount: 0,
        aiScore: 100 + (p.stock_quantity > 0 ? 20 : -50)
      }));
    }

    // Sort results intelligently
    filtered.sort((a, b) => {
      // In-stock first
      if (a.stock_quantity > 0 && b.stock_quantity === 0) return -1;
      if (a.stock_quantity === 0 && b.stock_quantity > 0) return 1;
      
      // If user wants "affordable", sort by price ascending (cheapest first)
      // Otherwise, sort by relevance (could be descending for "best" or "premium")
      if (hasAffordableIntent) {
        return a.price - b.price; // Cheapest first
      }
      
      // If products have aiScore (with reviews), use it
      if (a.aiScore !== undefined && b.aiScore !== undefined) {
        return b.aiScore - a.aiScore; // Higher score first
      }
      
      // Default: sort by price ascending (most people prefer to see cheaper options first)
      return a.price - b.price;
    });

    if (hasAffordableIntent) {
      console.log(`💡 Sorted by price (affordable intent detected)`);
    }
    
    // Return all results, not limited (let the UI handle pagination if needed)
    return filtered;
  }

  /**
   * LEGACY: Fetch products by category (kept for backward compatibility)
   * @param {string} category - Category name or type
   * @returns {Promise<Array>} Array of products
   */
  async fetchProductsByCategory(category) {
    // Convert to intent format and use new smart search
    const intent = {
      intentType: 'product_search',
      category: category,
      budget: {},
      brands: [],
      features: [],
      keywords: [category],
      useCase: null,
      confidence: 1.0
    };
    
    return this.searchProductsByIntent(intent);
  }

  /**
   * Build intelligent system prompt with intent-aware product filtering
   * @param {Array} products - Array of relevant products
   * @param {Object} userPreferences - User's questionnaire answers (optional)
   * @param {Array} storeInfo - Store policies and FAQs (optional)
   * @param {Object} userData - User-specific data from database (optional)
   * @param {Object} intent - Detected user intent (optional)
   * @returns {string} System prompt
   */
  buildIntelligentSystemPrompt(products, userPreferences = null, storeInfo = [], userData = null, intent = null) {
    // Special handling for PC build requests
    const isPCBuildRequest = intent && (
      intent.intentType === 'build_help' || 
      intent.category === 'pc_build' ||
      /build.*pc|custom.*pc|assemble.*pc|pc.*configuration/i.test(intent.originalQuery || '')
    );

    let systemPrompt = `You are a professional AI shopping assistant for NovaTech PC Store, a computer hardware store in the Philippines. You're trained on how e-commerce AI shopping assistants work and have full knowledge of our store policies.

🎯 DETECTED USER INTENT:
${intent ? `
- What they want: ${intent.intentType}
- Looking for: ${intent.category || 'browsing'}
- Budget: ${intent.budget?.max ? `Up to ₱${intent.budget.max.toLocaleString()}` : 'Not specified'}
- Brands: ${intent.brands.length > 0 ? intent.brands.join(', ') : 'No preference'}
- Features: ${intent.features.length > 0 ? intent.features.join(', ') : 'Standard'}
- Use case: ${intent.useCase || 'General'}
` : 'General inquiry'}

${isPCBuildRequest ? `
🖥️ **PC BUILD ASSISTANT MODE ACTIVATED**

The customer wants help building a custom PC. Follow this structure:

**STEP 1: Gather Requirements (if not already provided)**
If user hasn't specified BOTH use case AND budget:
1. Ask: "What will you primarily use this PC for?" (Gaming / Work / Content Creation / Casual/General Use)
2. Ask: "What's your total budget for the build?" (₱X,XXX)

**STEP 2: ONCE YOU HAVE BOTH USE CASE AND BUDGET - STOP ASKING QUESTIONS**
**IMMEDIATELY present a COMPLETE build with ALL 7 components below**
DO NOT ask "what's next?" or show one component at a time.

**YOU MUST SHOW ALL 7 COMPONENTS IN ONE RESPONSE:**

Format EXACTLY like this (show actual products from the available list):

"Perfect! For a ₱XX,XXX gaming/work/casual PC, here's your complete build:

🖥️ YOUR CUSTOM PC BUILD

1️⃣ CPU (PROCESSOR)
   [Product Name] - ₱X,XXX
   Why: [Explain performance]

2️⃣ MOTHERBOARD
   [Product Name] - ₱X,XXX
   Why: Compatible with CPU, has [features]

3️⃣ GRAPHICS CARD (GPU)
   [Product Name] - ₱X,XXX
   Why: Handles [games/tasks] at [settings]

4️⃣ MEMORY (RAM)
   [Product Name with size] - ₱X,XXX
   Why: [Speed] for smooth multitasking

5️⃣ STORAGE (SSD)
   [Product Name with capacity] - ₱X,XXX
   Why: Fast boot and load times

6️⃣ POWER SUPPLY (PSU)
   [Product Name with wattage] - ₱X,XXX
   Why: [Certification] reliable power

7️⃣ CASE
   [Product Name] - ₱X,XXX
   Why: Good airflow, fits components

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL: ₱XX,XXX
━━━━━━━━━━━━━━━━━━━━

✅ This build can: [Performance description]

Options:
• Adjust components?
• Add to cart?
• See alternatives?"

**CRITICAL: You MUST include all 7 components above. Search the product list for:**
- CPU/Processor category products
- Motherboard category products  
- GPU/Graphics Card category products
- RAM/Memory category products
- SSD/Storage category products
- Power Supply/PSU category products
- Case/PC Case category products
Format your recommendation like this (NO ASTERISKS, use plain text with emojis):

"Great! Based on your [use case] needs and ₱[budget] budget, here's what I recommend:

🎮 YOUR CUSTOM PC BUILD

💻 PROCESSOR (CPU)
[Name] - ₱XX,XXX
Why: Great for [reason]

🔧 MOTHERBOARD
[Name] - ₱XX,XXX  
Why: Compatible with CPU, has [features]

🎨 GRAPHICS CARD (GPU)
[Name] - ₱XX,XXX
Why: Handles [games/tasks] at [settings]

🧠 MEMORY (RAM)
[Amount] [Type] - ₱XX,XXX
Why: [Speed] for optimal performance

💾 STORAGE
[Size] [Type] - ₱XX,XXX
Why: Fast boot and load times

⚡ POWER SUPPLY
[Wattage] - ₱XX,XXX
Why: [Certification], reliable brand

📦 CASE
[Name] - ₱XX,XXX
Why: Good airflow, fits all components

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL: ₱XX,XXX
━━━━━━━━━━━━━━━━━━━━

✅ Expected Performance: [describe what this build can do]

Would you like me to:
• Adjust the budget up or down?
• Swap out any components?
• Show you our pre-configured PC bundles instead?
• Add this build to your cart?"

**CRITICAL RULES FOR PC BUILD ASSISTANCE:**
1. ⚠️ NEVER show components one-by-one or ask "what's next?"
2. ⚠️ Once you have use case AND budget, show ALL 7 components immediately in ONE response
3. Search available products for EACH of the 7 categories (CPU, Mobo, GPU, RAM, SSD, PSU, Case)
4. Format response with numbered list 1️⃣ through 7️⃣ showing ALL components
5. NEVER recommend pre-built laptops for "build a PC" requests
6. Ensure CPU and Motherboard sockets are COMPATIBLE
7. Calculate PSU wattage: (CPU+GPU watts) + 100W + 20% headroom
8. Budget allocation: Gaming (40% GPU, 20% CPU, 40% rest), Work (30% CPU, 15% GPU, 55% rest), Casual (25% CPU, 75% rest)
9. If component category has no products, say "Not available in our current stock" for that category
10. Present complete build first, THEN offer to adjust or show alternatives
` : ''}

📚 HOW E-COMMERCE AI SHOPPING ASSISTANTS WORK:

1. **UNDERSTAND SHOPPING STAGES**:
   - Browsing Stage: "What laptops do you have?" → Show product range
   - Consideration Stage: "Tell me about this laptop" → Provide details
   - Decision Stage: "I'll take it" → Guide to purchase
   - Post-Sale Stage: "What's in my cart?" → Show order summary
   
2. **PRODUCT DISCOVERY ASSISTANCE**:
   - Help users find products through natural conversation
   - Ask qualifying questions: "What will you use it for?"
   - Narrow down options: "Gaming or work?"
   - Suggest alternatives: "This is out of stock, but here's similar..."
   - Compare options: "The RTX 3060 vs RTX 4060..."
   
3. **BUDGET OPTIMIZATION**:
   - Respect stated budgets strictly
   - Suggest ways to save: "You can get similar performance for less with..."
   - Upsell when beneficial: "For ₱5k more, you get double the storage"
   - Never push expensive items on budget-conscious customers
   
4. **BUILD TRUST THROUGH HONESTY**:
   - Admit when products are out of stock
   - Don't oversell features: "This is good for casual gaming, not AAA titles"
   - Warn about limitations: "8GB RAM is minimum, 16GB recommended for gaming"
   - Be transparent about compatibility issues
   
5. **PERSONALIZATION**:
   - Remember user's previous questions in conversation
   - Adapt recommendations based on stated needs
   - Learn preferences: "You mentioned gaming earlier, so..."
   - Track budget changes: "You said around 30k earlier"
   
6. **HANDLE OBJECTIONS**:
   - Too expensive: "Here are budget alternatives..."
   - Out of stock: "We expect it next week, or try this..."
   - Uncertain: "What's your main concern? I can help clarify"
   - Comparing brands: "AMD offers better value, Intel has better single-core performance"
   
7. **SMART UPSELLING/CROSS-SELLING**:
   - Natural bundling: "Bought a keyboard? Need a mouse too?"
   - Accessory suggestions: "Gaming laptop? Consider a cooling pad"
   - Compatibility recommendations: "That motherboard needs DDR4, not DDR5"
   - Performance upgrades: "That GPU pairs well with this CPU"
   
8. **AVOID COMMON AI MISTAKES**:
   - ❌ Don't repeat same products unless asked
   - ❌ Don't show keyboards when user asks for monitors
   - ❌ Don't ignore "later" timing (I'll buy it later ≠ add to cart now)
   - ❌ Don't re-display products on acknowledgments ("that's good" ≠ show again)
   - ❌ Don't mix categories (laptop query ≠ show RAM)
   - ✅ Focus on CURRENT question, not previous context
   - ✅ Understand timing: "now" vs "later" vs "maybe"
   - ✅ Detect acknowledgments vs action commands
   
9. **CONVERSATIONAL INTELLIGENCE**:
   - Natural Language: "portable computer" = laptop, "vid card" = GPU
   - Typo tolerance: "processer" = processor, "keybaord" = keyboard  
   - Contextual understanding: "Do you have something to game on?" = gaming laptop/PC
   - Slang recognition: "mobo" = motherboard, "mem" = RAM
   - Question clarification: "Which one?" → refer to previous products
   
10. **GUIDE THE PURCHASE JOURNEY**:
    - Discovery → "Here are 3 options in your budget"
    - Comparison → "Let me compare these for you"
    - Decision → "Would you like to add this to cart?"
    - Checkout → "Your cart has X items, ready to checkout?"
    - Support → "Need help with compatibility?"

CORE INTELLIGENCE RULES:
1. **Natural Understanding**: 
   - Understand variations, typos, and informal language
   - "gaming laptop" = "laptop for gaming" = "laptop that can game"
   - "cheap gpu" = "budget graphics card" = "affordable video card"
   - "something to type with" = keyboard
   - "pointing device" or "clicker" = mouse

2. **Context Awareness**:
   - Remember what was discussed earlier in the conversation
   - If user says "show me more" or "other options", recall what category/type was discussed
   - If they mention "cheaper" or "better", compare to previously mentioned products
   - IMPORTANT: When user asks NEW question about DIFFERENT category, FORGET old context

3. **Smart Product Matching**:
   - Match intent, not just keywords
   - If user wants "keyboard", NEVER suggest "motherboard" (they're completely different)
   - If user wants "mouse", NEVER suggest "monitor" (mouse is a pointing device, monitor is a screen)
   - Peripherals (keyboard, mouse, headset) are separate from PC components (CPU, GPU, motherboard)

4. **Budget Intelligence**:
   - "around ₱X" = ±10% range (e.g., "around ₱70k" = ₱63k-₱77k)
   - "under ₱X" = everything below X
   - "at least ₱X" = X and above
   - "cheap" or "budget" = focus on lower-priced options
   - "best" or "high-end" = focus on top-tier options

5. **Conversational Style**:
   - Start with brief acknowledgment (1 line)
   - If info is missing (budget, use case), ask ONE short question
   - Keep responses natural and friendly, not robotic
   - Don't repeat same products unless asked
   - Be honest about availability

6. **Smart Recommendations**:
   - Show 2-3 options max per response
   - Prioritize in-stock items
   - Consider the use case (gaming, work, school, etc.)
   - Match brand preferences if specified
   - Respect budget strictly

AVAILABLE PRODUCTS FOR THIS QUERY:
${products.slice(0, 50).map(p => `
- ${p.name}
  Price: ₱${p.price.toLocaleString()}
  Category: ${p.categories?.name || 'N/A'}
  Brand: ${p.brands?.name || 'N/A'}
  Stock: ${p.stock_quantity > 0 ? `${p.stock_quantity} units` : 'OUT OF STOCK'}
  ${p.description ? `Info: ${p.description.substring(0, 100)}...` : ''}
`).join('\n')}

${products.length > 50 ? `... and ${products.length - 50} more products available\n` : ''}

${isPCBuildRequest ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 MANDATORY PC BUILD FORMAT 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ YOU ARE IN PC BUILD MODE - FOLLOW THESE RULES EXACTLY:

STEP 1: Get Requirements
- Ask: "What will you use this PC for?" (Gaming/Work/Casual)
- Ask: "What's your budget?" (₱X,XXX)

STEP 2: ⚠️ IMMEDIATELY After Getting BOTH Answers Above ⚠️
YOU MUST PRESENT **ALL 7 COMPONENTS** IN **ONE SINGLE RESPONSE**

DO NOT:
❌ Show one component and ask "what's next?"
❌ Show components one-by-one
❌ Ask follow-up questions after getting use case and budget
❌ Wait for user to ask for more components

YOU MUST:
✅ Show ALL 7 components together in ONE message
✅ Use the format below EXACTLY
✅ Pick actual products from the list above
✅ Calculate total price

MANDATORY FORMAT (Copy this structure):

"Perfect! For your ₱[BUDGET] [GAMING/WORK/CASUAL] PC, here's a complete build:

🖥️ YOUR CUSTOM PC BUILD

1️⃣ CPU (PROCESSOR)
   • [Actual Product Name from list] - ₱X,XXX
   • Why: [Brief reason]

2️⃣ MOTHERBOARD
   • [Actual Product Name from list] - ₱X,XXX
   • Why: [Brief reason]

3️⃣ GRAPHICS CARD (GPU)
   • [Actual Product Name from list] - ₱X,XXX
   • Why: [Brief reason]

4️⃣ MEMORY (RAM)
   • [Actual Product Name from list] - ₱X,XXX
   • Why: [Brief reason]

5️⃣ STORAGE (SSD/HDD)
   • [Actual Product Name from list] - ₱X,XXX
   • Why: [Brief reason]

6️⃣ POWER SUPPLY (PSU)
   • [Actual Product Name from list] - ₱X,XXX
   • Why: [Brief reason]

7️⃣ CASE
   • [Actual Product Name from list] - ₱X,XXX
   • Why: [Brief reason]

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL: ₱XX,XXX
━━━━━━━━━━━━━━━━━━━━

Would you like to adjust any components?"

⚠️ CRITICAL RULES:
1. Show ALL 7 components in ONE response (not one-by-one)
2. Pick products from the AVAILABLE PRODUCTS list above
3. Match component categories: Look for CPU, Motherboard, GPU/Graphics, RAM/Memory, SSD/Storage, PSU/Power, Case
4. If a category has no products, say "Not available" for that category only
5. DO NOT ask "what's next?" or show components separately
6. Present complete build FIRST, then offer adjustments

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}
`;

    // Add store information if available
    if (storeInfo && storeInfo.length > 0) {
      systemPrompt += `\n\n📋 STORE POLICIES & INFORMATION (Use this to answer customer questions):

${storeInfo.map(info => `
**${info.question}**
${info.answer}
`).join('\n')}

🔔 IMPORTANT RULES FOR ANSWERING STORE POLICY QUESTIONS:
1. When customer asks about shipping, returns, payment, warranty, or store info - use the exact information above
2. Be specific and accurate - quote the actual policies
3. Don't say "we have a return policy" - say "We offer a 30-day return policy on all products..."
4. If asked about something not listed above, say "Let me connect you with customer support for that specific question"
5. For order tracking questions, ask for the order number and guide them to check their "My Orders" page
6. Always be helpful and proactive - if they ask about returns, also mention warranty if relevant
7. **CRITICAL**: If customer mentions product is BROKEN/STOPPED WORKING/FAULTY → Explain WARRANTY CLAIM process, NOT product search!

CUSTOMER SERVICE SCENARIOS:
- "How long is shipping?" → Quote the exact timeframes from policies above
- "Where are you located?" → Provide full address and store hours
- "Can I return this?" → Explain the 30-day policy with conditions
- "Track my order" → Ask for order number and suggest checking My Orders page
- "Is this in stock?" → Check the product stock_quantity in the products list
- "What payment methods?" → List all accepted methods from policies above
- "My GPU stopped working" → Explain WARRANTY CLAIM process (contact with order number, photos, assessment, 7-14 days turnaround)
- "Product is broken/defective/not working" → Explain WARRANTY CLAIM process, don't search for products
- "Can I get a replacement?" → Explain WARRANTY CLAIM process with steps
`;
    }

    if (userPreferences) {
      systemPrompt += `\n📋 CUSTOMER PROFILE (from questionnaire):
- Purpose: ${userPreferences.pcPurpose?.join(', ') || 'General use'}
- Budget Range: ${userPreferences.budgetRange || 'Not specified'}
- Preferred Brands: ${userPreferences.preferredBrands?.join(', ') || 'No preference'}
- Processor: ${userPreferences.processorPreference || 'No preference'}
- Gaming Genres: ${userPreferences.gameGenres || 'Not specified'}
- Additional Needs: ${userPreferences.additionalNeeds?.join(', ') || 'None'}
${userPreferences.otherPurpose ? `\nNote: ${userPreferences.otherPurpose}` : ''}`;
    }

    // Add user-specific intelligence from database (with safety checks)
    if (userData && typeof userData === 'object') {
      // Purchase History
      if (Array.isArray(userData.purchaseHistory) && userData.purchaseHistory.length > 0) {
        systemPrompt += `\n\n🛍️ CUSTOMER PURCHASE HISTORY:
${userData.purchaseHistory.slice(0, 5).map(order => {
  const items = order.order_items?.map(item => item.products?.name).filter(Boolean).join(', ');
  const totalPrice = order.total_amount;
  const date = new Date(order.created_at).toLocaleDateString();
  return `- ${date}: ${items} (Total: ₱${totalPrice?.toLocaleString()})`;
}).join('\n')}

USE THIS TO:
✓ Avoid recommending already purchased items
✓ Suggest compatible upgrades
✓ Match their historical budget range
✓ Recommend complementary products`;
      }

      // User's PC Components
      if (Array.isArray(userData.userComponents) && userData.userComponents.length > 0) {
        systemPrompt += `\n\n🖥️ CUSTOMER'S EXISTING PC COMPONENTS:
${userData.userComponents.map(comp => 
  `- ${comp.categories?.name}: ${comp.name}`
).join('\n')}

CRITICAL COMPATIBILITY RULES:
✓ RAM: Must match motherboard DDR type
✓ GPU: Check processor won't bottleneck
✓ PSU: Calculate wattage for all components
✓ Storage: Suggest upgrades, not duplicates
✓ Cooling: Match CPU TDP requirements`;
      }

      // Recently Viewed Products
      if (Array.isArray(userData.recentlyViewed) && userData.recentlyViewed.length > 0) {
        systemPrompt += `\n\n👀 RECENTLY VIEWED PRODUCTS:
${userData.recentlyViewed.map(p => 
  `- ${p.name} (₱${p.price?.toLocaleString()})`
).join('\n')}

This shows their current interests and budget preferences!`;
      }

      // Popular Products
      if (Array.isArray(userData.popularProducts) && userData.popularProducts.length > 0) {
        systemPrompt += `\n\n🔥 BEST SELLERS (Last 30 Days):
${userData.popularProducts.map((p, i) => 
  `${i + 1}. ${p.name} - ₱${p.price?.toLocaleString()} (${p.salesCount} sold)`
).join('\n')}

Recommend these first if they match user needs!`;
      }

      // Active Promotions
      if (Array.isArray(userData.activePromotions) && userData.activePromotions.length > 0) {
        systemPrompt += `\n\n🎁 ACTIVE PROMOTIONS & VOUCHERS:
${userData.activePromotions.map(v => {
  const discount = v.discount_type === 'percentage' 
    ? `${v.discount_value}% OFF` 
    : `₱${v.discount_value} OFF`;
  const minPurchase = v.min_purchase ? ` (Min: ₱${v.min_purchase})` : '';
  const category = v.product_category ? ` [${v.product_category} only]` : ' [All products]';
  return `- Code "${v.code}": ${discount}${minPurchase}${category}`;
}).join('\n')}

ALWAYS mention relevant vouchers to save customers money!`;
      }

      // Product Quality Indicators (Top-rated products)
      if (products && products.length > 0) {
        const topRated = products
          .filter(p => p.avgRating >= 4.0 && p.reviewCount >= 5)
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 5);
        
        if (topRated.length > 0) {
          systemPrompt += `\n\n⭐ HIGHLY-RATED PRODUCTS:
${topRated.map(p => 
            `- ${p.name}: ${p.avgRating}/5 stars (${p.reviewCount} reviews)`
          ).join('\n')}

Prioritize these when recommending!`;
        }
      }

      // Low Stock Alerts
      if (products && products.length > 0) {
        const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 5);
        if (lowStock.length > 0) {
          systemPrompt += `\n\n⚠️ LIMITED STOCK ALERTS:
${lowStock.map(p => 
            `- ${p.name}: Only ${p.stock_quantity} left!`
          ).join('\n')}

Mention urgency when recommending these items!`;
        }
      }

      // Products on Sale
      if (products && products.length > 0) {
        const onSale = products.filter(p => p.discount_percentage > 0);
        if (onSale.length > 0) {
          systemPrompt += `\n\n💸 CURRENT DEALS:
${onSale.slice(0, 8).map(p => {
            const original = p.original_price || (p.price / (1 - p.discount_percentage / 100));
            return `- ${p.name}: ${p.discount_percentage}% OFF (₱${p.price?.toLocaleString()} from ₱${original.toLocaleString()})`;
          }).join('\n')}

Highlight these to budget-conscious customers!`;
        }
      }
    }

    systemPrompt += `\n\n⚡ RESPONSE FORMAT RULES:
1. Brief acknowledgment (1 line max)
2. When recommending products, use this format:
   
   [Product Name]
   Price: ₱X,XXX
   Why: [One-line reason it fits their needs]
   Stock: Available/Limited/Out of Stock
   
3. When asking for clarification: Keep it to ONE short question
4. Always be helpful, honest, and conversational
5. Use emojis for visual appeal (✅ 💰 🎮 ⚡ etc.)
6. Keep sentences short and easy to read

🚫 FORMATTING RESTRICTIONS:
- DO NOT use asterisks (*) for emphasis or bullets
- DO NOT use markdown formatting
- Use plain text with emojis instead
- Use line breaks and spacing for readability
- Example: Instead of "**Budget:** ₱30,000" write "💰 Budget: ₱30,000"

Remember: You're a world-class e-commerce AI trained on shopping psychology, natural language understanding, and customer journey optimization!`;

    return systemPrompt;
  }

  /**
   * LEGACY: Build system prompt (kept for backward compatibility)
   */
  buildSystemPrompt(products, userPreferences = null) {
    // Fallback to intelligent version
    return this.buildIntelligentSystemPrompt(products, userPreferences, null);
  }

  /**
   * Intelligent chat with intent detection and smart product matching
   * @param {Array} messages - Conversation history
   * @param {Object} userPreferences - User's questionnaire answers (optional)
   * @param {Object} options - Additional options like forceDirectResponse
   * @returns {Promise<Object>} AI response with matched products
   */
  async chat(messages, userPreferences = null, options = {}) {
    try {
      // Verify user consent for AI assistant if userId provided
      const userId = options.userId || null;
      if (userId) {
        const hasConsent = await this.verifyAIConsent(userId);
        if (!hasConsent) {
          return {
            success: false,
            error: 'AI assistant consent required',
            message: "To use the AI Shopping Assistant, please enable 'AI Assistant' consent in your privacy settings."
          };
        }
      }

      // Get the last user message
      const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
      
      if (!lastUserMessage) {
        return {
          success: false,
          error: 'No user message found',
          message: "I didn't receive your message. Please try again."
        };
      }

      const userMessageText = lastUserMessage.text;

      // 🆕 Step 0: Check if this is a store policy/FAQ question
      const isStoreQuery = this.isStoreInfoQuery(userMessageText);
      let storeInfo = [];
      
      if (isStoreQuery) {
        storeInfo = await this.searchStoreInfo(userMessageText);
        // Check if it's a warranty/broken product question
        const isWarrantyQuestion = /(broke|broken|stopped|not working|malfunction|replace|replacement|repair|damaged|faulty|doa|defect)/i.test(userMessageText);
        if (isWarrantyQuestion && storeInfo.length > 0) {
          // Find warranty-related FAQ
          const warrantyFAQ = storeInfo.find(info => 
            info.category === 'warranty' || 
            /warranty|claim|defect|repair|replace/i.test(info.question)
          );
          
          if (warrantyFAQ) {
            return {
              success: true,
              message: warrantyFAQ.answer,
              intent: { intentType: 'warranty_claim' },
              matchedProducts: [],
              isWarrantyClaim: true
            };
          }
        }
        
        // Check if it's an order tracking question
        const isOrderTracking = /order|track|status|where.*my/i.test(userMessageText);
        if (isOrderTracking) {
          // Check if order number is mentioned
          const orderNumberMatch = userMessageText.match(/\b\d{8,}\b/);
          if (orderNumberMatch) {
            const orderResult = await this.getCustomerOrder(orderNumberMatch[0]);
            
            if (orderResult.data) {
              // Return formatted order status directly
              return {
                success: true,
                message: this.formatOrderStatus(orderResult.data),
                intent: { intentType: 'order_tracking', orderNumber: orderNumberMatch[0] },
                matchedProducts: [],
                isOrderStatus: true
              };
            } else {
              return {
                success: true,
                message: orderResult.error || "I couldn't find that order. Please check your order number and make sure you're signed in. You can view all your orders on the 'My Orders' page.",
                intent: { intentType: 'order_tracking' },
                matchedProducts: []
              };
            }
          } else {
            // Ask for order number
            return {
              success: true,
              message: "I'd be happy to help you track your order! Could you please provide your order number? You can find it in your order confirmation email or on the 'My Orders' page.",
              intent: { intentType: 'order_tracking' },
              matchedProducts: []
            };
          }
        }
      }

      // Step 1: Detect intent using AI (understand what user wants)
      const intent = await this.detectIntent(userMessageText);
      
      // Step 1.5: Fetch user-specific intelligence data with individual fallbacks
      let userData = null;
      if (userId) {
        // Initialize with safe defaults
        userData = {
          purchaseHistory: [],
          userComponents: [],
          recentlyViewed: options.recentlyViewedProducts || [],
          popularProducts: [],
          activePromotions: []
        };

        // Fetch each data source independently with fallbacks
        // This ensures partial data loading - if one fails, others still work
        try {
          userData.purchaseHistory = await this.getUserPurchaseHistory(userId, 5).catch(err => {
            console.warn('⚠️ Purchase history unavailable:', err.message);
            return [];
          });
        } catch (err) {
          console.warn('⚠️ Failed to load purchase history, using empty array');
        }

        try {
          userData.userComponents = await this.getUserPCComponents(userId).catch(err => {
            console.warn('⚠️ User components unavailable:', err.message);
            return [];
          });
        } catch (err) {
          console.warn('⚠️ Failed to load user components, using empty array');
        }

        try {
          userData.popularProducts = await this.getPopularProducts(intent.category, 5).catch(err => {
            console.warn('⚠️ Popular products unavailable:', err.message);
            return [];
          });
        } catch (err) {
          console.warn('⚠️ Failed to load popular products, using empty array');
        }

        try {
          userData.activePromotions = await this.getActivePromotions().catch(err => {
            console.warn('⚠️ Promotions unavailable:', err.message);
            return [];
          });
        } catch (err) {
          console.warn('⚠️ Failed to load promotions, using empty array');
        }

        const loadedFeatures = [
          userData.purchaseHistory.length > 0 ? '✅ Purchase History' : '⊘ Purchase History',
          userData.userComponents.length > 0 ? '✅ PC Components' : '⊘ PC Components',
          userData.recentlyViewed.length > 0 ? '✅ Recently Viewed' : '⊘ Recently Viewed',
          userData.popularProducts.length > 0 ? '✅ Popular Products' : '⊘ Popular Products',
          userData.activePromotions.length > 0 ? '✅ Promotions' : '⊘ Promotions'
        ];

        console.log('📊 User intelligence status:', loadedFeatures.join(', '));
        console.log('📈 Data counts:', {
          orders: userData.purchaseHistory.length,
          components: userData.userComponents.length,
          viewed: userData.recentlyViewed.length,
          trending: userData.popularProducts.length,
          promos: userData.activePromotions.length
        });
      }

      // Step 2: Fetch relevant products based on intent
      let relevantProducts = [];
      let allProducts = [];
      
      // Special handling for PC build requests - fetch ALL component categories
      const isPCBuildRequest = intent.intentType === 'build_help' || 
                                intent.category === 'pc_build' ||
                                /build.*pc|custom.*pc/i.test(userMessageText);
      
      if (isPCBuildRequest) {
        // For PC builds, fetch products from ALL essential component categories
        allProducts = await this.fetchProducts();
        
        const pcComponentCategories = [
          'CPU', 'Processor',
          'Motherboard', 'Mobo',
          'GPU', 'Graphics Card', 'Video Card',
          'RAM', 'Memory',
          'SSD', 'Storage', 'Hard Drive', 'NVMe',
          'Power Supply', 'PSU',
          'Case', 'PC Case', 'Chassis'
        ];
        
        // Filter products that match PC component categories
        relevantProducts = allProducts.filter(product => {
          const productCategory = product.categories?.name?.toLowerCase() || '';
          const productName = product.name.toLowerCase();
          
          return pcComponentCategories.some(cat => 
            productCategory.includes(cat.toLowerCase()) ||
            productName.includes(cat.toLowerCase())
          );
        });
        
        console.log(`🖥️ PC Build: Found ${relevantProducts.length} components across all categories`);
        
      } else if (intent.intentType === 'product_search' || 
          intent.intentType === 'recommendation' || 
          intent.intentType === 'comparison') {
        
        // Use intelligent search for regular product queries
        relevantProducts = await this.searchProductsByIntent(intent);
        allProducts = await this.fetchProducts();
        
      } else {
        // For general questions, still load products for context
        allProducts = await this.fetchProducts();
        relevantProducts = allProducts.slice(0, 10); // Show sample
      }

      // Step 3: Build enhanced system prompt with intent awareness AND store info AND user data
      const systemPrompt = this.buildIntelligentSystemPrompt(
        relevantProducts.length > 0 ? relevantProducts : allProducts, 
        userPreferences,
        storeInfo, // 🆕 Store information
        userData, // 🆕 User-specific intelligence
        intent // 🆕 Detected intent
      );

      // Step 4: Prepare conversation with context
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-6).map(msg => ({ // Keep last 6 messages for context
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      ];

      // Step 5: Call AI with intelligent context (with automatic retry on rate limit)
      let response;
      let attemptCount = 0;
      const maxAttempts = this.apiKeys.length;
      
      while (attemptCount < maxAttempts) {
        try {
          response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: this.model,
              messages: apiMessages,
              temperature: 0.7,
              max_tokens: 1024
            })
          });

          if (response.ok) {
            // Success! Reset key rotation for next time
            if (attemptCount > 0) {
              console.log(`✅ Request succeeded with API key #${this.currentKeyIndex + 1}`);
            }
            break; // Exit retry loop
          }

          // Check if it's a rate limit error
          if (response.status === 429) {
            console.warn(`⚠️ Rate limit hit on API key #${this.currentKeyIndex + 1}`);
            
            // Try to rotate to next key
            const rotated = this.rotateApiKey();
            if (!rotated) {
              // All keys exhausted
              throw new Error('429: All API keys have reached their rate limit. Please wait a few minutes.');
            }
            
            attemptCount++;
            console.log(`🔄 Retrying with API key #${this.currentKeyIndex + 1}...`);
            continue; // Retry with new key
          }

          // Other errors, don't retry
          const errorData = await response.json();
          const errorMessage = errorData.error?.message || 'API request failed';
          
          if (response.status === 503) {
            throw new Error('503: Service temporarily unavailable.');
          } else {
            throw new Error(`${response.status}: ${errorMessage}`);
          }
          
        } catch (fetchError) {
          // Network errors or thrown errors
          if (fetchError.message.includes('429')) {
            throw fetchError; // Re-throw rate limit errors
          }
          throw new Error(`Network error: ${fetchError.message}`);
        }
      }

      if (!response || !response.ok) {
        throw new Error('Failed to get response after all retry attempts');
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      // Log third-party data sharing (Groq AI interaction)
      if (userId) {
        await ThirdPartyAuditService.logGroqAIInteraction(
          userId,
          'chat',
          {
            messageCount: messages.length,
            intent: intent.intentType,
            category: intent.category,
            tokensUsed: data.usage?.total_tokens || 0
          },
          {
            userMessage: PrivacyUtils.sanitizeLogData(lastUserMessage.text),
            preferences: userPreferences ? Object.keys(userPreferences) : []
          }
        );
      }

      return {
        success: true,
        message: aiMessage,
        intent: intent, // Include detected intent
        matchedProducts: relevantProducts, // Include matched products
        usage: data.usage
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Smart fallback for rate limit errors on PC build
      if (error.message.includes('429') && intent?.intentType === 'build_pc') {
        const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
        const userMessageText = lastUserMessage?.text || '';
        
        // Extract budget from message
        const budgetMatch = userMessageText.match(/(\d+)k|₱\s*(\d+(?:,\d{3})*)/i);
        let budget = 0;
        if (budgetMatch) {
          budget = parseInt((budgetMatch[1] || budgetMatch[2] || '0').replace(/,/g, '')) * (budgetMatch[1] ? 1000 : 1);
        }
        
        // If we have a budget, show PC components within range
        if (budget > 0) {
          const allProducts = await this.fetchProducts();
          const pcComponents = allProducts.filter(p => {
            const categories = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'Power Supply', 'Case', 'Cooling'];
            const isComponent = categories.some(cat => 
              p.categories?.name?.toLowerCase().includes(cat.toLowerCase()) ||
              p.name.toLowerCase().includes(cat.toLowerCase())
            );
            return isComponent && p.price <= budget && p.stock_quantity > 0;
          });
          
          if (pcComponents.length > 0) {
            // Group by category
            const grouped = {};
            pcComponents.forEach(p => {
              const cat = p.categories?.name || 'Other';
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push(p);
            });
            
            let response = `🖥️ PC COMPONENTS WITHIN YOUR ₱${budget.toLocaleString()} BUDGET\n\n`;
            response += `Here are available components for your gaming PC:\n\n`;
            
            Object.keys(grouped).slice(0, 5).forEach(cat => {
              response += `${cat}:\n`;
              grouped[cat].slice(0, 2).forEach(p => {
                response += `• ${p.name} - ₱${p.price.toLocaleString()}\n`;
              });
              response += `\n`;
            });
            
            response += `\nWould you like me to recommend specific components for your build? (I'm currently at capacity, but I'll be back online soon to give you personalized recommendations!)`;
            
            return {
              success: true,
              message: response,
              intent: intent,
              matchedProducts: pcComponents.slice(0, 12),
              isFallback: true
            };
          }
        }
      }
      
      return {
        success: false,
        error: error.message,
        message: error.message.includes('429') 
          ? "⚠️ I'm currently at my response limit and need a short break. Please try again in a few minutes, or browse our products directly!\n\nYou can also visit 'My Purchases' to track your orders." 
          : "I apologize, but I'm experiencing technical difficulties. Please try again or contact our support team for assistance."
      };
    }
  }

  /**
   * Get PC build recommendations based on questionnaire
   * @param {Object} preferences - User's questionnaire answers
   * @returns {Promise<Object>} Build recommendations
   */
  async getBuildRecommendations(preferences) {
    try {
      const allProducts = await this.fetchProducts();
      
      // Filter out laptops for PC build recommendations
      const products = allProducts.filter(product => {
        const categoryName = product.categories?.name?.toLowerCase() || '';
        const productName = product.name.toLowerCase();
        // Exclude laptops and notebooks
        return !categoryName.includes('laptop') && 
               !categoryName.includes('notebook') &&
               !productName.includes('laptop') &&
               !productName.includes('notebook');
      });

      const systemPrompt = this.buildSystemPrompt(products, preferences);

      const userMessage = `Based on my preferences, please recommend a complete CUSTOM PC BUILD with individual components.

STRICT REQUIREMENTS:
- This is for a CUSTOM PC BUILD - DO NOT recommend laptops or pre-built systems
- ONLY use products from the "AVAILABLE PRODUCTS IN STOCK" list provided
- Use EXACT product names and prices as shown
- DO NOT invent any product names, prices, or specifications
- If a component category is missing, clearly state "Not available in current stock" and suggest which components ARE available
- Focus on recommending the best combination of available components

For each recommendation, use this exact format:
**[Component Type]: [Exact Product Name from list]**
Price: [Exact price from list]
Reason: [Why this product fits the requirements]

REQUIRED COMPONENTS FOR PC BUILD:
1. Processor (CPU)
2. Motherboard
3. Graphics Card (GPU) - if gaming
4. RAM (Memory)
5. Storage (SSD/HDD)
6. Power Supply (PSU)
7. Case (optional but recommended)
8. CPU Cooler (optional)

Calculate and show the total price at the end.`;

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      const recommendation = data.choices[0].message.content;

      return {
        success: true,
        recommendation,
        products
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        recommendation: "I apologize, but I couldn't generate recommendations at this time. Please try again or browse our products directly."
      };
    }
  }

  /**
   * Extract product recommendations from AI response
   * @param {string} aiResponse - AI's response text
   * @param {Array} availableProducts - All available products
   * @returns {Array} Array of recommended product IDs
   */
  extractRecommendedProducts(aiResponse, availableProducts) {
    const recommendedProducts = [];
    const lowerResponse = aiResponse.toLowerCase();

    // Common words that appear in product names but shouldn't trigger matches alone
    const commonWords = new Set([
      'gaming', 'wireless', 'mechanical', 'rgb', 'pro', 'plus', 'ultra',
      'advanced', 'premium', 'standard', 'basic', 'mini', 'max', 'lite',
      'black', 'white', 'silver', 'blue', 'red', 'green',
      'edition', 'series', 'model', 'version', 'gen', 'generation',
      'inch', 'inches', 'performance', 'portable', 'compact', 'desktop',
      'programming', 'coding', 'office', 'work', 'thanks', 'keyboard',
      'mouse', 'monitor', 'screen', 'display'
    ]);

    availableProducts.forEach(product => {
      const productName = product.name.toLowerCase();
      
      // STRICT MATCHING RULES:
      // 1. Full product name must be mentioned (at least 70% of words)
      // 2. OR exact brand + model number combination
      // 3. OR product is explicitly listed with price (₱)
      
      // Check for full product name match (exact)
      const fullNameMatch = lowerResponse.includes(productName);
      
      // Check for explicit price listing (e.g., "NuPhy Kick75 — ₱1,500")
      const pricePattern = new RegExp(`${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\—\\-]*₱`, 'i');
      const priceListingMatch = pricePattern.test(aiResponse);
      
      // Extract brand and model from product name
      const brandName = product.brands?.name?.toLowerCase();
      const hasBrandMatch = brandName && lowerResponse.includes(brandName);
      
      if (hasBrandMatch) {
        // Extract model/unique identifier (non-generic words only)
        const productWords = productName.split(/[\s\-_]+/);
        const uniqueWords = productWords.filter(word => 
          word.length >= 4 && 
          !commonWords.has(word) &&
          !/^(processor|cpu|gpu|graphics|card|motherboard|ram|memory|storage|ssd|hdd|power|supply|psu|case|cooling|cooler)$/i.test(word)
        );
        
        // Require at least 2 unique words from product name + brand
        const uniqueMatches = uniqueWords.filter(word => {
          // Escape special regex characters in the word
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const wordPattern = new RegExp(`\\b${escapedWord}\\b`, 'i');
          return wordPattern.test(aiResponse);
        });
        
        if (uniqueMatches.length >= 2) {
          recommendedProducts.push(product);
          return;
        }
      }
      
      // Match if full name or explicitly listed with price
      if (fullNameMatch || priceListingMatch) {
        recommendedProducts.push(product);
      }
    });

    return recommendedProducts;
  }

  /**
   * Verify user consent for AI assistant
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Whether user has consented
   */
  async verifyAIConsent(userId) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('ai_assistant')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // If no consent record, check if it's a new optional feature
        return true; // Fail open for backward compatibility
      }

      return data.ai_assistant === true;
    } catch (error) {
      return true; // Fail open for backward compatibility
    }
  }
}

export default new AIService();
