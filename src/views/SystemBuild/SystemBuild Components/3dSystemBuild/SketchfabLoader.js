import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import JSZip from 'jszip';
import sketchfabTokenManager from '../../../../utils/sketchfabKeyManager';

// ========== RATE LIMITING & QUEUE SYSTEM ==========
// Prevents hitting API rate limits (429 errors)
let requestQueue = [];
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 1; // Only 1 request at a time (more strict)
const REQUEST_DELAY = 2000; // 2 seconds between requests (increased)

// Process the request queue
const processQueue = async () => {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
    return;
  }

  const { fn, resolve, reject } = requestQueue.shift();
  activeRequests++;

  try {
    const result = await fn();
    resolve(result);
  } catch (error) {
    reject(error);
  } finally {
    activeRequests--;
    // Add delay before next request to avoid rate limiting
    setTimeout(() => {
      processQueue();
    }, REQUEST_DELAY);
  }
};

// Queue a request with rate limiting
const queueRequest = (fn) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ fn, resolve, reject });
    processQueue();
  });
};

// ========== ENHANCED CACHING ==========
// Cache for model download URLs (lasts 1 hour)
const downloadUrlCache = new Map();
const DOWNLOAD_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Default configurations for component positioning (no search terms - will use product name)
const COMPONENT_CONFIGS = {
  Case: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'pc case computer'
  },
  Motherboard: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [-Math.PI / 2, 0, 0],
    fallbackSearch: 'motherboard'
  },
  Processor: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'cpu processor intel amd'
  },
  CPU: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'cpu processor'
  },
  GPU: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'graphics card'
  },
  RAM: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'ram memory'
  },
  SSD: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'ssd solid state drive'
  },
  HDD: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'hard disk drive hdd'
  },
  Cooling: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'cpu cooler cooling fan'
  },
  PSU: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'power supply'
  },
  Keyboard: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'gaming keyboard mechanical'
  },
  Mouse: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'gaming mouse'
  },
  Monitor: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'gaming monitor display'
  },
  Headset: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'gaming headset headphones'
  },
  Speaker: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'speaker audio'
  },
  Webcam: {
    scale: 0.01,
    position: [0, 0, 0],  // Center on floor
    rotation: [0, 0, 0],
    fallbackSearch: 'webcam camera'
  }
};

// Initialize loaders
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
gltfLoader.setDRACOLoader(dracoLoader);

// Suppress the KHR_materials_pbrSpecularGlossiness warning (it's deprecated but models still load)
const originalWarn = console.warn;
console.warn = function(...args) {
  if (args[0]?.includes('KHR_materials_pbrSpecularGlossiness')) return;
  originalWarn.apply(console, args);
};

// Cache for loaded models (keyed by product name)
const modelCache = new Map();

// Cache for search results (to avoid repeated searches for same product)
const searchCache = new Map();

/**
 * Build search query from product data
 * Strategy: Use FULL PRODUCT NAME first, then fallbacks
 */
const buildSearchQuery = (productData, componentType) => {
  if (!productData) return null;
  
  // DEBUG: Log what we're receiving
  console.log('🔍 buildSearchQuery received:', {
    componentType,
    productData,
    hasName: !!productData.name,
    hasProductName: !!productData.productName,
    keys: Object.keys(productData)
  });
  
  const productName = productData.name || productData.productName || '';
  
  if (!productName) {
    console.warn('⚠️ No product name found in productData:', productData);
    return null;
  }
  
  // Clean product name - remove storage sizes, speeds, but keep model identifiers
  let cleanName = productName
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\d+GB|\d+TB/gi, '') // Remove storage sizes
    .replace(/\d+MHz|\d+MT\/s/gi, '') // Remove speeds
    .replace(/DDR\d/gi, '') // Remove DDR versions
    .replace(/PCIe\s*\d+(\.\d+)?/gi, '') // Remove PCIe versions
    .replace(/\s+/g, ' ')
    .trim();
  
  // For monitors, try removing generic suffixes that might not match Sketchfab titles
  // "Samsung Odyssey G9 Curved Monitor" -> "Samsung Odyssey G9 Curved"
  if (componentType === 'Monitor') {
    cleanName = cleanName.replace(/\s+(Monitor|Display|Screen|LCD|LED)$/i, '').trim();
  }
  
  return cleanName;
};

/**
 * Generate fallback search queries (less specific)
 */
