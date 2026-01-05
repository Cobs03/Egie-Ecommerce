import { supabase } from '../lib/supabase';
import ThirdPartyAuditService from './ThirdPartyAuditService';
import PrivacyUtils from '../utils/PrivacyUtils';

/**
 * AIService - AI Shopping Assistant Service
 *
 * Features:
 * - Chat with AI assistant
 * - Get product recommendations based on preferences
 * - Fetch product data from Supabase
 * - Generate personalized PC build suggestions
 */

class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY;
    this.apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama-3.3-70b-versatile'; // Latest Llama 3.3 model (Nov 2024)
    // Alternative models (all active as of Nov 2024):
    // 'llama-3.1-8b-instant' - Fastest
    // 'llama-3.2-90b-text-preview' - Most powerful
    // 'mixtral-8x7b-32768' - Good for long context
    // 'gemma2-9b-it' - Balanced performance
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
        console.error('Error fetching products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchProducts:', error);
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
        console.error('Error fetching product categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchProductCategories:', error);
      return [];
    }
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
        console.log('🧠 Detected Intent:', intent);
        return intent;
      } catch (parseError) {
        console.error('Failed to parse intent JSON:', cleanedIntent);
        // Fallback to basic intent with simple keyword extraction
        return this.createFallbackIntent(userMessage);
      }
    } catch (error) {
      console.error('Error detecting intent:', error);
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
      console.log('🔍 Smart search with intent:', intent);
      
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
        console.log('📋 Simple/basic search detected, using direct filter');
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
        console.warn('AI scoring failed, using fallback search');
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
        
        console.log('✅ AI matched:', matchedProducts.length, 'products');
        return matchedProducts;
      } catch (parseError) {
        console.warn('Failed to parse AI results, using fallback');
        return this.fallbackSearch(allProducts, intent);
      }
    } catch (error) {
      console.error('Error in searchProductsByIntent:', error);
      return this.fallbackSearch(await this.fetchProducts(), intent);
    }
  }

  /**
   * Fallback search using traditional text matching (backup when AI fails)
   * @param {Array} products - All products
   * @param {Object} intent - Intent object
   * @returns {Array} Filtered products
   */
  fallbackSearch(products, intent) {
    console.log('📋 Using fallback text search for:', intent.category || 'all');
    
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
      console.log(`🔄 Normalized category: "${intent.category}" → "${categoryLower}"`);
      
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
      
      console.log(`✅ Category filter "${categoryLower}" found ${filtered.length} products`);
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
        console.log(`✅ After keyword filter: ${filtered.length} products`);
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
      
      // Default: sort by price ascending (most people prefer to see cheaper options first)
      return a.price - b.price;
    });

    console.log(`📦 Final results: ${filtered.length} products`);
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
   * Build intelligent system prompt with intent awareness
   * @param {Array} products - Relevant products based on intent
   * @param {Object} userPreferences - User's questionnaire answers
   * @param {Object} intent - Detected user intent
   * @returns {string} System prompt
   */
  buildIntelligentSystemPrompt(products, userPreferences = null, intent = null) {
    let systemPrompt = `You are a professional AI shopping assistant for Egie GameShop, a computer hardware store in the Philippines. You're trained on how e-commerce AI shopping assistants work.

🎯 DETECTED USER INTENT:
${intent ? `
- What they want: ${intent.intentType}
- Looking for: ${intent.category || 'browsing'}
- Budget: ${intent.budget?.max ? `Up to ₱${intent.budget.max.toLocaleString()}` : 'Not specified'}
- Brands: ${intent.brands.length > 0 ? intent.brands.join(', ') : 'No preference'}
- Features: ${intent.features.length > 0 ? intent.features.join(', ') : 'Standard'}
- Use case: ${intent.useCase || 'General'}
` : 'General inquiry'}

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
${products.slice(0, 30).map(p => `
- ${p.name}
  Price: ₱${p.price.toLocaleString()}
  Brand: ${p.brands?.name || 'N/A'}
  Stock: ${p.stock_quantity > 0 ? `${p.stock_quantity} units` : 'OUT OF STOCK'}
  ${p.description ? `Info: ${p.description.substring(0, 100)}...` : ''}
`).join('\n')}

${products.length > 30 ? `... and ${products.length - 30} more products available\n` : ''}
`;

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

    systemPrompt += `\n\n⚡ RESPONSE FORMAT:
1. Brief acknowledgment (1 line)
2. If recommending products:
   - **Product Name**
   - Price: ₱X,XXX
   - Why: [One-line reason it fits their needs]
   - Stock: Available/Limited/Out of Stock
3. If asking for clarification: Keep it to ONE short question
4. Always be helpful, honest, and conversational

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

      // Step 1: Detect intent using AI (understand what user wants)
      const intent = await this.detectIntent(lastUserMessage.text);
      console.log('💡 Understanding:', intent);

      // Step 2: Fetch relevant products based on intent
      let relevantProducts = [];
      let allProducts = [];
      
      if (intent.intentType === 'product_search' || 
          intent.intentType === 'recommendation' || 
          intent.intentType === 'comparison' ||
          intent.intentType === 'build_help') {
        
        // Use intelligent search
        relevantProducts = await this.searchProductsByIntent(intent);
        allProducts = await this.fetchProducts();
        
        console.log('🎯 Found', relevantProducts.length, 'relevant products for intent');
      } else {
        // For general questions, still load products for context
        allProducts = await this.fetchProducts();
        relevantProducts = allProducts.slice(0, 10); // Show sample
      }

      // Step 3: Build enhanced system prompt with intent awareness
      const systemPrompt = this.buildIntelligentSystemPrompt(
        relevantProducts.length > 0 ? relevantProducts : allProducts, 
        userPreferences,
        intent
      );

      // Step 4: Prepare conversation with context
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-6).map(msg => ({ // Keep last 6 messages for context
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      ];

      // Step 5: Call AI with intelligent context
      const response = await fetch(this.apiEndpoint, {
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Groq API error:', errorData);
        throw new Error(errorData.error?.message || 'API request failed');
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
      console.error('Error in AI chat:', error);
      return {
        success: false,
        error: error.message,
        message: "I apologize, but I'm experiencing technical difficulties. Please try again or contact our support team for assistance."
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
      console.error('Error getting build recommendations:', error);
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
          const wordPattern = new RegExp(`\\b${word}\\b`, 'i');
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

    console.log('🔍 Product extraction:', {
      totalAvailable: availableProducts.length,
      extracted: recommendedProducts.length,
      products: recommendedProducts.map(p => p.name)
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
        console.warn('No AI consent record found for user:', userId);
        return true; // Fail open for backward compatibility
      }

      return data.ai_assistant === true;
    } catch (error) {
      console.error('Error verifying AI consent:', error);
      return true; // Fail open for backward compatibility
    }
  }
}

export default new AIService();
