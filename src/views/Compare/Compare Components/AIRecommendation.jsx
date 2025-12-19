import React, { useState, useEffect } from "react";

const AIRecommendation = ({ products, onViewDetails }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate AI recommendation when products change
  useEffect(() => {
    if (products.length <= 1) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Call Groq AI to analyze products
    generateAIRecommendation(products);
  }, [products]);

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

      // Create prompt for AI
      const prompt = `You are a PC hardware expert. Compare these products and recommend the BEST ONE with a detailed explanation.

Products to compare:
${JSON.stringify(productsData, null, 2)}

Provide your response in this EXACT JSON format:
{
  "recommendedPosition": <number 1, 2, or 3>,
  "explanation": "<2-3 sentence explanation why this product is the best choice, focusing on performance, value, and specifications>"
}

Important: 
- Only return valid JSON, no additional text
- Be specific about technical specs
- Consider price-to-performance ratio
- Keep explanation concise but informative`;

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
          console.error('No JSON object found in response:', aiResponse);
          throw new Error('No valid JSON found in AI response');
        }
        
        console.log('Attempting to parse JSON string:', jsonString);
        
        // Parse the JSON
        parsedResponse = JSON.parse(jsonString);
        
        // Validate the response structure
        if (typeof parsedResponse.recommendedPosition !== 'number' || !parsedResponse.explanation) {
          console.error('Invalid response structure:', parsedResponse);
          throw new Error('Missing required fields in AI response');
        }
        
        console.log('Successfully parsed AI response:', parsedResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response. Raw response:', aiResponse);
        console.error('Parse error details:', parseError.message);
        
        // If JSON parsing fails, try to manually construct the response
        // This is a last-resort fallback
        const positionMatch = aiResponse.match(/"recommendedPosition"\s*:\s*(\d+)/);
        const explanationMatch = aiResponse.match(/"explanation"\s*:\s*"([^"]+)"/);
        
        if (positionMatch && explanationMatch) {
          console.log('Using fallback manual parsing');
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
        console.error(`Invalid recommended position: ${parsedResponse.recommendedPosition}, product count: ${productList.length}`);
        throw new Error('Invalid product recommendation position');
      }
      
      const recommendedProduct = productList[recommendedIndex];

      if (!recommendedProduct) {
        console.error(`Product not found at index ${recommendedIndex}`);
        throw new Error('Invalid product recommendation');
      }

      setRecommendation({
        product: recommendedProduct,
        explanation: parsedResponse.explanation,
        index: recommendedIndex
      });
      setLoading(false);

    } catch (err) {
      console.error('Error generating AI recommendation:', err);
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
    <div className="flex flex-col sm:flex-row items-start mb-4 sm:mb-8 px-3 sm:px-0">
      {/* AI Avatar - responsive sizing */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-medium mb-2 sm:mb-0 sm:mr-3 flex-shrink-0">
        AI
      </div>
      
      {/* Recommendation Bubble - adjusts to full width on mobile */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-3 sm:p-4 relative w-full">
        {/* Speech bubble pointer - hidden on mobile, visible on larger screens */}
        <div className="hidden sm:block absolute -left-2 top-4 w-4 h-4 bg-white transform rotate-45 shadow-md"></div>
        
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
  );
};

export default AIRecommendation;