const generateFallbackQueries = (productData, componentType) => {
  const brand = productData?.brand || '';
  const productName = productData?.name || productData?.productName || '';
  const queries = [];
  
  // Extract model numbers/identifiers from product name
  const modelPattern = /\b([A-Z]{1,4}[-\s]?\d{1,4}[A-Z]?[Xi]?)\b/gi;
  const modelMatches = productName.match(modelPattern) || [];
  
  // Extract key product identifiers (Odyssey, Kraken, etc.)
  const importantWords = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && 
      !['gaming', 'wireless', 'wired', 'mechanical', 'edition', 'series', 'ultra'].includes(w));
  
  // Fallback 1: Brand + key identifiers (without "Monitor", "Keyboard" etc suffixes)
  // Example: "Samsung Odyssey G9" instead of "Samsung Odyssey G9 Curved Monitor"
  if (brand && importantWords.length > 0) {
    const keyTerms = importantWords.slice(0, 2).join(' ');
    if (modelMatches.length > 0) {
      queries.push(brand + ' ' + keyTerms + ' ' + modelMatches[0]);
    }
    queries.push(brand + ' ' + keyTerms); // Try without model number too
  }
  
  // Fallback 2: Brand + model number only
  if (brand && modelMatches.length > 0) {
    queries.push(brand + ' ' + modelMatches[0]);
  }
  
  // Fallback 3: Model number only (if found)
  if (modelMatches.length > 0) {
    queries.push(modelMatches[0]);
  }
  
  // Fallback 4: Brand + component type (LAST RESORT - very generic)
  if (brand) {
    queries.push(brand + ' ' + componentType);
  }
  
  // Fallback 4: Generic component type
  const genericTerms = {
    'Case': 'PC case computer tower',
    'Motherboard': 'motherboard PCB',
    'CPU': 'CPU processor chip',
    'Processor': 'CPU processor chip',
    'GPU': 'graphics card GPU',
    'RAM': 'RAM memory stick DDR',
    'CPU Cooler': 'CPU cooler heatsink fan',
    'Cooling': 'CPU cooler heatsink fan',
    'Storage': 'SSD NVMe drive',
    'SSD': 'SSD drive',
    'HDD': 'hard drive',
    'PSU': 'power supply unit PSU',
    'Fans': 'PC case fan RGB',
    'Keyboard': 'mechanical keyboard',
    'Mouse': 'gaming mouse',
    'Monitor': 'gaming monitor display',
    'Headset': 'gaming headset',
    'Speaker': 'speaker audio',
    'Webcam': 'webcam camera'
  };
  
  if (genericTerms[componentType]) {
    queries.push(genericTerms[componentType]);
  }
  
  return queries;
};

/**
 * Search Sketchfab for downloadable models (WITH RATE LIMITING)
 */
