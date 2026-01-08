import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import ProductSearchService from '../services/ProductSearchService';

/**
 * SearchSuggestions Component
 * Professional autocomplete search with suggestions, recent searches, and popular terms
 */
const SearchSuggestions = ({ 
  products = [], 
  isVisible = false, 
  onClose,
  className = '',
  placeholder = 'Search products...'
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularTerms, setPopularTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  // Load recent searches and popular terms on mount
  useEffect(() => {
    setRecentSearches(ProductSearchService.getRecentSearches());
    if (products.length > 0) {
      setPopularTerms(ProductSearchService.getPopularSearchTerms(products, 5));
    }
  }, [products]);

  // Focus input when visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length >= 2) {
      setIsLoading(true);
      debounceTimer.current = setTimeout(() => {
        const results = ProductSearchService.getSuggestions(products, query, 8);
        setSuggestions(results);
        setIsLoading(false);
        setShowDropdown(true);
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setIsLoading(false);
      setShowDropdown(query.length === 0 && (recentSearches.length > 0 || popularTerms.length > 0));
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, products, recentSearches, popularTerms]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const items = suggestions.length > 0 ? suggestions : [...recentSearches, ...popularTerms];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        handleSearch(items[selectedIndex]);
      } else {
        handleSearch(query);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      if (onClose) onClose();
    }
  };

  // Handle search execution
  const handleSearch = (searchTerm) => {
    const sanitized = ProductSearchService.sanitizeQuery(searchTerm || query);
    
    if (sanitized.trim().length === 0) return;

    // Track search
    ProductSearchService.trackSearch(sanitized);
    
    // Navigate to products page with search query
    navigate(`/products?search=${encodeURIComponent(sanitized)}`);
    
    // Reset state
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    if (onClose) onClose();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion);
  };

  // Clear search input
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    setShowDropdown(recentSearches.length > 0 || popularTerms.length > 0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Clear search history
  const handleClearHistory = () => {
    ProductSearchService.clearSearchHistory();
    setRecentSearches([]);
  };

  // Render suggestion item
  const renderSuggestionItem = (item, index, icon, type = 'suggestion') => {
    const isSelected = index === selectedIndex;
    
    return (
      <li
        key={`${type}-${index}`}
        onClick={() => handleSuggestionClick(item)}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-green-500 text-white' 
            : 'hover:bg-gray-800 text-gray-200'
        }`}
      >
        <span className={isSelected ? 'text-white' : 'text-gray-400'}>
          {icon}
        </span>
        <span className="flex-1 text-sm font-medium truncate">{item}</span>
        <Search className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
      </li>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full bg-black bg-opacity-50 backdrop-blur-sm text-white border border-gray-600 rounded-lg pl-12 pr-24 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all placeholder-gray-400"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
          )}
          
          {query.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          <button
            onClick={() => handleSearch(query)}
            className="px-4 py-1.5 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 transition-colors text-sm"
          >
            Search
          </button>
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
        >
          {/* Suggestions from current query */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Suggestions
                </span>
              </div>
              <ul>
                {suggestions.map((suggestion, index) => 
                  renderSuggestionItem(suggestion, index, <Search className="w-4 h-4" />, 'suggestion')
                )}
              </ul>
            </div>
          )}

          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Recent Searches
                </span>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-green-500 hover:text-green-400 transition-colors"
                >
                  Clear
                </button>
              </div>
              <ul>
                {recentSearches.slice(0, 5).map((search, index) => 
                  renderSuggestionItem(search, index, <Clock className="w-4 h-4" />, 'recent')
                )}
              </ul>
            </div>
          )}

          {/* Popular Search Terms */}
          {query.length === 0 && popularTerms.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Popular Searches
                </span>
              </div>
              <ul>
                {popularTerms.map((term, index) => 
                  renderSuggestionItem(
                    term, 
                    index + recentSearches.length, 
                    <TrendingUp className="w-4 h-4" />, 
                    'popular'
                  )
                )}
              </ul>
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !isLoading && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No suggestions found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for something else</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
