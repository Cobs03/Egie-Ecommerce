import * as THREE from 'three';
import { fetchComponentModel, fetchAllComponentModels } from './ModelFetcher';
import { clearModelCache } from './SketchfabLoader';

// Track loaded components
const loadedComponents = new Map();

/**
 * Update scene with selected components
 */
export const updateSceneWithComponents = async (scene, selectedProducts, onProgress, onStatusChange) => {
  console.log('Updating scene with components:', selectedProducts);
  
  const newTypes = new Set();
  
  // Get all selected component types
  Object.keys(selectedProducts).forEach(function(k) {
    if (selectedProducts[k]) {
      newTypes.add(k);
    }
  });
  
  // Remove components that are no longer selected
  loadedComponents.forEach(function(modelData, type) {
    if (!newTypes.has(type)) {
      console.log('🗑️ Removing:', type);
      if (modelData.model && modelData.model.parent) {
        scene.remove(modelData.model);
        disposeModel(modelData.model);
      }
      loadedComponents.delete(type);
    }
  });
  
  // Check if there are components to load
  if (newTypes.size === 0) {
    console.log('No components to load');
    if (onStatusChange) onStatusChange('No components selected');
    return;
  }
  
  // Load new or updated components
  const typesToLoad = [];
  
  newTypes.forEach(function(type) {
    const productData = selectedProducts[type];
    const existingData = loadedComponents.get(type);
    
    // Check if we need to reload (new product or different product)
    if (!existingData || existingData.productId !== productData.id) {
      // Remove old model if exists
      if (existingData && existingData.model) {
        scene.remove(existingData.model);
        disposeModel(existingData.model);
      }
      typesToLoad.push(type);
    }
  });
  
  // Load components
  for (let i = 0; i < typesToLoad.length; i++) {
    const type = typesToLoad[i];
    const productData = selectedProducts[type];
    
    const componentProgress = (progress) => {
      const overallProgress = ((i + progress / 100) / typesToLoad.length) * 100;
      if (onProgress) onProgress(overallProgress);
    };
    
    const result = await fetchComponentModel(
      scene,
      type,
      productData,
      componentProgress,
      onStatusChange
    );
    
    if (result) {
      loadedComponents.set(type, {
        model: result.model,
        productId: productData.id,
        source: result.source,
        available: result.available,
        modelInfo: result.modelInfo || null
      });
    }
  }
  
  console.log('Scene now has', loadedComponents.size, 'component models');
  
  // Return summary of loaded models
  const summary = {
    total: loadedComponents.size,
    available: 0,
    placeholders: 0
  };
  
  loadedComponents.forEach(function(data) {
    if (data.available) {
      summary.available++;
    } else {
      summary.placeholders++;
    }
  });
  
  return summary;
};

/**
 * Clear all component models from scene
 */
export const clearAllComponents = (scene) => {
  console.log('Clearing all component models...');
  
  loadedComponents.forEach(function(modelData, type) {
    if (modelData.model && modelData.model.parent) {
      scene.remove(modelData.model);
      disposeModel(modelData.model);
    }
  });
  
  loadedComponents.clear();
  clearModelCache();
};

/**
 * Dispose of a model and its resources
 */
const disposeModel = (model) => {
  model.traverse(function(child) {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(function(m) {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      } else {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }
  });
};

/**
 * Get information about loaded components
 */
export const getLoadedComponentsInfo = () => {
  const info = {};
  
  loadedComponents.forEach(function(data, type) {
    info[type] = {
      source: data.source,
      available: data.available,
      productId: data.productId,
      modelInfo: data.modelInfo || null
    };
  });
  
  return info;
};

/**
 * Get model info for a specific component
 * @param {string} componentType - The component type to get info for
 */
export const getComponentModelInfo = (componentType) => {
  const data = loadedComponents.get(componentType);
  if (data) {
    return {
      source: data.source,
      available: data.available,
      modelInfo: data.modelInfo || null
    };
  }
  return null;
};

/**
 * Show only a specific component, hide all others
 * @param {string} componentType - The component type to show (e.g., 'CPU', 'GPU')
 */
export const showOnlyComponent = (componentType) => {
  loadedComponents.forEach(function(modelData, type) {
    if (modelData.model) {
      modelData.model.visible = (type === componentType);
    }
  });
  console.log('👁️ Showing only:', componentType);
};

/**
 * Show all loaded components
 */
export const showAllComponents = () => {
  loadedComponents.forEach(function(modelData) {
    if (modelData.model) {
      modelData.model.visible = true;
    }
  });
  console.log('👁️ Showing all components');
};