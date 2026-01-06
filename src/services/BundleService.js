import { supabase } from '../lib/supabase';

/**
 * BundleService - Manages pre-configured PC build bundles from database
 * Fetches bundles created by admin and allows adding entire builds to cart
 */

class BundleService {
  /**
   * Fetch all available bundles from database
   */
  static async fetchBundles() {
    try {
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      // Filter for active bundles (database uses "active" not "available")
      const availableBundles = data?.filter(bundle => 
        bundle.status && bundle.status.toLowerCase() === 'active'
      ) || [];
      
      // Get product counts for each bundle
      for (const bundle of availableBundles) {
        const { data: products, error: productsError } = await supabase
          .from('bundle_products')
          .select('id')
          .eq('bundle_id', bundle.id);
        
        bundle.product_count = products?.length || 0;
      }
      
      return { data: availableBundles, error: null };
    } catch (error) {
      return { data: [], error: error.message };
    }
  }

  /**
   * Fetch a single bundle with all its products
   */
  static async fetchBundleDetails(bundleId) {
    try {
      // First get the bundle info
      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .select('*')
        .eq('id', bundleId)
        .single();

      if (bundleError) {
        return { data: null, error: bundleError.message };
      }

      // Get bundle products - admin stores product info directly, no product_id
      const { data: bundleProducts, error: productsError } = await supabase
        .from('bundle_products')
        .select('*')
        .eq('bundle_id', bundleId)
        .order('sort_order', { ascending: true });

      if (productsError) {
        // Return bundle without products
        bundle.products = [];
        bundle.productCount = 0;
        return { data: bundle, error: null };
      }

      // Transform bundle_products to match product format
      if (bundleProducts && bundleProducts.length > 0) {
        bundle.products = bundleProducts.map(bp => ({
          id: bp.id, // Use bundle_product id as fallback
          name: bp.product_name,
          code: bp.product_code,
          price: bp.product_price,
          images: bp.product_image ? [bp.product_image] : [],
          image: bp.product_image
        }));
      } else {
        bundle.products = [];
      }

      bundle.productCount = bundle.products.length;
      return { data: bundle, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Add entire bundle to cart
   */
  static async addBundleToCart(bundleId) {
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get bundle details with products
      const { data: bundle, error: bundleError } = await this.fetchBundleDetails(bundleId);
      
      if (bundleError || !bundle) {
        return { success: false, error: bundleError || 'Bundle not found' };
      }

      if (!bundle.products || bundle.products.length === 0) {
        return { success: false, error: 'Bundle has no products' };
      }

      // Find actual product IDs by matching names/codes
      // bundle_products stores names, not IDs, so we need to look them up
      const productNames = bundle.products.map(p => p.name);
      
      const { data: actualProducts, error: lookupError } = await supabase
        .from('products')
        .select('id, name, price')
        .in('name', productNames);

      if (lookupError) {
        return { success: false, error: 'Could not find bundle products in inventory: ' + lookupError.message };
      }

      if (!actualProducts || actualProducts.length === 0) {
        return { success: false, error: 'Bundle products not found in current inventory' };
      }

      // Get user's cart
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Create cart if doesn't exist
      if (cartError || !cart) {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) {
          return { success: false, error: 'Failed to create cart: ' + createError.message };
        }
        cart = newCart;
      }

      // Check for existing cart items to avoid duplicates
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('cart_id', cart.id);

      // Add or update each product from bundle to cart
      for (const product of actualProducts) {
        const existingItem = existingItems?.find(item => item.product_id === product.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + 1 })
            .eq('cart_id', cart.id)
            .eq('product_id', product.id);

          if (updateError) {
          }
        } else {
          // Insert new item
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              cart_id: cart.id,
              product_id: product.id,
              quantity: 1
            });

          if (insertError) {
            return { success: false, error: 'Failed to add product to cart: ' + insertError.message };
          }
        }
      }

      return { success: true, itemsAdded: actualProducts.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Format bundle for AI display
   */
  static formatBundleForDisplay(bundle) {
    return {
      id: bundle.id,
      name: bundle.bundle_name || bundle.name,
      code: bundle.code,
      price: parseFloat(bundle.official_price || bundle.total_price) || 0,
      originalPrice: parseFloat(bundle.official_price || bundle.total_price) || 0,
      description: bundle.description || `Complete ${bundle.bundle_name || bundle.name} Package`,
      productCount: bundle.product_count || 0,
      image: bundle.image || bundle.images || '/placeholder-bundle.png',
      status: bundle.status
    };
  }
}

export default BundleService;
