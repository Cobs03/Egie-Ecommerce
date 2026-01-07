import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import JSZip from 'jszip';

// Your Sketchfab API token
const SKETCHFAB_API_TOKEN = '40e432b03bd3443787fd33a830b1eae4';

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
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    fallbackSearch: 'pc case computer'
  },
  Motherboard: {
    scale: 0.01,
    position: [0, 1, 0],
    rotation: [-Math.PI / 2, 0, 0],
    fallbackSearch: 'motherboard'
  },
  Processor: {
    scale: 0.01,
    position: [0, 1.2, 0],
    rotation: [0, 0, 0],
    fallbackSearch: 'cpu processor intel amd'
  },
  CPU: {
    scale: 0.01,
    position: [0, 1.2, 0],
    rotation: [0, 0, 0],
    fallbackSearch: 'cpu processor'
  },
  GPU: {
    scale: 0.01,
    position: [0, 0.8, 0.5],
    rotation: [0, 0, 0],
    fallbackSearch: 'graphics card'
  },
  RAM: {
    scale: 0.01,
    position: [0.6, 1.2, 0],
    rotation: [0, 0, 0],
    fallbackSearch: 'ram memory'
  },
  SSD: {
    scale: 0.01,
    position: [-0.8, 0.5, 0],
    rotation: [0, 0, 0],
    fallbackSearch: 'ssd solid state drive'
  },
  HDD: {
    scale: 0.01,
    position: [-0.8, 0.3, 0],
    rotation: [0, 0, 0],
    fallbackSearch: 'hard disk drive hdd'
  },
  Cooling: {
    scale: 0.01,
    position: [0, 1.5, 0],
    rotation: [0, 0, 0],
    fallbackSearch: 'cpu cooler cooling fan'
  },
  PSU: {
    scale: 0.01,
    position: [0, 0.4, -0.6],
    rotation: [0, 0, 0],
    fallbackSearch: 'power supply'
  },
  Keyboard: {
    scale: 0.01,
    position: [-1.5, 0, 1],
    rotation: [0, 0, 0],
    fallbackSearch: 'gaming keyboard mechanical'
  },
  Mouse: {
    scale: 0.01,
    position: [1.5, 0, 1],
    rotation: [0, 0, 0],
    fallbackSearch: 'gaming mouse'
  },
  Monitor: {
    scale: 0.01,
    position: [0, 1.8, -1.5],
    rotation: [0, 0, 0],
    fallbackSearch: 'gaming monitor display'
  },
  Headset: {
    scale: 0.01,
    position: [-1, 1, 0.5],
    rotation: [0, 0, 0],
    fallbackSearch: 'gaming headset headphones'
  },
  Speaker: {
    scale: 0.01,
    position: [1, 1, 0.5],
    rotation: [0, 0, 0],
    fallbackSearch: 'speaker audio'
  },
  Webcam: {
    scale: 0.01,
    position: [0, 2.2, -1.2],
    rotation: [0, 0, 0],
    fallbackSearch: 'webcam camera'
  }
};

// Initialize loaders
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
gltfLoader.setDRACOLoader(dracoLoader);

// Cache for loaded models (keyed by product name)
const modelCache = new Map();

// Cache for search results (to avoid repeated searches for same product)
const searchCache = new Map();

/**
 * Build search query from product data
 * Strategy: Try multiple search approaches for better accuracy
 */