export const searchSketchfabModels = async (searchTerm, options = {}) => {
  const { count = 5, componentType = null } = options;

  // Check search cache first
  const cacheKey = searchTerm.toLowerCase() + (componentType ? '_' + componentType : '');
  if (searchCache.has(cacheKey)) {
    console.log('📦 Using cached results for "' + searchTerm + '"');
    return searchCache.get(cacheKey);
  }

  // Use the request queue to avoid rate limiting
  return queueRequest(async () => {
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        type: 'models',
        downloadable: 'true',
        count: '30', // Increased to get more results (some may fail to download)
        sort_by: '-relevance' // Changed from -likeCount to -relevance for better matches
      });

      console.log('🔍 Searching Sketchfab API for "' + searchTerm + '"...');
      
      // Get token from rotation manager
      const token = sketchfabTokenManager.getNextToken();
      
      const response = await fetch(
        'https://api.sketchfab.com/v3/search?' + params,
        {
          headers: {
            'Authorization': 'Token ' + token
          }
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          // Block this token for 60 seconds
          sketchfabTokenManager.blockToken(token, 60000);
          console.warn('⚠️ Rate limited, waiting 5 seconds...');
          // Wait longer before retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          throw new Error('Rate limited, please try again');
        }
        if (response.status === 401) {
          // Token is invalid, block it permanently
          sketchfabTokenManager.blockToken(token, 3600000); // 1 hour
          throw new Error('Invalid Sketchfab token');
        }
        throw new Error('Sketchfab API error: ' + response.status);
      }

      const data = await response.json();
      console.log('✅ Found ' + (data.results?.length || 0) + ' models for "' + searchTerm + '"');
    
    const downloadableModels = data.results?.filter(function(model) {
      return model.isDownloadable;
    }) || [];
    
    // Score and sort models by name similarity to search term
    const searchTermLower = searchTerm.toLowerCase();
    const searchWords = searchTermLower.split(/\s+/).filter(w => w.length > 1);
    
    // Component type keywords to filter out wrong types
    const componentTypeKeywords = {
      'Motherboard': { 
        include: ['motherboard', 'mobo', 'mainboard', 'pcb', 'socket', 'chipset'],
        exclude: ['keyboard', 'mouse', 'monitor', 'case', 'cooler', 'fan', 'psu', 'headset', 'speaker']
      },
      'Case': {
        include: ['case', 'tower', 'chassis', 'enclosure', 'pc case'],
        exclude: ['keyboard', 'mouse', 'monitor', 'motherboard', 'cooler', 'duct', 'airflow duct', 'fan duct', 'shroud', 'bracket', 'mount', 'adapter', 'cable']
      },
      'GPU': {
        include: ['gpu', 'graphics', 'video card', 'rtx', 'gtx', 'radeon', 'geforce'],
        exclude: ['cpu', 'processor', 'motherboard', 'keyboard', 'mouse']
      },
      'CPU': {
        include: ['cpu', 'processor', 'ryzen', 'intel', 'core i', 'threadripper'],
        exclude: ['gpu', 'graphics', 'motherboard', 'cooler', 'keyboard']
      },
      'RAM': {
        include: ['ram', 'memory', 'ddr', 'dimm', 'memory stick'],
        exclude: ['ssd', 'storage', 'motherboard', 'gpu']
      },
      'CPU Cooler': {
        include: ['cooler', 'heatsink', 'radiator', 'aio', 'cooling'],
        exclude: ['case', 'fan', 'motherboard']
      },
      'PSU': {
        include: ['psu', 'power supply', 'power unit'],
        exclude: ['ups', 'battery', 'cable']
      },
      'Monitor': {
        include: ['monitor', 'display', 'screen', 'lcd', 'led'],
        exclude: ['tv', 'television', 'keyboard', 'mouse']
      },
      'Keyboard': {
        include: ['keyboard', 'keeb'],
        exclude: ['mouse', 'mousepad', 'monitor', 'headset']
      },
      'Mouse': {
        include: ['mouse', 'mice'],
        exclude: ['keyboard', 'mousepad', 'monitor', 'headset']
      }
    };
    
    const scoredModels = downloadableModels.map(function(model) {
      const nameLower = model.name.toLowerCase();
      const descriptionLower = (model.description || '').toLowerCase();
      let score = 0;
      
      // COMPONENT TYPE FILTERING (Critical - prevents wrong type matches)
      if (componentType && componentTypeKeywords[componentType]) {
        const keywords = componentTypeKeywords[componentType];
        const combinedText = nameLower + ' ' + descriptionLower;
        
        // Check if model name contains excluded keywords (STRICT - auto-reject)
        const hasExcludedKeyword = keywords.exclude.some(kw => combinedText.includes(kw));
        
        // If excluded keyword found, COMPLETELY reject this model
        if (hasExcludedKeyword) {
          score = -999999; // Complete rejection - will be filtered out
          return { model: model, score: score }; // Skip further scoring
        }
        
        // Check if model name contains included keywords (REQUIRED for motherboards/specific types)
        const hasIncludedKeyword = keywords.include.some(kw => combinedText.includes(kw));
        
        // For critical component types, REQUIRE the component keyword to be present
        const strictTypes = ['Motherboard', 'GPU', 'CPU', 'RAM', 'PSU'];
        if (strictTypes.includes(componentType) && !hasIncludedKeyword) {
          score = -999999; // Reject if component keyword not present
          return { model: model, score: score };
        }
        
        // Bonus for correct component type keywords
        if (hasIncludedKeyword) {
          score += 30000; // Big bonus for matching component type
        }
      }
      
      // NAME SCORING (Primary) - Heavily prioritize name matches
      // Exact match gets MASSIVE score
      if (nameLower === searchTermLower) {
        score += 100000;
      }
      // Contains full search term in name
      else if (nameLower.includes(searchTermLower)) {
        score += 50000;
      }
      // Check for partial matches with high weight
      else {
        let nameMatchCount = 0;
        let totalWords = searchWords.length;
        
        searchWords.forEach(function(word) {
          if (word.length > 2 && nameLower.includes(word)) {
            nameMatchCount++;
            score += 5000; // High value for each word match
          }
        });
        
        // Bonus if most search words appear in name
        if (nameMatchCount >= Math.floor(totalWords * 0.6)) {
          score += 10000; // Good partial match bonus
        }
      }
      
      // BRAND/MODEL NUMBER DETECTION - Critical for tech products
      // Extract potential model numbers and brand names
      const modelNumbers = searchTermLower.match(/[a-z0-9]+-?[0-9]+[a-z]?|g[0-9]+|z[0-9]+|i[0-9]+|rtx[0-9]+/gi) || [];
      const brandNames = ['samsung', 'asus', 'corsair', 'aula', 'intel', 'amd', 'nvidia', 'logitech', 'razer'];
      
      modelNumbers.forEach(function(modelNum) {
        if (nameLower.includes(modelNum.toLowerCase())) {
          score += 20000; // Model numbers are VERY important
        }
      });
      
      brandNames.forEach(function(brand) {
        if (searchTermLower.includes(brand) && nameLower.includes(brand)) {
          score += 15000; // Brand match is crucial
        }
      });
      
      // DESCRIPTION SCORING (Tertiary - minimal impact)
      if (descriptionLower && descriptionLower.includes(searchTermLower)) {
        score += 500; // Much less than name matches
      }
      
      // Popularity bonus - VERY small impact (only for tie-breaking)
      score += Math.min(model.likeCount || 0, 10);
      score += Math.min((model.viewCount || 0) / 1000, 10);
      
      return { model: model, score: score };
    });
    
    // Sort by score (highest first) and filter out rejected models
    scoredModels.sort(function(a, b) {
      return b.score - a.score;
    });
    
    // Filter out models with negative scores (rejected by component type filtering)
    const validModels = scoredModels.filter(function(item) {
      return item.score > 0;
    });
    
    const sortedModels = validModels.map(function(item) {
      return item.model;
    });
    
    if (sortedModels.length > 0) {
      console.log('🎯 Best match: "' + sortedModels[0].name + '" (score: ' + scoredModels[0].score + ')');
    }
    
    // Cache the results with timestamp
    searchCache.set(cacheKey, sortedModels);
    
    return sortedModels;
    } catch (error) {
      console.error('❌ Search error:', error);
      return [];
    }
  });
};

