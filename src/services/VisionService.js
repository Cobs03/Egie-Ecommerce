/**
 * AI Vision Service
 * Integrates with Google Vision API or OpenAI Vision API for real image recognition
 * Analyzes product images to find similar items in the database
 */

import axios from 'axios';

class VisionService {
  constructor() {
    // Configuration - these should be set in .env file
    this.provider = import.meta.env.VITE_VISION_API_PROVIDER || 'groq'; // 'groq', 'openai', or 'google'
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.googleApiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
    this.openaiModel = import.meta.env.VITE_OPENAI_VISION_MODEL || 'gpt-4o'; // gpt-4o or gpt-4-turbo
    this.groqModel = import.meta.env.VITE_GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
  }

  /**
   * Analyze an image and extract product information
   * @param {string} imageData - Base64 encoded image data or image URL
   * @param {string} userPrompt - Optional user description to guide the analysis
   * @returns {Promise<Object>} - Extracted product features and keywords
   */
  async analyzeProductImage(imageData, userPrompt = '') {
    try {
      if (this.provider === 'groq') {
        return await this.analyzeWithGroq(imageData, userPrompt);
      } else if (this.provider === 'openai') {
        return await this.analyzeWithOpenAI(imageData, userPrompt);
      } else if (this.provider === 'google') {
        return await this.analyzeWithGoogle(imageData, userPrompt);
      } else {
        throw new Error('Invalid vision API provider');
      }
    } catch (error) {
      console.error('Vision API Error:', error);
      throw error;
    }
  }

  /**
   * Analyze image using OpenAI Vision API (GPT-4 Vision)
   */
  async analyzeWithOpenAI(imageData, userPrompt) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const systemPrompt = `You are a computer hardware and electronics expert. Analyze this product image and extract detailed information.

Your task:
1. Identify the product type (e.g., Graphics Card, RAM, Processor, Mouse, Keyboard, Monitor, etc.)
2. Identify the brand if visible
3. Extract model number or series if visible
4. Identify key specifications or features visible in the image
5. Describe the product's appearance and design features
6. List relevant technical specifications you can see
7. Suggest product categories this belongs to

Respond in JSON format:
{
  "productType": "main category of the product",
  "brand": "brand name or null if not visible",
  "model": "model number/name or null",
  "category": "specific category",
  "subCategory": "subcategory if applicable",
  "specifications": ["list", "of", "visible", "specs"],
  "features": ["design", "features", "visible"],
  "keywords": ["searchable", "terms", "for", "matching"],
  "description": "brief description of what you see",
  "confidence": 0.0-1.0
}`;

