import React, { createContext, useContext, useState, useEffect } from 'react';
import CartService from '../services/CartService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Order checkout details
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState(null); // 'local_delivery' or 'store_pickup'

  // Load cart when user logs in
  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadCart();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadCart();
      } else {
        // Clear cart when user logs out
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
        setOrderNotes('');
        setDeliveryType(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Load cart items from database
   */
  const loadCart = async () => {
    setLoading(true);
    try {
      const { data, error, totalItems, totalPrice } = await CartService.getCartItems();
      
      if (error) {
        console.error('Error loading cart:', error);
        return;
      }

      setCartItems(data || []);
      setCartCount(totalItems || 0);
      setCartTotal(totalPrice || 0);
    } catch (error) {
      console.error('Error in loadCart:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add item to cart
   */
  const addToCart = async ({ product_id, product_name, variant_name, price, quantity = 1 }) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return { success: false, error: 'Not authenticated' };
    }

    setLoading(true);
    try {
      const { data, error } = await CartService.addToCart({
        product_id,
        variant_name,
        price,
        quantity
      });

      if (error) {
        toast.error('Failed to add to cart', {
          description: error
        });
        return { success: false, error };
      }

      // Reload cart to get updated data
      await loadCart();

      toast.success('Added to cart!', {
        description: variant_name 
          ? `${product_name} (${variant_name})` 
          : product_name,
        duration: 3000,
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update item quantity
   */
  const updateQuantity = async (cart_item_id, quantity) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    setLoading(true);
    try {
      const { data, error } = await CartService.updateQuantity(cart_item_id, quantity);

      if (error) {
        toast.error('Failed to update quantity', {
          description: error
        });
        return { success: false, error };
      }

      // Reload cart
      await loadCart();

      return { success: true, data };
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = async (cart_item_id) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    console.log('CartContext: Removing item with ID:', cart_item_id);
    setLoading(true);
    try {
      const { data, error } = await CartService.removeFromCart(cart_item_id);

      if (error) {
        console.error('CartContext: Error removing item:', error);
        toast.error('Failed to remove item', {
          description: error
        });
        return { success: false, error };
      }

      console.log('CartContext: Item removed successfully, reloading cart...');
      // Reload cart
      await loadCart();

      toast.success('Item removed from cart');

      return { success: true, data };
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    if (!user) return { success: false, error: 'Not authenticated' };

    setLoading(true);
    try {
      const { data, error } = await CartService.clearCart();

      if (error) {
        toast.error('Failed to clear cart', {
          description: error
        });
        return { success: false, error };
      }

      // Clear local state
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      setOrderNotes('');
      setDeliveryType(null);

      toast.success('Cart cleared');

      return { success: true, data };
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    user,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    // Order checkout data
    orderNotes,
    setOrderNotes,
    deliveryType,
    setDeliveryType,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