/**
 * Get download URL for a Sketchfab model (WITH RATE LIMITING & CACHING)
 */
export const getSketchfabDownloadUrl = async (modelUid) => {
  // Check cache first
  const cached = downloadUrlCache.get(modelUid);
  if (cached && (Date.now() - cached.timestamp < DOWNLOAD_CACHE_DURATION)) {
    console.log('📦 Using cached download URL for', modelUid);
    return cached.data;
  }

  // Use the request queue to avoid rate limiting
  return queueRequest(async () => {
    try {
      console.log('📥 Fetching download URL for', modelUid);
      
      // Get token from rotation manager
      const token = sketchfabTokenManager.getNextToken();
      
      const response = await fetch(
        'https://api.sketchfab.com/v3/models/' + modelUid + '/download',
        {
          headers: {
            'Authorization': 'Token ' + token
          }
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          console.warn('⚠️ Model', modelUid, 'claims to be downloadable but returns 403 - trying next model');
          throw new Error('Model not downloadable');
        }
        if (response.status === 429) {
          // Block this token for 60 seconds
          sketchfabTokenManager.blockToken(token, 60000);
          console.warn('⚠️ Rate limited on download URL, waiting 5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          throw new Error('Rate limited');
        }
        if (response.status === 401) {
          // Token is invalid, block it permanently
          sketchfabTokenManager.blockToken(token, 3600000); // 1 hour
          throw new Error('Invalid Sketchfab token');
        }
        throw new Error('API error: ' + response.status);
      }

      const data = await response.json();
      console.log('📋 Available formats:', Object.keys(data));
      
      let result = null;
      if (data.gltf?.url) {
        result = { url: data.gltf.url, format: 'gltf' };
      } else if (data.glb?.url) {
        result = { url: data.glb.url, format: 'glb' };
      } else {
        throw new Error('No GLTF/GLB format available');
      }

      // Cache the result
      downloadUrlCache.set(modelUid, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('❌ Download URL error:', error);
      return null;
    }
  });
};

/**
 * Download and extract ZIP file, then load GLTF
 */
const loadGLTFFromZip = async (url, onProgress) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to download: ' + response.status);
  }
  
  const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
  let loadedSize = 0;
  
  const reader = response.body.getReader();
  const chunks = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loadedSize += value.length;
    if (totalSize > 0 && onProgress) {
      onProgress((loadedSize / totalSize) * 50);
    }
  }
  
  const arrayBuffer = new Uint8Array(loadedSize);
  let offset = 0;
  for (const chunk of chunks) {
    arrayBuffer.set(chunk, offset);
    offset += chunk.length;
  }
  
  if (onProgress) onProgress(55);
  
  const zip = await JSZip.loadAsync(arrayBuffer.buffer);
  
  let gltfFile = null;
  let gltfFileName = null;
  const files = {};
  
  for (const fileName of Object.keys(zip.files)) {
    const file = zip.files[fileName];
    if (file.dir) continue;
    
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.gltf') || lowerName.endsWith('.glb')) {
      gltfFile = file;
      gltfFileName = fileName;
    }
    
    files[fileName] = file;
  }
  
  if (!gltfFile) {
    throw new Error('No GLTF/GLB file found in ZIP');
  }
  
  if (onProgress) onProgress(65);
  
  const isGLB = gltfFileName.toLowerCase().endsWith('.glb');
  
  if (isGLB) {
    const glbData = await gltfFile.async('arraybuffer');
    if (onProgress) onProgress(80);
    
    return new Promise(function(resolve, reject) {
      gltfLoader.parse(
        glbData,
        '',
        function(gltf) {
          if (onProgress) onProgress(100);
          resolve(gltf.scene);
        },
        function(error) {
          reject(error);
        }
      );
    });
  } else {
    const gltfContent = await gltfFile.async('text');
    const gltfJson = JSON.parse(gltfContent);
    
    if (onProgress) onProgress(70);
    
    const gltfDir = gltfFileName.includes('/') 
      ? gltfFileName.substring(0, gltfFileName.lastIndexOf('/') + 1) 
      : '';
    
    const blobUrls = {};
    
    if (gltfJson.buffers) {
      for (let i = 0; i < gltfJson.buffers.length; i++) {
        const buffer = gltfJson.buffers[i];
        if (buffer.uri && !buffer.uri.startsWith('data:')) {
          const bufferPath = gltfDir + buffer.uri;
          const bufferFile = files[bufferPath] || files[buffer.uri];
          if (bufferFile) {
            const bufferData = await bufferFile.async('arraybuffer');
            const blob = new Blob([bufferData]);
            blobUrls[buffer.uri] = URL.createObjectURL(blob);
            gltfJson.buffers[i].uri = blobUrls[buffer.uri];
          }
        }
      }
    }
    
    if (gltfJson.images) {
      for (let i = 0; i < gltfJson.images.length; i++) {
        const image = gltfJson.images[i];
        if (image.uri && !image.uri.startsWith('data:')) {
          const imagePath = gltfDir + image.uri;
          const imageFile = files[imagePath] || files[image.uri];
          if (imageFile) {
            const imageData = await imageFile.async('arraybuffer');
            const mimeType = image.uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
            const blob = new Blob([imageData], { type: mimeType });
            blobUrls[image.uri] = URL.createObjectURL(blob);
            gltfJson.images[i].uri = blobUrls[image.uri];
          }
        }
      }
    }
    
    if (onProgress) onProgress(85);
    
    const modifiedGltf = JSON.stringify(gltfJson);
    
    return new Promise(function(resolve, reject) {
      gltfLoader.parse(
        modifiedGltf,
        '',
        function(gltf) {
          Object.values(blobUrls).forEach(function(url) {
            URL.revokeObjectURL(url);
          });
          if (onProgress) onProgress(100);
          resolve(gltf.scene);
        },
        function(error) {
          Object.values(blobUrls).forEach(function(url) {
            URL.revokeObjectURL(url);
          });
          reject(error);
        }
      );
    });
  }
};

