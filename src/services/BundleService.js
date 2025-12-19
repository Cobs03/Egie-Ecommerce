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
      console.log('🔍 Fetching bundles from database...');
      
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching bundles:', error);
        return { data: [], error: error.message };
      }

      console.log('✅ Fetched bundles:', data);
      console.log('📊 Bundle count:', data?.length || 0);
      
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
      
      console.log('✅ Available bundles:', availableBundles.length);
      console.log('📦 Available bundle details:', availableBundles);

      return { data: availableBundles, error: null };
    } catch (error) {
      console.error('❌ Error in fetchBundles:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Fetch a single bundle with all its products
   */
  static async fetchBundleDetails(bundleId) {
    try {
      console.log('🔍 Fetching bundle details for:', bundleId);
      
      // First get the bundle info
      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .select('*')
        .eq('id', bundleId)
        .single();

      if (bundleError) {
        console.error('❌ Error fetching bundle:', bundleError);
        return { data: null, error: bundleError.message };
      }

      console.log('✅ Bundle fetched:', bundle);

      // Get bundle products - admin stores product info directly, no product_id
      const { data: bundleProducts, error: productsError } = await supabase
        .from('bundle_products')
        .select('*')
        .eq('bundle_id', bundleId)
        .order('sort_order', { ascending: true });

      if (productsError) {
        console.error('❌ Error fetching bundle products:', productsError);
        // Return bundle without products
        bundle.products = [];
        bundle.productCount = 0;
        return { data: bundle, error: null };
      }

      console.log('✅ Bundle products fetched:', bundleProducts);

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
      console.log('✅ Bundle with products:', bundle);
      console.log('📊 Product count:', bundle.productCount);

      return { data: bundle, error: null };
    } catch (error) {
      console.error('❌ Error in fetchBundleDetails:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Add entire bundle to cart
   */
  static async addBundleToCart(bundleId) {
    try {
      console.log('🛒 Starting addBundleToCart for bundle:', bundleId);
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ User not authenticated');
        return { success: false, error: 'User not authenticated' };
      }

      console.log('✅ User authenticated:', user.id);

      // Get bundle details with products
      const { data: bundle, error: bundleError } = await this.fetchBundleDetails(bundleId);
      
      if (bundleError || !bundle) {
        console.log('❌ Bundle not found or error:', bundleError);
        return { success: false, error: bundleError || 'Bundle not found' };
      }

      console.log('✅ Bundle fetched:', bundle);

      if (!bundle.products || bundle.products.length === 0) {
        console.log('❌ Bundle has no products');
        return { success: false, error: 'Bundle has no products' };
      }

      console.log('✅ Bundle has', bundle.products.length, 'products');

      // Find actual product IDs by matching names/codes
      // bundle_products stores names, not IDs, so we need to look them up
      const productNames = bundle.products.map(p => p.name);
      
      console.log('🔍 Looking up products by names:', productNames);
      
      const { data: actualProducts, error: lookupError } = await supabase
        .from('products')
        .select('id, name, price')
        .in('name', productNames);

      if (lookupError) {
        console.error('❌ Error looking up products:', lookupError);
        return { success: false, error: 'Could not find bundle products in inventory: ' + lookupError.message };
      }

      console.log('✅ Found products:', actualProducts);

      if (!actualProducts || actualProducts.length === 0) {
        console.log('❌ No products found in inventory');
        return { success: false, error: 'Bundle products not found in current inventory' };
      }

      console.log('✅ Found', actualProducts.length, 'products in inventory');

      // Get user's cart
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Cart lookup result:', { cart, cartError });

      // Create cart if doesn't exist
      if (cartError || !cart) {
        console.log('Creating new cart for user...');
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create cart:', createError);
          return { success: false, error: 'Failed to create cart: ' + createError.message };
        }
        cart = newCart;
        console.log('✅ Cart created:', cart);
      }

      console.log('✅ Cart ready:', cart.id);

      // Check for existing cart items to avoid duplicates
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('cart_id', cart.id);

      console.log('Existing cart items:', existingItems);

      // Add or update each product from bundle to cart
      for (const product of actualProducts) {
        const existingItem = existingItems?.find(item => item.product_id === product.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          console.log(`Updating existing item ${product.name}, new quantity: ${existingItem.quantity + 1}`);
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + 1 })
            .eq('cart_id', cart.id)
            .eq('product_id', product.id);

          if (updateError) {
            console.error('❌ Error updating cart item:', updateError);
          }
        } else {
          // Insert new item
          console.log(`Adding new item ${product.name}`);
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              cart_id: cart.id,
              product_id: product.id,
              quantity: 1
            });

          if (insertError) {
            console.error('❌ Error adding cart item:', insertError);
            return { success: false, error: 'Failed to add product to cart: ' + insertError.message };
          }
        }
      }

      console.log('✅ Added/updated', actualProducts.length, 'products in cart');
      return { success: true, itemsAdded: actualProducts.length };
    } catch (error) {
      console.error('❌ Error in addBundleToCart:', error);
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
