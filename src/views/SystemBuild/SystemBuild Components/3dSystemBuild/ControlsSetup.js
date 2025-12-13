import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const initializeControls = (camera, renderer) => {
  console.log('🎮 Initializing OrbitControls...');
  
  // OrbitControls needs the canvas DOM element, NOT the renderer
  const domElement = renderer.domElement;
  console.log('📍 DOM Element:', domElement);

  const controls = new OrbitControls(camera, domElement);
  
  // Configure controls
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI / 1.5;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.enableRotate = true;
  
  // Auto-rotate settings (disabled by default)
  controls.autoRotate = false;
  controls.autoRotateSpeed = 2.0;

  console.log('✅ OrbitControls initialized:', {
    enabled: controls.enabled,
    enableRotate: controls.enableRotate,
    enableZoom: controls.enableZoom,
    enablePan: controls.enablePan,
    domElement: 'attached'
  });

  return controls;
};

// Store event handlers for cleanup
let controlsStartHandler = null;
let controlsEndHandler = null;
let controlsChangeHandler = null;

export const attachControlsEventListeners = (controls) => {
  console.log('🔗 Attaching controls event listeners...');

  controlsStartHandler = () => {
    console.log('🎮 Controls interaction started');
  };

  controlsEndHandler = () => {
    console.log('🎮 Controls interaction ended');
  };

  controlsChangeHandler = () => {
    // Uncomment for verbose logging
    // console.log('🎮 Controls changed');
  };

  controls.addEventListener('start', controlsStartHandler);
  controls.addEventListener('end', controlsEndHandler);
  controls.addEventListener('change', controlsChangeHandler);

  console.log('✅ Controls event listeners attached');
};

export const detachControlsEventListeners = (controls) => {
  console.log('🔗 Detaching controls event listeners...');

  if (controls) {
    if (controlsStartHandler) {
      controls.removeEventListener('start', controlsStartHandler);
    }
    if (controlsEndHandler) {
      controls.removeEventListener('end', controlsEndHandler);
    }
    if (controlsChangeHandler) {
      controls.removeEventListener('change', controlsChangeHandler);
    }
  }

  controlsStartHandler = null;
  controlsEndHandler = null;
  controlsChangeHandler = null;

  console.log('✅ Controls event listeners detached');
};

export const resetControls = (controls, camera) => {
  console.log('🔄 Resetting controls...');
  
  if (controls && camera) {
    controls.reset();
    camera.position.set(5, 4, 5);
    controls.target.set(0, 0, 0);
    controls.update();
  }
  
  console.log('✅ Controls reset');
};

export const focusOnObject = (controls, camera, object) => {
  console.log('🎯 Focusing on object...');
  
  if (controls && camera && object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;
    
    camera.position.set(center.x + distance, center.y + distance / 2, center.z + distance);
    controls.target.copy(center);
    controls.update();
  }
  
  console.log('✅ Focused on object');
};