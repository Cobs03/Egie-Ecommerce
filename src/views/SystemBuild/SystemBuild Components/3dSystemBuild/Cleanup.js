export const cleanupScene = (scene, renderer, controls, container) => {
  console.log('🧹 Starting cleanup...');

  // Dispose scene objects
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    console.log('✅ Scene objects disposed');
  }

  // Dispose controls
  if (controls) {
    controls.dispose();
    console.log('✅ Controls disposed');
  }

  // Remove renderer from DOM
  if (container && renderer && renderer.domElement) {
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
      console.log('✅ Renderer removed from DOM');
    }
  }

  // Dispose renderer
  if (renderer) {
    renderer.dispose();
    console.log('✅ Renderer disposed');
  }

  console.log('✅ Cleanup complete');
};