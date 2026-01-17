/**
 * ProductSearchService
 * Professional product search utility with fuzzy matching and intelligent filtering
 */

import Fuse from 'fuse.js';

class ProductSearchService {
  /**
   * Search products with fuzzy matching and intelligent filtering
   * @param {Array} products - Array of product objects
   * @param {String} searchQuery - Search query string
   * @param {Object} options - Additional search options
   * @returns {Array} - Filtered and ranked products
   */
  static searchProducts(products, searchQuery, options = {}) {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return products;
    }

    const {
      threshold = 0.4, // Fuzziness: 0.0 = exact match, 1.0 = match anything
      includeScore = true,
      minScore = 0.3, // Minimum relevance score
      limit = null, // Limit results (null = no limit)
    } = options;

    // Configure Fuse.js for fuzzy search
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 2.0 }, // Product title is most important
        { name: 'description', weight: 1.5 }, // Description is second
        { name: 'brand.name', weight: 1.2 }, // Brand name
        { name: 'category_name', weight: 1.0 }, // Category
        { name: 'tags', weight: 0.8 }, // Tags if available
        { name: 'specifications.cpu', weight: 0.7 }, // CPU specs
        { name: 'specifications.gpu', weight: 0.7 }, // GPU specs
        { name: 'specifications.ram', weight: 0.6 }, // RAM specs
        { name: 'specifications.storage', weight: 0.6 }, // Storage specs
      ],
      threshold,
      includeScore,
      ignoreLocation: true,
      useExtendedSearch: true,
      minMatchCharLength: 2,
    };

    const fuse = new Fuse(products, fuseOptions);
    const results = fuse.search(searchQuery);

    // Filter by minimum score and format results
    let filteredResults = results
      .filter(result => !includeScore || (1 - result.score) >= minScore)
      .map(result => ({
        ...result.item,
        searchScore: result.score ? (1 - result.score) : 1,
        searchMatches: result.matches || [],
      }));

    // Apply limit if specified
    if (limit && limit > 0) {
      filteredResults = filteredResults.slice(0, limit);
    }

    return filteredResults;
  }

  /**
   * Get search suggestions based on partial input
   * @param {Array} products - Array of product objects
   * @param {String} partialQuery - Partial search query
   * @param {Number} maxSuggestions - Maximum number of suggestions
   * @returns {Array} - Array of suggestion strings
   */
  static getSuggestions(products, partialQuery, maxSuggestions = 5) {
    if (!partialQuery || partialQuery.trim().length < 2) {
      return [];
    }

    const query = partialQuery.toLowerCase().trim();
    const suggestions = new Set();

    // Extract unique titles, brands, and categories that match
    products.forEach(product => {
      // Check product title
      if (product.title && product.title.toLowerCase().includes(query)) {
        suggestions.add(product.title);
      }

      // Check brand name
      if (product.brand?.name && product.brand.name.toLowerCase().includes(query)) {
        suggestions.add(product.brand.name);
      }

      // Check category
      if (product.category_name && product.category_name.toLowerCase().includes(query)) {
        suggestions.add(product.category_name);
      }
    });

    // Convert Set to Array and limit results
    return Array.from(suggestions)
      .slice(0, maxSuggestions)
      .sort((a, b) => {
        // Prioritize matches at the start of the string
        const aStartsWith = a.toLowerCase().startsWith(query);
        const bStartsWith = b.toLowerCase().startsWith(query);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then sort by length (shorter = more relevant)
        return a.length - b.length;
      });
  }

  /**
   * Get popular search terms based on product categories and brands
   * @param {Array} products - Array of product objects
   * @param {Number} limit - Number of popular terms to return
   * @returns {Array} - Array of popular search terms
   */
  static getPopularSearchTerms(products, limit = 10) {
    const termFrequency = new Map();

    products.forEach(product => {
      // Count brands
      if (product.brand?.name) {
        const brand = product.brand.name;
        termFrequency.set(brand, (termFrequency.get(brand) || 0) + 1);
      }

      // Count categories
      if (product.category_name) {
        const category = product.category_name;
        termFrequency.set(category, (termFrequency.get(category) || 0) + 1);
      }

      // Count common words in titles (optional)
      if (product.title) {
        const words = product.title.split(' ').filter(word => word.length > 3);
        words.forEach(word => {
          const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normalized.length > 3) {
            termFrequency.set(normalized, (termFrequency.get(normalized) || 0) + 1);
          }
        });
      }
    });

    // Sort by frequency and return top results
    return Array.from(termFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([term]) => term);
  }

  /**
   * Highlight matching text in search results
   * @param {String} text - Text to highlight
   * @param {String} query - Search query
   * @returns {String} - HTML string with highlighted matches
   */
  static highlightMatches(text, query) {
    if (!text || !query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-300 text-black px-1 rounded">$1</mark>');
  }

  /**
   * Sanitize search query to prevent XSS
   * @param {String} query - Raw search query
   * @returns {String} - Sanitized query
   */
  static sanitizeQuery(query) {
    if (!query) return '';
    
    return query
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 100); // Limit length
  }

  /**
   * Get search analytics (track what users search for)
   * This can be extended to store in localStorage or send to backend
   * @param {String} query - Search query to track
   */
  static trackSearch(query) {
    if (!query || query.trim().length === 0) return;

    try {
      const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      
      // Add new search at the beginning
      const updated = [
        query.trim(),
        ...searches.filter(s => s !== query.trim())
      ].slice(0, 10); // Keep last 10 searches

      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }

  /**
   * Get recent search history
   * @returns {Array} - Array of recent search queries
   */
  static getRecentSearches() {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear search history
   */
  static clearSearchHistory() {
    try {
      localStorage.removeItem('recentSearches');
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }
}

export default ProductSearchService;