const buildSearchQuery = (productData, componentType) => {
  if (!productData) return null;
  
  const productName = productData.name || productData.productName || '';
  const brand = productData.brand || '';
  
  // Extract key identifiers (model numbers, series names)
  // Examples: "RTX 4090", "Ryzen 9 7950X", "H510", "RM850x"
  const modelPattern = /\b([A-Z]{2,4}[-\s]?\d{3,4}[A-Z]?[Xi]?)\b/gi;
  const modelMatches = productName.match(modelPattern) || [];
  
  // Clean product name but keep important identifiers
  let cleanName = productName
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\d+GB|\d+TB/gi, '') // Remove storage sizes
    .replace(/\d+MHz|\d+MT\/s/gi, '') // Remove speeds
    .replace(/DDR\d/gi, '') // Remove DDR versions
    .replace(/PCIe\s*\d+(\.\d+)?/gi, '') // Remove PCIe versions
    .replace(/\s+/g, ' ')
    .trim();
  
  // Build prioritized search query
  let searchQuery = '';
  
  // Priority 1: Brand + Model number (most specific)
  if (brand && modelMatches.length > 0) {
    searchQuery = brand + ' ' + modelMatches[0];
  }
  // Priority 2: Just model number if distinctive
  else if (modelMatches.length > 0 && modelMatches[0].length >= 4) {
    searchQuery = modelMatches[0];
  }
  // Priority 3: Brand + cleaned product name
  else if (brand && !cleanName.toLowerCase().includes(brand.toLowerCase())) {
    searchQuery = brand + ' ' + cleanName;
  }
  // Priority 4: Just the cleaned name
  else {
    searchQuery = cleanName;
  }
  
  // Limit query length (Sketchfab works better with shorter queries)
  const words = searchQuery.split(' ').filter(w => w.length > 1);
  if (words.length > 4) {
    searchQuery = words.slice(0, 4).join(' ');
  }
  
  return searchQuery;
};

/**
 * Generate fallback search queries (less specific)
 */
