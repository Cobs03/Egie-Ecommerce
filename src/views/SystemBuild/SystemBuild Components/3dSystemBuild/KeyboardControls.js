import * as THREE from 'three';

export const setupKeyboardControls = (camera, controls, mini) => {
  // Check if device is mobile (screen width < 768px)
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    console.log('📱 Mobile device detected - keyboard controls disabled');
    return null; // Return null so cleanup knows there's nothing to remove
  }

  console.log('⌨️ Setting up keyboard controls...');

  const handleKeyboard = (event) => {
    if (!controls.enabled) return;
    
    const moveSpeed = 0.5;

    switch(event.key.toLowerCase()) {
      // Arrow keys for rotation
      case 'arrowleft':
        controls.rotateLeft(0.1);
        console.log('⬅️ Rotate left');
        break;
      case 'arrowright':
        controls.rotateLeft(-0.1);
        console.log('➡️ Rotate right');
        break;
      case 'arrowup':
        controls.rotateUp(0.1);
        console.log('⬆️ Rotate up');
        break;
      case 'arrowdown':
        controls.rotateUp(-0.1);
        console.log('⬇️ Rotate down');
        break;
      
      // WASD for camera position
      case 'w':
        camera.position.y += moveSpeed;
        console.log('⬆️ Move up (W)');
        break;
      case 's':
        camera.position.y -= moveSpeed;
        console.log('⬇️ Move down (S)');
        break;
      case 'a':
        camera.position.x -= moveSpeed;
        console.log('⬅️ Move left (A)');
        break;
      case 'd':
        camera.position.x += moveSpeed;
        console.log('➡️ Move right (D)');
        break;
      
      // Q/E for zoom
      case 'q':
        const direction1 = new THREE.Vector3();
        direction1.subVectors(controls.target, camera.position).normalize();
        camera.position.addScaledVector(direction1, 0.5);
        console.log('🔍+ Zoom in (Q)');
        break;
      case 'e':
        const direction2 = new THREE.Vector3();
        direction2.subVectors(controls.target, camera.position).normalize();
        camera.position.addScaledVector(direction2, -0.5);
        console.log('🔍- Zoom out (E)');
        break;
      
      // R to reset camera
      case 'r':
        camera.position.set(mini ? 4 : 5, mini ? 3 : 4, mini ? 4 : 5);
        controls.target.set(0, 1, 0);
        controls.update();
        console.log('🔄 Camera reset (R)');
        break;
      
      // G to toggle auto-rotate
      case 'g':
        event.preventDefault();
        controls.autoRotate = !controls.autoRotate;
        console.log('🔁 Auto-rotate toggled (G):', controls.autoRotate);
        break;
    }
    controls.update();
  };

  window.addEventListener('keydown', handleKeyboard);
  console.log('✅ Keyboard controls attached');

  return handleKeyboard;
};

export const removeKeyboardControls = (handleKeyboard) => {
  console.log('⌨️ Removing keyboard controls...');
  if (handleKeyboard) {
    window.removeEventListener('keydown', handleKeyboard);
    console.log('✅ Keyboard controls removed');
  }
};