/**
 * Load a model from Sketchfab by UID
 */
export const loadSketchfabModel = async (modelUid, onProgress) => {
  if (modelCache.has(modelUid)) {
    return modelCache.get(modelUid).clone();
  }

  try {
    const downloadInfo = await getSketchfabDownloadUrl(modelUid);
    if (!downloadInfo) {
      return null;
    }

    const model = await loadGLTFFromZip(downloadInfo.url, onProgress);
    
    modelCache.set(modelUid, model.clone());
    
    return model;
  } catch (error) {
    return null;
  }
};

/**
 * Load model for a component type from Sketchfab using PRODUCT DATA
 */
export const loadComponentFromSketchfab = async (scene, componentType, productData, onProgress) => {
  const config = COMPONENT_CONFIGS[componentType];
  
  if (!config) {
    return null;
  }

  if (!productData) {
    return null;
  }

  try {
    let model = null;
    let modelInfo = null; // Store the model metadata
    
    // Build search query from ACTUAL PRODUCT DATA
    const searchQuery = buildSearchQuery(productData, componentType);
    
    // Generate fallback queries
    const fallbackQueries = generateFallbackQueries(productData, componentType);
    
    // All queries to try (primary + fallbacks)
    const allQueries = searchQuery ? [searchQuery, ...fallbackQueries] : fallbackQueries;
    
    // Try each query until we find a working model
    for (const query of allQueries) {
      if (model) break; // Already found a model
      
      const results = await searchSketchfabModels(query, { count: 8, componentType: componentType });
      
      if (results.length === 0) {
        continue;
      }
      
      // Results are already sorted by relevance from searchSketchfabModels
      // Just log the top results and try them in order
      console.log('📊 Top results:', results.slice(0, 3).map(r => 
        r.name + ' (from search scoring)'
      ));
      
      // Try each result until one works
      for (const result of results) {
        console.log('🎯 Trying model: ' + result.name);
        try {
          model = await loadSketchfabModel(result.uid, onProgress);
          if (model) {
            // Store model info including creator
            modelInfo = {
              name: result.name,
              uid: result.uid,
              creator: result.user?.displayName || result.user?.username || 'Unknown',
              creatorUrl: result.user?.profileUrl || ('https://sketchfab.com/' + (result.user?.username || '')),
              modelUrl: 'https://sketchfab.com/3d-models/' + result.uid,
              source: 'Sketchfab'
            };
            console.log('✅ Successfully loaded: ' + result.name);
            break;
          } else {
            console.log('⚠️ Model failed to load (likely not downloadable), trying next...');
          }
        } catch (error) {
          console.log('⚠️ Model error:', error.message, '- trying next...');
        }
      }
    }

    if (model) {
      // Apply rotation first (important for correct positioning)
      if (config.rotation) {
        model.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
      }
      
      // Center the model first at origin
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x = -center.x;
      model.position.z = -center.z;
      model.position.y = -box.min.y; // Place on floor
      
      // Auto-scale model to fit scene
      box.setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 3;
      const autoScale = targetSize / maxDim;
      
      model.scale.setScalar(autoScale);
      
      // Recalculate box after scaling to get accurate floor position
      box.setFromObject(model);
      model.position.y = -box.min.y; // Ensure on floor after scaling
      
      // Now apply the configured position offset
      const offsetX = config.position[0];
      const offsetY = config.position[1];
      const offsetZ = config.position[2];
      
      model.position.x += offsetX;
      model.position.y += offsetY;
      model.position.z += offsetZ;
      
      // Add metadata
      model.userData = {
        componentType: componentType,
        productData: productData,
        isComponent: true,
        source: 'sketchfab',
        modelInfo: modelInfo
      };
      model.name = 'component_' + componentType;

      // Remove any existing model with the same name (prevent stacking)
      const existingModel = scene.children.find(child => child.name === model.name);
      if (existingModel) {
        console.log('🗑️ Removing existing ' + componentType + ' model');
        scene.remove(existingModel);
        // Dispose of old model resources
        existingModel.traverse(function(child) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => {
                if (m.map) m.map.dispose();
                m.dispose();
              });
            } else {
              if (child.material.map) child.material.map.dispose();
              child.material.dispose();
            }
          }
        });
      }

      // Enable shadows
      model.traverse(function(child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(model);
      console.log('✅ ' + componentType + ' (' + productData.productName + ') added to scene');
      return { model: model, modelInfo: modelInfo };
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Clear model cache
 */
export const clearModelCache = () => {
  modelCache.forEach(function(model) {
    model.traverse(function(child) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(function(m) { m.dispose(); });
        } else {
          child.material.dispose();
        }
      }
    });
  });
  modelCache.clear();
  searchCache.clear();
};