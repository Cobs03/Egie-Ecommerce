import { supabase } from '../lib/supabase';

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
   * Normalize category keywords to handle variations
   * @param {string} keyword - User's search term
   * @returns {Array<string>} Array of normalized keywords
   */
  normalizeCategoryKeyword(keyword) {
    const normalized = keyword.toLowerCase().trim();
    
    // Map common variations to standard terms
    const categoryMap = {
      // RAM variations
      'ram': ['ram', 'memory', 'ddr', 'dimm'],
      'rams': ['ram', 'memory', 'ddr', 'dimm'],
      'memory': ['ram', 'memory', 'ddr', 'dimm'],
      'ddr': ['ram', 'memory', 'ddr', 'dimm'],
      'ddr4': ['ram', 'memory', 'ddr4', 'ddr'],
      'ddr5': ['ram', 'memory', 'ddr5', 'ddr'],
      
      // Processor variations
      'processor': ['processor', 'cpu', 'intel', 'amd', 'ryzen'],
      'processors': ['processor', 'cpu', 'intel', 'amd', 'ryzen'],
      'cpu': ['processor', 'cpu', 'intel', 'amd', 'ryzen'],
      'cpus': ['processor', 'cpu', 'intel', 'amd', 'ryzen'],
      
      // GPU variations
      'gpu': ['gpu', 'graphics', 'video card', 'nvidia', 'amd', 'rtx', 'gtx'],
      'gpus': ['gpu', 'graphics', 'video card', 'nvidia', 'amd', 'rtx', 'gtx'],
      'graphics': ['gpu', 'graphics', 'video card', 'nvidia', 'amd'],
      'video card': ['gpu', 'graphics', 'video card'],
      
      // Storage variations
      'ssd': ['ssd', 'storage', 'nvme', 'm.2', 'solid state'],
      'hdd': ['hdd', 'storage', 'hard drive'],
      'storage': ['ssd', 'hdd', 'storage', 'nvme', 'm.2'],
      
      // Motherboard variations
      'motherboard': ['motherboard', 'mobo', 'mainboard'],
      'mobo': ['motherboard', 'mobo', 'mainboard'],
      
      // Power Supply variations
      'psu': ['power supply', 'psu', 'power'],
      'power supply': ['power supply', 'psu', 'power'],
      'power': ['power supply', 'psu', 'power'],
      
      // Case variations
      'case': ['case', 'chassis', 'tower'],
      'cases': ['case', 'chassis', 'tower'],
      
      // Laptop variations
      'laptop': ['laptop', 'notebook'],
      'laptops': ['laptop', 'notebook'],
      'notebook': ['laptop', 'notebook'],
    };
    
    return categoryMap[normalized] || [normalized];
  }

  /**
   * Fetch products by category
   * @param {string} category - Category name or type
   * @returns {Promise<Array>} Array of products
   */
  async fetchProductsByCategory(category) {
    try {
      console.log('🔍 Searching for products with keyword:', category);
      
      // First, try to match by category field for exact category matches
      const categoryLower = category.toLowerCase();

      // Check if searching for laptops specifically
      const isLaptopSearch = ['laptop', 'laptops', 'notebook'].includes(categoryLower);
      
      // Check if searching for PC components (not laptops)
      const isComponentSearch = ['processor', 'processors', 'cpu', 'gpu', 'graphics', 'ram', 'memory', 
                                  'motherboard', 'ssd', 'hdd', 'storage', 'psu', 'power supply', 
                                  'case', 'cooler', 'fan'].includes(categoryLower);

      if (isLaptopSearch) {
        // Strict laptop-only search
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
          .or(`name.ilike.%laptop%,description.ilike.%laptop%`)
          .not('name', 'ilike', '%processor%')
          .not('name', 'ilike', '%cpu%')
          .not('name', 'ilike', '%gpu%')
          .not('name', 'ilike', '%ram%')
          .not('name', 'ilike', '%ssd%')
          .not('name', 'ilike', '%motherboard%')
          .order('price', { ascending: true });

        if (!error && data && data.length > 0) {
          console.log('✅ Strict laptop search found:', data.length, 'products');
          return data;
        }
      }

      // Enhanced search: Check name, description, category, and use OR logic
      let query = supabase
        .from('products')
        .select(`
          *,
          brands (
            id,
            name
          )
        `)
        .eq('status', 'active')
        .or(`name.ilike.%${category}%,description.ilike.%${category}%`);
      
      // If searching for components, exclude laptops
      if (isComponentSearch) {
        query = query
          .not('name', 'ilike', '%laptop%')
          .not('name', 'ilike', '%notebook%')
          .not('description', 'ilike', '%laptop%');
      }
      
      const { data, error } = await query.order('price', { ascending: true });

      if (error) {
        console.error('Error fetching products by category:', error);
        
        // Fallback: Try just name search if OR query fails
        console.log('⚠️ Advanced search failed, trying simple name search...');
        let fallbackQuery = supabase
          .from('products')
          .select(`
            *,
            brands (
              id,
              name
            )
          `)
          .eq('status', 'active')
          .ilike('name', `%${category}%`);
        
        // Apply same exclusions for components
        if (isComponentSearch) {
          fallbackQuery = fallbackQuery
            .not('name', 'ilike', '%laptop%')
            .not('name', 'ilike', '%notebook%');
        }
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery
          .order('price', { ascending: true });
        
        if (fallbackError) {
          console.error('Fallback search also failed:', fallbackError);
          return [];
        }
        
        console.log('✅ Fallback found:', fallbackData?.length || 0, 'products');
        return fallbackData || [];
      }

      console.log('✅ Enhanced search found:', data?.length || 0, 'products');
      return data || [];
    } catch (error) {
      console.error('Error in fetchProductsByCategory:', error);
      return [];
    }
  }

  /**
   * Build system prompt with product context
   * @param {Array} products - Available products
   * @param {Object} userPreferences - User's questionnaire answers
   * @returns {string} System prompt
   */
  buildSystemPrompt(products, userPreferences = null) {
    let systemPrompt = `You are an expert PC building assistant for Egie GameShop, a computer hardware store in the Philippines.

CRITICAL RULES:
1. ONLY recommend products from the AVAILABLE PRODUCTS list below
2. NEVER invent product names, prices, or specifications
3. Use EXACT product names and prices as listed
4. If a component type is not available, say "Not available in current stock"
5. DO NOT make assumptions about product specifications not listed

AVAILABLE PRODUCTS IN STOCK:
${products.map(p => `
- ${p.name}
  Price: ₱${p.price.toLocaleString()}
  Brand: ${p.brands?.name || 'N/A'}
  Stock: ${p.stock_quantity} units
  ${p.description ? `Description: ${p.description}` : ''}
`).join('\n')}

GUIDELINES:
- This is for CUSTOM PC BUILDS ONLY - exclude laptops and pre-built systems from recommendations
- Consider budget constraints - all prices are in Philippine Pesos (₱)
- Only suggest products that are actually in stock above
- Provide exact prices from the list
- Explain compatibility between components
- If critical components are missing, be honest and suggest visiting the store or waiting for restock
- Be professional and helpful
- If the user asks about a definition, specification, or general PC concept (e.g., "what is clock speed"), provide a clear explanation using your technical knowledge and then relate it to any relevant in-stock products or categories when possible.

`;

    if (userPreferences) {
      // Extract processor preference from preferredBrands if not explicitly set
      let processorPref = userPreferences.processorPreference || 'No preference';
      if (!userPreferences.processorPreference && userPreferences.preferredBrands) {
        const hasIntel = userPreferences.preferredBrands.includes('Intel');
        const hasAMD = userPreferences.preferredBrands.includes('AMD');
        if (hasIntel && !hasAMD) processorPref = 'Intel';
        else if (hasAMD && !hasIntel) processorPref = 'AMD';
        else if (hasIntel && hasAMD) processorPref = 'Intel or AMD';
      }

      systemPrompt += `\nCUSTOMER PREFERENCES:
- Purpose: ${userPreferences.pcPurpose?.join(', ') || 'General use'}
- Budget Range: ${userPreferences.budgetRange || 'Not specified'}
- Preferred Brands: ${userPreferences.preferredBrands?.join(', ') || 'No preference'}
- Processor: ${processorPref}
- Monitor Resolution: ${userPreferences.monitorResolution || 'Not specified'}
- Gaming Genres: ${userPreferences.gameGenres || 'Not specified'}
- Ray Tracing: ${userPreferences.rayTracing || 'Not specified'}
- Storage Preference: ${userPreferences.storagePreference || 'Not specified'}
- Upgradeability: ${userPreferences.upgradeability || 'Not specified'}
- Aesthetics: ${userPreferences.aesthetics || 'Not specified'}
- Additional Needs: ${userPreferences.additionalNeeds?.join(', ') || 'None specified'}

IMPORTANT: Match recommendations to these preferences BUT only use products from the available list above.
${userPreferences.otherPurpose ? `\nCustomer Note (Purpose): ${userPreferences.otherPurpose}` : ''}
${userPreferences.otherNeeds ? `\nCustomer Note (Needs): ${userPreferences.otherNeeds}` : ''}`;
    }

    return systemPrompt;
  }

  /**
   * Send message to AI and get response
   * @param {Array} messages - Conversation history
   * @param {Object} userPreferences - User's questionnaire answers (optional)
   * @returns {Promise<Object>} AI response
   */
  async chat(messages, userPreferences = null) {
    try {
      // Fetch current products
      const products = await this.fetchProducts();

      if (products.length === 0) {
        return {
          success: false,
          error: 'No products available in inventory',
          message: "I apologize, but I'm having trouble accessing our product inventory right now. Please try again later or contact our support team."
        };
      }

      // Build system prompt with product context
      const systemPrompt = this.buildSystemPrompt(products, userPreferences);

      // Prepare messages for API
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      ];

      // Call Groq API
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

      return {
        success: true,
        message: aiMessage,
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

    availableProducts.forEach(product => {
      const productName = product.name.toLowerCase();
      
      // Split product name into meaningful parts (remove common words)
      const nameParts = productName
        .replace(/\b(processor|cpu|gpu|graphics|card|motherboard|ram|memory|storage|ssd|hdd|power|supply|psu|case|cooling|cooler)\b/gi, '')
        .split(/[\s\-_]+/)
        .filter(part => part.length > 2); // Only keep parts longer than 2 chars
      
      // Check if product name or significant parts are mentioned
      const fullNameMatch = lowerResponse.includes(productName);
      const partialMatch = nameParts.length > 0 && 
        nameParts.some(part => part.length > 3 && lowerResponse.includes(part));
      
      // Also check brand + key model number
      const brandMatch = product.brands?.name && 
        lowerResponse.includes(product.brands.name.toLowerCase());
      
      if (fullNameMatch || (brandMatch && partialMatch)) {
        recommendedProducts.push(product);
      }
    });

    return recommendedProducts;
  }
}

export default new AIService();
