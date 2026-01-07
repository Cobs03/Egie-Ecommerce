import { loadComponentFromSketchfab } from './SketchfabLoader';
import { createPlaceholderModel, hasLocalModel, loadLocalModel } from './PlaceholderModels';

/**
 * Model Fetcher - Tries multiple sources to get 3D models
 * Priority:
 * 1. Local pre-made models (fastest)
 * 2. Sketchfab API (product-specific search)
 * 3. Sketchfab API (generic component type search)
 * 4. Placeholder geometric model (fallback)
 */

export const fetchComponentModel = async (scene, componentType, productData, onProgress, onStatusChange) => {
  if (!productData) {
    return null;
  }

  const productName = productData.name || productData.productName || componentType;
  // Update status callback
  const updateStatus = (status) => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  try {
    // PRIORITY 1: Check for local pre-made model
    updateStatus(`Checking local models for ${componentType}...`);
    if (hasLocalModel(productData, componentType)) {
      const localModel = await loadLocalModel(scene, componentType, productData, onProgress);
      if (localModel) {
        updateStatus(`Loaded local model for ${productName}`);
        return { model: localModel, source: 'local', available: true };
      }
    }

    // PRIORITY 2: Try Sketchfab with product name
    updateStatus(`Searching Sketchfab for "${productName}"...`);
    if (onProgress) onProgress(10);
    
    const sketchfabResult = await loadComponentFromSketchfab(
      scene, 
      componentType, 
      productData, 
      (progress) => {
        if (onProgress) onProgress(10 + progress * 0.7); // 10-80%
      }
    );

    if (sketchfabResult && sketchfabResult.model) {
      updateStatus(`Loaded ${productName} from Sketchfab`);
      if (onProgress) onProgress(100);
      return { 
        model: sketchfabResult.model, 
        source: 'sketchfab', 
        available: true,
        modelInfo: sketchfabResult.modelInfo
      };
    }

    // PRIORITY 3: Create placeholder model
    updateStatus(`Creating placeholder for ${componentType}...`);
    if (onProgress) onProgress(90);
    
    const placeholder = createPlaceholderModel(scene, componentType, productData);
    if (onProgress) onProgress(100);
    
    updateStatus(`3D model not available for ${productName}`);
    return { 
      model: placeholder, 
      source: 'placeholder', 
      available: false,
      message: `3D model not available for "${productName}"`
    };

  } catch (error) {
    updateStatus(`Failed to load model for ${componentType}`);
    
    // Return placeholder on error
    const placeholder = createPlaceholderModel(scene, componentType, productData);
    return { 
      model: placeholder, 
      source: 'placeholder', 
      available: false,
      error: error.message
    };
  }
};

/**
 * Fetch models for multiple components
 */
export const fetchAllComponentModels = async (scene, selectedProducts, onProgress, onStatusChange) => {
  const results = {};
  const componentTypes = Object.keys(selectedProducts);
  const totalComponents = componentTypes.length;
  
  for (let i = 0; i < componentTypes.length; i++) {
    const componentType = componentTypes[i];
    const productData = selectedProducts[componentType];
    
    if (!productData) continue;
    
    const componentProgress = (progress) => {
      const overallProgress = ((i + progress / 100) / totalComponents) * 100;
      if (onProgress) onProgress(overallProgress);
    };
    
    results[componentType] = await fetchComponentModel(
      scene, 
      componentType, 
      productData, 
      componentProgress,
      onStatusChange
    );
  }
  
  return results;
};