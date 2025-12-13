import * as THREE from 'three';

/**
 * Initialize Scene, Camera, and Renderer
 */
export const initializeScene = (container, mini = false) => {
  console.log('🎬 Initializing scene, camera, and renderer...');

  // Create Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff); // White background

  // Create Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(mini ? 4 : 5, mini ? 3 : 4, mini ? 4 : 5);

  // Create Renderer with proper settings
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Tone mapping for better colors
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5; // Brighter exposure
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  
  container.appendChild(renderer.domElement);

  // Create environment map for reflections (makes dark materials visible)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  
  // Create a simple environment
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0xffffff);
  
  // Add lights to environment scene
  const envLight1 = new THREE.DirectionalLight(0xffffff, 1);
  envLight1.position.set(1, 1, 1);
  envScene.add(envLight1);
  
  const envLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  envLight2.position.set(-1, 0.5, -1);
  envScene.add(envLight2);
  
  const envAmbient = new THREE.AmbientLight(0xffffff, 0.5);
  envScene.add(envAmbient);
  
  // Generate environment map
  const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
  scene.environment = envMap; // This illuminates PBR materials!
  pmremGenerator.dispose();

  console.log('✅ Scene, camera, and renderer initialized');
  return { scene, camera, renderer };
};

/**
 * Setup Lighting - VERY BRIGHT for dark Sketchfab models
 */
export const setupLighting = (scene, camera, mini = false) => {
  console.log('💡 Setting up camera-following lighting...');

  // ============================================
  // AMBIENT LIGHT - Very high for overall brightness
  // ============================================
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); // Very bright!
  scene.add(ambientLight);

  // ============================================
  // HEMISPHERE LIGHT - Sky/ground lighting
  // ============================================
  const hemiLight = new THREE.HemisphereLight(
    0xffffff, // Sky color (white)
    0xcccccc, // Ground color (light gray)
    1.5       // Intensity
  );
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  // ============================================
  // MAIN DIRECTIONAL LIGHT - Key light from front-top-right
  // ============================================
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  camera.add(directionalLight);
  console.log('💡 Directional light attached to camera');

  // Light target
  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, 0, 0);
  camera.add(lightTarget);
  directionalLight.target = lightTarget;
  console.log('🎯 Light target attached to camera');

  // ============================================
  // FILL LIGHTS - Multiple to eliminate dark spots
  // ============================================
  // Front-right fill
  const fillLight1 = new THREE.PointLight(0xffffff, 1.5, 50);
  fillLight1.position.set(5, 3, 5);
  camera.add(fillLight1);

  // Back-left fill  
  const fillLight2 = new THREE.PointLight(0xffffff, 1.5, 50);
  fillLight2.position.set(-5, 3, -5);
  camera.add(fillLight2);

  // Front-left fill (illuminates inside of case)
  const fillLight3 = new THREE.PointLight(0xffffff, 1.5, 50);
  fillLight3.position.set(-5, 3, 5);
  camera.add(fillLight3);

  // Top fill (illuminates interior from above)
  const fillLight4 = new THREE.PointLight(0xffffff, 1.0, 50);
  fillLight4.position.set(0, 8, 0);
  camera.add(fillLight4);

  // Front center (direct illumination into case)
  const fillLight5 = new THREE.PointLight(0xffffff, 2.0, 30);
  fillLight5.position.set(0, 2, 8);
  camera.add(fillLight5);

  console.log('💡 Fill lights attached to camera');

  // ============================================
  // GROUND PLANE for shadows
  // ============================================
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);

  console.log('✅ Camera-following lighting setup complete');
  
  return { 
    directionalLight, 
    fillLight1, 
    fillLight2, 
    fillLight3, 
    fillLight4, 
    fillLight5,
    ambientLight, 
    hemiLight 
  };
};

/**
 * Add Grid Helper - Gray lines on white background
 */
export const addGridHelper = (scene, mini = false) => {
  console.log('📐 Adding grid helper...');
  const gridHelper = new THREE.GridHelper(
    20,       // Size
    20,       // Divisions
    0x888888, // Center line color (gray)
    0xcccccc  // Grid line color (light gray)
  );
  gridHelper.position.y = -0.49;
  scene.add(gridHelper);
  console.log('✅ Grid helper added');
  return gridHelper;
};

/**
 * Add Axes Helper (for debugging)
 */
export const addAxesHelper = (scene, size = 5) => {
  console.log('🧭 Adding axes helper...');
  const axesHelper = new THREE.AxesHelper(size);
  scene.add(axesHelper);
  console.log('✅ Axes helper added (Red=X, Green=Y, Blue=Z)');
  return axesHelper;
};

/**
 * Add Test Cube (purple cube for testing)
 */
export const addTestCube = (scene) => {
  console.log('🟪 Adding test cube...');
  
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x9333ea,
    metalness: 0.5,
    roughness: 0.5
  });
  
  const testCube = new THREE.Mesh(geometry, material);
  testCube.position.set(0, 0.5, 0);
  testCube.castShadow = true;
  testCube.receiveShadow = true;
  testCube.userData = { componentType: 'testCube' };
  
  scene.add(testCube);
  console.log('✅ Test cube added with userData');
  return testCube;
};

/**
 * Legacy function for backward compatibility
 */
export const setupScene = () => {
  console.warn('⚠️ setupScene() is deprecated. Use initializeScene() instead.');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);
  
  return scene;
};