const generateFallbackQueries = (productData, componentType) => {
  const brand = productData?.brand || '';
  const queries = [];
  
  // Fallback 1: Brand + component type
  if (brand) {
    queries.push(brand + ' ' + componentType);
  }
  
  // Fallback 2: Component type + "3D model"
  queries.push(componentType + ' 3D model');
  
  // Fallback 3: Generic component
  const genericTerms = {
    'Case': 'PC case computer tower',
    'Motherboard': 'motherboard PCB',
    'CPU': 'CPU processor chip',
    'GPU': 'graphics card GPU',
    'RAM': 'RAM memory stick DDR',
    'CPU Cooler': 'CPU cooler heatsink fan',
    'Storage': 'SSD NVMe drive',
    'PSU': 'power supply unit PSU',
    'Fans': 'PC case fan RGB'
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
  const { count = 5 } = options;

  // Check search cache first
  const cacheKey = searchTerm.toLowerCase();
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
        count: '24', // Increased to get more results for better matching
        sort_by: '-relevance' // Changed from -likeCount to -relevance for better matches
      });

      console.log('🔍 Searching Sketchfab API for "' + searchTerm + '"...');
      const response = await fetch(
        'https://api.sketchfab.com/v3/search?' + params,
        {
          headers: {
            'Authorization': 'Token ' + SKETCHFAB_API_TOKEN
          }
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('⚠️ Rate limited, waiting 5 seconds...');
          // Wait longer before retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          throw new Error('Rate limited, please try again');
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
    const searchWords = searchTermLower.split(/\s+/);
    
    const scoredModels = downloadableModels.map(function(model) {
      const nameLower = model.name.toLowerCase();
      const descriptionLower = (model.description || '').toLowerCase();
      let score = 0;
      
      // NAME SCORING (Primary)
      // Exact match gets highest score
      if (nameLower === searchTermLower) {
        score = 1000;
      }
      // Contains full search term
      else if (nameLower.includes(searchTermLower)) {
        score = 500;
      }
      // Count matching words in name
      else {
        searchWords.forEach(function(word) {
          if (word.length > 2 && nameLower.includes(word)) {
            score += 100;
          }
        });
      }
      
      // DESCRIPTION SCORING (Secondary - worth less than name but still valuable)
      if (descriptionLower) {
        // Full search term in description
        if (descriptionLower.includes(searchTermLower)) {
          score += 300; // Good match, but less than name
        }
        
        // Count matching words in description
        searchWords.forEach(function(word) {
          if (word.length > 2 && descriptionLower.includes(word)) {
            score += 50; // Half value of name matches
          }
        });
      }
      
      // Bonus for models with more views/likes (quality indicator)
      score += Math.min(model.likeCount || 0, 50);
      score += Math.min((model.viewCount || 0) / 100, 50);
      
      return { model: model, score: score };
    });
    
    // Sort by score (highest first)
    scoredModels.sort(function(a, b) {
      return b.score - a.score;
    });
    
    const sortedModels = scoredModels.map(function(item) {
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
      const response = await fetch(
        'https://api.sketchfab.com/v3/models/' + modelUid + '/download',
        {
          headers: {
            'Authorization': 'Token ' + SKETCHFAB_API_TOKEN
          }
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Model not downloadable');
        }
        if (response.status === 429) {
          console.warn('⚠️ Rate limited on download URL, waiting 5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          throw new Error('Rate limited');
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
      
      const results = await searchSketchfabModels(query, { count: 8 });
      
      if (results.length === 0) {
        continue;
      }
      
      // Score and sort results by relevance
      const scoredResults = results.map(result => {
        let score = 0;
        const nameLower = result.name.toLowerCase();
        const productNameLower = (productData.productName || '').toLowerCase();
        const brandLower = (productData.brand || '').toLowerCase();
        
        // Exact brand match
        if (brandLower && nameLower.includes(brandLower)) score += 30;
        
        // Model number match
        const modelPattern = /\b([A-Z]{2,4}[-\s]?\d{3,4}[A-Z]?[Xi]?)\b/gi;
        const productModels = productNameLower.match(modelPattern) || [];
        const resultModels = nameLower.match(modelPattern) || [];
        if (productModels.some(pm => resultModels.some(rm => rm.toLowerCase().includes(pm.toLowerCase())))) {
          score += 50;
        }
        
        // Component type in name
        if (nameLower.includes(componentType.toLowerCase())) score += 20;
        
        // Penalize generic terms
        if (nameLower.includes('low poly')) score -= 10;
        if (nameLower.includes('cartoon')) score -= 20;
        if (nameLower.includes('stylized')) score -= 15;
        
        // Prefer higher quality (like count as proxy)
        score += Math.min(result.likeCount || 0, 100) / 10;
        
        return { ...result, relevanceScore: score };
      });
      
      // Sort by relevance score
      scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      console.log('📊 Top results:', scoredResults.slice(0, 3).map(r => 
        r.name + ' (score: ' + r.relevanceScore + ')'
      ));
      
      // Try each result until one works
      for (const result of scoredResults) {
        console.log('🎯 Trying model: ' + result.name + ' (score: ' + result.relevanceScore + ')');
        model = await loadSketchfabModel(result.uid, onProgress);
        if (model) {
          // Store model info including creator
          modelInfo = {
            name: result.name,
            uid: result.uid,
            creator: result.user?.displayName || result.user?.username || 'Unknown',
            creatorUrl: result.user?.profileUrl || ('https://sketchfab.com/' + (result.user?.username || '')),
            modelUrl: 'https://sketchfab.com/3d-models/' + result.uid,
            source: 'Sketchfab',
            relevanceScore: result.relevanceScore
          };
          break;
        }
      }
    }

    if (model) {
      // Auto-scale model to fit scene
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 3;
      const autoScale = targetSize / maxDim;
      
      model.scale.setScalar(autoScale);
      model.position.set(config.position[0], config.position[1], config.position[2]);
      
      if (config.rotation) {
        model.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
      }
      
      // Center the model
      box.setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.z -= center.z;
      model.position.y -= box.min.y;
      
      // Add metadata
      model.userData = {
        componentType: componentType,
        productData: productData,
        isComponent: true,
        source: 'sketchfab',
        modelInfo: modelInfo
      };
      model.name = 'component_' + componentType;

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