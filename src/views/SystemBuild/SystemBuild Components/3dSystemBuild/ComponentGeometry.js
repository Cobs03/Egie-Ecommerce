import * as THREE from 'three';
import { updateComponentsWithModels, searchSketchfabModels, toggleTestCube } from './SketchfabLoader';

/**
 * Component positioning configuration (kept for reference/fallback)
 */
const componentPositions = {
  Motherboard: { x: 0, y: 0, z: 0, color: 0x2d5016, size: { w: 2, h: 0.1, d: 2.5 } },
  CPU: { x: 0, y: 0.3, z: 0, color: 0x444444, size: { w: 0.8, h: 0.2, d: 0.8 } },
  GPU: { x: -0.6, y: 0.8, z: 0.3, color: 0x1a1a1a, size: { w: 0.4, h: 0.8, d: 1.5 } },
  RAM: { x: 0.6, y: 0.8, z: 0.8, color: 0x00ff00, size: { w: 0.2, h: 0.8, d: 0.1 } },
  Storage: { x: 0.6, y: 0.3, z: -0.8, color: 0x0066cc, size: { w: 0.4, h: 0.1, d: 0.6 } },
  PSU: { x: -0.6, y: 0.4, z: -0.9, color: 0x333333, size: { w: 0.7, h: 0.5, d: 0.5 } },
  Cooling: { x: 0, y: 1.2, z: 0.5, color: 0x666666, size: { w: 0.5, h: 0.5, d: 0.3 } },
  Case: { x: 0, y: 1.2, z: 0, color: 0x222222, size: { w: 2.8, h: 2.8, d: 3 }, wireframe: true, opacity: 0.15 },
};

/**
 * Flag to use Sketchfab models or simple boxes
 */
let USE_SKETCHFAB_MODELS = true;

export const setUseSketchfabModels = (value) => {
  USE_SKETCHFAB_MODELS = value;
  console.log(`🔧 Sketchfab models: ${value ? 'ENABLED' : 'DISABLED'}`);
};

/**
 * Cache for searched models to avoid duplicate API calls
 */
const searchCache = new Map();

/**
 * Search Sketchfab for a product and return the first downloadable model UID
 */
const findModelUidForProduct = async (productName) => {
  // Check cache first
  if (searchCache.has(productName)) {
    console.log(`♻️ Using cached UID for ${productName}`);
    return searchCache.get(productName);
  }

  try {
    console.log(`🔎 Searching Sketchfab for: "${productName}"`);
    const models = await searchSketchfabModels(productName, 1); // Get only 1 result
    
    if (models && models.length > 0) {
      const uid = models[0].uid;
      console.log(`✅ Found model UID: ${uid} for ${productName}`);
      searchCache.set(productName, uid);
      return uid;
    } else {
      console.warn(`⚠️ No downloadable models found for: ${productName}`);
      searchCache.set(productName, null);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error searching for ${productName}:`, error);
    searchCache.set(productName, null);
    return null;
  }
};

/**
 * Enriches selected products with Sketchfab model UIDs
 */
const enrichProductsWithModelUids = async (selectedProducts) => {
  const enriched = { ...selectedProducts };
  
  for (const [componentType, product] of Object.entries(selectedProducts)) {
    if (product && product.productName && !product.sketchfabUid) {
      const uid = await findModelUidForProduct(product.productName);
      enriched[componentType] = {
        ...product,
        sketchfabUid: uid,
      };
    }
  }
  
  return enriched;
};

/**
 * Creates a simple box mesh (fallback)
 */
const createComponentMesh = (componentType, product, mini = false) => {
  const config = componentPositions[componentType];
  
  if (!config) {
    console.warn(`⚠️ No position config for component type: ${componentType}`);
    return null;
  }

  const { size, color, wireframe, opacity } = config;
  const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
  
  const material = new THREE.MeshStandardMaterial({
    color: color,
    wireframe: wireframe || false,
    metalness: wireframe ? 0 : 0.7,
    roughness: wireframe ? 1 : 0.3,
    transparent: wireframe || opacity ? true : false,
    opacity: opacity || (wireframe ? 0.15 : 1),
    emissive: wireframe ? 0x000000 : color,
    emissiveIntensity: 0.1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(config.x, config.y, config.z);
  mesh.castShadow = !wireframe;
  mesh.receiveShadow = !wireframe;
  
  mesh.userData = {
    componentType,
    productName: product?.productName || componentType,
    productId: product?.id || null,
  };

  if (!wireframe) {
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x000000, 
      linewidth: 2,
      transparent: true,
      opacity: 0.3
    });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(lineSegments);
  }

  console.log(`✅ Created box mesh for ${componentType}`);
  return mesh;
};

/**
 * Clears all component meshes from scene
 */
const clearComponents = (scene) => {
  console.log('🗑️ Removing all components from scene...');
  
  const componentsToRemove = [];
  
  scene.traverse((child) => {
    if (child.isMesh && child.userData.componentType && child.userData.componentType !== 'testCube') {
      componentsToRemove.push(child);
    }
  });

  componentsToRemove.forEach((mesh) => {
    mesh.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      }
    });
    scene.remove(mesh);
  });

  console.log(`✅ Removed ${componentsToRemove.length} components`);
  return componentsToRemove.length;
};

/**
 * Updates the 3D scene with selected components
 */
export const updateComponents = async (scene, selectedProducts, mini = false) => {
  console.log('🔄 Updating components...', selectedProducts);

  const hasProducts = Object.keys(selectedProducts).length > 0;

  if (USE_SKETCHFAB_MODELS && hasProducts) {
    try {
      console.log('🔍 Searching Sketchfab for models...');
      
      // Hide test cube immediately when products are being loaded
      toggleTestCube(scene, false);
      
      const enrichedProducts = await enrichProductsWithModelUids(selectedProducts);
      await updateComponentsWithModels(scene, enrichedProducts);
      
    } catch (error) {
      console.error('❌ Error loading Sketchfab models, falling back to boxes:', error);
      
      // Hide test cube before fallback
      toggleTestCube(scene, false);
      
      clearComponents(scene);
      let addedCount = 0;
      Object.entries(selectedProducts).forEach(([componentType, product]) => {
        if (product) {
          const mesh = createComponentMesh(componentType, product, mini);
          if (mesh) {
            scene.add(mesh);
            addedCount++;
          }
        }
      });
      
      console.log(`✅ Added ${addedCount} fallback box components`);
    }
  } else if (hasProducts) {
    // Hide test cube before adding simple boxes
    toggleTestCube(scene, false);
    
    clearComponents(scene);
    let addedCount = 0;
    Object.entries(selectedProducts).forEach(([componentType, product]) => {
      if (product) {
        const mesh = createComponentMesh(componentType, product, mini);
        if (mesh) {
          scene.add(mesh);
          addedCount++;
        }
      }
    });
    
    console.log(`✅ Added ${addedCount} box components to scene`);
  } else {
    // No products - show test cube
    clearComponents(scene);
    toggleTestCube(scene, true);
    console.log('ℹ️ No products selected, showing test cube');
  }
};