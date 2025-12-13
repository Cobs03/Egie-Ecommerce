import React, { useState, useMemo } from "react";
import BuildComponents from "./SystemBuild Components/BuildComponents";
import Selected from "./SystemBuild Components/Selected";
import SystemBuilder3D from "./SystemBuild Components/3dSystemBuild/SystemBuilder3D";
import ComponentSelector from "./SystemBuild Components/ComponentSelector";
import { FaInfoCircle, FaShoppingCart, FaTrash, FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx'; // npm install xlsx
import { Button } from "@/components/ui/button";

const SystemBuild = () => {
  const [selectedProducts, setSelectedProducts] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [show3DPreview, setShow3DPreview] = useState(true);

  const memoizedSelectedProducts = useMemo(
    () => selectedProducts,
    [JSON.stringify(selectedProducts)]
  );

  // Calculate total price
  const totalPrice = useMemo(() => {
    return Object.values(selectedProducts).reduce((total, product) => {
      return total + (product?.price || 0);
    }, 0);
  }, [selectedProducts]);

  // Count selected components
  const selectedCount = Object.keys(selectedProducts).length;

  const handleAddProduct = (componentType, product) => {
    console.log(`➕ Adding ${componentType}:`, product);
    setSelectedProducts(prev => ({
      ...prev,
      [componentType]: product
    }));
    setSelectedType(null);
  };

  // Remove product handler
  const handleRemoveProduct = (componentType) => {
    console.log(`➖ Removing ${componentType}`);
    setSelectedProducts(prev => {
      const updated = { ...prev };
      delete updated[componentType];
      return updated;
    });
  };

  // Clear all products
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all selected components?')) {
      console.log('🗑️ Clearing all components');
      setSelectedProducts({});
      setSelectedType(null);
    }
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (selectedCount === 0) return;
    
    const buildBundle = {
      type: 'pc-build',
      components: selectedProducts,
      totalPrice: totalPrice,
      createdAt: new Date().toISOString()
    };
    
    console.log('🛒 Adding build to cart:', buildBundle);
    // TODO: Add to your cart context/state
    alert('Build added to cart!');
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (selectedCount === 0) return;

    const data = Object.entries(selectedProducts).map(([type, product]) => ({
      'Component Type': type,
      'Product Name': product.productName,
      'Brand': product.brand || '',
      'Price': product.price || 0,
    }));

    // Add total row
    data.push({
      'Component Type': '',
      'Product Name': 'TOTAL',
      'Brand': '',
      'Price': totalPrice,
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PC Build');
    
    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `PC_Build_${date}.xlsx`);
  };

  const toggleViewMode = () => {
    setViewMode(prev => {
      const newMode = prev === 'table' ? '3d' : 'table';
      console.log('🔄 View mode toggled to:', newMode);
      return newMode;
    });
  };

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

        </div>

        <div className="flex items-center gap-4">
          {/* Total Price Display */}
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Total ({selectedCount} items)
            </p>
            <p className="text-lg font-bold text-lime-600">
              ₱{totalPrice.toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <Button
            onClick={handleExportExcel}
            disabled={selectedCount === 0}
            className="text-gray-600 hover:text-lime-600 hover:border-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Export to Excel"
            variant="outline"
            size="icon"
          >
            <FaFileExcel size={20} />
          </Button>

          <Button
            onClick={handleClearAll}
            disabled={selectedCount === 0}
            className="text-gray-600 hover:text-red-600 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Clear All"
            variant="outline"
            size="icon"
          >
            <FaTrash size={18} />
          </Button>

          <button
            onClick={handleAddToCart}
            disabled={selectedCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <FaShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>

          {/* 3D Toggle */}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
            <span className="text-sm font-semibold text-gray-700">3D</span>
            <button
              onClick={toggleViewMode}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                viewMode === "3d" ? "bg-lime-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  viewMode === "3d" ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#F3F7F6] overflow-hidden">
        {/* 3D View */}
        {viewMode === "3d" && (
          <div className="w-full h-full bg-[#F3F7F6]">
            <div className="flex w-full h-full bg-[#F3F7F6]">
              {/* Left Sidebar */}
              <div className="w-64 bg-white flex-shrink-0 border-r border-gray-300 overflow-y-auto">
                <ComponentSelector
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedProducts={selectedProducts}
                />
              </div>

              {/* Center - 3D Viewer */}
              <div className="flex-1 flex flex-col bg-white min-w-0">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-300 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-800">
                      <h2 className="text-xl font-bold">
                        {selectedType && selectedProducts[selectedType]
                          ? selectedProducts[selectedType].productName
                          : "Select a component"}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedType || "Component"}
                      </p>
                    </div>

                    <div className="w-20 h-20 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                      {selectedType &&
                      selectedProducts[selectedType] &&
                      selectedProducts[selectedType].imageUrl ? (
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

                <div className="flex-1 relative bg-gray-100 min-h-0">
                  <SystemBuilder3D
                    selectedProducts={memoizedSelectedProducts}
                    mini={false}
                  />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-80 bg-white flex-shrink-0 flex flex-col border-l border-gray-300">
                <div className="flex-1 overflow-y-auto">
                  <Selected
                    selectedType={selectedType}
                    selectedProducts={selectedProducts}
                    onAddProduct={handleAddProduct}
                    onRemoveProduct={handleRemoveProduct}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="flex-1 bg-[#F3F7F6] w-full overflow-y-auto">
            <div className="flex gap-6 p-6 w-full items-stretch">
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
                  onRemoveProduct={handleRemoveProduct}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating 3D Preview - LEFT SIDE */}
      {show3DPreview && viewMode === "table" && (
        <div
          className="fixed bottom-6 left-6 w-96 h-64 bg-gray-900 rounded-lg shadow-2xl border-2 border-lime-500 overflow-hidden"
          style={{ zIndex: 1000 }}
        >
          <div className="bg-gray-800 px-4 py-2 flex justify-between items-center cursor-move">
            <span className="text-white text-sm font-semibold">
              🎮 3D Preview
            </span>
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

      {!show3DPreview && viewMode === "table" && (
        <button
          onClick={() => setShow3DPreview(true)}
          className="fixed bottom-6 left-6 bg-lime-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-lime-600 transition"
        >
          🎮 Show 3D Preview
        </button>
      )}
    </div>
  );
};

export default SystemBuild;
