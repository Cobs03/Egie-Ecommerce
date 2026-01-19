import React, { useState, useEffect } from "react";

const AIRecommendation = ({ products, onViewDetails }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMode, setSelectedMode] = useState("balanced"); // budget, balanced, performance
  const [selectedCriteria, setSelectedCriteria] = useState("best-overall"); // additional criteria

  // Mode configurations
  const modes = {
    budget: {
      label: "Budget-Friendly",
      icon: "💰",
      description: "Best value for money",
      color: "blue"
    },
    balanced: {
      label: "Balanced",
      icon: "⚖️",
      description: "Best overall choice",
      color: "green"
    },
    performance: {
      label: "High-End",
      icon: "🚀",
      description: "Maximum performance",
      color: "purple"
    }
  };

  // Additional criteria options
  const criteriaOptions = [
    { value: "best-overall", label: "Best Overall", icon: "⭐" },
    { value: "most-powerful", label: "Most Powerful", icon: "💪" },
    { value: "best-value", label: "Best Value for Money", icon: "💎" },
    { value: "energy-efficient", label: "Most Energy Efficient", icon: "🔋" },
    { value: "gaming", label: "Best for Gaming", icon: "🎮" },
    { value: "productivity", label: "Best for Productivity", icon: "💼" },
    { value: "quietest", label: "Quietest Operation", icon: "🔇" },
    { value: "compact", label: "Most Compact", icon: "📦" }
  ];

  // Generate AI recommendation when products or selection changes
  useEffect(() => {
    if (products.length <= 1) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Call Groq AI to analyze products
    generateAIRecommendation(products);
  }, [products, selectedMode, selectedCriteria]);

  // Generate AI-powered recommendation using Groq
  const generateAIRecommendation = async (productList) => {
    try {
      // Prepare product data for AI analysis
      const productsData = productList.map((product, index) => {
        // Extract specifications
        const specs = extractSpecifications(product);
        
        return {
          position: index + 1,
          name: product.name || product.productName,
          brand: product.brand,
          price: product.price,
          specifications: specs
        };
      });

      // Build context based on selected mode and criteria
      const modeContext = {
        budget: "Focus on affordability and value for money. Prioritize the product with the lowest price that still meets basic requirements. Consider price-to-performance ratio heavily.",
        balanced: "Consider a balanced approach between price, performance, and features. Look for the best overall package that offers good value without compromising on key specifications.",
        performance: "Prioritize raw performance and premium features. Focus on the most powerful specifications, latest technology, and best quality, with less emphasis on price."
      };

      const criteriaContext = {
        "best-overall": "Evaluate overall quality, features, reliability, and user satisfaction. Consider all aspects holistically.",
        "most-powerful": "Focus exclusively on raw performance metrics, processing power, speed, and capability. Choose the most powerful option.",
        "best-value": "Analyze the price-to-performance ratio. Find the product that offers the most features and performance per dollar spent.",
        "energy-efficient": "Prioritize power consumption, energy efficiency ratings, and operating costs. Choose the most environmentally friendly and cost-effective in terms of power usage.",
        "gaming": "Focus on gaming performance, frame rates, compatibility with gaming software, and features that enhance gaming experience.",
        "productivity": "Prioritize features beneficial for work tasks, multitasking capability, reliability, and productivity-enhancing features.",
        "quietest": "Focus on noise levels, cooling efficiency, and quiet operation. Choose the product with the lowest decibel ratings.",
        "compact": "Prioritize physical dimensions, space efficiency, and portability. Choose the most space-saving option."
      };

      // Create comprehensive prompt for AI
      const prompt = `You are a PC hardware expert. Compare these products and recommend the BEST ONE based on the following criteria.

**Analysis Mode**: ${modes[selectedMode].label} - ${modes[selectedMode].description}
${modeContext[selectedMode]}

**Additional Criteria**: ${criteriaOptions.find(c => c.value === selectedCriteria)?.label}
${criteriaContext[selectedCriteria]}

Products to compare:
${JSON.stringify(productsData, null, 2)}

Provide your response in this EXACT JSON format:
{
  "recommendedPosition": <number 1, 2, or 3>,
  "explanation": "<2-3 sentence explanation why this product is the best choice based on the ${modes[selectedMode].label} mode and ${criteriaOptions.find(c => c.value === selectedCriteria)?.label} criteria. Be specific about technical specs and how they align with the selected criteria.>"
}

Important: 
- Only return valid JSON, no additional text
- Be specific about technical specs
- Align your recommendation with BOTH the mode (${selectedMode}) and criteria (${selectedCriteria})
- Keep explanation concise but informative
- Reference specific features that match the criteria`;

      // Call Groq API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful PC hardware expert assistant. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendation');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      // Parse AI response
      let parsedResponse;
      try {
        // Clean the response - remove any markdown code blocks or extra text
        let cleanResponse = aiResponse.trim();
        
        // Remove markdown code blocks if present
        cleanResponse = cleanResponse.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        
        // Try multiple parsing strategies
        let jsonString = null;
        
        // Strategy 1: Direct parse if it looks like pure JSON
        if (cleanResponse.startsWith('{') && cleanResponse.endsWith('}')) {
          jsonString = cleanResponse;
        } else {
          // Strategy 2: Extract JSON using regex
          const jsonMatch = cleanResponse.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
          }
        }
        
        if (!jsonString) {
          throw new Error('No valid JSON found in AI response');
        }
        
        // Parse the JSON
        parsedResponse = JSON.parse(jsonString);
        
        // Validate the response structure
        if (typeof parsedResponse.recommendedPosition !== 'number' || !parsedResponse.explanation) {
          throw new Error('Missing required fields in AI response');
        }
        
      } catch (parseError) {
        // If JSON parsing fails, try to manually construct the response
        // This is a last-resort fallback
        const positionMatch = aiResponse.match(/"recommendedPosition"\s*:\s*(\d+)/);
        const explanationMatch = aiResponse.match(/"explanation"\s*:\s*"([^"]+)"/);
        
        if (positionMatch && explanationMatch) {
          parsedResponse = {
            recommendedPosition: parseInt(positionMatch[1]),
            explanation: explanationMatch[1]
          };
        } else {
          throw new Error('Invalid AI response format');
        }
      }

      // Validate and get the recommended product
      const recommendedIndex = parsedResponse.recommendedPosition - 1;
      
      // Check if the recommended position is within bounds
      if (recommendedIndex < 0 || recommendedIndex >= productList.length) {
        throw new Error('Invalid product recommendation position');
      }
      
      const recommendedProduct = productList[recommendedIndex];

      if (!recommendedProduct) {
        throw new Error('Invalid product recommendation');
      }

      setRecommendation({
        product: recommendedProduct,
        explanation: parsedResponse.explanation,
        index: recommendedIndex
      });
      setLoading(false);

    } catch (err) {
      setError(err.message);
      // Fallback to basic recommendation
      const fallbackRecommendation = generateFallbackRecommendation(productList);
      setRecommendation(fallbackRecommendation);
      setLoading(false);
    }
  };

  // Extract specifications from product
  const extractSpecifications = (product) => {
    const specs = {};
    
    if (product.specifications && typeof product.specifications === 'object') {
      Object.entries(product.specifications).forEach(([componentId, specData]) => {
        if (typeof specData === 'object' && specData !== null) {
          Object.entries(specData)
            .filter(([field, value]) => value && value !== '' && field.toLowerCase() !== 'brand')
            .forEach(([field, value]) => {
              const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
              specs[field] = valueStr;
            });
        }
      });
    }
    
    return specs;
  };

  // Fallback recommendation logic (in case AI fails)
  const generateFallbackRecommendation = (productList) => {
    if (!productList || productList.length <= 1) {
      return null;
    }

    // Simple logic: choose middle-priced product as balanced option
    const sorted = [...productList].sort((a, b) => 
      parseFloat(a.price) - parseFloat(b.price)
    );
    const middleProduct = sorted[Math.floor(sorted.length / 2)];
    const index = productList.findIndex(p => p.id === middleProduct.id);

    let position = "first";
    if (index === 1) position = "second";
    if (index === 2) position = "third";

    return {
      product: middleProduct,
      explanation: `I would recommend the ${position} product because it offers the best balance of performance and value for the price.`,
      index
    };
  };

  // Don't render anything if we only have 0-1 products
  if (products.length <= 1) {
    return null;
  }

  return (
    <div className="mb-4 sm:mb-8 px-3 sm:px-0">
      {/* Mode Selection Toggles */}
      <div className="mb-4 bg-white rounded-xl shadow-md p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Shopping Mode</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(modes).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => setSelectedMode(key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedMode === key
                    ? `border-${mode.color}-500 bg-${mode.color}-50 shadow-md`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{mode.icon}</div>
                <div className={`text-xs font-semibold ${
                  selectedMode === key ? `text-${mode.color}-700` : 'text-gray-600'
                }`}>
                  {mode.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{mode.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Criteria Dropdown */}
        <div>
          <label htmlFor="criteria-select" className="text-sm font-semibold text-gray-700 mb-2 block">
            Additional Criteria
          </label>
          <div className="relative">
            <select
              id="criteria-select"
              value={selectedCriteria}
              onChange={(e) => setSelectedCriteria(e.target.value)}
              className="w-full p-3 pr-10 border-2 border-gray-200 rounded-lg appearance-none bg-white hover:border-gray-300 focus:border-green-500 focus:outline-none transition-colors cursor-pointer text-sm"
            >
              {criteriaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Display */}
      <div className="flex flex-col sm:flex-row items-start">
        {/* AI Avatar - responsive sizing */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-0 sm:mr-3 flex-shrink-0 overflow-hidden bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/8943/8943377.png" 
            alt="AI Assistant"
            className="w-full h-full object-cover p-1.5"
          />
        </div>
        
        {/* Recommendation Bubble - adjusts to full width on mobile */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-3 sm:p-4 relative w-full">
          {/* Speech bubble pointer - hidden on mobile, visible on larger screens */}
          <div className="hidden sm:block absolute -left-2 top-4 w-4 h-4 bg-white transform rotate-45 shadow-md"></div>
          
          {/* Active Mode & Criteria Badge */}
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-${modes[selectedMode].color}-100 text-${modes[selectedMode].color}-700 border border-${modes[selectedMode].color}-200`}>
              {modes[selectedMode].icon} {modes[selectedMode].label}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {criteriaOptions.find(c => c.value === selectedCriteria)?.icon} {criteriaOptions.find(c => c.value === selectedCriteria)?.label}
            </span>
          </div>
          
          {loading ? (
            <div className="flex items-center">
              <div className="text-sm sm:text-base mr-2">Analyzing products with AI</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          ) : error ? (
            <div>
              <p className="text-sm sm:text-base text-orange-600 mb-2">
                ⚠️ AI analysis unavailable, using basic comparison
              </p>
              {recommendation && (
                <>
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base">{recommendation.explanation}</p>
                  
                  {/* Clickable Product Card */}
                  <button 
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 w-full sm:max-w-xs text-left hover:bg-gray-50 hover:border-green-300 transition-colors group focus:outline-none"
                    onClick={() => onViewDetails && onViewDetails(recommendation.product)}
                  >
                    <div className="font-medium border-b pb-2 mb-2 flex justify-between items-center text-sm sm:text-base">
                      <span className="line-clamp-1 mr-2">
                        {recommendation.product.productName || recommendation.product.name}
                      </span>
                      <span className="text-green-500 whitespace-nowrap text-xs sm:text-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        View details →
                      </span>
                    </div>
                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                      <img 
                        src={recommendation.product.imageUrl || recommendation.product.image || recommendation.product.images?.[0]} 
                        alt={recommendation.product.productName || recommendation.product.name}
                        className="h-16 sm:h-24 object-contain"
                      />
                    </div>
                  </button>
                </>
              )}
            </div>
          ) : recommendation ? (
            <div>
              <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">{recommendation.explanation}</p>
              
              {/* Clickable Product Card - responsive width and padding */}
              <button 
                className="border-2 border-green-200 rounded-lg p-3 sm:p-4 w-full sm:max-w-xs text-left hover:bg-green-50 hover:border-green-400 transition-all group focus:outline-none shadow-sm hover:shadow-md"
                onClick={() => onViewDetails && onViewDetails(recommendation.product)}
              >
                <div className="font-medium border-b border-green-200 pb-2 mb-2 flex justify-between items-center text-sm sm:text-base">
                  <span className="line-clamp-1 mr-2 text-gray-800">
                    {recommendation.product.productName || recommendation.product.name}
                  </span>
                  <span className="text-green-600 whitespace-nowrap text-xs sm:text-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                    View details →
                  </span>
                </div>
                <div className="flex items-center justify-center mb-2 sm:mb-3 bg-white rounded p-2">
                  <img 
                    src={recommendation.product.imageUrl || recommendation.product.image || recommendation.product.images?.[0]} 
                    alt={recommendation.product.productName || recommendation.product.name}
                    className="h-16 sm:h-24 object-contain"
                  />
                </div>
                <div className="text-center">
                  <span className="text-green-600 font-bold text-lg">
                    ₱{Number(recommendation.product.price).toLocaleString()}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <div className="text-sm sm:text-base text-gray-500">
              I need more product information to make a recommendation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendation;