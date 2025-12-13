import * as THREE from 'three';

// Map of local model paths (if you have pre-made models in public folder)
const LOCAL_MODELS = {
  // Add paths to your local GLB/GLTF files
  // 'ProductID': '/models/specific-product.glb',
  // 'CASE-001': '/models/nzxt-h510.glb',
};

// Placeholder configurations for each component type
const PLACEHOLDER_CONFIGS = {
  Case: {
    geometry: () => new THREE.BoxGeometry(2, 2.5, 1.5),
    color: 0x2a2a2a,
    position: [0, 1.25, 0],
    label: '🖥️ Case'
  },
  Motherboard: {
    geometry: () => new THREE.BoxGeometry(1.5, 0.1, 1.5),
    color: 0x1a5c1a,
    position: [0, 0.5, 0],
    label: '🔲 Motherboard'
  },
  CPU: {
    geometry: () => new THREE.BoxGeometry(0.3, 0.05, 0.3),
    color: 0x4a90d9,
    position: [0, 0.55, 0],
    label: '💻 CPU'
  },
  GPU: {
    geometry: () => new THREE.BoxGeometry(1.2, 0.25, 0.6),
    color: 0x333333,
    position: [0, 0.3, 0.4],
    label: '🎮 GPU'
  },
  RAM: {
    geometry: () => new THREE.BoxGeometry(0.08, 0.4, 0.6),
    color: 0x2ecc71,
    position: [0.5, 0.7, 0],
    label: '📊 RAM'
  },
  'CPU Cooler': {
    geometry: () => new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16),
    color: 0x888888,
    position: [0, 0.8, 0],
    label: '❄️ CPU Cooler'
  },
  Storage: {
    geometry: () => new THREE.BoxGeometry(0.4, 0.05, 0.5),
    color: 0x1a1a1a,
    position: [-0.5, 0.3, 0],
    label: '💾 Storage'
  },
  PSU: {
    geometry: () => new THREE.BoxGeometry(0.8, 0.4, 0.5),
    color: 0x1a1a1a,
    position: [0, 0.2, -0.5],
    label: '⚡ PSU'
  },
  Fans: {
    geometry: () => new THREE.CylinderGeometry(0.25, 0.25, 0.1, 8),
    color: 0x444444,
    position: [0.8, 1, 0],
    rotation: [0, 0, Math.PI / 2],
    label: '🌀 Fan'
  }
};

/**
 * Check if a local model exists for the product
 */
export const hasLocalModel = (productData, componentType) => {
  if (!productData) return false;
  
  // Check by product ID
  if (productData.id && LOCAL_MODELS[productData.id]) {
    return true;
  }
  
  // Check by product name (exact match)
  if (productData.productName && LOCAL_MODELS[productData.productName]) {
    return true;
  }
  
  return false;
};

/**
 * Load a local pre-made model
 */
export const loadLocalModel = async (scene, componentType, productData, onProgress) => {
  // For now, return null - implement when you have local models
  // You would use GLTFLoader to load from /public/models/ folder
  return null;
};

/**
 * Create a placeholder geometric model
 */
export const createPlaceholderModel = (scene, componentType, productData) => {
  const config = PLACEHOLDER_CONFIGS[componentType] || {
    geometry: () => new THREE.BoxGeometry(0.5, 0.5, 0.5),
    color: 0x666666,
    position: [0, 0.25, 0],
    label: '📦 Component'
  };

  // Create group to hold placeholder
  const group = new THREE.Group();
  group.name = 'component_' + componentType;

  // Create main geometry
  const geometry = config.geometry();
  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    metalness: 0.3,
    roughness: 0.7,
    transparent: true,
    opacity: 0.85
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  // Apply rotation if specified
  if (config.rotation) {
    mesh.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
  }
  
  group.add(mesh);

  // Add wireframe overlay for "placeholder" look
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });
  const wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
  if (config.rotation) {
    wireframe.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
  }
  group.add(wireframe);

  // Add label sprite
  const labelSprite = createLabelSprite(
    productData?.productName || config.label,
    componentType
  );
  labelSprite.position.set(0, getBoundingHeight(mesh) + 0.3, 0);
  group.add(labelSprite);

  // Position the group
  group.position.set(config.position[0], config.position[1], config.position[2]);

  // Add metadata
  group.userData = {
    componentType: componentType,
    productData: productData,
    isComponent: true,
    isPlaceholder: true,
    source: 'placeholder'
  };

  scene.add(group);
  console.log('🔲 Placeholder created for:', componentType);
  
  return group;
};

/**
 * Create a text label sprite
 */
const createLabelSprite = (text, componentType) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;

  // Background
  context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  context.roundRect(0, 0, canvas.width, canvas.height, 16);
  context.fill();

  // Border
  context.strokeStyle = '#84cc16';
  context.lineWidth = 4;
  context.roundRect(2, 2, canvas.width - 4, canvas.height - 4, 14);
  context.stroke();

  // Text
  context.fillStyle = '#ffffff';
  context.font = 'bold 32px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Truncate text if too long
  let displayText = text;
  if (context.measureText(text).width > canvas.width - 40) {
    displayText = text.substring(0, 25) + '...';
  }
  
  context.fillText(displayText, canvas.width / 2, canvas.height / 2 - 10);

  // Subtitle
  context.fillStyle = '#84cc16';
  context.font = '20px Arial';
  context.fillText('3D Model Unavailable', canvas.width / 2, canvas.height / 2 + 25);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture,
    transparent: true
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(2, 0.5, 1);

  return sprite;
};

/**
 * Get bounding box height of a mesh
 */
const getBoundingHeight = (mesh) => {
  const box = new THREE.Box3().setFromObject(mesh);
  return box.max.y - box.min.y;
};

/**
 * Create "No Model Available" indicator
 */
export const createNoModelIndicator = (componentType) => {
  const group = new THREE.Group();
  group.name = 'no_model_' + componentType;

  // Create a simple icon
  const iconGeometry = new THREE.RingGeometry(0.3, 0.4, 32);
  const iconMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6b6b,
    side: THREE.DoubleSide
  });
  const icon = new THREE.Mesh(iconGeometry, iconMaterial);
  icon.rotation.x = -Math.PI / 2;
  group.add(icon);

  // Add X through the ring
  const xGeometry = new THREE.PlaneGeometry(0.6, 0.08);
  const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b, side: THREE.DoubleSide });
  const x1 = new THREE.Mesh(xGeometry, xMaterial);
  x1.rotation.x = -Math.PI / 2;
  x1.rotation.z = Math.PI / 4;
  group.add(x1);
  
  const x2 = new THREE.Mesh(xGeometry.clone(), xMaterial);
  x2.rotation.x = -Math.PI / 2;
  x2.rotation.z = -Math.PI / 4;
  group.add(x2);

  return group;
};