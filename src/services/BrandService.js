import { supabase } from '../lib/supabase.js'

export class BrandService {
  /**
   * Get all active brands
   */
  static async getAllBrands() {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        return { success: false, error: error.message, data: [] }
      }
      
      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: error.message, data: [] }
    }
  }

  /**
   * Get brands that have products in a specific category
   * @param {string} categoryId - UUID of the category
   */
  static async getBrandsByCategory(categoryId) {
    try {
      // Query products where selected_components JSONB array contains the category
      const { data, error } = await supabase
        .from('products')
        .select(`
          brand_id,
          selected_components,
          brands!inner(id, name, slug, logo_url)
        `)
        .eq('status', 'active')
        .not('brand_id', 'is', null)

      if (error) {
        return { success: false, error: error.message, data: [] }
      }

      // Filter products that have this category in selected_components
      const productsInCategory = data.filter(product => {
        if (!product.selected_components || !Array.isArray(product.selected_components)) {
          return false;
        }
        // Check if any component matches the categoryId
        return product.selected_components.some(comp => 
          comp.id === categoryId || comp === categoryId
        );
      });

      // Extract unique brands
      const uniqueBrands = [];
      const brandIds = new Set();

      productsInCategory.forEach(item => {
        if (item.brands && !brandIds.has(item.brands.id)) {
          brandIds.add(item.brands.id);
          uniqueBrands.push(item.brands);
        }
      });

      // Sort by name
      uniqueBrands.sort((a, b) => a.name.localeCompare(b.name));

      return { success: true, data: uniqueBrands }
    } catch (error) {
      return { success: false, error: error.message, data: [] }
    }
  }

  /**
   * Get brands that have any active products (for "All Products")
   */
  static async getBrandsWithProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          brand_id,
          brands!inner(id, name, slug, logo_url)
        `)
        .eq('status', 'active')
        .not('brand_id', 'is', null)

      if (error) {
        return { success: false, error: error.message, data: [] }
      }

      // Extract unique brands
      const uniqueBrands = [];
      const brandIds = new Set();

      data.forEach(item => {
        if (item.brands && !brandIds.has(item.brands.id)) {
          brandIds.add(item.brands.id);
          uniqueBrands.push(item.brands);
        }
      });

      // Sort by name
      uniqueBrands.sort((a, b) => a.name.localeCompare(b.name));

      return { success: true, data: uniqueBrands }
    } catch (error) {
      return { success: false, error: error.message, data: [] }
    }
  }

  /**
   * Get brand by ID
   */
  static async getBrandById(id) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { success: false, error: error.message, data: null }
      }
      
      return { success: true, data: data }
    } catch (error) {
      return { success: false, error: error.message, data: null }
    }
  }

  /**
   * Get brand by slug
   */
  static async getBrandBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        return { success: false, error: error.message, data: null }
      }
      
      return { success: true, data: data }
    } catch (error) {
      return { success: false, error: error.message, data: null }
    }
  }
}
