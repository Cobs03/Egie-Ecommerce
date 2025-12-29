import React, { useState, useMemo, useEffect } from "react";
import BuildComponents from "./SystemBuild Components/BuildComponents";
import Selected from "./SystemBuild Components/Selected";
import SystemBuilder3D from "./SystemBuild Components/3dSystemBuild/SystemBuilder3D";
import ComponentSelector from "./SystemBuild Components/ComponentSelector";
import { FaInfoCircle, FaShoppingCart, FaTrash, FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx'; // npm install xlsx
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AiOutlineAppstore } from "react-icons/ai";
import { CgComponents } from "react-icons/cg";

const SystemBuild = () => {
  const [selectedProducts, setSelectedProducts] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [show3DPreview, setShow3DPreview] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerComponentType, setDrawerComponentType] = useState(null);
  const [isMobileComponentDrawerOpen, setIsMobileComponentDrawerOpen] = useState(false);
  const [isMobileSelectedDrawerOpen, setIsMobileSelectedDrawerOpen] = useState(false);

  // Scroll animations
  const headerAnim = useScrollAnimation({ threshold: 0.1 });
  const contentAnim = useScrollAnimation({ threshold: 0.1 });

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

  // Auto-open products drawer when component is selected in mobile 3D view
  useEffect(() => {
    if (selectedType && viewMode === "3d" && window.innerWidth < 768) {
      setIsMobileComponentDrawerOpen(false);
      setIsMobileSelectedDrawerOpen(true);
    }
  }, [selectedType, viewMode]);

  const handleAddProduct = (componentType, product) => {
    console.log(`➕ Adding ${componentType}:`, product);
    setSelectedProducts(prev => ({
      ...prev,
      [componentType]: product
    }));
    setSelectedType(null);
    setIsDrawerOpen(false);
    setIsMobileComponentDrawerOpen(false);
    setIsMobileSelectedDrawerOpen(false);
  };

  // Open drawer for component selection (mobile only)
  const handleOpenDrawer = (componentType) => {
    // Only open drawer on mobile screens (below lg breakpoint - 1024px)
    if (window.innerWidth < 1024) {
      console.log(`📂 Opening drawer for ${componentType}`);
      setDrawerComponentType(componentType);
      setSelectedType(componentType);
      setIsDrawerOpen(true);
    } else {
      // On desktop, just set the selected type so it shows in the visible sidebar
      setSelectedType(componentType);
    }
  };

  // Close drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setDrawerComponentType(null);
      setSelectedType(null);
    }, 300);
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
      <div
        ref={headerAnim.ref}
        className={`bg-white border-b border-gray-300 px-3 sm:px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 flex-shrink-0 transition-all duration-700 ${
          headerAnim.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 font-['Bruno_Ace_SC']">
            System Builder
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Total Price Display */}
          <div className="text-left sm:text-right flex-1 sm:flex-initial">
            <p className="text-xs text-gray-500">
              Total ({selectedCount} items)
            </p>
            <p className="text-base sm:text-lg font-bold text-lime-600">
              ₱{totalPrice.toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <Button
            onClick={handleExportExcel}
            disabled={selectedCount === 0}
            className="text-gray-600 hover:text-lime-600 hover:border-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105 h-8 w-8 sm:h-10 sm:w-10"
            title="Export to Excel"
            variant="outline"
            size="icon"
          >
            <FaFileExcel className="text-base sm:text-xl" />
          </Button>

          <Button
            onClick={handleClearAll}
            disabled={selectedCount === 0}
            className="text-gray-600 hover:text-red-600 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105 h-8 w-8 sm:h-10 sm:w-10"
            title="Clear All"
            variant="outline"
            size="icon"
          >
            <FaTrash className="text-sm sm:text-lg" />
          </Button>

          <button
            onClick={handleAddToCart}
            disabled={selectedCount === 0}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105 text-sm sm:text-base"
          >
            <FaShoppingCart className="text-sm sm:text-base" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Cart</span>
          </button>

          {/* 3D Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 sm:ml-4 sm:pl-4 sm:border-l border-gray-300">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              3D
            </span>
            <button
              onClick={toggleViewMode}
              className={`relative w-12 sm:w-14 h-6 sm:h-7 rounded-full transition-all duration-300 active:scale-95 ${
                viewMode === "3d" ? "bg-lime-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  viewMode === "3d"
                    ? "translate-x-6 sm:translate-x-7"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={contentAnim.ref}
        className={`flex-1 bg-[#F3F7F6] overflow-hidden transition-all duration-700 ${
          contentAnim.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        {/* 3D View */}
        {viewMode === "3d" && (
          <div className="w-full h-full bg-[#F3F7F6]">
            <div className="flex flex-col md:flex-row w-full h-full bg-[#F3F7F6]">
              {/* Left Sidebar - Desktop Only */}
              <div className="hidden md:flex md:w-48 lg:w-64 bg-white flex-shrink-0 border-r border-gray-300 overflow-y-auto">
                <ComponentSelector
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedProducts={selectedProducts}
                />
              </div>

              {/* Center - 3D Viewer */}
              <div className="flex-1 flex flex-col bg-white min-w-0">
                {/* Mobile Control Buttons */}
                <div className="md:hidden bg-gray-100 px-3 sm:px-4 py-3 border-b border-gray-300 flex-shrink-0">
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => setIsMobileComponentDrawerOpen(true)}
                      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-all duration-200 active:scale-95 hover:scale-105 shadow-md text-sm sm:text-base font-semibold"
                    >

                      <span>Components</span>
                    </button>

                    <button
                      onClick={() => setIsMobileSelectedDrawerOpen(true)}
                      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 active:scale-95 hover:scale-105 shadow-md text-sm sm:text-base font-semibold"
                    >

                      <span>Products ({selectedCount})</span>
                    </button>
                  </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:block bg-gray-100 px-3 sm:px-4 md:px-6 py-3 md:py-4 border-b border-gray-300 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="text-gray-800 flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg md:text-xl font-bold truncate">
                        {selectedType && selectedProducts[selectedType]
                          ? selectedProducts[selectedType].productName
                          : "Select a component"}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {selectedType || "Component"}
                      </p>
                    </div>

                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
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

                <div className="flex-1 relative bg-gray-100 h-full">
                  <SystemBuilder3D
                    selectedProducts={memoizedSelectedProducts}
                    mini={false}
                  />
                </div>
              </div>

              {/* Right Sidebar - Desktop Only */}
              <div className="hidden md:flex md:w-64 lg:w-80 bg-white flex-shrink-0 flex-col border-l border-gray-300">
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
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 w-full items-stretch">
              <div className="flex-1 min-w-0">
                <BuildComponents
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedProducts={selectedProducts}
                  setSelectedProducts={setSelectedProducts}
                  onOpenDrawer={handleOpenDrawer}
                />
              </div>

              <div className="hidden lg:block lg:w-80 flex-shrink-0">
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
          className="fixed bottom-3 sm:bottom-6 left-3 sm:left-6 w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 h-48 sm:h-56 md:h-64 bg-gray-900 rounded-lg shadow-2xl border-2 border-lime-500 overflow-hidden"
          style={{ zIndex: 1000 }}
        >
          <div className="bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 flex justify-between items-center cursor-move">
            <span className="text-white text-xs sm:text-sm font-semibold">
              🎮 3D Preview
            </span>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={expandToFullscreen}
                className="text-white hover:text-lime-400 transition-all duration-200 active:scale-90 hover:scale-110 text-sm sm:text-base"
                title="Expand to fullscreen"
              >
                ⛶
              </button>
              <button
                onClick={() => setShow3DPreview(false)}
                className="text-white hover:text-red-400 transition-all duration-200 active:scale-90 hover:scale-110 text-sm sm:text-base"
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
          className="fixed bottom-3 sm:bottom-6 left-3 sm:left-6 bg-lime-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg hover:bg-lime-600 transition-all duration-200 active:scale-95 hover:scale-105 text-xs sm:text-sm md:text-base"
        >
          <span className="hidden sm:inline">🎮 Show 3D Preview</span>
          <span className="sm:hidden">🎮 3D</span>
        </button>
      )}

      {/* Mobile 3D View - Component Selector Drawer (Left) */}
      {isMobileComponentDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
            onClick={() => setIsMobileComponentDrawerOpen(false)}
          />
          <div
            className={`fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${
              isMobileComponentDrawerOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }`}
          >
            <div className="bg-gray-800 text-white px-4 sm:px-6 py-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold">
                  Component Selector
                </h2>
                <p className="text-xs sm:text-sm text-gray-300">
                  Choose a component type
                </p>
              </div>
              <button
                onClick={() => setIsMobileComponentDrawerOpen(false)}
                className="ml-4 text-white hover:text-red-400 transition-all duration-200 active:scale-90 hover:scale-110 text-2xl sm:text-3xl flex-shrink-0"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#F3F7F6]">
              <ComponentSelector
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedProducts={selectedProducts}
              />
            </div>
          </div>
        </>
      )}

      {/* Mobile 3D View - Selected Products Drawer (Right) */}
      {isMobileSelectedDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
            onClick={() => setIsMobileSelectedDrawerOpen(false)}
          />
          <div
            className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${
              isMobileSelectedDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="bg-gray-800 text-white px-4 sm:px-6 py-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold">
                  Selected Products
                </h2>
                <p className="text-xs sm:text-sm text-gray-300">
                  Your current build ({selectedCount} items)
                </p>
              </div>
              <button
                onClick={() => setIsMobileSelectedDrawerOpen(false)}
                className="ml-4 text-white hover:text-red-400 transition-all duration-200 active:scale-90 hover:scale-110 text-2xl sm:text-3xl flex-shrink-0"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#F3F7F6]">
              <Selected
                selectedType={selectedType}
                selectedProducts={selectedProducts}
                onAddProduct={handleAddProduct}
                onRemoveProduct={handleRemoveProduct}
                isDrawer={true}
              />
            </div>
            <div className="bg-white border-t border-gray-300 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
              <button
                onClick={() => setIsMobileSelectedDrawerOpen(false)}
                className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 active:scale-95 text-sm sm:text-base"
              >
                Close
              </button>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Price</p>
                <p className="text-sm sm:text-base font-semibold text-lime-600">
                  ₱{totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Side Drawer for Product Selection */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
            onClick={handleCloseDrawer}
            style={{ opacity: isDrawerOpen ? 1 : 0 }}
          />

          {/* Drawer */}
          <div
            className={`fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Drawer Header */}
            <div className="bg-gray-800 text-white px-4 sm:px-6 py-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold truncate">
                  Select {drawerComponentType || "Component"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300">
                  Choose a product to add to your build
                </p>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="ml-4 text-white hover:text-red-400 transition-all duration-200 active:scale-90 hover:scale-110 text-2xl sm:text-3xl flex-shrink-0"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto bg-[#F3F7F6]">
              <Selected
                selectedType={drawerComponentType}
                selectedProducts={selectedProducts}
                onAddProduct={handleAddProduct}
                onRemoveProduct={handleRemoveProduct}
                isDrawer={true}
              />
            </div>

            {/* Drawer Footer */}
            <div className="bg-white border-t border-gray-300 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
              <button
                onClick={handleCloseDrawer}
                className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 active:scale-95 text-sm sm:text-base"
              >
                Cancel
              </button>
              <div className="text-right">
                <p className="text-xs text-gray-500">Current Selection</p>
                <p className="text-sm sm:text-base font-semibold text-gray-800">
                  {selectedProducts[drawerComponentType]?.productName ||
                    "None selected"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemBuild;
