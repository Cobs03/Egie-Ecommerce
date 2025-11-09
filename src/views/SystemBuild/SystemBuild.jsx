import React, { useState, useMemo, useEffect } from "react";
import BuildComponents from "./SystemBuild Components/BuildComponents";
import Selected from "./SystemBuild Components/Selected";
import SystemBuilder3D from "./SystemBuild Components/3dSystemBuild/SystemBuilder3D";
import ComponentSelector from "./SystemBuild Components/ComponentSelector";
import { FaInfoCircle } from "react-icons/fa";

const SystemBuild = () => {
  const [selectedProducts, setSelectedProducts] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [viewerSize, setViewerSize] = useState({ width: 90, height: 90 });
  const [show3DPreview, setShow3DPreview] = useState(true);

  const memoizedSelectedProducts = useMemo(
    () => selectedProducts,
    [JSON.stringify(selectedProducts)]
  );

  const handleAddProduct = (componentType, product) => {
    console.log(`➕ Adding ${componentType}:`, product);
    setSelectedProducts(prev => ({
      ...prev,
      [componentType]: product
    }));
    setSelectedType(null);
  };

  const toggleViewMode = () => {
    setViewMode(prev => {
      const newMode = prev === 'table' ? '3d' : 'table';
      console.log('🔄 View mode toggled to:', newMode);
      return newMode;
    });
  };

  useEffect(() => {
    if (viewMode === '3d') {
      console.log('🔧 Triggering resize for 3D view');
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
  }, [viewMode]);

  const expandToFullscreen = () => {
    setShow3DPreview(false);
    setViewMode('3d');
  };

  return (
    <div className="flex flex-col bg-[#F3F7F6] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">System Builder</h1>
          <FaInfoCircle className="text-gray-500 cursor-pointer" title="System Builder automatically recommends compatible products, helping users ensure that all components work seamlessly together." />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">3D</span>
            <button 
              onClick={toggleViewMode}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                viewMode === '3d' ? 'bg-lime-500' : 'bg-gray-300'
              }`}
            >
              <span 
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  viewMode === '3d' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#F3F7F6]">
        {/* 3D View with New Layout */}
        {viewMode === '3d' && (
          <div className="w-full bg-[#F3F7F6]" style={{ height: '800px' }}>
            <div className="flex w-full h-full bg-[#F3F7F6]">
              {/* Left Sidebar - Component Selector */}
              <div className="w-64 bg-white flex-shrink-0 border-r border-gray-300">
                <ComponentSelector 
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedProducts={selectedProducts}
                />
              </div>

              {/* Center - 3D Viewer */}
              <div className="flex-1 flex flex-col bg-white">
                {/* Top - Product Name Bar */}
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-300">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-800">
                      <h2 className="text-xl font-bold">
                        {selectedType && selectedProducts[selectedType] 
                          ? selectedProducts[selectedType].productName 
                          : "Product name"}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedType || "Component"}
                      </p>
                    </div>
                    
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                      {selectedType && selectedProducts[selectedType] && selectedProducts[selectedType].imageUrl ? (
                        <img 
                          src={selectedProducts[selectedType].imageUrl} 
                          alt={selectedProducts[selectedType].productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3D Viewer */}
                <div className="flex-1 relative bg-gray-100">
                  <SystemBuilder3D 
                    selectedProducts={memoizedSelectedProducts} 
                    mini={false}
                  />
                </div>
              </div>

              {/* Right Sidebar - Selected Components */}
              <div className="w-80 bg-white flex-shrink-0 flex flex-col border-l border-gray-300">
                <div className="flex-1 overflow-y-auto">
                  <Selected 
                    selectedType={selectedType}
                    selectedProducts={selectedProducts}
                    onAddProduct={handleAddProduct}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-[#F3F7F6] w-full">
            <div className="flex gap-6 p-6 w-full">
              <div className="flex-1">
                <BuildComponents 
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedProducts={selectedProducts}
                  setSelectedProducts={setSelectedProducts}
                />
              </div>

              <div className="w-80 flex-shrink-0">
                <Selected 
                  selectedType={selectedType}
                  selectedProducts={selectedProducts}
                  onAddProduct={handleAddProduct}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating 3D Preview */}
      {show3DPreview && viewMode === 'table' && (
        <div 
          className="fixed bottom-6 right-6 w-96 h-64 bg-gray-900 rounded-lg shadow-2xl border-2 border-lime-500 overflow-hidden"
          style={{ zIndex: 1000 }}
        >
          <div className="bg-gray-800 px-4 py-2 flex justify-between items-center cursor-move">
            <span className="text-white text-sm font-semibold">🎮 3D Preview</span>
            <div className="flex gap-2">
              <button 
                onClick={expandToFullscreen}
                className="text-white hover:text-lime-400 transition"
                title="Expand to fullscreen"
              >
                ⛶
              </button>
              <button 
                onClick={() => setShow3DPreview(false)}
                className="text-white hover:text-red-400 transition"
                title="Close preview"
              >
                ✕
              </button>
            </div>
          </div>
          
          <SystemBuilder3D 
            selectedProducts={memoizedSelectedProducts} 
            mini={true}
          />
        </div>
      )}

      {!show3DPreview && viewMode === 'table' && (
        <button
          onClick={() => setShow3DPreview(true)}
          className="fixed bottom-6 right-6 bg-lime-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-lime-600 transition"
        >
          🎮 Show 3D Preview
        </button>
      )}
    </div>
  );
};

export default SystemBuild;
