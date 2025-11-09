import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FaSearchPlus, FaSearchMinus, FaUndo, FaSyncAlt } from 'react-icons/fa';

// Import separated modules
import { 
  initializeScene, 
  setupLighting, 
  addGridHelper, 
  addTestCube 
} from './SceneSetup';

import { 
  initializeControls, 
  attachControlsEventListeners, 
  detachControlsEventListeners 
} from './ControlsSetup';

import { 
  setupKeyboardControls, 
  removeKeyboardControls 
} from './KeyboardControls';

import { 
  attachMouseDebugListeners, 
  detachMouseDebugListeners 
} from './MouseDebug';

import { 
  updateComponents 
} from './ComponentGeometry';

import { 
  startAnimationLoop, 
  stopAnimationLoop 
} from './AnimationLoop';

import { 
  cleanupScene 
} from './Cleanup';

const SystemBuilder3D = ({ selectedProducts, mini = false }) => {
  console.log('🚀 SystemBuilder3D render');

  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const testCubeRef = useRef(null);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true); // Track if component is mounted
  
  // Event handlers storage
  const eventHandlersRef = useRef({});

  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // MAIN INITIALIZATION EFFECT
  useEffect(() => {
    // Prevent double initialization
    if (isInitializedRef.current) {
      console.log('⚠️ Already initialized, skipping...');
      return;
    }

    if (!containerRef.current) {
      console.warn('⚠️ Container not ready');
      return;
    }

    console.log('═══════════════════════════════════════');
    console.log('🎬 STARTING 3D INITIALIZATION');
    console.log('═══════════════════════════════════════');

    isInitializedRef.current = true;
    isMountedRef.current = true;

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (!isMountedRef.current || !containerRef.current) return;

      try {
        // 1. Initialize Scene, Camera, Renderer
        const { scene, camera, renderer } = initializeScene(containerRef.current, mini);
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        // 2. Setup Lighting
        setupLighting(scene, mini);

        // 3. Add Grid Helper
        addGridHelper(scene, mini);

        // 4. Add Test Cube
        const testCube = addTestCube(scene);
        testCubeRef.current = testCube;

        // 5. Initialize OrbitControls
        const controls = initializeControls(camera, renderer, mini);
        controlsRef.current = controls;

        // 6. Attach Controls Event Listeners
        const controlsHandlers = attachControlsEventListeners(controls, renderer, setIsInteracting);
        eventHandlersRef.current.controlsHandlers = controlsHandlers;
        setControlsEnabled(true);

        // 7. Setup Keyboard Controls
        const keyboardHandler = setupKeyboardControls(camera, controls, mini);
        eventHandlersRef.current.keyboardHandler = keyboardHandler;

        // 8. Attach Mouse Debug Listeners
        const mouseHandlers = attachMouseDebugListeners(renderer.domElement);
        eventHandlersRef.current.mouseHandlers = mouseHandlers;

        // 9. Setup Window Resize Handler
        const handleResize = () => {
          if (!containerRef.current || !isMountedRef.current) return;
          camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
          console.log('📐 Window resized');
        };
        eventHandlersRef.current.resizeHandler = handleResize;
        window.addEventListener('resize', handleResize);

        // 10. Start Animation Loop
        const animationId = startAnimationLoop(renderer, scene, camera, controls, testCube);
        animationFrameRef.current = animationId;

        console.log('═══════════════════════════════════════');
        console.log('✅ 3D INITIALIZATION COMPLETE');
        console.log('═══════════════════════════════════════');
      } catch (error) {
        console.error('❌ Initialization error:', error);
        isInitializedRef.current = false;
      }
    }, 100);

    // CLEANUP FUNCTION
    return () => {
      console.log('═══════════════════════════════════════');
      console.log('🧹 STARTING CLEANUP');
      console.log('═══════════════════════════════════════');

      clearTimeout(initTimeout);
      isMountedRef.current = false;
      isInitializedRef.current = false;

      // Stop animation loop
      if (animationFrameRef.current) {
        stopAnimationLoop(animationFrameRef.current);
      }

      // Remove window resize listener
      if (eventHandlersRef.current.resizeHandler) {
        window.removeEventListener('resize', eventHandlersRef.current.resizeHandler);
      }

      // Remove keyboard controls
      if (eventHandlersRef.current.keyboardHandler) {
        removeKeyboardControls(eventHandlersRef.current.keyboardHandler);
      }

      // Remove mouse debug listeners
      if (eventHandlersRef.current.mouseHandlers && rendererRef.current) {
        detachMouseDebugListeners(rendererRef.current.domElement, eventHandlersRef.current.mouseHandlers);
      }

      // Remove controls event listeners
      if (eventHandlersRef.current.controlsHandlers && controlsRef.current) {
        detachControlsEventListeners(controlsRef.current, eventHandlersRef.current.controlsHandlers);
      }

      // Cleanup scene
      if (sceneRef.current) {
        cleanupScene(sceneRef.current, rendererRef.current, controlsRef.current, containerRef.current);
      }

      // Clear refs
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      animationFrameRef.current = null;
      testCubeRef.current = null;
      eventHandlersRef.current = {};

      setControlsEnabled(false);
      setIsInteracting(false);

      console.log('═══════════════════════════════════════');
      console.log('✅ CLEANUP COMPLETE');
      console.log('═══════════════════════════════════════');
    };
  }, [mini]); // Only re-initialize if mini changes

  // UPDATE COMPONENTS EFFECT
  useEffect(() => {
    if (!sceneRef.current || !isMountedRef.current) {
      return;
    }

    console.log('🔄 Updating components');

    const timeoutId = setTimeout(() => {
      if (sceneRef.current && isMountedRef.current) {
        updateComponents(sceneRef.current, selectedProducts, mini);
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [selectedProducts, mini]);

  // CONTROL BUTTON HANDLERS
  const handleZoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const direction = new THREE.Vector3();
    direction.subVectors(controlsRef.current.target, cameraRef.current.position).normalize();
    cameraRef.current.position.addScaledVector(direction, 0.5);
    controlsRef.current.update();
  };

  const handleZoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const direction = new THREE.Vector3();
    direction.subVectors(controlsRef.current.target, cameraRef.current.position).normalize();
    cameraRef.current.position.addScaledVector(direction, -0.5);
    controlsRef.current.update();
  };

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(mini ? 4 : 5, mini ? 3 : 4, mini ? 4 : 5);
    controlsRef.current.target.set(0, 1, 0);
    controlsRef.current.update();
  };

  const toggleAutoRotate = () => {
    if (!controlsRef.current) return;
    controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
  };

  // RENDER
  return (
    <div className={`w-full h-full relative ${mini ? '' : 'bg-gray-200'} rounded-lg overflow-hidden shadow-2xl`}>
      {/* Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
      />

      {/* Status Badge */}
      <div 
        className={`absolute top-2 right-2 px-2 py-1 ${isInteracting ? 'bg-yellow-500' : 'bg-green-500'} text-white text-xs rounded pointer-events-none`}
        style={{ zIndex: 20 }}
      >
        {isInteracting ? '🎮 Interacting...' : (controlsEnabled ? '✅ Controls Active' : '⏳ Loading...')}
      </div>

      {/* UI Overlays (only in full view) */}
      {!mini && (
        <>
          {/* Controls Panel */}
          <div 
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-800 p-4 rounded-lg border border-gray-300 shadow-lg"
            style={{ zIndex: 20, pointerEvents: 'auto' }}
          >
            <h3 className="font-bold mb-2 text-lime-600">🎮 Controls:</h3>
            <ul className="text-xs space-y-1">
              <li>🖱️ <strong>Left Drag:</strong> Rotate</li>
              <li>🖱️ <strong>Right Drag:</strong> Pan</li>
              <li>🖱️ <strong>Scroll:</strong> Zoom</li>
              <li>⌨️ <strong>Q/E:</strong> Zoom In/Out</li>
              <li>⌨️ <strong>R:</strong> Reset View</li>
              <li>⌨️ <strong>Space:</strong> Auto-Rotate</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div 
            className="absolute top-4 right-4 flex flex-col gap-2"
            style={{ zIndex: 20, pointerEvents: 'auto' }}
          >
            <button 
              onClick={handleZoomIn} 
              className="bg-lime-500 hover:bg-lime-600 text-white font-bold p-3 rounded shadow-lg transition flex items-center justify-center"
              title="Zoom In"
            >
              <FaSearchPlus size={20} />
            </button>
            <button 
              onClick={handleZoomOut} 
              className="bg-lime-500 hover:bg-lime-600 text-white font-bold p-3 rounded shadow-lg transition flex items-center justify-center"
              title="Zoom Out"
            >
              <FaSearchMinus size={20} />
            </button>
            <button 
              onClick={handleResetCamera} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold p-3 rounded shadow-lg transition flex items-center justify-center"
              title="Reset Camera"
            >
              <FaUndo size={20} />
            </button>
            <button 
              onClick={toggleAutoRotate} 
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold p-3 rounded shadow-lg transition flex items-center justify-center"
              title="Toggle Auto-Rotate"
            >
              <FaSyncAlt size={20} />
            </button>
          </div>

          {/* Component Counter */}
          <div 
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-gray-800 p-4 rounded-lg border border-gray-300 shadow-lg"
            style={{ zIndex: 20, pointerEvents: 'auto' }}
          >
            <h3 className="font-bold mb-2 text-lime-600">📦 Components</h3>
            <div className="text-xs">
              <span>Selected: </span>
              <span className="font-bold text-lime-600">{Object.keys(selectedProducts).length}</span>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!mini && Object.keys(selectedProducts).length === 0 && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ zIndex: 15 }}
        >
          <div className="text-gray-700 text-center">
            <p className="text-2xl mb-2">🖥️</p>
            <p className="text-sm">Add components to see them in 3D</p>
            <p className="text-xs mt-2 text-gray-500">Try interacting with the view!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemBuilder3D;
