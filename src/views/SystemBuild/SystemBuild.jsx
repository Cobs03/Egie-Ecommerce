import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BuildComponents from "./SystemBuild Components/BuildComponents";
import Selected from "./SystemBuild Components/Selected";
import SystemBuilder3D from "./SystemBuild Components/3dSystemBuild/SystemBuilder3D";
import ComponentSelector from "./SystemBuild Components/ComponentSelector";
import { FaInfoCircle, FaShoppingCart, FaTrash, FaFileExcel, FaSave } from "react-icons/fa";
import * as XLSX from 'xlsx'; // npm install xlsx
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AiOutlineAppstore } from "react-icons/ai";
import { CgComponents } from "react-icons/cg";
import PCBuildService from "@/services/PCBuildService";
import CartService from "@/services/CartService";
import BuildService from "@/services/BuildService";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/LoadingIndicator";

const SystemBuild = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasLoadedDraft = useRef(false);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [show3DPreview, setShow3DPreview] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerComponentType, setDrawerComponentType] = useState(null);
  const [isMobileComponentDrawerOpen, setIsMobileComponentDrawerOpen] = useState(false);
  const [isMobileSelectedDrawerOpen, setIsMobileSelectedDrawerOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  
  // Save build modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loadedBuildId, setLoadedBuildId] = useState(null); // Track loaded build for purchase count
  const [loadedBuildName, setLoadedBuildName] = useState(''); // Track loaded build name
  const [saveMode, setSaveMode] = useState('new'); // 'update' or 'new'
  
  // Database products state
  const [componentProducts, setComponentProducts] = useState({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Cart context
  const { addToCart, user, loadCart } = useCart();

  // Scroll animations
  const headerAnim = useScrollAnimation({ threshold: 0.1 });
  const contentAnim = useScrollAnimation({ threshold: 0.1 });

  // Load products from database on mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const products = await PCBuildService.fetchComponentProducts();
        setComponentProducts(products);
      } catch (error) {
        console.error("Failed to load PC build products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Load draft build from database on mount (only once)
  useEffect(() => {
    const loadDraft = async () => {
      // Don't load draft if coming from MyBuilds or already loaded
      if (location.state?.loadBuild || location.state?.clearDraft || hasLoadedDraft.current) {
        return;
      }

      hasLoadedDraft.current = true;

      try {
        const draft = await BuildService.getDraft();
        if (draft && Object.keys(draft.components).length > 0) {
          setSelectedProducts(draft.components);
          console.log('📦 Draft restored from database');
        }
      } catch (error) {
        console.error('Failed to restore draft:', error);
      }
    };

    if (user) {
      loadDraft();
    }
  }, [user, location.state]);

  // Calculate total price (must be before auto-save effect)
  const totalPrice = useMemo(() => {
    return Object.values(selectedProducts).reduce((total, product) => {
      return total + (product?.price || 0);
    }, 0);
  }, [selectedProducts]);

  // Auto-save draft to database (debounced)
  useEffect(() => {
    if (!user || Object.keys(selectedProducts).length === 0) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        await BuildService.saveDraft(selectedProducts, totalPrice);
      } catch (error) {
        console.error('Failed to auto-save draft:', error);
      }
    }, 2000); // Wait 2 seconds after last change before saving

    return () => clearTimeout(timeoutId);
  }, [selectedProducts, totalPrice, user]);

  // Load build from navigation state if coming from MyBuilds
  useEffect(() => {
    if (location.state?.loadBuild) {
      const { loadBuild } = location.state;
      console.log('📦 Loading saved build:', loadBuild.build_name);
      
      // Set the saved components
      setSelectedProducts(loadBuild.components);
      
      // Store the build ID and name to track for updates
      setLoadedBuildId(loadBuild.id);
      setLoadedBuildName(loadBuild.build_name);
      setBuildName(loadBuild.build_name);
      setIsPublic(loadBuild.is_public || false);
      
      // Show success message
      toast.success(`Loaded "${loadBuild.build_name}"`, {
        description: 'You can now edit or add to cart'
      });
      
      // Clear the state to prevent reloading on refresh
      window.history.replaceState({}, document.title);
    } else if (location.state?.loadBundle) {
      // Load bundle components from BundleDetails
      const { loadBundle } = location.state;
      console.log('📦 Loading bundle:', loadBundle.bundleName);
      console.log('📦 Components:', loadBundle.components);
      
      // Set the bundle components
      setSelectedProducts(loadBundle.components);
      
      // Clear build tracking (this is a new build from bundle template)
      setLoadedBuildId(null);
      setLoadedBuildName(null);
      setBuildName('');
      setIsPublic(false);
      
      // Show success message
      toast.success(`Loaded bundle: "${loadBundle.bundleName}"`, {
        description: `${Object.keys(loadBundle.components).length} components loaded`
      });
      
      // Clear the state to prevent reloading on refresh
      window.history.replaceState({}, document.title);
    } else if (location.state?.clearDraft) {
      // Clear everything when creating a new build
      console.log('🆕 Starting fresh build - clearing all components');
      setSelectedProducts({});
      setLoadedBuildId(null);
      setLoadedBuildName(null);
      setBuildName('');
      setIsPublic(false);
      
      // Clear the state to prevent reloading on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const memoizedSelectedProducts = useMemo(
    () => selectedProducts,
    [JSON.stringify(selectedProducts)]
  );

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
  const handleAddToCart = async () => {
    if (selectedCount === 0) {
      toast.error('No components selected', {
        description: 'Please add at least one component to your build before adding to cart.'
      });
      return;
    }

    if (!user) {
      toast.error('Please login', {
        description: 'You need to be logged in to add items to cart.'
      });
      return;
    }
    
    try {
      // Process all items in parallel for faster execution
      const addPromises = Object.entries(selectedProducts).map(async ([componentType, product]) => {
        let variantName = componentType;
        const selectedVariantName = selectedVariants[componentType];
        
        if (selectedVariantName) {
          variantName = selectedVariantName;
        } else if (product.variants && product.variants.length > 0) {
          const firstVariant = product.variants[0];
          variantName = firstVariant.name || firstVariant.sku || firstVariant;
        } else if (product.selected_components && product.selected_components.length > 0) {
          const firstComponent = product.selected_components[0];
          variantName = typeof firstComponent === 'object' ? firstComponent.name : firstComponent;
        }
        
        try {
          const result = await CartService.addToCart({
            product_id: product.id,
            variant_name: variantName,
            price: product.price,
            quantity: 1
          });
          
          return result && !result.error ? { success: true, name: product.name } : { success: false, name: product.name, error: result?.error };
        } catch (err) {
          return { success: false, name: product.name, error: err.message };
        }
      });
      
      const results = await Promise.all(addPromises);
      const addedCount = results.filter(r => r.success).length;
      const failedItems = results.filter(r => !r.success);
      
      if (addedCount > 0) {
        toast.success(`Added ${addedCount} component${addedCount > 1 ? 's' : ''} to cart!`);
        
        // Increment purchase count if this was a loaded community build
        if (loadedBuildId) {
          try {
            await BuildService.incrementPurchases(loadedBuildId);
            console.log('✅ Incremented purchase count for build:', loadedBuildId);
          } catch (error) {
            console.error('Failed to increment purchase count:', error);
            // Non-critical, don't show error to user
          }
        }
        
        // Delete draft since user is adding to cart
        try {
          await BuildService.deleteDraft();
          console.log('🗑️ Draft cleared after adding to cart');
        } catch (error) {
          console.error('Failed to delete draft:', error);
        }
        
        // Reload cart in background
        loadCart();
      }
      
      if (failedItems.length > 0) {
        failedItems.forEach(item => {
          toast.error(`Failed to add ${item.name}: ${item.error || 'Unknown error'}`);
        });
      }
      
      if (addedCount === 0) {
        toast.error('No items were added to cart');
      }
      
    } catch (error) {
      toast.error('Failed to add to cart: ' + error.message);
    }
  };

  // Save build handler
  const handleSaveBuild = async () => {
    if (selectedCount === 0) {
      toast.error('No components selected', {
        description: 'Please add at least one component before saving.'
      });
      return;
    }

    if (!user) {
      toast.error('Please login', {
        description: 'You need to be logged in to save builds.'
      });
      return;
    }

    // Set mode based on whether we have a loaded build
    if (loadedBuildId && loadedBuildName) {
      setSaveMode('update');
    } else {
      setSaveMode('new');
      setBuildName(''); // Clear name for new builds
    }

    // Open modal to enter build name
    setIsSaveModalOpen(true);
  };

  // Submit save build
  const handleSubmitSaveBuild = async () => {
    if (!buildName.trim()) {
      toast.error('Please enter a build name');
      return;
    }

    setIsSaving(true);
    try {
      if (saveMode === 'update' && loadedBuildId) {
        // Update existing build
        await BuildService.updateBuild(
          loadedBuildId,
          buildName.trim(),
          selectedProducts,
          totalPrice
        );

        // Delete the draft since we saved the build
        await BuildService.deleteDraft();

        toast.success('Build updated successfully!', {
          description: 'Starting fresh build...',
          action: {
            label: 'View My Builds',
            onClick: () => navigate('/mybuilds')
          }
        });

        // Clear the build after update
        setSelectedProducts({});
        setSelectedVariants({});
        setLoadedBuildId(null);
        setLoadedBuildName('');
        setBuildName('');
        hasLoadedDraft.current = false; // Reset so draft can be loaded again if needed
      } else {
        // Save as new build
        // Check if user has a draft - if so, convert it
        const draft = await BuildService.getDraft();
        
        if (draft && !loadedBuildId) {
          // Convert draft to saved build
          await BuildService.convertDraftToSaved(
            buildName.trim(),
            isPublic
          );
        } else {
          // No draft or editing loaded build, save as new build
          await BuildService.saveBuild(
            buildName.trim(),
            selectedProducts,
            totalPrice,
            isPublic
          );
        }

        // Delete the draft since we saved the build
        await BuildService.deleteDraft();

        toast.success('Build saved successfully!', {
          description: `"${buildName}" has been saved to your builds${isPublic ? ' and is now visible to the community!' : '.'}`,
          action: {
            label: 'View My Builds',
            onClick: () => navigate('/mybuilds')
          }
        });

        // Clear the build after save
        setSelectedProducts({});
        setSelectedVariants({});
        setLoadedBuildId(null);
        setLoadedBuildName('');
        setBuildName('');
        hasLoadedDraft.current = false; // Reset so draft can be loaded again if needed
      }

      setIsPublic(false);
      setIsSaveModalOpen(false);
    } catch (error) {
      toast.error('Failed to save build', {
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
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
        className={`bg-white border-b border-gray-300 px-3 sm:px-4 md:px-6 py-3 md:py-4 flex flex-col gap-3 flex-shrink-0 transition-all duration-700 ${
          headerAnim.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4"
        }`}
      >
        {/* Top Row: Title and Total Price */}
        <div className="flex items-center justify-between gap-3 w-full">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 font-['Bruno_Ace_SC'] flex-shrink-0">
            System Builder
          </h1>
          
          {/* Total Price Display */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500">
              Total ({selectedCount} items)
            </p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-lime-600">
              ₱{totalPrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Bottom Row: Action Buttons */}
        <div className="flex items-center justify-between gap-2 w-full flex-wrap">
          {/* Left Group: Icon Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleExportExcel}
              disabled={selectedCount === 0}
              className="text-gray-600 hover:text-lime-600 hover:border-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
              title="Export to Excel"
              variant="outline"
              size="icon"
            >
              <FaFileExcel className="text-sm sm:text-base md:text-lg" />
            </Button>

            <Button
              onClick={handleClearAll}
              disabled={selectedCount === 0}
              className="text-gray-600 hover:text-red-600 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
              title="Clear All"
              variant="outline"
              size="icon"
            >
              <FaTrash className="text-xs sm:text-sm md:text-base" />
            </Button>
          </div>

          {/* Middle Group: Primary Action Buttons */}
          <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start min-w-0">
            <button
              onClick={handleSaveBuild}
              disabled={selectedCount === 0}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              <FaSave className="text-xs sm:text-sm flex-shrink-0" />
              <span className="hidden xs:inline">Save</span>
              <span className="xs:hidden">Save Build</span>
            </button>

            <button
              onClick={handleAddToCart}
              disabled={selectedCount === 0}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              <FaShoppingCart className="text-xs sm:text-sm flex-shrink-0" />
              <span className="hidden xs:inline">Cart</span>
              <span className="xs:hidden">Add to Cart</span>
            </button>
          </div>

          {/* Right Group: 3D Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-2 sm:pl-4 border-l border-gray-300">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              3D
            </span>
            <button
              onClick={toggleViewMode}
              className={`relative w-10 sm:w-12 md:w-14 h-5 sm:h-6 md:h-7 rounded-full transition-all duration-300 active:scale-95 flex-shrink-0 ${
                viewMode === "3d" ? "bg-lime-500" : "bg-gray-300"
              }`}
              title={viewMode === "3d" ? "Switch to Table View" : "Switch to 3D View"}
            >
              <span
                className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 w-4 sm:w-4 md:w-5 h-4 sm:h-4 md:h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  viewMode === "3d"
                    ? "translate-x-5 sm:translate-x-6 md:translate-x-7"
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
                    componentProducts={componentProducts}
                    isLoadingProducts={isLoadingProducts}
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
                  selectedVariants={selectedVariants}
                  setSelectedVariants={setSelectedVariants}
                  onOpenDrawer={handleOpenDrawer}
                  onAddToCart={handleAddToCart}
                />
              </div>

              <div className="hidden lg:block lg:w-80 flex-shrink-0">
                <Selected
                  selectedType={selectedType}
                  selectedProducts={selectedProducts}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                  componentProducts={componentProducts}
                  isLoadingProducts={isLoadingProducts}
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
                componentProducts={componentProducts}
                isLoadingProducts={isLoadingProducts}
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
                componentProducts={componentProducts}
                isLoadingProducts={isLoadingProducts}
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

      {/* Save Build Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[700] p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-slide-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaSave className="text-xl" />
                <h3 className="text-lg font-semibold">
                  {saveMode === 'update' ? 'Update Build' : 'Save PC Build'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsSaveModalOpen(false);
                  if (saveMode === 'new') {
                    setBuildName('');
                  }
                }}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Mode Toggle (only show if editing loaded build) */}
              {loadedBuildId && loadedBuildName && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaInfoCircle className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      You're editing "{loadedBuildName}"
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSaveMode('update')}
                      className={`flex-1 px-3 py-2 text-sm rounded transition-all ${
                        saveMode === 'update'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      Update Original
                    </button>
                    <button
                      onClick={() => {
                        setSaveMode('new');
                        setBuildName('');
                      }}
                      className={`flex-1 px-3 py-2 text-sm rounded transition-all ${
                        saveMode === 'new'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      Save as New
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="buildName" className="block text-sm font-medium text-gray-700 mb-2">
                  Build Name *
                </label>
                <input
                  id="buildName"
                  type="text"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSaving) {
                      handleSubmitSaveBuild();
                    }
                  }}
                  placeholder="e.g. Gaming PC 2024, Office Build..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {/* Public Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      Make this build public
                    </span>
                    <span className="text-xs text-gray-500">
                      Allow other users to view and like your build
                    </span>
                  </div>
                </label>
              </div>

              {/* Build Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Build Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Components:</span>
                    <span className="font-semibold text-gray-800">{selectedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Price:</span>
                    <span className="font-semibold text-blue-600">₱{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibility:</span>
                    <span className={`font-semibold ${isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                      {isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3">
              <button
                onClick={() => {
                  setIsSaveModalOpen(false);
                  if (saveMode === 'new') {
                    setBuildName('');
                  }
                  setIsPublic(false);
                }}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSaveBuild}
                disabled={isSaving || !buildName.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" color="white" />
                    <span>{saveMode === 'update' ? 'Updating...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>{saveMode === 'update' ? 'Update Build' : 'Save Build'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemBuild;