      const userMessage = userPrompt 
        ? `User says: "${userPrompt}"\n\nAnalyze this product image and provide detailed information.`
        : "Analyze this product image and provide detailed information.";

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.openaiModel,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userMessage
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`,
                    detail: 'high' // Use 'high' for detailed analysis, 'low' for faster/cheaper
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3 // Lower temperature for more consistent results
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiApiKey}`
          }
        }
      );

      const result = response.data.choices[0].message.content;
      
      // Try to parse JSON response
      try {
        const parsedResult = JSON.parse(result);
        return {
          success: true,
          data: parsedResult,
          provider: 'openai'
        };
      } catch (parseError) {
        // If not JSON, extract information from text
        return {
          success: true,
          data: this.extractFromText(result),
          provider: 'openai',
          rawResponse: result
        };
      }
    } catch (error) {
      console.error('OpenAI Vision API Error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        provider: 'openai'
      };
    }
  }

  /**
   * Analyze image using Groq Vision API (Llama 4 Scout)
   */
  async analyzeWithGroq(imageData, userPrompt) {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const systemPrompt = `You are a computer hardware expert specializing in product identification. Analyze this product image carefully.

CRITICAL RULES:
1. For Intel CPUs: productType MUST be "Processor" or "CPU", brand MUST be "Intel"
2. For AMD CPUs: productType MUST be "Processor" or "CPU", brand MUST be "AMD"  
3. For Graphics Cards: productType MUST be "Graphics Card" or "GPU"
4. For RAM: productType MUST be "RAM" or "Memory"
5. For Motherboards: productType MUST be "Motherboard"
6. For Storage: productType MUST be "SSD" or "HDD" or "Storage"
7. For Power Supplies: productType MUST be "Power Supply" or "PSU"

IDENTIFICATION TASKS:
1. Identify the EXACT product type (Processor, Graphics Card, RAM, Motherboard, etc.)
2. Identify the brand (Intel, AMD, NVIDIA, ASUS, Corsair, etc.)
3. Extract the specific model name/number (e.g., "Core i7-13700K", "Ryzen 7 5800X", "RTX 4090")
4. List visible specifications (cores, speed, memory size, etc.)
5. Extract searchable keywords

Return ONLY valid JSON with this EXACT structure:
{
  "productType": "Processor",
  "brand": "Intel",
  "model": "Core i7-13700K",
  "specs": ["16 cores", "3.4 GHz"],
  "keywords": ["intel", "i7", "13700k", "processor", "cpu", "13th", "gen"],
  "confidence": 0.95
}`;

      const userMessage = userPrompt 
        ? `${systemPrompt}\n\nUser context: ${userPrompt}\n\nAnalyze this product image and provide the JSON response.`
        : `${systemPrompt}\n\nAnalyze this product image and provide the JSON response.`;

      console.log('🤖 Calling Groq Vision API...');
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: this.groqModel,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userMessage
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1024,
          temperature: 0.3,
          response_format: { type: 'json_object' } // Enable JSON mode
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.groqApiKey}`
          },
          timeout: 30000
        }
      );

      const result = response.data.choices[0].message.content;
      console.log('📥 Raw Groq response:', result);
      
      // Parse JSON response
      try {
        const parsedResult = JSON.parse(result);
        console.log('✅ Parsed vision data:', parsedResult);
        return {
          success: true,
          data: parsedResult,
          provider: 'groq'
        };
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        // If not JSON, extract information from text
        return {
          success: true,
          data: this.extractFromText(result),
          provider: 'groq',
          rawResponse: result
        };
      }
    } catch (error) {
      console.error('❌ Groq Vision API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        provider: 'groq'
      };
    }
  }

  /**
   * Analyze image using Google Vision API
   */
  async analyzeWithGoogle(imageData, userPrompt) {
    if (!this.googleApiKey) {
      throw new Error('Google Vision API key not configured');
    }

    try {
      // Remove data URL prefix if present
      const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');

      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.googleApiKey}`,
        {
          requests: [
            {
              image: {
                content: base64Image
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 20 },
                { type: 'TEXT_DETECTION', maxResults: 10 },
                { type: 'LOGO_DETECTION', maxResults: 5 },
                { type: 'WEB_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const annotations = response.data.responses[0];
      
      return {
        success: true,
        data: this.processGoogleVisionResults(annotations, userPrompt),
        provider: 'google',
        rawResponse: annotations
      };
    } catch (error) {
      console.error('Google Vision API Error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        provider: 'google'
      };
    }
  }

  /**
   * Process Google Vision API results into structured format
   */
  processGoogleVisionResults(annotations, userPrompt) {
    const labels = annotations.labelAnnotations || [];
    const text = annotations.textAnnotations?.[0]?.description || '';
    const logos = annotations.logoAnnotations || [];
    const webDetection = annotations.webDetection || {};
    const objects = annotations.localizedObjectAnnotations || [];

    // Extract product information
    const productType = this.identifyProductType(labels, objects, text);
    const brand = this.extractBrand(logos, text, webDetection);
    const model = this.extractModel(text);
    const specs = this.extractSpecifications(text);

    // Generate keywords for search
    const keywords = [
      ...labels.map(l => l.description.toLowerCase()),
      ...(webDetection.bestGuessLabels || []).map(l => l.label.toLowerCase()),
      ...(brand ? [brand.toLowerCase()] : []),
      ...(model ? [model.toLowerCase()] : []),
      ...(userPrompt ? userPrompt.toLowerCase().split(' ') : []),
      productType.toLowerCase()
    ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

    return {
      productType,
      brand,
      model,
      category: productType,
      subCategory: this.inferSubCategory(labels, productType),
      specifications: specs,
      features: labels.slice(0, 10).map(l => l.description),
      keywords,
      description: webDetection.bestGuessLabels?.[0]?.label || labels[0]?.description || 'Product',
      confidence: labels[0]?.score || 0.5,
      detectedText: text.substring(0, 200) // First 200 chars
    };
  }

  /**
   * Identify product type from labels and objects
   */
  identifyProductType(labels, objects, text) {
    const lowercaseLabels = labels.map(l => l.description.toLowerCase());
    const lowercaseObjects = objects.map(o => o.name.toLowerCase());
    const allTerms = [...lowercaseLabels, ...lowercaseObjects, text.toLowerCase()];

    // Hardware categories
    const categories = {
      'Graphics Card': ['gpu', 'graphics card', 'video card', 'nvidia', 'geforce', 'radeon', 'rtx', 'gtx'],
      'Processor': ['cpu', 'processor', 'intel', 'amd', 'ryzen', 'core i', 'i3', 'i5', 'i7', 'i9'],
      'RAM': ['ram', 'memory', 'ddr4', 'ddr5', 'dimm', 'memory module'],
      'Motherboard': ['motherboard', 'mainboard', 'mobo', 'socket', 'chipset'],
      'Storage': ['ssd', 'hard drive', 'hdd', 'nvme', 'storage', 'm.2'],
      'Monitor': ['monitor', 'display', 'screen', 'lcd', 'led'],
      'Mouse': ['mouse', 'gaming mouse', 'wireless mouse'],
      'Keyboard': ['keyboard', 'mechanical keyboard', 'gaming keyboard'],
      'Headset': ['headset', 'headphone', 'earphone', 'gaming headset'],
      'Case': ['computer case', 'tower', 'chassis', 'pc case'],
      'Power Supply': ['psu', 'power supply', 'watt', 'modular'],
      'Cooling': ['cooler', 'fan', 'cooling', 'radiator', 'aio', 'liquid cooling']
    };

    for (const [category, terms] of Object.entries(categories)) {
      if (terms.some(term => allTerms.some(t => t.includes(term)))) {
        return category;
      }
    }

    return 'Electronics';
  }

  /**
   * Extract brand from logos and text
   */
  extractBrand(logos, text, webDetection) {
    if (logos && logos.length > 0) {
      return logos[0].description;
    }

    // Common tech brands
    const brands = [
      'NVIDIA', 'AMD', 'Intel', 'ASUS', 'MSI', 'Gigabyte', 'ASRock', 'EVGA',
      'Corsair', 'G.Skill', 'Kingston', 'Samsung', 'Western Digital', 'Seagate',
      'Logitech', 'Razer', 'SteelSeries', 'HyperX', 'Cooler Master', 'NZXT',
      'Thermaltake', 'be quiet!', 'Fractal Design'
    ];

    for (const brand of brands) {
      if (text.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }

    // Check web detection
    if (webDetection.webEntities) {
      for (const entity of webDetection.webEntities) {
        if (brands.some(b => entity.description?.includes(b))) {
          return entity.description;
        }
      }
    }

    return null;
  }

  /**
   * Extract model number from text
   */
  extractModel(text) {
    // Look for common model patterns
    const patterns = [
      /RTX\s*\d{4}(\s*Ti)?/gi,
      /GTX\s*\d{4}(\s*Ti)?/gi,
      /RX\s*\d{4}/gi,
      /Core\s*i[3579]-?\d{4,5}[A-Z]?/gi,
      /Ryzen\s*[3579]\s*\d{4}[A-Z]?/gi,
      /DDR[45]\s*\d{4}/gi,
      /\b[A-Z0-9]{3,}-[A-Z0-9]{2,}\b/g
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * Extract specifications from text
   */
  extractSpecifications(text) {
    const specs = [];
    
    // Memory size
    const memoryMatch = text.match(/(\d+)\s*(GB|MB|TB)/gi);
    if (memoryMatch) {
      specs.push(...memoryMatch);
    }

    // Speed/Frequency
    const speedMatch = text.match(/(\d+)\s*(MHz|GHz)/gi);
    if (speedMatch) {
      specs.push(...speedMatch);
    }

    // Wattage
    const wattMatch = text.match(/(\d+)\s*W(att)?/gi);
    if (wattMatch) {
      specs.push(...wattMatch);
    }

    return specs;
  }

  /**
   * Infer subcategory from labels
   */
  inferSubCategory(labels, productType) {
    const labelStrings = labels.map(l => l.description.toLowerCase()).join(' ');
    
    if (productType === 'Mouse' || productType === 'Keyboard') {
      if (labelStrings.includes('gaming') || labelStrings.includes('rgb')) {
        return 'Gaming';
      }
      if (labelStrings.includes('wireless')) {
        return 'Wireless';
      }
    }

    return null;
  }

  /**
   * Extract product information from text response
   */
  extractFromText(text) {
    // Fallback parser if JSON parsing fails
    return {
      productType: 'Unknown',
      brand: null,
      model: null,
      category: 'Electronics',
      subCategory: null,
      specifications: [],
      features: [],
      keywords: text.toLowerCase().split(/\s+/).filter(w => w.length > 3),
      description: text.substring(0, 200),
      confidence: 0.5
    };
  }

  /**
   * Match vision results with database products
   * @param {Object} visionData - Results from AI vision analysis
   * @param {Array} products - Array of products from database
   * @returns {Array} - Matched products sorted by relevance
   */
  matchProducts(visionData, products) {
    console.log('🔍 Matching with vision data:', visionData);
    console.log('📦 Total products to match:', products.length);
    
    const scores = products.map(product => {
      let score = 0;
      
      // Extract brand from various possible structures
      let brandName = '';
      if (product.brands && product.brands.name) {
        brandName = product.brands.name; // Supabase relation: brands.name
      } else if (product.brand_name) {
        brandName = product.brand_name;
      } else if (product.brand) {
        brandName = product.brand;
      }
      
      // Extract category from various possible structures  
      let categoryName = '';
      if (product.category_id) {
        categoryName = product.category_id;
      } else if (product.category) {
        categoryName = product.category;
      } else if (product.type) {
        categoryName = product.type;
      }
      // Also check product name for category hints
      const nameForCategory = (product.name || product.title || '').toLowerCase();
      
      const productData = {
        name: (product.name || product.title || product.productName || '').toLowerCase(),
        description: (product.description || '').toLowerCase(),
        brand: brandName.toLowerCase().trim(),
        category: categoryName.toLowerCase().trim(),
        // Handle both string and array formats for categories
        categories: Array.isArray(product.selected_components) 
          ? product.selected_components.map(c => (typeof c === 'object' ? c.name : c)?.toLowerCase() || '')
          : [categoryName.toLowerCase().trim()]
      };

      console.log(`Checking product: "${productData.name}" | Brand: "${productData.brand}" | Category: "${productData.category}"`);

      // Brand match (high weight) - ONLY if both have values
      if (visionData.brand && visionData.brand.toLowerCase() !== 'unknown') {
        const visionBrand = visionData.brand.toLowerCase().trim();
        
        // Skip if product has no brand
        if (!productData.brand || productData.brand === '') {
          console.log(`  ⚠️  Product has no brand, skipping brand match`);
        } else if (productData.brand.includes(visionBrand) || visionBrand.includes(productData.brand)) {
          score += 40;
          console.log(`  ✅ Brand match! +40 (${visionBrand} ↔ ${productData.brand})`);
        } else {
          console.log(`  ❌ Brand MISMATCH! (${visionBrand} ≠ ${productData.brand})`);
        }
      }

      // Model match (very high weight)
      if (visionData.model) {
        const model = visionData.model.toLowerCase();
        if (productData.name.includes(model) || productData.description.includes(model)) {
          score += 50;
          console.log(`  ✅ Model match! +50 (${model})`);
        }
      }

      // Product type/category match (CRITICAL for correct filtering)
      if (visionData.productType) {
        const visionType = visionData.productType.toLowerCase();
        
        // Normalize product types
        const typeMapping = {
          'processor': ['processor', 'cpu'],
          'cpu': ['processor', 'cpu'],
          'graphics card': ['graphics card', 'gpu', 'video card'],
          'gpu': ['graphics card', 'gpu', 'video card'],
          'ram': ['ram', 'memory'],
          'memory': ['ram', 'memory'],
          'motherboard': ['motherboard', 'mobo', 'mainboard'],
          'storage': ['ssd', 'hdd', 'storage', 'hard drive', 'solid state'],
          'ssd': ['ssd', 'solid state', 'storage'],
          'hdd': ['hdd', 'hard drive', 'storage'],
          'power supply': ['power supply', 'psu'],
          'psu': ['power supply', 'psu'],
          'case': ['case', 'chassis', 'tower'],
          'cooling': ['cooler', 'cooling', 'fan', 'radiator'],
          'monitor': ['monitor', 'display', 'screen'],
          'keyboard': ['keyboard'],
          'mouse': ['mouse', 'mice'],
          'headset': ['headset', 'headphone']
        };

        // Get synonyms for the detected product type
        const synonyms = typeMapping[visionType] || [visionType];
        
        // Check if product category OR name matches any synonym
        const categoryMatch = synonyms.some(syn => 
          (productData.category && productData.category.includes(syn)) ||
          (syn && productData.category && syn.includes(productData.category)) ||
          productData.categories.some(cat => cat && cat.includes(syn)) ||
          productData.name.includes(syn) ||
          nameForCategory.includes(syn)
        );

        if (categoryMatch) {
          score += 35; // Increased weight for category match
          console.log(`  ✅ Category match! +35 (${visionType} matches ${productData.category || productData.name})`);
        } else {
          console.log(`  ❌ Category mismatch (${visionType} vs ${productData.category})`);
        }
      }

      // Keyword matches
      visionData.keywords?.forEach(keyword => {
        if (keyword.length < 3) return; // Skip short keywords
        const kw = keyword.toLowerCase();
        
        if (productData.name.includes(kw)) {
          score += 5;
          console.log(`  ✅ Keyword in name! +5 (${keyword})`);
        }
        if (productData.description.includes(kw)) {
          score += 3;
          console.log(`  ✅ Keyword in description! +3 (${keyword})`);
        }
        if (productData.categories.some(cat => cat && cat.includes(kw))) {
          score += 4;
          console.log(`  ✅ Keyword in category! +4 (${keyword})`);
        }
      });

      // Specification matches
      visionData.specs?.forEach(spec => {
        const specLower = spec.toLowerCase();
        if (productData.name.includes(specLower) || productData.description.includes(specLower)) {
          score += 8;
          console.log(`  ✅ Spec match! +8 (${spec})`);
        }
      });

      console.log(`  📊 Total score: ${score}`);

      return {
        product,
        score
      };
    });

    // Filter products with meaningful scores (need at least category OR brand+model match)
    const minScore = 30; // Minimum score threshold
    const matches = scores
      .filter(item => item.score >= minScore)
      .sort((a, b) => b.score - a.score);
    
    console.log('🎯 Top matches:', matches.slice(0, 5).map(m => ({ name: m.product.name || m.product.title, score: m.score })));
    
    return matches
      .map(item => ({
        ...item.product,
        matchScore: item.score
      }));
  }

  /**
   * Check if Vision API is configured
   */
  isConfigured() {
    if (this.provider === 'groq') {
      return !!this.groqApiKey;
    } else if (this.provider === 'openai') {
      return !!this.openaiApiKey;
    } else if (this.provider === 'google') {
      return !!this.googleApiKey;
    }
    return false;
  }
}

export default new VisionService();
