import { supabase } from "@/lib/supabase";

/**
 * Service to fetch and organize products for PC Build system
 * Maps database products to component types (Case, Motherboard, etc.)
 */
class PCBuildService {
  /**
   * Component type mapping - maps UI component names to database categories
   */
  static COMPONENT_TYPES = {
    Case: ["case", "cases", "casing"],
    Motherboard: ["motherboard", "mobo"],
    GPU: ["gpu", "graphics card", "video card", "vga"],
    Processor: ["processor", "cpu", "central processing unit"],
    RAM: ["ram", "memory", "ddr"],
    SSD: ["ssd", "solid state"],
    HDD: ["hdd", "hard disk", "hard drive"],
    PSU: ["psu", "power supply"],
    Cooling: ["cooling", "cpu cooler", "cooler", "fan", "fans"],
    Keyboard: ["keyboard"],
    Mouse: ["mouse", "mice"],
    Monitor: ["monitor", "display", "screen"],
    Speaker: ["speaker", "speakers", "audio"],
    Headset: ["headset", "headphone", "headphones"],
    Webcam: ["webcam", "camera", "web camera"],
  };

  /**
   * Fetch all products from database and organize by component type
   * @returns {Promise<Object>} Object with component types as keys
   */
  static async fetchComponentProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands(id, name, slug, logo_url)
        `)
        .eq("status", "active")
        .gt("stock_quantity", 0)
        .order("name");

      if (error) {
        throw error;
      }

      // Group products by component type
      const grouped = this.groupProductsByComponentType(data || []);
      console.log("📂 Grouped products:", Object.keys(grouped).map(key => `${key}: ${grouped[key].length}`));
      
      return grouped;
    } catch (error) {
      return {};
    }
  }

  /**
   * Group products by their component type
   * @param {Array} products - Array of products from database
   * @returns {Object} Products grouped by component type
   */
  static groupProductsByComponentType(products) {
    const grouped = {};

    // Initialize all component types
    Object.keys(this.COMPONENT_TYPES).forEach((type) => {
      grouped[type] = [];
    });

    products.forEach((product) => {
      const componentType = this.detectComponentType(product);
      
      if (componentType && grouped[componentType]) {
        // Transform product to match expected format
        const transformedProduct = {
          id: product.id,
          name: product.name,
          brand: product.brands?.name || "Unknown",
          brandId: product.brands?.id || null,
          price: parseFloat(product.price) || 0,
          image: product.images?.[0] || "/placeholder-product.png",
          images: product.images || [], // Keep full images array for modal
          description: product.description || "",
          stock: product.stock_quantity || 0,
          stock_quantity: product.stock_quantity || 0, // Keep original field name too
          category: product.category || "",
          subcategory: this.getSubCategory(product),
          specifications: product.specifications || {},
          selected_components: product.selected_components || [],
          variants: product.variants || [],
        };
        
        grouped[componentType].push(transformedProduct);
      } else {
      }
    });

    return grouped;
  }

  /**
   * Detect component type from product data
   * Priority: selected_components > category > name
   */
  static detectComponentType(product) {
    // Check selected_components array first - it contains objects with {id, name}
    if (product.selected_components && Array.isArray(product.selected_components)) {
      for (const comp of product.selected_components) {
        // comp is an object like {"id": "uuid", "name": "Case"}
        const compName = comp.name || comp;
        const compNameLower = typeof compName === 'string' ? compName.toLowerCase() : '';
        
        for (const [type, keywords] of Object.entries(this.COMPONENT_TYPES)) {
          if (keywords.some(keyword => compNameLower.includes(keyword))) {
            return type;
          }
        }
      }
    }

    // Check category field
    if (product.category) {
      const categoryLower = product.category.toLowerCase();
      for (const [type, keywords] of Object.entries(this.COMPONENT_TYPES)) {
        if (keywords.some(keyword => categoryLower.includes(keyword))) {
          return type;
        }
      }
    }

    // Check product name as fallback
    if (product.name) {
      const nameLower = product.name.toLowerCase();
      for (const [type, keywords] of Object.entries(this.COMPONENT_TYPES)) {
        if (keywords.some(keyword => nameLower.includes(keyword))) {
          return type;
        }
      }
    }

    return null;
  }

  /**
   * Extract subcategory from specifications or category
   */
  static getSubCategory(product) {
    // Try to get from specifications
    if (product.specifications) {
      if (product.specifications.subcategory) {
        return product.specifications.subcategory;
      }
      if (product.specifications.type) {
        return product.specifications.type;
      }
      if (product.specifications.form_factor) {
        return product.specifications.form_factor;
      }
    }

    // Try to extract from category (e.g., "Case - Mid Tower" -> "Mid Tower")
    if (product.category && product.category.includes(" - ")) {
      return product.category.split(" - ")[1];
    }

    return "General";
  }

  /**
   * Get unique brands from products array
   */
  static getBrandsFromProducts(products) {
    const brands = [...new Set(products.map(p => p.brand))];
    return brands.sort();
  }

  /**
   * Get unique subcategories from products array
   */
  static getSubCategoriesFromProducts(products) {
    const subcategories = [...new Set(products.map(p => p.subcategory))];
    return subcategories.sort();
  }
}

export default PCBuildService;
