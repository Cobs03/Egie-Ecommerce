/**
 * Compatibility Service
 * Checks compatibility between PC components
 */

class CompatibilityService {
  /**
   * Check if cart items are compatible with each other
   * @param {Array} cartItems - Items in the cart
   * @returns {Object} Compatibility results
   */
  checkCartCompatibility(cartItems) {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    // Extract components by type
    const cpu = cartItems.find(item => 
      item.product?.selected_components?.some(c => 
        c.name?.toLowerCase().includes('processor') || 
        c.name?.toLowerCase().includes('cpu')
      )
    );
    
    const motherboard = cartItems.find(item => 
      item.product?.selected_components?.some(c => 
        c.name?.toLowerCase().includes('motherboard')
      )
    );
    
    const ram = cartItems.find(item => 
      item.product?.selected_components?.some(c => 
        c.name?.toLowerCase().includes('ram') || 
        c.name?.toLowerCase().includes('memory')
      )
    );
    
    const gpu = cartItems.find(item => 
      item.product?.selected_components?.some(c => 
        c.name?.toLowerCase().includes('gpu') || 
        c.name?.toLowerCase().includes('graphics')
      )
    );
    
    const psu = cartItems.find(item => 
      item.product?.selected_components?.some(c => 
        c.name?.toLowerCase().includes('power supply') || 
        c.name?.toLowerCase().includes('psu')
      )
    );

    // Check CPU + Motherboard Socket Compatibility
    if (cpu && motherboard) {
      const cpuBrand = cpu.product?.brands?.name?.toLowerCase();
      const moboBrand = motherboard.product?.name?.toLowerCase();
      
      // Intel CPUs need Intel motherboards, AMD CPUs need AMD motherboards
      if (cpuBrand?.includes('intel') && !moboBrand?.includes('intel')) {
        issues.push({
          type: 'socket',
          severity: 'high',
          title: '⚠️ CPU-Motherboard Incompatibility',
          message: `Your Intel ${cpu.product.name} may not be compatible with this motherboard. Intel CPUs require Intel chipset motherboards (LGA socket).`,
          affectedItems: [cpu.product.name, motherboard.product.name]
        });
      } else if (cpuBrand?.includes('amd') && !moboBrand?.includes('amd')) {
        issues.push({
          type: 'socket',
          severity: 'high',
          title: '⚠️ CPU-Motherboard Incompatibility',
          message: `Your AMD ${cpu.product.name} may not be compatible with this motherboard. AMD CPUs require AMD chipset motherboards (AM4/AM5 socket).`,
          affectedItems: [cpu.product.name, motherboard.product.name]
        });
      } else {
        suggestions.push({
          type: 'compatible',
          message: `✅ Your CPU and Motherboard appear to be compatible!`
        });
      }
    }

    // Check if GPU is present but no PSU
    if (gpu && !psu) {
      warnings.push({
        type: 'missing',
        severity: 'medium',
        title: '💡 Power Supply Needed',
        message: `You have a graphics card (${gpu.product.name}) in your cart. Don't forget to add a power supply! Most gaming GPUs require at least 500-650W.`,
        suggestion: 'Add a Power Supply'
      });
    }

    // Check if CPU present but no RAM
    if (cpu && !ram) {
      warnings.push({
        type: 'missing',
        severity: 'high',
        title: '⚠️ RAM Required',
        message: `You'll need RAM to complete your build. For gaming, we recommend at least 16GB DDR4.`,
        suggestion: 'Add RAM to Cart'
      });
    }

    // Check if CPU present but no motherboard
    if (cpu && !motherboard) {
      warnings.push({
        type: 'missing',
        severity: 'high',
        title: '⚠️ Motherboard Required',
        message: `Your CPU needs a compatible motherboard. Make sure to choose one that matches your CPU socket.`,
        suggestion: 'Add Motherboard to Cart'
      });
    }

    // Suggest cooling if high-end CPU
    if (cpu) {
      const cpuName = cpu.product.name.toLowerCase();
      if (cpuName.includes('i7') || cpuName.includes('i9') || cpuName.includes('ryzen 7') || cpuName.includes('ryzen 9')) {
        const hasCooling = cartItems.some(item => 
          item.product?.selected_components?.some(c => 
            c.name?.toLowerCase().includes('cooling') || 
            c.name?.toLowerCase().includes('cooler')
          )
        );
        
        if (!hasCooling) {
          suggestions.push({
            type: 'recommendation',
            message: `💡 Consider adding a CPU cooler for your ${cpu.product.name}. High-performance CPUs benefit from aftermarket cooling.`
          });
        }
      }
    }

    return {
      hasIssues: issues.length > 0,
      hasWarnings: warnings.length > 0,
      hasSuggestions: suggestions.length > 0,
      issues,
      warnings,
      suggestions,
      components: { cpu, motherboard, ram, gpu, psu }
    };
  }

  /**
   * Get compatibility status message
   * @param {Object} compatibility - Compatibility check results
   * @returns {string} Human-readable status
   */
  getStatusMessage(compatibility) {
    if (compatibility.hasIssues) {
      return '⚠️ Compatibility issues detected in your build';
    }
    if (compatibility.hasWarnings) {
      return '💡 Some components may be missing';
    }
    if (compatibility.hasSuggestions) {
      return '✅ Build looks good! Here are some suggestions';
    }
    return '✅ Your build is looking great!';
  }

  /**
   * Compare two products
   * @param {Object} product1 - First product
   * @param {Object} product2 - Second product
   * @returns {Object} Comparison data
   */
  compareProducts(product1, product2) {
    const comparison = {
      name: {
        product1: product1.name,
        product2: product2.name
      },
      price: {
        product1: product1.price,
        product2: product2.price,
        difference: Math.abs(product1.price - product2.price),
        cheaper: product1.price < product2.price ? 'product1' : 'product2'
      },
      stock: {
        product1: product1.stock_quantity || 0,
        product2: product2.stock_quantity || 0,
        moreAvailable: (product1.stock_quantity || 0) > (product2.stock_quantity || 0) ? 'product1' : 'product2'
      },
      brand: {
        product1: product1.brands?.name || 'N/A',
        product2: product2.brands?.name || 'N/A'
      },
      specifications: {
        product1: product1.specifications || {},
        product2: product2.specifications || {}
      }
    };

    return comparison;
  }

  /**
   * Format comparison as readable text
   * @param {Object} comparison - Comparison data
   * @returns {string} Formatted comparison
   */
  formatComparisonText(comparison) {
    let text = `📊 **Product Comparison**\n\n`;
    
    text += `**${comparison.name.product1}** vs **${comparison.name.product2}**\n\n`;
    
    text += `💰 **Price:**\n`;
    text += `• ${comparison.name.product1}: ₱${comparison.price.product1.toLocaleString()}\n`;
    text += `• ${comparison.name.product2}: ₱${comparison.price.product2.toLocaleString()}\n`;
    text += `• Difference: ₱${comparison.price.difference.toLocaleString()}\n`;
    text += `• Cheaper: ${comparison.price.cheaper === 'product1' ? comparison.name.product1 : comparison.name.product2}\n\n`;
    
    text += `📦 **Stock:**\n`;
    text += `• ${comparison.name.product1}: ${comparison.stock.product1} units\n`;
    text += `• ${comparison.name.product2}: ${comparison.stock.product2} units\n\n`;
    
    text += `🏷️ **Brand:**\n`;
    text += `• ${comparison.name.product1}: ${comparison.brand.product1}\n`;
    text += `• ${comparison.name.product2}: ${comparison.brand.product2}\n\n`;
    
    return text;
  }
}

export default new CompatibilityService();
