import { supabase } from '../lib/supabase.js'

export class ProductService {
  // Get all active products for the ecommerce frontend
  static async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message, data: [] }
      }
      
      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error.message, data: [] }
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message, data: [] }
      }
      
      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error.message, data: [] }
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands!inner(id, name)
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error) {
        return { success: false, error: error.message, data: null }
      }
      
      // Flatten the brand object for easier access
      if (data && data.brands) {
        data.brand = data.brands;
        delete data.brands;
      }
      
      return { success: true, data: data }
    } catch (error) {
      return { success: false, error: error.message, data: null }
    }
  }

  // Search products
  static async searchProducts(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message, data: [] }
      }
      
      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error.message, data: [] }
    }
  }

  // Get products with filters
  static async getFilteredProducts(filters = {}) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          brands(id, name, slug, logo_url)
        `)
        .eq('status', 'active')

      // Apply brand filter (array of brand IDs)
      if (filters.brands && filters.brands.length > 0) {
        query = query.in('brand_id', filters.brands)
      }

      // Apply price range filter
      if (filters.minPrice !== null && filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice)
      }
      if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice)
      }

      // Apply stock filter (only show products with stock > 0)
      if (filters.inStock) {
        query = query.gt('stock_quantity', 0)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message, data: [] }
      }

      // Filter by category (client-side since it's in JSONB array)
      let filteredData = data;
      if (filters.category) {
        filteredData = data.filter(product => {
          if (!product.selected_components || !Array.isArray(product.selected_components)) {
            return false;
          }
          // Check if any component matches the category
          return product.selected_components.some(comp => 
            comp.id === filters.category || comp === filters.category
          );
        });
      }

      // Flatten brand data for easier access
      const processedData = filteredData.map(product => ({
        ...product,
        brand: product.brands,
        brand_name: product.brands?.name || 'Unknown'
      }));
      
      return { success: true, data: processedData }
    } catch (error) {
      return { success: false, error: error.message, data: [] }
    }
  }

  // Subscribe to real-time product updates
  static subscribeToProducts(callback) {
    const subscription = supabase
      .channel('products')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'products',
          filter: 'is_active=eq.true'
        }, 
        callback
      )
      .subscribe()

    return subscription
  }

  // Unsubscribe from real-time updates
  static unsubscribeFromProducts(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }

  // Helper function to get full image URL from Supabase storage or external URL
  static getImageUrl(imagePath) {
    if (!imagePath) return '/images/placeholder-product.png'
    
    // If it's already a full URL (external hosting like ImgBB), return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    
    // If it's a relative path starting with /, return as-is (local asset)
    if (imagePath.startsWith('/')) {
      return imagePath
    }
    
    // Otherwise, construct Supabase Storage URL
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(imagePath)
    
    return data.publicUrl
  }

  // Helper function to transform Supabase product data to match existing UI structure
  static transformProductData(product) {
    if (!product) return null

    // Extract data from metadata if available
    const metadata = product.metadata || {}

    // Transform images to full URLs
    const productImages = product.images || metadata.images || []
    const imageUrls = productImages.map(img => this.getImageUrl(img))

    return {
      id: product.id,
      title: product.name,
      productName: product.name,
      description: product.description,
      price: parseFloat(product.price),
      oldPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : parseFloat(product.price) * 1.2,
      category: product.category_id || metadata.category || 'General', // Use category_id from new schema or from metadata
      type: product.category_id || metadata.category || 'General', // For compatibility with existing filtering
      brand: product.specifications?.brand || metadata.specifications?.brand || 'N/A',
      stock: product.stock_quantity,
      stockStatus: this.getStockStatus(product.stock_quantity),
      rating: product.rating || Math.floor(Math.random() * 5) + 1,
      reviews: product.review_count || Math.floor(Math.random() * 50) + 1,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : '/images/placeholder-product.png',
      images: imageUrls,
      specs: this.transformSpecifications(product.specifications || metadata.specifications),
      features: product.features || [],
      variants: metadata.variants || product.variants || [],
      newArrival: this.isNewArrival(product.created_at),
      sku: product.sku || product.id,
      // Add metadata for advanced features - parse price fields as numbers
      metadata: {
        ...metadata,
        officialPrice: metadata.officialPrice ? parseFloat(metadata.officialPrice) : undefined,
        initialPrice: metadata.initialPrice ? parseFloat(metadata.initialPrice) : undefined,
        discount: metadata.discount ? parseFloat(metadata.discount) : undefined
      },
      components: metadata.components || [],
      warranty: metadata.warranty,
      status: product.status
    }
  }

  // Helper function to determine stock status
  static getStockStatus(stockQuantity) {
    if (stockQuantity === 0) return "Out of Stock"
    if (stockQuantity <= 10) return "Low Stock"
    return "In Stock"
  }

  // Helper function to transform specifications object to array format
  static transformSpecifications(specs) {
    if (!specs || typeof specs !== 'object') return []
    
    return Object.entries(specs).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
      value: value
    }))
  }

  // Helper function to check if product is new (within last 30 days)
  static isNewArrival(createdAt) {
    if (!createdAt) return false
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return new Date(createdAt) > thirtyDaysAgo
  }

  // Get unique categories for filtering
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('id, name, slug, image_url, icon_url, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        return { success: false, error: error.message, data: [] }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error.message, data: [] }
    }
  }
}