import * as THREE from 'three';

/**
 * Component positioning configuration
 * Defines where each component type should be placed in 3D space
 * Adjusted so components are OUTSIDE or clearly visible from the case
 */
const componentPositions = {
  Motherboard: { x: 0, y: 0, z: 0, color: 0x00ff00, size: { w: 2, h: 0.1, d: 2.5 } }, // Green - Base/Floor
  CPU: { x: 0, y: 0.3, z: 0, color: 0xff0000, size: { w: 0.8, h: 0.2, d: 0.8 } }, // Red - On motherboard center
  GPU: { x: -0.6, y: 0.8, z: 0.3, color: 0x0000ff, size: { w: 0.4, h: 0.8, d: 1.5 } }, // Blue - Left side, horizontal
  RAM: { x: 0.6, y: 0.8, z: 0.8, color: 0xffff00, size: { w: 0.2, h: 0.8, d: 0.1 } }, // Yellow - Right back, vertical stick
  Storage: { x: 0.6, y: 0.3, z: -0.8, color: 0xff00ff, size: { w: 0.4, h: 0.1, d: 0.6 } }, // Magenta - Right front, flat
  PSU: { x: -0.6, y: 0.4, z: -0.9, color: 0x00ffff, size: { w: 0.7, h: 0.5, d: 0.5 } }, // Cyan - Left front bottom
  Cooling: { x: 0, y: 1.2, z: 0.5, color: 0xffa500, size: { w: 0.5, h: 0.5, d: 0.3 } }, // Orange - Top back (fan)
  Case: { x: 0, y: 1.2, z: 0, color: 0x404040, size: { w: 2.8, h: 2.8, d: 3 }, wireframe: true, opacity: 0.2 }, // Dark Gray transparent wireframe
};

/**
 * Creates a 3D mesh for a component
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
    metalness: 0.5,
    roughness: 0.5,
    transparent: wireframe || opacity ? true : false,
    opacity: opacity || (wireframe ? 0.2 : 1),
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(config.x, config.y, config.z);
  mesh.castShadow = !wireframe;
  mesh.receiveShadow = !wireframe;
  
  // Store metadata
  mesh.userData = {
    componentType,
    productName: product?.productName || componentType,
    productId: product?.id || null,
  };

  // Add edge lines for better visibility (except for case)
  if (!wireframe) {
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(lineSegments);
  }

  console.log(`✅ Created mesh for ${componentType}: ${product?.productName || 'N/A'}`);
  return mesh;
};

/**
 * Removes all component meshes from the scene (except test cube)
 */
const clearComponents = (scene) => {
  console.log('🗑️ Removing all components from scene...');
  
  const componentsToRemove = [];
  
  scene.traverse((child) => {
    // Don't remove the test cube (magenta rotating cube from SceneSetup)
    if (child.isMesh && child.userData.componentType && child.userData.componentType !== 'testCube') {
      componentsToRemove.push(child);
    }
  });

  componentsToRemove.forEach((mesh) => {
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose());
      } else {
        mesh.material.dispose();
      }
    }
    scene.remove(mesh);
  });

  console.log(`✅ Removed ${componentsToRemove.length} components`);
  return componentsToRemove.length;
};

/**
 * Updates the 3D scene with selected components
 */
export const updateComponents = (scene, selectedProducts, mini = false) => {
  console.log('🔄 Updating components...', selectedProducts);

  // Clear existing components (but keep test cube)
  clearComponents(scene);

  // Add new components
  let addedCount = 0;
  
  Object.entries(selectedProducts).forEach(([componentType, product]) => {
    if (product) {
      const mesh = createComponentMesh(componentType, product, mini);
      if (mesh) {
        scene.add(mesh);
        addedCount++;
        console.log(`➕ Added ${componentType} to scene at position (${mesh.position.x}, ${mesh.position.y}, ${mesh.position.z})`);
      }
    }
  });

  console.log(`✅ Added ${addedCount} components to scene`);
  
  return addedCount;
};