export const startAnimationLoop = (renderer, scene, camera, controls, testCube) => {
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
  return animationFrameId;
};

export const stopAnimationLoop = (animationFrameId) => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
};