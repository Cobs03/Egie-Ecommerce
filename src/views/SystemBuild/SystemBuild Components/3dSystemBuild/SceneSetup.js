import * as THREE from 'three';

export const initializeScene = (container, mini = false) => {
  console.log('🎬 Initializing Scene...');

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(mini ? 0x0f172a : 0x1f2937);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(mini ? 4 : 5, mini ? 3 : 4, mini ? 4 : 5);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: mini 
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.cursor = 'grab';

  container.appendChild(renderer.domElement);

  console.log('✅ Scene, Camera, Renderer created');
  
  return { scene, camera, renderer };
};

export const setupLighting = (scene, mini = false) => {
  console.log('💡 Setting up lighting...');

  // Ambient light (soft overall illumination)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Directional light (main light with shadows)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Point light (accent lighting)
  const pointLight = new THREE.PointLight(0x84cc16, 0.5);
  pointLight.position.set(-5, 5, -5);
  scene.add(pointLight);

  console.log('✅ Lighting setup complete');
};

export const addGridHelper = (scene, mini = false) => {
  if (!mini) {
    const gridHelper = new THREE.GridHelper(10, 20, 0x84cc16, 0x374151);
    scene.add(gridHelper);
    console.log('✅ Grid helper added');
  }
};

export const addTestCube = (scene) => {
  const testGeometry = new THREE.BoxGeometry(1, 1, 1);
  const testMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff00ff,
    emissive: 0xff00ff,
    emissiveIntensity: 0.3
  });
  const testCube = new THREE.Mesh(testGeometry, testMaterial);
  testCube.position.set(0, 0.5, 0);
  testCube.userData.isTestCube = true;
  scene.add(testCube);
  
  console.log('✅ Test cube added at center');
  return testCube;
};