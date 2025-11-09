import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const initializeControls = (camera, renderer, mini = false) => {
  console.log('🎮 Initializing OrbitControls...');

  const controls = new OrbitControls(camera, renderer.domElement);
  
  // Enable all controls
  controls.enabled = true;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  
  // Rotation settings
  controls.rotateSpeed = 1.0;
  
  // Zoom settings
  controls.zoomSpeed = 1.2;
  controls.minDistance = mini ? 2 : 3;
  controls.maxDistance = mini ? 15 : 25;
  
  // Pan settings
  controls.panSpeed = 0.8;
  controls.screenSpacePanning = true;
  
  // Damping (smooth movement)
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Limits
  controls.maxPolarAngle = Math.PI / 2; // Don't go below ground
  controls.minPolarAngle = 0;
  
  // Auto-rotate in mini mode
  controls.autoRotate = mini;
  controls.autoRotateSpeed = 2;
  
  // Mouse buttons mapping
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  };

  // Touch controls for mobile
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  };

  console.log('✅ OrbitControls initialized:', {
    enabled: controls.enabled,
    enableRotate: controls.enableRotate,
    enableZoom: controls.enableZoom,
    enablePan: controls.enablePan
  });

  return controls;
};

export const attachControlsEventListeners = (controls, renderer, setIsInteracting) => {
  console.log('🔗 Attaching controls event listeners...');

  const handleControlsStart = () => {
    console.log('🎮 Controls started');
    setIsInteracting(true);
    if (renderer.domElement) {
      renderer.domElement.style.cursor = 'grabbing';
    }
  };

  const handleControlsEnd = () => {
    console.log('🎮 Controls ended');
    setIsInteracting(false);
    if (renderer.domElement) {
      renderer.domElement.style.cursor = 'grab';
    }
  };

  const handleControlsChange = () => {
    // Too spammy, only log occasionally
    // console.log('📹 Camera moving...');
  };

  controls.addEventListener('start', handleControlsStart);
  controls.addEventListener('end', handleControlsEnd);
  controls.addEventListener('change', handleControlsChange);

  console.log('✅ Controls event listeners attached');

  return {
    handleControlsStart,
    handleControlsEnd,
    handleControlsChange
  };
};

export const detachControlsEventListeners = (controls, handlers) => {
  console.log('🔗 Detaching controls event listeners...');
  
  if (controls && handlers) {
    controls.removeEventListener('start', handlers.handleControlsStart);
    controls.removeEventListener('end', handlers.handleControlsEnd);
    controls.removeEventListener('change', handlers.handleControlsChange);
    controls.dispose();
    console.log('✅ Controls event listeners detached');
  }
};