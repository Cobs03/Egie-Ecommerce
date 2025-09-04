export const placeholderProducts = {
  // Product data
  products: [
    {
      id: "product-1",
      title: "Legion Pro 5 16IRX8 Gaming Laptop",
      description: "Legion Pro 5 16IRX8 Gaming Laptop - Intel Core i7-13700HX - NVIDIA GeForce RTX 4070 - 16GB DDR5 - 1TB SSD - Win11 - 16\" WQXGA 240Hz",
      price: 89995.00,
      oldPrice: 98999.00,
      discount: 9,
      stock: 42,
      stockStatus: "In Stock",
      sku: "82WK0054PH",
      rating: 4.7,
      reviewCount: 56,
      reviews: "56 reviews",
      brand: "Lenovo",
      category: "Laptops",
      subcategory: "Gaming Laptops",
      tags: ["gaming", "laptop", "nvidia", "rtx", "i7"],
      variations: ["82WK0054PH", "82WK0055PH", "82WK0056PH", "82WK0057PH"],
      images: [
        "/images/products/laptop1.png",
        "/images/products/laptop2.png",
        "/images/products/laptop3.png",
        "/images/products/laptop4.png",
      ],
      specs: [
        { name: "Processor", value: "Intel Core i7-13700HX" },
        { name: "Memory", value: "16GB DDR5-5200MHz" },
        { name: "Storage", value: "1TB SSD M.2 2280 PCIe 4.0x4 NVMe" },
        { name: "Graphics", value: "NVIDIA GeForce RTX 4070 8GB GDDR6" },
        { name: "Display", value: "16\" WQXGA (2560 x 1600), IPS, Anti-Glare, 240Hz" },
        { name: "Operating System", value: "Windows 11 Home 64" },
        { name: "Battery", value: "80Wh" },
      ],
      warranty: {
        period: "2 years",
        type: "Limited Warranty",
        details: "2-year limited warranty on parts and labor"
      }
    },
    {
      id: "product-2",
      title: "Logitech G502 X PLUS Wireless Gaming Mouse",
      description: "The new pinnacle of gaming performance with LIGHTFORCE hybrid optical-mechanical switches, LIGHTSPEED wireless, POWERPLAY compatibility, and LIGHTSYNC RGB.",
      price: 7990.00,
      oldPrice: 8990.00,
      discount: 11,
      stock: 136,
      stockStatus: "In Stock",
      sku: "910-006164",
      rating: 4.8,
      reviewCount: 243,
      reviews: "243 reviews",
      brand: "Logitech",
      category: "Gaming Peripherals",
      subcategory: "Gaming Mice",
      tags: ["gaming", "mouse", "wireless", "rgb"],
      variations: ["Black", "White"],
      images: [
        "/images/products/mouse1.png",
        "/images/products/mouse2.png",
        "/images/products/mouse3.png",
        "/images/products/mouse4.png",
      ],
      specs: [
        { name: "Sensor", value: "HERO 25K" },
        { name: "Resolution", value: "100 – 25,600 DPI" },
        { name: "Battery Life", value: "Up to 60 hours" },
        { name: "Buttons", value: "13 programmable buttons" },
        { name: "Connection", value: "LIGHTSPEED Wireless / Bluetooth / USB-C" },
        { name: "Weight", value: "106g" },
      ],
      warranty: {
        period: "2 years",
        type: "Standard Warranty",
        details: "2-year hardware warranty"
      }
    },
    {
      id: "product-3",
      title: "ASUS ROG Strix Scope II 96 Wireless Gaming Keyboard",
      description: "96-key wireless mechanical gaming keyboard with tri-mode connectivity, ROG NX mechanical switches, PBT doubleshot keycaps, sound-dampening foam, USB passthrough and 2.4 GHz SpeedNova wireless technology.",
      price: 9995.00,
      oldPrice: null,
      discount: 0,
      stock: 57,
      stockStatus: "In Stock",
      sku: "90MP02P1-BKUA00",
      rating: 4.6,
      reviewCount: 87,
      reviews: "87 reviews",
      brand: "ASUS",
      category: "Gaming Peripherals",
      subcategory: "Gaming Keyboards",
      tags: ["gaming", "keyboard", "wireless", "mechanical", "rgb"],
      variations: ["ROG NX Red", "ROG NX Brown", "ROG NX Blue"],
      images: [
        "/images/products/keyboard1.png",
        "/images/products/keyboard2.png",
        "/images/products/keyboard3.png",
        "/images/products/keyboard4.png",
      ],
      specs: [
        { name: "Switch Type", value: "ROG NX Mechanical Switches" },
        { name: "Layout", value: "96-key layout" },
        { name: "Connectivity", value: "2.4GHz / Bluetooth / USB-C" },
        { name: "Battery Life", value: "Up to 450 hours" },
        { name: "Lighting", value: "Per-key RGB" },
        { name: "Keycaps", value: "PBT Doubleshot" },
      ],
      warranty: {
        period: "1 year",
        type: "Limited Warranty",
        details: "1-year limited warranty on parts and labor"
      }
    },
    {
      id: "product-6",
      title: "AMD Ryzen 7 7800X3D Desktop Processor",
      description: "8 cores, 16 threads, up to 5.0 GHz, 104MB cache, AM5 socket, PCIe 5.0, DDR5 support",
      price: 24990.00,
      oldPrice: 27990.00,
      discount: 10,
      stock: 22,
      stockStatus: "In Stock",
      sku: "100-100000952WOF",
      rating: 4.9,
      reviewCount: 128,
      reviews: "128 reviews",
      brand: "AMD",
      category: "Components",
      subcategory: "Processors",
      tags: ["cpu", "processor", "amd", "ryzen", "gaming"],
      images: [
        "/images/products/cpu1.png",
        "/images/products/cpu2.png",
        "/images/products/cpu3.png",
        "/images/products/cpu4.png",
      ],
      specs: [
        { name: "Cores", value: "8" },
        { name: "Threads", value: "16" },
        { name: "Base Clock", value: "4.2 GHz" },
        { name: "Max Boost", value: "5.0 GHz" },
        { name: "L3 Cache", value: "96MB" },
        { name: "TDP", value: "120W" },
        { name: "Socket", value: "AM5" },
      ],
      warranty: {
        period: "3 years",
        type: "Limited Warranty",
        details: "3-year limited warranty through manufacturer"
      }
    }
  ],
  
  // Bundle data
  bundles: [
    {
      id: "bundle-1",
      title: "CHRISTMAS BUNDLE",
      description: "Ultimate gaming PC bundle with AMD Ryzen 7 7800X3D, NVIDIA RTX 4070, 32GB RAM, and all the peripherals you need for the perfect setup.",
      price: 29495.00,
      priceRange: "₱29,495.00 - ₱39,920.00",
      stock: 1404,
      stockStatus: "In Stock",
      sku: "XMAS-BUNDLE-2023",
      rating: 0,
      reviewCount: 0,
      reviews: "No Ratings Yet",
      brand: "Multiple",
      category: "Bundles",
      tags: ["bundle", "gaming", "complete setup", "christmas", "holiday deal"],
      options: ["Basic", "Premium", "Ultimate"],
      components: [
        { name: "CPU", value: "AMD Ryzen 7 7800X3D", productId: "product-6" },
        { name: "Motherboard", value: "ASUS ROG STRIX B650-A GAMING WIFI", productId: null },
        { name: "RAM", value: "G.SKILL Trident Z5 RGB 32GB DDR5 6000MHz", productId: null },
        { name: "GPU", value: "NVIDIA GeForce RTX 4070 12GB", productId: null },
        { name: "Storage", value: "2TB Samsung 990 Pro NVMe SSD", productId: null },
        { name: "Case", value: "Lian Li O11 Dynamic EVO", productId: null },
        { name: "PSU", value: "Corsair RM850x 850W 80+ Gold", productId: null },
        { name: "Keyboard", value: "ASUS ROG Strix Scope II 96 Wireless", productId: "product-3" },
        { name: "Mouse", value: "Logitech G502 X PLUS Wireless", productId: "product-2" },
      ],
      images: [
        "/images/bundle.png",
        "/images/bundle.png",
        "/images/bundle.png",
        "/images/bundle.png",
      ],
      features: [
        "Complete high-end gaming setup",
        "Premium components from trusted brands",
        "Pre-tested for stability and performance",
        "Easy setup with included guides",
        "Special holiday pricing",
        "Free games included"
      ],
      warranty: {
        period: "1 year",
        type: "Bundled Warranty",
        details: "1-year comprehensive warranty covering all components"
      }
    },
    {
      id: "bundle-2",
      title: "STREAMING STARTER BUNDLE",
      description: "Everything you need to start your streaming career, including mid-range PC, microphone, webcam, and lighting.",
      price: 19995.00,
      priceRange: "₱19,995.00 - ₱24,995.00",
      stock: 52,
      stockStatus: "In Stock",
      sku: "STREAM-BUNDLE-01",
      rating: 4.3,
      reviewCount: 18,
      reviews: "18 reviews",
      brand: "Multiple",
      category: "Bundles",
      tags: ["streaming", "content creation", "starter kit", "bundle"],
      options: ["Basic", "Premium"],
      components: [
        { name: "CPU", value: "AMD Ryzen 5 5600X", productId: null },
        { name: "Motherboard", value: "MSI B550M PRO-VDH WIFI", productId: null },
        { name: "RAM", value: "Corsair Vengeance RGB Pro 16GB DDR4 3600MHz", productId: null },
        { name: "GPU", value: "NVIDIA GeForce RTX 3060 12GB", productId: null },
        { name: "Storage", value: "1TB Samsung 980 NVMe SSD", productId: null },
        { name: "Case", value: "Phanteks Eclipse P360A", productId: null },
        { name: "PSU", value: "EVGA 650W 80+ Gold", productId: null },
        { name: "Microphone", value: "HyperX QuadCast S RGB", productId: null },
        { name: "Webcam", value: "Logitech C922 Pro Stream", productId: null },
        { name: "Lighting", value: "Elgato Key Light Air", productId: null }
      ],
      images: [
        "/images/stream-bundle.png",
        "/images/stream-bundle.png",
        "/images/stream-bundle.png",
        "/images/stream-bundle.png",
      ],
      features: [
        "Complete streaming setup",
        "Optimized for OBS and Streamlabs",
        "Includes professional audio capture",
        "HD webcam with background replacement capability",
        "Professional-grade lighting"
      ],
      warranty: {
        period: "1 year",
        type: "Bundled Warranty",
        details: "1-year warranty on all components"
      }
    }
  ]
};

/**
 * Helper function to get a product or bundle by ID
 */
export const getItemById = (id) => {
  // Check if it's a product
  if (id?.startsWith('product-')) {
    return placeholderProducts.products.find(p => p.id === id);
  }
  // Check if it's a bundle
  else if (id?.startsWith('bundle-')) {
    return placeholderProducts.bundles.find(b => b.id === id);
  }
  // Default to first product if ID not found
  return placeholderProducts.products[0];
};

/**
 * Get related products for a product or bundle
 */
export const getRelatedItems = (id, count = 4) => {
  if (id?.startsWith('bundle-')) {
    return placeholderProducts.products.slice(0, count);
  } else {
    return placeholderProducts.products
      .filter(p => p.id !== id)
      .slice(0, count);
  }
};

/**
 * Get all bundles
 */
export const getAllBundles = () => {
  return placeholderProducts.bundles;
};

/**
 * Get product by category
 */
export const getProductsByCategory = (category) => {
  return placeholderProducts.products.filter(
    p => p.category === category || p.subcategory === category
  );
};