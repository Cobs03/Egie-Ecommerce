export const cleanupScene = (scene, renderer, controls) => {
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
  }

  // Dispose controls BEFORE renderer (and check if domElement exists)
  if (controls) {
    try {
      // Check if the DOM element still exists before disposing
      if (controls.domElement && controls.domElement.parentNode) {
        controls.dispose();
      } else {
      }
    } catch (error) {
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
    } catch (error) {
    }
  }

};