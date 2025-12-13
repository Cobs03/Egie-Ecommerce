export const cleanupScene = (scene, renderer, controls) => {
  console.log('🧹 Starting cleanup...');

  // Dispose scene objects first
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
    scene.clear();
    console.log('✅ Scene objects disposed');
  }

  // Dispose controls BEFORE renderer (and check if domElement exists)
  if (controls) {
    try {
      // Check if the DOM element still exists before disposing
      if (controls.domElement && controls.domElement.parentNode) {
        controls.dispose();
        console.log('✅ Controls disposed');
      } else {
        console.log('⚠️ Controls DOM element already removed, skipping dispose');
      }
    } catch (error) {
      console.log('⚠️ Controls already disposed or error:', error.message);
    }
  }

  // Dispose renderer last
  if (renderer) {
    try {
      // Remove canvas from DOM if it still exists
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      console.log('✅ Renderer disposed');
    } catch (error) {
      console.log('⚠️ Renderer already disposed or error:', error.message);
    }
  }

  console.log('✅ Cleanup complete');
};