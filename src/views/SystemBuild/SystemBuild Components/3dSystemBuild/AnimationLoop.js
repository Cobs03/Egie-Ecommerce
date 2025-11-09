export const startAnimationLoop = (renderer, scene, camera, controls, testCube) => {
  console.log('🎬 Starting animation loop...');
  
  let animationFrameId = null;

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    
    // Rotate test cube
    if (testCube) {
      testCube.rotation.x += 0.01;
      testCube.rotation.y += 0.01;
    }
    
    // Update controls (damping)
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
  };

  animate();
  console.log('✅ Animation loop started');

  return animationFrameId;
};

export const stopAnimationLoop = (animationFrameId) => {
  console.log('🛑 Stopping animation loop...');
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    console.log('✅ Animation loop stopped');
  }
};