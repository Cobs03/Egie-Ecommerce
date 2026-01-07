import React, { useRef, useEffect, useState, useCallback } from 'react';
import { initializeScene, setupLighting, addGridHelper, addAxesHelper } from './SceneSetup';
import { initializeControls, attachControlsEventListeners, detachControlsEventListeners } from './ControlsSetup';
import { setupKeyboardControls, removeKeyboardControls } from './KeyboardControls';
import { attachMouseDebugListeners, detachMouseDebugListeners } from './MouseDebug';
import { startAnimationLoop, stopAnimationLoop } from './AnimationLoop';
import { cleanupScene } from './Cleanup';
import { updateSceneWithComponents, clearAllComponents, showOnlyComponent, showAllComponents, getComponentModelInfo } from './ModelLoader';
import { clearModelCache } from './SketchfabLoader';

const SystemBuilder3D = ({ selectedProducts, mini = false }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationIdRef = useRef(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing 3D scene...');
  const [modelSummary, setModelSummary] = useState(null);

  // Pagination state for navigating models
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  
  // Current model info state
  const [currentModelInfo, setCurrentModelInfo] = useState(null);

  // Get array of selected component types
  const componentTypes = Object.keys(selectedProducts || {});
  const totalModels = componentTypes.length;
  const currentComponent = componentTypes[currentModelIndex];
  const currentProduct = selectedProducts?.[currentComponent];

  // Navigation handlers
  const goToPrevious = () => {
    setCurrentModelIndex((prev) => (prev > 0 ? prev - 1 : totalModels - 1));
  };

  const goToNext = () => {
    setCurrentModelIndex((prev) => (prev < totalModels - 1 ? prev + 1 : 0));
  };

  // Reset index when products change
  useEffect(() => {
    if (currentModelIndex >= totalModels && totalModels > 0) {
      setCurrentModelIndex(0);
    }
  }, [totalModels, currentModelIndex]);

  // Show only the current model based on pagination (not in mini mode)
  // Also update the model info display
  useEffect(() => {
    if (!mini && currentComponent && !isLoading) {
      showOnlyComponent(currentComponent);
      // Get and update model info for current component
      const info = getComponentModelInfo(currentComponent);
      setCurrentModelInfo(info?.modelInfo || null);
    }
  }, [currentModelIndex, currentComponent, isLoading, mini]);

  // Initialize 3D scene
  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setLoadingStatus('Initializing 3D scene...');
    setLoadingProgress(0);

    // Initialize scene, camera, renderer
    const { scene, camera, renderer } = initializeScene(containerRef.current, mini);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Setup lighting
    setupLighting(scene, camera);
    scene.add(camera);

    // Add helpers
    addGridHelper(scene);
    addAxesHelper(scene);

    // Initialize controls
    const controls = initializeControls(camera, renderer);
    controlsRef.current = controls;

    // Attach event listeners
    attachControlsEventListeners(controls);
    setupKeyboardControls(camera, controls);
    attachMouseDebugListeners(renderer.domElement);

    // Start animation loop
    animationIdRef.current = startAnimationLoop(renderer, scene, camera, controls);

    // Hide loading after scene is ready
    setTimeout(() => {
      setIsLoading(false);
      setLoadingStatus('');
    }, 500);

    // Cleanup on unmount
    return () => {
      removeKeyboardControls();
      detachMouseDebugListeners(renderer.domElement);
      detachControlsEventListeners(controls);
      clearAllComponents(scene);
      clearModelCache();
      stopAnimationLoop(animationIdRef.current);
      cleanupScene(scene, renderer, controls, containerRef.current);
    };
  }, [mini]);

  // Update components when selectedProducts changes
  useEffect(() => {
    if (!sceneRef.current) return;

    const componentCount = selectedProducts ? Object.keys(selectedProducts).length : 0;
    if (componentCount > 0) {
      setIsLoading(true);
      setLoadingProgress(0);
      setLoadingStatus('Loading 3D models...');
    }

    // Update scene with components
    updateSceneWithComponents(
      sceneRef.current, 
      selectedProducts || {},
      (progress) => {
        setLoadingProgress(Math.round(progress));
      },
      (status) => {
        setLoadingStatus(status);
      }
    )
      .then((summary) => {
        setModelSummary(summary);
        setIsLoading(false);
        setLoadingStatus('');
        // After loading, show only the current component (in full mode)
        // In mini mode, show all components
        if (!mini && currentComponent) {
          showOnlyComponent(currentComponent);
          // Update model info for current component
          const info = getComponentModelInfo(currentComponent);
          setCurrentModelInfo(info?.modelInfo || null);
        } else if (mini) {
          showAllComponents();
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setLoadingStatus('Error loading models');
      });

  }, [selectedProducts]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: mini ? "200px" : "500px",
          cursor: "grab",
        }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Animated Spinner */}
          <div
            style={{
              width: mini ? "40px" : "60px",
              height: mini ? "40px" : "60px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #84cc16",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px",
            }}
          />

          {/* Progress Bar */}
          {loadingProgress > 0 && (
            <div
              style={{
                width: mini ? "120px" : "200px",
                height: "8px",
                backgroundColor: "#e5e7eb",
                borderRadius: "4px",
                overflow: "hidden",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: `${loadingProgress}%`,
                  height: "100%",
                  backgroundColor: "#84cc16",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          )}

          {/* Loading Status Text */}
          <div
            style={{
              fontSize: mini ? "11px" : "14px",
              fontWeight: "500",
              color: "#374151",
              textAlign: "center",
              maxWidth: "250px",
              padding: "0 16px",
            }}
          >
            {loadingStatus}
          </div>

          {loadingProgress > 0 && (
            <div
              style={{
                fontSize: mini ? "10px" : "12px",
                color: "#6b7280",
                marginTop: "4px",
              }}
            >
              {loadingProgress}%
            </div>
          )}
        </div>
      )}

      {/* Model Creator Info Panel - Top Left */}
      {!isLoading && !mini && window.innerWidth >= 768 && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "12px",
            lineHeight: "1.5",
            minWidth: "180px",
            maxWidth: "220px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontWeight: "600",
              color: "#84cc16",
              marginBottom: "8px",
              fontSize: "13px",
            }}
          >
            3D Model Info:
          </div>
          {currentModelInfo ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div>
                <span style={{ color: "#84cc16" }}>Creator: </span>
                <a
                  href={currentModelInfo.creatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "white",
                    fontWeight: "500",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                >
                  {currentModelInfo.creator}
                </a>
              </div>
              <div>
                <span style={{ color: "#84cc16" }}>Source: </span>
                <a
                  href={currentModelInfo.modelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "white",
                    fontWeight: "500",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                >
                  {currentModelInfo.source}
                </a>
              </div>
            </div>
          ) : (
            <div style={{ color: "#9ca3af", fontStyle: "italic" }}>
              {totalModels > 0 ? "Placeholder model" : "No model selected"}
            </div>
          )}
        </div>
      )}

      {/* Model Pagination Navigation - Top Center */}
      {!isLoading && !mini && totalModels > 0 && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 5,
          }}
        >
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={totalModels <= 1}
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: totalModels <= 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: totalModels <= 1 ? "#9ca3af" : "#374151",
              transition: "all 0.2s",
              opacity: totalModels <= 1 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (totalModels > 1) {
                e.target.style.backgroundColor = "#84cc16";
                e.target.style.color = "#fff";
                e.target.style.borderColor = "#84cc16";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
              e.target.style.color = totalModels <= 1 ? "#9ca3af" : "#374151";
              e.target.style.borderColor = "#d1d5db";
            }}
          >
            ‹
          </button>

          {/* Current Model Display */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "8px 16px",
              minWidth: "160px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px",
              }}
            >
              {currentComponent || "No Components"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              {totalModels > 0
                ? `${currentModelIndex + 1} of ${totalModels}`
                : "0 selected"}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={totalModels <= 1}
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: totalModels <= 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: totalModels <= 1 ? "#9ca3af" : "#374151",
              transition: "all 0.2s",
              opacity: totalModels <= 1 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (totalModels > 1) {
                e.target.style.backgroundColor = "#84cc16";
                e.target.style.color = "#fff";
                e.target.style.borderColor = "#84cc16";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
              e.target.style.color = totalModels <= 1 ? "#9ca3af" : "#374151";
              e.target.style.borderColor = "#d1d5db";
            }}
          >
            ›
          </button>
        </div>
      )}

      {/* Controls Instructions Panel - Right Side */}
      {!isLoading && !mini && window.innerWidth >= 768 && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            lineHeight: "1.6",
            backdropFilter: "blur(4px)",
            minWidth: "160px",
          }}
        >
          <div
            style={{
              color: "#84cc16",
              fontWeight: "600",
              marginBottom: "8px",
              fontSize: "13px",
            }}
          >
            🎮 Controls:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div>
              <span style={{ color: "#84cc16", fontWeight: "500" }}>
                ◉ Left Drag:
              </span>{" "}
              Rotate
            </div>
            <div>
              <span style={{ color: "#84cc16", fontWeight: "500" }}>
                ◉ Right Drag:
              </span>{" "}
              Pan
            </div>
            <div>
              <span style={{ color: "#84cc16", fontWeight: "500" }}>
                ◉ Scroll:
              </span>{" "}
              Zoom
            </div>
            <div>
              <span style={{ color: "#84cc16", fontWeight: "500" }}>
                ◉ Q/E:
              </span>{" "}
              Zoom In/Out
            </div>
            <div>
              <span style={{ color: "#84cc16", fontWeight: "500" }}>◉ R:</span>{" "}
              Reset View
            </div>
            <div>
              <span style={{ color: "#84cc16", fontWeight: "500" }}>
                ◉ G:
              </span>{" "}
              Auto-Rotate
            </div>
          </div>
        </div>
      )}

      {/* Model Summary Badge */}
      {!isLoading && modelSummary && modelSummary.placeholders > 0 && !mini && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: "#fbbf24" }}>⚠️</span>
          <span>
            {modelSummary.placeholders} of {modelSummary.total} models
            unavailable
          </span>
        </div>
      )}

      {/* CSS Animation for Spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SystemBuilder3D;
