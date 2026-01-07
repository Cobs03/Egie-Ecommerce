import { supabase } from '../lib/supabase';

/**
 * CartService - Shopping Cart Management
 * 
 * Features:
 * - Add items to cart with variant support
 * - Update quantities
 * - Remove items
 * - Get cart items with product details
 * - Clear entire cart
 * - Each user has their own cart (RLS enforced)
 */

class CartService {
  
  /**
   * Get or create cart for current user
   * @returns {Object} { data: { cart_id }, error }
   */
  async getOrCreateCart() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Try to get existing cart
      const { data: existingCart, error: fetchError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingCart) {
        return { data: { cart_id: existingCart.id }, error: null };
      }

      // Create new cart if doesn't exist
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .single();

      if (createError) {
        return { data: null, error: createError.message };
      }

      return { data: { cart_id: newCart.id }, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Add item to cart (or update quantity if already exists)
   * @param {Object} params - { product_id, variant_name, price, quantity }
   * @returns {Object} { data, error }
   */
  async addToCart({ product_id, variant_name = null, price, quantity = 1 }) {
    try {
      // Get or create cart
      const { data: cartData, error: cartError } = await this.getOrCreateCart();
      if (cartError) return { data: null, error: cartError };

      const cart_id = cartData.cart_id;

      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart_id)
        .eq('product_id', product_id)
        .eq('variant_name', variant_name || '')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        return { data: null, error: checkError.message };
      }

      // If item exists, update quantity
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        const { data, error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data, error: null };
      }

      // Add new item to cart
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id,
          product_id,
          variant_name: variant_name || null,
          quantity,
          price_at_add: price
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all cart items for current user with product details
   * @returns {Object} { data: [items], error, totalItems, totalPrice }
   */
  async getCartItems() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: [], error: 'User not authenticated', totalItems: 0, totalPrice: 0 };
      }

      // Get cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cartError || !cart) {
        return { data: [], error: null, totalItems: 0, totalPrice: 0 };
      }

      // Get cart items with product details
      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          variant_name,
          quantity,
          price_at_add,
          created_at,
          products (
            id,
            name,
            price,
            images,
            stock_quantity,
            variants
          )
        `)
        .eq('cart_id', cart.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message, totalItems: 0, totalPrice: 0 };
      }

      // Calculate totals
      const totalItems = items.length; // Count unique items, not total quantity
      const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.price_at_add), 0);

      // Format items with product details
      const formattedItems = items.map(item => {
        // Extract image - images can be array of strings or array of objects with url property
        let imageUrl = '/placeholder.png';
        if (item.products?.images && item.products.images.length > 0) {
          const firstImage = item.products.images[0];
          // Check if it's a string or object with url property
          imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url || '/placeholder.png';
        }

        return {
          id: item.id,
          product_id: item.product_id,
          product_name: item.products?.name || 'Unknown Product',
          product_image: imageUrl,
          variant_name: item.variant_name,
          quantity: item.quantity,
          price_at_add: item.price_at_add,
          current_price: item.products?.price || item.price_at_add,
          stock_quantity: item.products?.stock_quantity || 0,
          subtotal: item.quantity * item.price_at_add,
          created_at: item.created_at
        };
      });

      return { 
        data: formattedItems, 
        error: null, 
        totalItems, 
        totalPrice 
      };
    } catch (error) {
      return { data: [], error: error.message, totalItems: 0, totalPrice: 0 };
    }
  }

  /**
   * Update item quantity in cart
   * @param {string} cart_item_id - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Object} { data, error }
   */
  async updateQuantity(cart_item_id, quantity) {
    try {
      if (quantity < 1) {
        return { data: null, error: 'Quantity must be at least 1' };
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cart_item_id)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Remove item from cart
   * @param {string} cart_item_id - Cart item ID
   * @returns {Object} { data, error }
   */
  async removeFromCart(cart_item_id) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cart_item_id)
        .select();

      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Clear all items from cart
   * @returns {Object} { data, error }
   */
  async clearCart() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Get cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cartError || !cart) {
        return { data: null, error: 'Cart not found' };
      }

      // Delete all items
      const { data, error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)
        .select();

      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Remove multiple items from cart (used for checkout)
   * @param {Array<string>} cart_item_ids - Array of cart item IDs to remove
   * @returns {Object} { data, error }
   */
  async removeMultipleItems(cart_item_ids) {
    try {
      if (!cart_item_ids || cart_item_ids.length === 0) {
        return { data: null, error: 'No items to remove' };
      }

      const { data, error } = await supabase
        .from('cart_items')
        .delete()
        .in('id', cart_item_ids)
        .select();

      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get cart item count for current user
   * @returns {Object} { data: { count }, error }
   */
  async getCartCount() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: { count: 0 }, error: null };
      }

      // Get cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cartError || !cart) {
        return { data: { count: 0 }, error: null };
      }

      // Get count of unique items (not total quantity)
      const { data, error, count } = await supabase
        .from('cart_items')
        .select('id', { count: 'exact', head: false })
        .eq('cart_id', cart.id);

      if (error) return { data: { count: 0 }, error: error.message };

      return { data: { count: count || 0 }, error: null };
    } catch (error) {
      return { data: { count: 0 }, error: error.message };
    }
  }
}

export default new CartService();
