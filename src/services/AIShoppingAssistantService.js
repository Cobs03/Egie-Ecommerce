import { supabase } from '../lib/supabase';

/**
 * AI Shopping Assistant Service
 * Professional customer service AI for e-commerce store
 * 
 * Core Responsibilities:
 * - Product recommendations and discovery
 * - Price and stock inquiries
 * - Product comparisons
 * - Bundles and promotions
 * - Cart and order assistance
 * - General customer service
 */

class AIShoppingAssistantService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY;
    this.apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama-3.3-70b-versatile';
    
    // System prompt - Professional AI Shopping Assistant
    this.systemPrompt = `You are an AI shopping assistant for an online tech store. Your goal is to act as a friendly, professional, and helpful customer service representative, helping users with product recommendations, bundles, discounts, orders, and general store questions.

IMPORTANT RULES:
1. NEVER invent products, prices, stock, discounts, or order statuses. Only use data provided.
2. Always clarify missing information instead of guessing (e.g., budget, preferred brand, product type).
3. Never expose internal database names, IDs, or table structures.
4. Use natural, human-friendly language; do not be robotic.
5. Ask follow-up questions only when necessary.
6. Keep responses concise and helpful.

---

# STORE DATA YOU MAY RECEIVE:
- Products (name, price, stock, brand, specifications, variants, compatibility tags)
- Bundles (bundle name, included products, official price, discount)
- Brands (name, description)
- Categories
- Discounts and vouchers
- Cart contents
- Orders (number, status, payment, delivery type)
- Chat history
- User preferences

Use only the data provided. If a requested item or information is missing, politely ask the user for clarification.

---

# CORE BEHAVIORS

## 1️⃣ Product Recommendation
- Suggest products based on budget, purpose, and preferences if provided.
- Highlight key details: price, stock, specs, warranty, variants.
- Recommend up to 3 products per request.
- Ask clarifying questions if user info is missing.

## 2️⃣ Price & Stock Inquiry
- Provide exact prices and availability from provided data.
- If out of stock, mention clearly and offer alternatives if available.

## 3️⃣ Product Comparison
- Compare products using provided attributes (price, specs, warranty, brand).
- Use simple language.
- Provide a short recommendation based on the user's needs.

## 4️⃣ Bundles & Promotions
- Explain included items and discounts.
- Mention validity only if provided.
- Never assume eligibility without data.

## 5️⃣ Cart & Order Assistance
- Use provided cart or order data.
- Summarize cart items, order status, delivery type, payment method.
- Ask for login or details if data is missing.

## 6️⃣ General Customer Service
- Can answer shipping methods, payment methods, warranty, ordering guidance.
- If question is unrelated, politely redirect to store assistance.

---

# RESPONSE STYLE
- Friendly, professional, concise
- Customer-first mindset
- End with a helpful question or suggested next step`;
  }

  /**
   * Fetch all active products from database
   * @returns {Promise<Array>} Array of products with full details
   */
  async fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          stock_quantity,
          warranty,
          specifications,
          compatibility_tags,
          status,
          brands (
            id,
            name
          ),
          categories (
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
   * Fetch active bundles with products and discounts
   * @returns {Promise<Array>} Array of bundles
   */
  async fetchBundles() {
    try {
      const { data, error } = await supabase
        .from('bundles')
        .select(`
          id,
          name,
          description,
          discount_percentage,
          discount_type,
          is_active,
          bundle_products (
            quantity,
            products (
              id,
              name,
              price,
              brands (
                name
              )
            )
          )
        `)
        .eq('is_active', true);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Fetch active vouchers
   * @returns {Promise<Array>} Array of vouchers
   */
  async fetchVouchers() {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', now)
        .order('discount_value', { ascending: false });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Fetch user's cart items
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Cart items with product details
   */
  async fetchUserCart(userId) {
    try {
      if (!userId) return [];

      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (cartError || !cart) return [];

      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            stock_quantity,
            brands (
              name
            )
          )
        `)
        .eq('cart_id', cart.id);

      if (itemsError) {
        return [];
      }

      return items || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Fetch user's orders
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User orders
   */
  async fetchUserOrders(userId) {
    try {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          payment_status,
          payment_method,
          delivery_type,
          created_at,
          order_items (
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Build context-aware system prompt with store data
   * @param {Object} context - Store context (products, bundles, cart, orders)
   * @returns {string} Enhanced system prompt
   */
  buildContextualPrompt(context = {}) {
    let prompt = this.systemPrompt;

    // Add available products
    if (context.products && context.products.length > 0) {
      prompt += '\n\n## AVAILABLE PRODUCTS:\n';
      context.products.forEach(product => {
        prompt += `\n**${product.name}**\n`;
        prompt += `- Price: ₱${product.price.toLocaleString()}\n`;
        prompt += `- Brand: ${product.brands?.name || 'N/A'}\n`;
        prompt += `- Stock: ${product.stock_quantity} units\n`;
        prompt += `- Category: ${product.categories?.name || 'N/A'}\n`;
        if (product.warranty) {
          prompt += `- Warranty: ${product.warranty}\n`;
        }
        if (product.description) {
          prompt += `- Description: ${product.description}\n`;
        }
        if (product.specifications && Object.keys(product.specifications).length > 0) {
          prompt += `- Specs: ${JSON.stringify(product.specifications)}\n`;
        }
      });
    }

    // Add active bundles
    if (context.bundles && context.bundles.length > 0) {
      prompt += '\n\n## AVAILABLE BUNDLES:\n';
      context.bundles.forEach(bundle => {
        prompt += `\n**${bundle.name}**\n`;
        prompt += `- Description: ${bundle.description || 'N/A'}\n`;
        prompt += `- Discount: ${bundle.discount_percentage}% off\n`;
        prompt += `- Includes:\n`;
        bundle.bundle_products?.forEach(bp => {
          prompt += `  • ${bp.products.name} (x${bp.quantity}) - ₱${bp.products.price.toLocaleString()}\n`;
        });
      });
    }

    // Add active vouchers
    if (context.vouchers && context.vouchers.length > 0) {
      prompt += '\n\n## ACTIVE VOUCHERS:\n';
      context.vouchers.forEach(voucher => {
        prompt += `\n**${voucher.code}**\n`;
        prompt += `- Discount: ${voucher.discount_type === 'percentage' ? voucher.discount_value + '%' : '₱' + voucher.discount_value.toLocaleString()}\n`;
        if (voucher.min_purchase_amount) {
          prompt += `- Minimum Purchase: ₱${voucher.min_purchase_amount.toLocaleString()}\n`;
        }
        if (voucher.max_discount_amount) {
          prompt += `- Maximum Discount: ₱${voucher.max_discount_amount.toLocaleString()}\n`;
        }
        prompt += `- Valid Until: ${new Date(voucher.valid_until).toLocaleDateString()}\n`;
      });
    }

    // Add user's cart
    if (context.cart && context.cart.length > 0) {
      prompt += '\n\n## USER\'S CURRENT CART:\n';
      let cartTotal = 0;
      context.cart.forEach(item => {
        const itemTotal = item.products.price * item.quantity;
        cartTotal += itemTotal;
        prompt += `- ${item.products.name} (x${item.quantity}) - ₱${itemTotal.toLocaleString()}\n`;
      });
      prompt += `\n**Cart Total: ₱${cartTotal.toLocaleString()}**\n`;
    }

    // Add user's recent orders
    if (context.orders && context.orders.length > 0) {
      prompt += '\n\n## USER\'S RECENT ORDERS:\n';
      context.orders.slice(0, 3).forEach(order => {
        prompt += `\n**Order #${order.order_number}**\n`;
        prompt += `- Status: ${order.status}\n`;
        prompt += `- Payment: ${order.payment_status} (${order.payment_method})\n`;
        prompt += `- Delivery: ${order.delivery_type}\n`;
        prompt += `- Total: ₱${order.total_amount.toLocaleString()}\n`;
        prompt += `- Date: ${new Date(order.created_at).toLocaleDateString()}\n`;
      });
    }

    return prompt;
  }

  /**
   * Send message to AI assistant and get response
   * @param {Array} messages - Conversation history
   * @param {Object} context - Additional context (userId, products, etc.)
   * @returns {Promise<Object>} AI response
   */
  async chat(messages, context = {}) {
    try {
      // Gather store context
      const storeContext = {
        products: context.products || await this.fetchProducts(),
        bundles: context.bundles || await this.fetchBundles(),
        vouchers: context.vouchers || await this.fetchVouchers(),
        cart: context.userId ? await this.fetchUserCart(context.userId) : [],
        orders: context.userId ? await this.fetchUserOrders(context.userId) : []
      };

      // Build contextual prompt
      const systemPrompt = this.buildContextualPrompt(storeContext);

      // Prepare messages for API
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
          content: msg.content || msg.text || msg.message
        }))
      ];

      // Call AI API
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
          max_tokens: 1024,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'AI service unavailable');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      return {
        success: true,
        message: assistantMessage,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        usage: data.usage
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or feel free to browse our products directly.",
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get product recommendations based on user query
   * @param {string} query - User's search query or requirements
   * @param {Object} filters - Optional filters (budget, category, brand)
   * @returns {Promise<Object>} Recommendations
   */
  async getRecommendations(query, filters = {}) {
    try {
      let products = await this.fetchProducts();

      // Apply filters
      if (filters.category) {
        products = products.filter(p => 
          p.categories?.name?.toLowerCase().includes(filters.category.toLowerCase())
        );
      }

      if (filters.brand) {
        products = products.filter(p => 
          p.brands?.name?.toLowerCase().includes(filters.brand.toLowerCase())
        );
      }

      if (filters.maxPrice) {
        products = products.filter(p => p.price <= filters.maxPrice);
      }

      if (filters.minPrice) {
        products = products.filter(p => p.price >= filters.minPrice);
      }

      // Get AI recommendation
      const messages = [
        {
          role: 'user',
          content: `I'm looking for: ${query}${filters.maxPrice ? `. My budget is up to ₱${filters.maxPrice.toLocaleString()}.` : ''}`
        }
      ];

      const response = await this.chat(messages, { products });

      return {
        success: response.success,
        recommendation: response.message,
        products: products.slice(0, 10) // Return top 10 matching products
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        recommendation: "I couldn't generate recommendations at this time. Please try browsing our products directly."
      };
    }
  }

  /**
   * Compare multiple products
   * @param {Array<string>} productIds - Array of product IDs to compare
   * @returns {Promise<Object>} Comparison result
   */
  async compareProducts(productIds) {
    try {
      if (!productIds || productIds.length < 2) {
        return {
          success: false,
          error: 'Please provide at least 2 products to compare'
        };
      }

      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          stock_quantity,
          warranty,
          specifications,
          brands (name),
          categories (name)
        `)
        .in('id', productIds);

      if (error || !products || products.length < 2) {
        return {
          success: false,
          error: 'Could not fetch products for comparison'
        };
      }

      // Ask AI to compare
      const messages = [
        {
          role: 'user',
          content: `Please compare these products and help me choose the best one:\n${products.map((p, i) => 
            `${i + 1}. ${p.name} - ₱${p.price.toLocaleString()}`
          ).join('\n')}`
        }
      ];

      const response = await this.chat(messages, { products });

      return {
        success: response.success,
        comparison: response.message,
        products
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new AIShoppingAssistantService();
