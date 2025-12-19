import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Camera, ChevronUp, ChevronDown, Maximize2, Minimize2, ShoppingCart, Mic, MicOff, Image as ImageIcon, Globe } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { useNavigate } from "react-router-dom";
import PCBuildQuestionnaire from "../views/Question/Question";
import AIService from "../services/AIService";
import VisionService from "../services/VisionService";
import CartService from "../services/CartService";
import CompatibilityService from "../services/CompatibilityService";
import ChatHistoryService from "../services/ChatHistoryService";
import BundleService from "../services/BundleService";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import Fuse from "fuse.js"; // Fuzzy search for typo-tolerant product matching

// ===== DOMAIN KNOWLEDGE HELPERS FOR A MORE PROFESSIONAL ASSISTANT =====
const CATEGORY_LIBRARY = [
  {
    id: "a092c955-0010-4254-902c-61831a71db2e",
    slug: "processor",
    name: "Processor",
    description: "CPU components and processors",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/processor_1762076563533.webp",
    displayOrder: 1,
    keywords: ["processor", "processors", "cpu", "cpus", "ryzen", "intel", "core", "i5", "i7", "i9"],
  },
  {
    id: "motherboard",
    slug: "motherboard",
    name: "Motherboard",
    description: "Boards that connect and power every PC component",
    image: null,
    displayOrder: 2,
    keywords: ["motherboard", "motherboards", "mobo", "board"],
  },
  {
    id: "cd60882d-f2df-4d46-92f9-df923ae95bfa",
    slug: "ram",
    name: "RAM",
    description: "Memory modules and storage",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/ram_1762076589350.png",
    displayOrder: 3,
    keywords: ["ram", "memory", "ddr4", "ddr5", "dimm", "so-dimm"],
  },
  {
    id: "ad6cce85-5c86-48ab-8941-639048780bff",
    slug: "ssd",
    name: "SSD",
    description: "Solid State Drives",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/ssd_1762076646383.jpg",
    displayOrder: 4,
    keywords: ["ssd", "storage", "solid state", "nvme", "m.2", "m2"],
  },
  {
    id: "069efe9b-66f5-42a7-9b90-6140c7e8a5de",
    slug: "hdd",
    name: "HDD",
    description: "Hard Disk Drives",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/hdd_1762076679912.jpg",
    displayOrder: 5,
    keywords: ["hdd", "hard drive", "harddisk", "hard disk", "mechanical drive"],
  },
  {
    id: "a2c1d556-e753-4b4c-a2ec-d41e50642b70",
    slug: "graphics-card",
    name: "Graphics Card",
    description: "GPU and graphics components",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/graphics-card_1763347283343.png",
    displayOrder: 6,
    keywords: ["gpu", "graphics", "graphics card", "rtx", "gtx", "nvidia", "radeon"],
  },
  {
    id: "0bda9c40-6b09-4d69-b45d-6efd68ad3c2d",
    slug: "power-supply",
    name: "Power Supply",
    description: "PSU and power components",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/power-supply_1763347599427.png",
    displayOrder: 7,
    keywords: ["psu", "power supply", "power", "supply", "modular", "80+"],
  },
  {
    id: "2d81bd03-3cc8-4937-80ae-bd1bdfff339a",
    slug: "cooling",
    name: "Cooling",
    description: "Fans and cooling systems",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/cooling_1763347684782.jpg",
    displayOrder: 8,
    keywords: ["cooling", "cooler", "fan", "fans", "aio", "liquid"],
  },
  {
    id: "b75d6c45-bc5f-4f14-973c-d2c2a67f4765",
    slug: "case",
    name: "Case",
    description: "Computer cases and enclosures",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/case_1763347735737.png",
    displayOrder: 9,
    keywords: ["case", "chassis", "tower", "itx", "atx"],
  },
  {
    id: "e8f50241-0519-4802-8e69-4fc02e2aca00",
    slug: "monitor",
    name: "Monitor",
    description: "Display devices",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/monitor_1763347869198.jpg",
    displayOrder: 10,
    keywords: ["monitor", "display", "screen", "panel"],
  },
  {
    id: "62313fd1-a340-4135-a790-ae415f80abc2",
    slug: "keyboard",
    name: "Keyboard",
    description: "Input devices - keyboards",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/keyboard_1763347790522.png",
    displayOrder: 11,
    keywords: ["keyboard", "kb", "mech", "mechanical", "keys"],
  },
  {
    id: "556f2cdf-41b2-4740-b799-0bf8bc5a0664",
    slug: "mouse",
    name: "Mouse",
    description: "Input devices - mice",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/mouse_1763347987006.jpg",
    displayOrder: 12,
    keywords: ["mouse", "mice", "pointer", "gaming mouse"],
  },
  {
    id: "b2d53f67-5291-4a09-b302-b027e7dd1a57",
    slug: "laptops",
    name: "Laptop",
    description: "Portable systems for work, school, and gaming",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/laptop_1763347159946.webp",
    displayOrder: 13,
    keywords: ["laptop", "laptops", "notebook", "ultrabook"],
  },
  {
    id: "cd8fc8a2-df4e-49c7-bff1-c28435033d33",
    slug: "speaker",
    name: "Speaker",
    description: "Audio accessories",
    image: "https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/categories/speaker_1763348046878.jpg",
    displayOrder: 14,
    keywords: ["speaker", "speakers", "audio", "soundbar"],
  },
  {
    id: "bundle",
    slug: "bundle",
    name: "PC Bundle",
    description: "Pre-selected kits and full PC builds",
    image: null,
    displayOrder: 15,
    keywords: ["bundle", "pc build", "full setup", "package"],
  },
];

const CATEGORY_KEYWORDS = CATEGORY_LIBRARY.reduce((map, category) => {
  map[category.slug] = category.keywords;
  return map;
}, {});

const PRICE_SIGNALS = {
  budget: ["budget", "cheap", "cheapest", "affordable", "lower", "entry"],
  balanced: ["mid", "midrange", "value", "worth", "best price"],
  premium: ["expensive", "top tier", "flagship", "high end", "performance", "powerful"],
};

const USE_CASE_KEYWORDS = {
  gaming: ["game", "gaming", "fps", "esports"],
  productivity: ["office", "work", "business", "productivity"],
  creative: ["editing", "render", "design", "creative", "autocad"],
  school: ["school", "student", "study"],
  streaming: ["stream", "streaming", "content creator"],
};

const BRAND_KEYWORDS = ["intel", "amd", "nvidia", "asus", "msi", "gigabyte", "acer", "lenovo", "hp", "ryzen", "intel core", "lenovo legion"];

const GENERIC_PRODUCT_TERMS = new Set(["product", "products", "item", "items", "components", "component", "anything"]);

const CATEGORY_PRICE_GUIDE = {
  processor: { budgetMax: 10000, premiumMin: 20000 },
  "graphics-card": { budgetMax: 20000, premiumMin: 45000 },
  ram: { budgetMax: 5000, premiumMin: 12000 },
  ssd: { budgetMax: 3000, premiumMin: 8000 },
  hdd: { budgetMax: 2500, premiumMin: 6000 },
  laptops: { budgetMax: 45000, premiumMin: 80000 },
  monitor: { budgetMax: 7000, premiumMin: 20000 },
  default: { budgetMax: 15000, premiumMin: 50000 },
};

const NEXT_STEP_SUGGESTIONS = [
  "Say \"compare the first two\" for a quick spec sheet.",
  "Tell me \"add the cheaper one\" when you're ready to checkout.",
  "Ask for a full PC build and share your total budget to get a curated list.",
  "Need a matching accessory? Just mention what you're missing (monitor, PSU, etc.).",
];

const COMPONENT_KNOWLEDGE_BASE = {
  ssd: {
    label: "Solid-State Drive (SSD)",
    definition: "An SSD is a storage device that keeps your files on non-volatile flash memory, so it boots and loads programs much faster than traditional hard drives.",
    value: "Because SSDs have no moving parts, they are quieter, more durable, and dramatically quicker for everyday use.",
    tip: "Choose at least a 500GB SSD for modern systems and pair it with an HDD only if you need large, low-cost archival space.",
    categoryHints: ["storage", "ssd"],
    synonyms: ["ssd", "ssds", "solid state drive", "solid-state drive"],
  },
  processor: {
    label: "Central Processing Unit (Processor)",
    definition: "The processor is the brain of the computer, handling instructions for every app, game, or task you run.",
    value: "A capable CPU keeps multitasking smooth and prevents bottlenecks for GPUs and memory.",
    tip: "Match the processor tier with your workload—Ryzen 5 / Core i5 for balanced builds, Ryzen 7 / Core i7 for heavy multitasking or gaming.",
    categoryHints: ["processor", "cpu"],
    synonyms: ["processor", "processors", "cpu", "cpus"],
  },
  ram: {
    label: "Random Access Memory (RAM)",
    definition: "RAM is the short-term workspace your PC uses to keep apps responsive while you switch tasks.",
    value: "More and faster RAM lets you keep more browser tabs, projects, or games open without slowdowns.",
    tip: "Aim for at least 16GB DDR4/DDR5 for modern gaming or productivity; dual-channel kits give the best performance.",
    categoryHints: ["ram", "memory"],
    synonyms: ["ram", "memory", "ddr4", "ddr5"],
  },
  gpu: {
    label: "Graphics Processing Unit (GPU)",
    definition: "A GPU renders visuals for games, creative apps, and GPU-accelerated workloads.",
    value: "Pairing the right GPU with your CPU keeps frame rates stable and speeds up rendering or AI workloads.",
    tip: "Balance GPU choice with monitor resolution—don’t overspend on power you can’t see, but leave headroom if you plan to upgrade displays.",
    categoryHints: ["gpu", "graphics"],
    synonyms: ["gpu", "graphics card", "graphics", "rtx", "gtx"],
  },
  hdd: {
    label: "Hard Disk Drive (HDD)",
    definition: "An HDD is a magnetic storage drive that uses spinning platters and read/write heads to store large amounts of data economically.",
    value: "They are great for archiving media, backups, and bulky game libraries because cost per gigabyte stays low compared to SSDs.",
    tip: "Use an HDD for mass storage and pair it with an SSD boot drive for fast load times.",
    categoryHints: ["hdd", "storage"],
    synonyms: ["hdd", "hard disk", "hard drive", "mechanical drive"],
  },
};

const sanitizeSearchTerm = (term = "") => {
  let cleaned = term.trim();
  cleaned = cleaned.replace(/^(all|any|the)\s+/i, "");
  cleaned = cleaned.replace(/\b(that|which)\s+you\s+have$/i, "");
  cleaned = cleaned.replace(/\b(do\s+you\s+have|are\s+available|available|in\s+stock)$/i, "");
  cleaned = cleaned.replace(/\s+(available|in\s+stock|on\s+hand|still\s+available|current\s+stock)\??$/i, "");
  return cleaned.trim().toLowerCase();
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const keywordMatches = (normalizedText = "", keyword = "") => {
  if (!normalizedText || !keyword) return false;
  const pattern = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`);
  return pattern.test(normalizedText.toLowerCase());
};

const buildTextVariants = (value = "") => {
  if (!value) return [];
  const base = value.toLowerCase().trim();
  if (!base) return [];
  const variantSet = new Set([base, base.replace(/[-_]/g, ' ')]);
  return Array.from(variantSet);
};

const parseBudgetFromInput = (input = "") => {
  const lower = input.toLowerCase();
  const currencyPattern = /(under|below|less than|max(?:imum)?|up to|within)?\s*₱?\s*([\d,.]+)(k|\s*k|\s*thousand)?/;
  const match = lower.match(currencyPattern);
  if (!match) return null;

  const qualifier = match[1]?.trim() || null;
  let numeric = match[2]?.replace(/,/g, "");
  if (!numeric) return null;
  let amount = parseFloat(numeric);
  if (Number.isNaN(amount)) return null;
  if (match[3]) {
    amount *= 1000;
  }

  return {
    amount,
    qualifier: qualifier || 'exact',
  };
};

const getPriceGuideForCategory = (slug) => CATEGORY_PRICE_GUIDE[slug] || CATEGORY_PRICE_GUIDE.default;

const buildNextStepsLine = (intent, categoryInfo) => {
  const tips = [];
  if (!intent?.budgetAmount) {
    tips.push("Share a maximum budget so I can filter tighter.");
  }
  if (categoryInfo) {
    tips.push("Say \"compare the first two\" for a side-by-side breakdown.");
  }
  tips.push(NEXT_STEP_SUGGESTIONS[Math.floor(Math.random() * NEXT_STEP_SUGGESTIONS.length)]);
  return `Next steps: ${tips.join(' ')}`;
};

const getNumericPrice = (product) => {
  const raw = product?.price ?? product?.official_price ?? product?.total_price ?? 0;
  const value = Number(raw);
  return Number.isNaN(value) ? 0 : value;
};

const filterByBudgetSignals = (products = [], intent = {}, categorySlug) => {
  if (!products.length) return [];
  const guide = getPriceGuideForCategory(categorySlug || intent?.category);
  return products.filter((product) => {
    const price = getNumericPrice(product);
    if (price <= 0) return true;

    if (intent?.budgetAmount) {
      const cap = intent.budgetAmount * 1.05; // allow small buffer over stated budget
      return price <= cap;
    }

    if (intent?.priceFocus === 'budget') {
      return price <= guide.budgetMax;
    }

    if (intent?.priceFocus === 'premium') {
      return price >= guide.premiumMin;
    }

    return true;
  });
};

const resolveCategoryInfo = (term, dynamicCategories = []) => {
  if (!term) return null;
  const normalized = term.toLowerCase().trim();
  if (!normalized) return null;

  const libraryMatch = CATEGORY_LIBRARY.find((category) => {
    const slugVariants = buildTextVariants(category.slug);
    const nameVariants = buildTextVariants(category.name);
    if (slugVariants.includes(normalized) || nameVariants.includes(normalized)) return true;
    if (slugVariants.some((variant) => keywordMatches(normalized, variant))) return true;
    if (nameVariants.some((variant) => keywordMatches(normalized, variant))) return true;
    return category.keywords.some((keyword) => keywordMatches(normalized, keyword));
  });
  if (libraryMatch) return libraryMatch;

  const dynamicMatch = dynamicCategories.find((category) => {
    const slug = category.slug?.toLowerCase();
    const name = category.name?.toLowerCase();
    const slugVariants = buildTextVariants(slug);
    const nameVariants = buildTextVariants(name);
    if (slugVariants.includes(normalized) || nameVariants.includes(normalized)) return true;
    if (slugVariants.some((variant) => keywordMatches(normalized, variant))) return true;
    if (nameVariants.some((variant) => keywordMatches(normalized, variant))) return true;
    return false;
  });

  if (dynamicMatch) {
    const reference = CATEGORY_LIBRARY.find((cat) => cat.slug === dynamicMatch.slug);
    return {
      id: dynamicMatch.id,
      slug: dynamicMatch.slug,
      name: dynamicMatch.name,
      description: dynamicMatch.description,
      image: dynamicMatch.image_url || dynamicMatch.icon_url,
      displayOrder: dynamicMatch.display_order,
      keywords: reference?.keywords || [normalized],
    };
  }

  return null;
};

const hydrateCategoriesForOverview = (categories = []) => {
  const source = categories.length ? categories : CATEGORY_LIBRARY;
  return source
    .map((category) => {
      const reference = CATEGORY_LIBRARY.find((cat) => cat.slug === category.slug) || CATEGORY_LIBRARY.find((cat) => cat.slug === category?.slug);
      return {
        slug: category.slug || reference?.slug,
        name: category.name || reference?.name,
        description: category.description || reference?.description || 'Core PC component',
        displayOrder: category.display_order ?? category.displayOrder ?? reference?.displayOrder ?? 999,
      };
    })
    .filter((entry) => entry.slug && entry.name)
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
};

const getCategoryDisplayName = (slug) => {
  if (!slug) return '';
  return CATEGORY_LIBRARY.find((category) => category.slug === slug)?.name || slug.replace(/-/g, ' ');
};

const estimateBase64SizeKb = (dataUrl = '') => {
  if (!dataUrl?.startsWith('data:')) return 0;
  const base64 = dataUrl.split(',')[1] || '';
  const bytes = Math.ceil((base64.length * 3) / 4);
  return Math.round(bytes / 1024);
};

const optimizeImageForVision = (dataUrl, options = {}) => new Promise((resolve, reject) => {
  if (!dataUrl) {
    resolve(null);
    return;
  }

  const image = new Image();
  image.onload = () => {
    try {
      const maxDimension = options.maxDimension || 1024;
      const quality = options.quality || 0.82;
      const largestSide = Math.max(image.width, image.height);
      const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const optimized = canvas.toDataURL('image/jpeg', quality);
      resolve(optimized);
    } catch (processingError) {
      reject(processingError);
    }
  };
  image.onerror = () => reject(new Error('Unable to process this image. Please try a different file.'));
  image.src = dataUrl;
});

const formatVisionErrorMessage = (error) => {
  if (!error) {
    return 'I encountered an unexpected issue while analyzing your image. Please describe what you need and I will assist you right away.';
  }

  const status = error.statusCode || error.response?.status;
  if (status === 413) {
    return 'The uploaded image is too large for the vision service. Please upload a smaller or cropped version and try again.';
  }
  if (status === 429) {
    return 'The vision service is momentarily busy. Please wait a few seconds and try again.';
  }

  const providerMessage = error.providerError || error.message || 'Vision service error';
  return `I ran into an issue while analyzing your image (${providerMessage}). Please try again or describe what you\'re looking for.`;
};


const normalizeComponentTerm = (term) => {
  const cleaned = term?.toLowerCase().trim();
  if (!cleaned) return null;
  for (const [key, info] of Object.entries(COMPONENT_KNOWLEDGE_BASE)) {
    if (info.synonyms.some((syn) => cleaned.includes(syn))) {
      return key;
    }
  }
  return cleaned;
};

const formatCurrency = (value) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;
  return numericValue.toLocaleString();
};

const AIChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // For fullscreen mode
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null); // Store questionnaire data
  const [recommendedProducts, setRecommendedProducts] = useState([]); // Store product recommendations
  const [selectedVariants, setSelectedVariants] = useState({}); // Store selected variant for each product
  const [comparisonMode, setComparisonMode] = useState(false); // For product comparison
  const [productsToCompare, setProductsToCompare] = useState([]); // Products selected for comparison
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false); // Track if history was loaded
  const [lastAddedToCart, setLastAddedToCart] = useState(null); // Track last item added to cart
  const [catalog, setCatalog] = useState({ products: [], categories: [] });
  const productsLoadingRef = useRef(false);
  const categoriesLoadingRef = useRef(false);

  // ===== CONTEXT MEMORY SYSTEM ===== 🧠
  const [conversationContext, setConversationContext] = useState({
    lastProducts: [],           // Products shown in last response
    lastCategory: null,          // Last searched category
    lastAction: null,            // Last action performed
    lastSearchTerm: null,        // Last search query
    budget: null,                // User's budget preference
    useCase: null,               // gaming, work, creator, etc.
    addedItemsSession: [],       // All items added in this session
  });

  // Phase 3: Advanced Features
  const [isRecording, setIsRecording] = useState(false); // Voice input state
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Multi-language support
  const [uploadedImage, setUploadedImage] = useState(null); // Image upload for visual search
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const { loadCart, addToCart } = useCart(); // Get cart functions from CartContext

  const ensureProductsLoaded = useCallback(async () => {
    if (catalog.products.length) return catalog.products;
    if (productsLoadingRef.current) return catalog.products;
    productsLoadingRef.current = true;
    try {
      const products = await AIService.fetchProducts();
      setCatalog((prev) => ({ ...prev, products }));
      return products;
    } catch (error) {
      console.error('Error preloading products:', error);
      return catalog.products;
    } finally {
      productsLoadingRef.current = false;
    }
  }, [catalog.products.length]);

  const ensureCategoriesLoaded = useCallback(async () => {
    if (catalog.categories.length) return catalog.categories;
    if (categoriesLoadingRef.current) return catalog.categories;
    if (typeof AIService.fetchProductCategories !== 'function') return catalog.categories;
    categoriesLoadingRef.current = true;
    try {
      const categories = await AIService.fetchProductCategories();
      setCatalog((prev) => ({ ...prev, categories }));
      return categories;
    } catch (error) {
      console.error('Error preloading categories:', error);
      return catalog.categories;
    } finally {
      categoriesLoadingRef.current = false;
    }
  }, [catalog.categories.length]);

  // ===== SHOPPING INTENT + RESPONSE HELPERS =====
  const detectShoppingIntent = (rawInput = "") => {
    const lowerInput = rawInput.toLowerCase();
    const intent = {
      category: null,
      priceFocus: null,
      useCase: null,
      brandPreferences: [],
      action: null,
      definitionTarget: null,
      budgetAmount: null,
      budgetQualifier: null,
    };

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((keyword) => lowerInput.includes(keyword))) {
        intent.category = category;
        break;
      }
    }

    for (const [priceTier, keywords] of Object.entries(PRICE_SIGNALS)) {
      if (keywords.some((keyword) => lowerInput.includes(keyword))) {
        intent.priceFocus = priceTier;
        break;
      }
    }

    for (const [useCase, keywords] of Object.entries(USE_CASE_KEYWORDS)) {
      if (keywords.some((keyword) => lowerInput.includes(keyword))) {
        intent.useCase = useCase;
        break;
      }
    }

    const detectedBrands = BRAND_KEYWORDS.filter((brand) => lowerInput.includes(brand));
    if (detectedBrands.length > 0) {
      intent.brandPreferences = detectedBrands.map((brand) => brand.toUpperCase());
    }

    const budgetInfo = parseBudgetFromInput(lowerInput);
    if (budgetInfo) {
      intent.budgetAmount = budgetInfo.amount;
      intent.budgetQualifier = budgetInfo.qualifier;
      if (!intent.priceFocus) {
        if (budgetInfo.amount <= 15000) intent.priceFocus = 'budget';
        else if (budgetInfo.amount >= 60000) intent.priceFocus = 'premium';
        else intent.priceFocus = 'balanced';
      }
    }

    const definitionMatch = lowerInput.match(/what\s+is\s+(an?\s+)?([a-z0-9\-\s]+)/);
    if (definitionMatch) {
      intent.action = 'definition';
      intent.definitionTarget = definitionMatch[2].replace(/\?+/g, '').trim();
    }

    return intent;
  };

  const productMatchesCategory = (product, categoryKey) => {
    if (!categoryKey) return true;
    const normalized = categoryKey.toLowerCase();
    const normalizedVariants = buildTextVariants(normalized);
    const matchesValue = (value) => {
      if (!value) return false;
      const lower = value.toLowerCase();
      if (normalizedVariants.includes(lower)) return true;
      return normalizedVariants.some((variant) => keywordMatches(lower, variant));
    };

    const candidateFields = [
      product.category,
      product.category_slug,
      product.component_type,
      product.type,
      product.name,
      product.title,
    ]
      .filter(Boolean)
      .map((value) => value.toLowerCase());

    if (candidateFields.some((field) => matchesValue(field))) {
      return true;
    }

    if (product.selected_components && Array.isArray(product.selected_components)) {
      const matches = product.selected_components.some((component) => {
        if (!component) return false;
        if (typeof component === 'string') {
          return matchesValue(component);
        }
        const componentName = component.name || component.label;
        const componentSlug = component.slug;
        const componentId = component.id;
        if (componentId && componentId.toLowerCase() === normalized) return true;
        if (componentSlug && componentSlug.toLowerCase() === normalized) return true;
        if (componentName && matchesValue(componentName)) return true;
        const reference = CATEGORY_LIBRARY.find((cat) => cat.slug === normalized);
        if (reference && componentName) {
          return keywordMatches(componentName.toLowerCase(), reference.name.toLowerCase());
        }
        return false;
      });
      if (matches) return true;
    }

    return false;
  };

  const productMatchesBrand = (product, brandPreferences = []) => {
    if (!brandPreferences.length) return true;
    const productBrand = product.brands?.name || product.brand || '';
    if (!productBrand) return false;
    return brandPreferences.some((brand) => productBrand.toLowerCase().includes(brand.toLowerCase()));
  };

  const getVisionCategorySlug = (productType) => {
    if (!productType) return null;
    const normalized = productType.toLowerCase().trim();
    if (!normalized) return null;
    const match = CATEGORY_LIBRARY.find((category) => {
      const slugVariants = buildTextVariants(category.slug);
      const nameVariants = buildTextVariants(category.name);
      if (slugVariants.includes(normalized) || nameVariants.includes(normalized)) return true;
      if (category.keywords.some((keyword) => keywordMatches(normalized, keyword))) return true;
      return false;
    });
    return match?.slug || normalized.replace(/\s+/g, '-');
  };

  const rankProductsByVisionClues = (visionData = {}, products = []) => {
    if (!products.length) return [];
    const brandPreferences = visionData.brand ? [visionData.brand.toUpperCase()] : [];
    const categorySlug = getVisionCategorySlug(visionData.productType);
    const keywords = (visionData.keywords || []).map((keyword) => keyword.toLowerCase()).filter((keyword) => keyword.length > 2);
    const specs = (visionData.specs || visionData.specifications || []).map((spec) => spec.toLowerCase());

    return products
      .map((product) => {
        let score = 0;
        const productName = (product.name || product.title || '').toLowerCase();
        const productDescription = (product.description || '').toLowerCase();

        if (categorySlug && productMatchesCategory(product, categorySlug)) {
          score += 60;
        }

        if (brandPreferences.length && productMatchesBrand(product, brandPreferences)) {
          score += 30;
        }

        keywords.forEach((keyword) => {
          if (productName.includes(keyword)) score += 8;
          if (productDescription.includes(keyword)) score += 4;
        });

        specs.forEach((spec) => {
          if (productName.includes(spec)) score += 6;
          if (productDescription.includes(spec)) score += 3;
        });

        return {
          product,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => ({ ...item.product, matchScore: item.score }));
  };

  const applyIntentFilters = (products = [], intent, options = {}) => {
    if (!products.length) return [];
    let filtered = [...products];
    const categorySlug = options?.categoryInfo?.slug || intent?.category;

    if (categorySlug) {
      const categoryMatches = filtered.filter((product) =>
        productMatchesCategory(product, categorySlug)
      );
      if (categoryMatches.length) {
        filtered = categoryMatches;
      }
    }

    if (intent?.brandPreferences?.length) {
      const brandMatches = filtered.filter((product) => productMatchesBrand(product, intent.brandPreferences));
      if (brandMatches.length) {
        filtered = brandMatches;
      }
    }

    const budgetMatches = filterByBudgetSignals(filtered, intent, categorySlug);
    if (budgetMatches.length) {
      filtered = budgetMatches;
    }

    if (intent?.priceFocus === 'budget') {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (intent?.priceFocus === 'premium') {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return filtered;
  };

  const formatProfessionalProductSummary = (products = [], intent, searchTerm, categoryInfo) => {
    if (!products.length) return '';

    const descriptor = intent?.priceFocus === 'budget'
      ? 'the best-priced picks'
      : intent?.priceFocus === 'premium'
        ? 'our top-performing options'
        : 'well-balanced recommendations';

    const categoryLabel = categoryInfo?.name || searchTerm || intent?.category || 'these products';
    const useCaseLabel = intent?.useCase ? ` tailored for ${intent.useCase}` : '';
    const budgetLabel = intent?.budgetAmount ? ` within ₱${formatCurrency(intent.budgetAmount)}` : '';
    const brandLabel = intent?.brandPreferences?.length ? ` focusing on ${intent.brandPreferences.join(', ')}` : '';
    const intro = `Here are ${descriptor}${brandLabel} for ${categoryLabel}${useCaseLabel}${budgetLabel}:`;

    const productLines = products.slice(0, 5).map((product, index) => {
      const name = product.name || product.title;
      const brand = product.brands?.name ? ` • Brand: ${product.brands.name}` : '';
      const stock = typeof product.stock_quantity !== 'undefined'
        ? product.stock_quantity
        : product.stock || 0;
      const highlights = [];
      if (intent?.priceFocus === 'budget' && product.matchScore) {
        highlights.push(`match score ${(product.matchScore * 100).toFixed(0)}%`);
      }
      if (intent?.priceFocus === 'premium' && product.rating) {
        highlights.push(`rating ${product.rating}/5`);
      }
      if (product.metadata?.discount) {
        highlights.push(`discount ${product.metadata.discount}%`);
      }
      const shortDescription = product.description?.split('. ')[0];
      const descriptionText = shortDescription ? ` • ${shortDescription}` : '';
      const highlightText = highlights.length ? ` • ${highlights.join(' • ')}` : '';
      return `${index + 1}. **${name}** — ₱${formatCurrency(getNumericPrice(product))} • Stock: ${stock}${brand}${highlightText}${descriptionText}`;
    }).join('\n\n');

    const closing = buildNextStepsLine(intent, categoryInfo);

    return `${intro}\n\n${productLines}\n\n${closing}`;
  };

  const fetchProductsForComponent = async (knowledge) => {
    if (!knowledge?.categoryHints?.length) return [];
    for (const hint of knowledge.categoryHints) {
      try {
        const results = await AIService.fetchProductsByCategory(hint);
        if (results?.length) {
          return results;
        }
      } catch (error) {
        console.error('Error fetching related products for component definition:', error);
      }
    }
    return [];
  };

  const handleComponentQuestion = async (userInput) => {
      const intent = detectShoppingIntent(userInput);
      const lowerInput = userInput.toLowerCase();
      const definitionCue = /(what\s+is|define|definition|meaning|explain|tell me about|difference)/i.test(lowerInput);
      const matchedComponents = Object.entries(COMPONENT_KNOWLEDGE_BASE)
        .filter(([, info]) => info.synonyms.some((syn) => keywordMatches(lowerInput, syn)))
        .map(([key]) => key);
      const wantsComparison = /(difference between|differentiate|compare|vs|versus)/i.test(lowerInput);

      if (wantsComparison && matchedComponents.length >= 2) {
        setIsTyping(true);
        try {
          const keysToDescribe = matchedComponents.slice(0, 3);
          const availabilityByKey = {};
          for (const key of keysToDescribe) {
            availabilityByKey[key] = await fetchProductsForComponent(COMPONENT_KNOWLEDGE_BASE[key]);
          }

          const comparisonSections = keysToDescribe.map((key) => {
            const knowledge = COMPONENT_KNOWLEDGE_BASE[key];
            const related = availabilityByKey[key] || [];
            const availabilityText = related.length
              ? `We currently have ${related.length} option${related.length > 1 ? 's' : ''} in stock.`
              : 'Currently out of stock, but I can alert you when new units arrive.';
            return `**${knowledge.label}**
  ${knowledge.definition}
  • Why it matters: ${knowledge.value}
  • Buying tip: ${knowledge.tip}
  • Availability: ${availabilityText}`;
          }).join('\n\n');

          const comparisonTitle = `⚖️ ${keysToDescribe.map((key) => COMPONENT_KNOWLEDGE_BASE[key].label).join(' vs ')}`;
          const response = {
            id: Date.now(),
            text: `${comparisonTitle}
  \n${comparisonSections}
  \nNeed help picking one? Share your budget or primary use case and I'll narrow it down.`,
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, response]);
          saveMessageToHistory(response);
          updateContext({
            lastAction: 'component_comparison',
            lastCategory: keysToDescribe[0],
          });
          return true;
        } catch (error) {
          console.error('Error handling comparison question:', error);
          return false;
        } finally {
          setIsTyping(false);
        }
      }

      const needsSingleDefinition = (intent.action === 'definition' && intent.definitionTarget) || (definitionCue && matchedComponents.length === 1);
      if (!needsSingleDefinition) {
        return false;
      }

      const normalizedTerm = intent.definitionTarget
        ? normalizeComponentTerm(intent.definitionTarget)
        : matchedComponents[0];
      const knowledge = COMPONENT_KNOWLEDGE_BASE[normalizedTerm];
      if (!knowledge) {
        return false;
      }

      setIsTyping(true);
      try {
        const relatedProducts = await fetchProductsForComponent(knowledge);

        const availabilityText = relatedProducts.length
          ? `We currently have ${relatedProducts.length} option${relatedProducts.length > 1 ? 's' : ''} available in this category.`
          : 'This category is temporarily unavailable, but I can monitor it for you or suggest comparable alternatives right away.';

        const response = {
          id: Date.now(),
          text: `💡 **${knowledge.label} Essentials**
  \n${knowledge.definition}
  \n**Why it matters:** ${knowledge.value}
  **Buying tip:** ${knowledge.tip}
  \n${availabilityText}
  Let me know if you want the most affordable, best-performing, or most compatible options next.`,
          sender: 'ai',
          timestamp: new Date(),
          products: relatedProducts.slice(0, 4) || null,
        };

        setMessages((prev) => [...prev, response]);
        saveMessageToHistory(response);
        updateContext({
          lastAction: 'component_definition',
          lastCategory: normalizedTerm,
        });
        return true;
      } catch (error) {
        console.error('Error handling component question:', error);
        return false;
      } finally {
        setIsTyping(false);
      }
  };

  // ===== HELPER FUNCTIONS FOR ADVANCED AI COMMANDS ===== 🚀

  /**
   * FUZZY PRODUCT MATCHING - Handles typos and variations
   * Examples: "intrll cor i7" → "Intel Core i7", "rayzen" → "Ryzen"
   */
  const fuzzyMatchProduct = (query, products) => {
    if (!query || !products || products.length === 0) return [];
    
    const fuse = new Fuse(products, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'brands.name', weight: 0.2 },
        { name: 'description', weight: 0.1 },
      ],
      threshold: 0.4,  // 60% similarity required
      includeScore: true,
      ignoreLocation: true,
      useExtendedSearch: true,
    });

    const results = fuse.search(query);
    return results.map(result => ({
      ...result.item,
      matchScore: 1 - result.score, // Convert to percentage
    }));
  };

  /**
   * QUANTITY DETECTION - Extract numbers from natural language
   * Examples: "add 3 rams" → 3, "get two processors" → 2, "5 pieces" → 5
   */
  const extractQuantity = (input) => {
    const numberWords = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'a': 1, 'an': 1,
    };

    // Pattern 1: Direct numbers "add 3 rams", "5 pieces"
    const directNumber = input.match(/(\d+)\s*(?:pieces?|pcs|units?|items?)?/i);
    if (directNumber) {
      const qty = parseInt(directNumber[1]);
      return qty > 0 && qty <= 100 ? qty : 1; // Cap at 100
    }

    // Pattern 2: "add [number]" or "get [number]"
    const actionNumber = input.match(/(?:add|get|buy|order|purchase)\s+(\d+)/i);
    if (actionNumber) {
      const qty = parseInt(actionNumber[1]);
      return qty > 0 && qty <= 100 ? qty : 1;
    }

    // Pattern 3: Number words "two processors", "five rams"
    const words = input.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (numberWords[word]) {
        return numberWords[word];
      }
    }

    return 1; // Default quantity
  };

  /**
   * UPDATE CONVERSATION CONTEXT - Remember last interactions
   */
  const updateContext = (updates) => {
    setConversationContext(prev => ({
      ...prev,
      ...updates,
      timestamp: new Date(),
    }));
  };

  /**
   * GET CONTEXT-AWARE PRODUCT - Handle "add the cheaper one", "add the first one"
   */
  const getContextualProduct = (input) => {
    const { lastProducts } = conversationContext;
    if (!lastProducts || lastProducts.length === 0) return null;

    const lowerInput = input.toLowerCase();

    // Price-based selection
    if (lowerInput.includes('cheaper') || lowerInput.includes('cheapest')) {
      return lastProducts.reduce((min, p) => 
        parseFloat(p.price) < parseFloat(min.price) ? p : min
      );
    }
    if (lowerInput.includes('expensive') || lowerInput.includes('pricey')) {
      return lastProducts.reduce((max, p) => 
        parseFloat(p.price) > parseFloat(max.price) ? p : max
      );
    }

    // Position-based selection
    if (lowerInput.includes('first') || lowerInput.includes('top')) {
      return lastProducts[0];
    }
    if (lowerInput.includes('second')) {
      return lastProducts[1] || lastProducts[0];
    }
    if (lowerInput.includes('last')) {
      return lastProducts[lastProducts.length - 1];
    }

    // Default: first product
    return lastProducts[0];
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    ensureProductsLoaded();
    ensureCategoriesLoaded();
  }, [ensureProductsLoaded, ensureCategoriesLoaded]);

  // Manual load chat history function
  const loadChatHistory = async () => {
    try {
      setIsTyping(true);
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const result = await ChatHistoryService.loadHistory(data.user.id, 20);
        if (result.success && result.messages.length > 0) {
          setMessages(result.messages);
          setHasLoadedHistory(true);

          // Add system message
          const systemMsg = {
            id: Date.now(),
            text: `✅ Loaded ${result.messages.length} previous messages. You can continue where you left off!`,
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, systemMsg]);
        } else {
          const noHistoryMsg = {
            id: Date.now(),
            text: "No previous conversation history found. Let's start fresh!",
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, noHistoryMsg]);
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Clear chat history function
  const clearChatHistory = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await ChatHistoryService.clearHistory(data.user.id);
        setMessages([
          {
            id: 1,
            text: "Chat history cleared! How can I help you today?",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
        setHasLoadedHistory(false);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  // Quick Action Handlers
  const handleShowCheaperOptions = async (currentProducts) => {
    setIsTyping(true);
    const products = await AIService.fetchProducts();

    // Get products in same category but cheaper
    const cheaper = products.filter(p =>
      currentProducts.some(cp =>
        p.selected_components?.some(sc =>
          cp.selected_components?.some(csc => sc.name === csc.name)
        ) && p.price < cp.price
      )
    ).slice(0, 5);

    const aiResponse = {
      id: Date.now(),
      text: cheaper.length > 0
        ? "Here are some more affordable alternatives:"
        : "These are already among the most affordable options available!",
      sender: "ai",
      timestamp: new Date(),
      products: cheaper.length > 0 ? cheaper : null,
      isGeneralQuestion: false
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleCompareProducts = (products) => {
    if (products.length < 2) {
      const noProductsMsg = {
        id: Date.now(),
        text: "I need at least 2 products to compare. Please ask me to show you multiple items from the same category!",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, noProductsMsg]);
      return;
    }

    // Group products by category (selected_components)
    const categoryGroups = {};
    products.forEach(product => {
      const category = product.selected_components?.[0]?.name || 'other';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(product);
    });

    // Find the category with the most products
    let largestCategory = null;
    let largestCount = 0;
    Object.entries(categoryGroups).forEach(([category, prods]) => {
      if (prods.length >= 2 && prods.length > largestCount) {
        largestCategory = category;
        largestCount = prods.length;
      }
    });

    // If no category has 2+ products, show error
    if (!largestCategory) {
      const mixedMsg = {
        id: Date.now(),
        text: "These products are from different categories, so I can't compare them directly. Try asking for multiple products from the same category, like:\n\n• 'Show me processors'\n• 'What RAMs do you have?'\n• 'Available graphics cards'",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, mixedMsg]);
      return;
    }

    // Compare first 2 products from the same category
    const productsToCompare = categoryGroups[largestCategory].slice(0, 2);
    setComparisonMode(true);
    setProductsToCompare(productsToCompare);

    const comparison = CompatibilityService.compareProducts(productsToCompare[0], productsToCompare[1]);
    const comparisonText = CompatibilityService.formatComparisonText(comparison);

    const aiResponse = {
      id: Date.now(),
      text: comparisonText + `\n\n💡 Both products are **${largestCategory}** components, making this a fair comparison!`,
      sender: "ai",
      timestamp: new Date(),
      isGeneralQuestion: false
    };

    setMessages(prev => [...prev, aiResponse]);
    saveMessageToHistory(aiResponse);
    setComparisonMode(false);
  };

  const handleCheckCompatibility = async () => {
    setIsTyping(true);

    try {
      const cartItems = await CartService.getCartItems();
      const compatibility = CompatibilityService.checkCartCompatibility(cartItems.items || []);

      let message = CompatibilityService.getStatusMessage(compatibility) + '\n\n';

      if (compatibility.issues.length > 0) {
        message += '**Issues:**\n';
        compatibility.issues.forEach(issue => {
          message += `${issue.title}\n${issue.message}\n\n`;
        });
      }

      if (compatibility.warnings.length > 0) {
        message += '**Warnings:**\n';
        compatibility.warnings.forEach(warning => {
          message += `${warning.title}\n${warning.message}\n\n`;
        });
      }

      if (compatibility.suggestions.length > 0) {
        message += '**Suggestions:**\n';
        compatibility.suggestions.forEach(suggestion => {
          message += `${suggestion.message}\n`;
        });
      }

      const aiResponse = {
        id: Date.now(),
        text: message,
        sender: "ai",
        timestamp: new Date(),
        isGeneralQuestion: false
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error checking compatibility:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle showing recommended bundles
  const handleShowBundles = async () => {
    setIsTyping(true);

    try {
      console.log('🔍 handleShowBundles: Fetching bundles...');
      const { data: bundles, error } = await BundleService.fetchBundles();

      console.log('📦 Bundle fetch result:', { bundles, error });
      console.log('📊 Bundles count:', bundles?.length);

      if (error) {
        console.error('❌ Bundle fetch error:', error);
      }

      if (error || !bundles || bundles.length === 0) {
        console.log('⚠️ No bundles available');
        const noBundlesMsg = {
          id: Date.now(),
          text: "I apologize, but we don't have any complete bundles available at the moment. However, I can help you build a custom PC! Just let me know your budget and requirements.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, noBundlesMsg]);
        setIsTyping(false);
        return;
      }

      console.log('✅ Showing', bundles.length, 'bundles');

      // Show bundle options
      const bundleOptionsMsg = {
        id: Date.now(),
        text: `🎁 **Pre-Configured PC Bundles**\n\nI have ${bundles.length} complete build package${bundles.length > 1 ? 's' : ''} ready for you! Each bundle includes all compatible components.\n\nClick "View Bundle" to see the details:`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, bundleOptionsMsg]);

      // Add individual bundle cards
      bundles.forEach((bundle, index) => {
        console.log(`📦 Adding bundle ${index + 1}:`, bundle.bundle_name, bundle);

        // Extract values with fallbacks for different column names
        const bundleName = bundle.bundle_name || bundle.name || 'Unnamed Bundle';
        const bundlePrice = bundle.official_price || bundle.total_price || 0;
        const productCount = bundle.product_count || 0;
        const bundleDesc = bundle.description || 'Complete PC Bundle';

        const bundleMsg = {
          id: Date.now() + index + 1,
          text: `📦 **${bundleName}**\n${bundleDesc}\n\n💰 Total Price: ₱${parseFloat(bundlePrice).toLocaleString()}\n📊 ${productCount} Products Included`,
          sender: "ai",
          timestamp: new Date(),
          bundleId: bundle.id,
          bundleData: bundle,
          showBundleActions: true,
        };
        setMessages(prev => [...prev, bundleMsg]);
      });

    } catch (error) {
      console.error('❌ Error in handleShowBundles:', error);
      const errorMsg = {
        id: Date.now(),
        text: "Sorry, I encountered an error while fetching bundle options. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle viewing bundle details
  const handleViewBundleDetails = async (bundleId) => {
    setIsTyping(true);
    
    try {
      const { data: bundle, error } = await BundleService.fetchBundleDetails(bundleId);

      if (error || !bundle) {
        const errorMsg = {
          id: Date.now(),
          text: `❌ Sorry, I couldn't load the bundle details. ${error || 'Bundle not found'}`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsTyping(false);
        return;
      }

      // Format products list
      const productsList = bundle.products && bundle.products.length > 0
        ? bundle.products.map(p => `• ${p.name} - ₱${parseFloat(p.price || 0).toLocaleString()}`).join('\n')
        : 'No products available';

      // Extract bundle info with fallbacks
      const bundleName = bundle.bundle_name || bundle.name || 'Bundle';
      const bundleDesc = bundle.description || 'Complete PC Bundle';
      const bundlePrice = bundle.official_price || bundle.total_price || 0;

      const bundleDetailsMsg = {
        id: Date.now(),
        text: `📦 **${bundleName}** Bundle Details\n\n${bundleDesc}\n\n**Included Products:**\n${productsList}\n\n💰 **Total Price:** ₱${parseFloat(bundlePrice).toLocaleString()}`,
        sender: "ai",
        timestamp: new Date(),
        products: bundle.products || [],
        bundleData: bundle,
        showBundleActions: true,
      };

      setMessages(prev => [...prev, bundleDetailsMsg]);
      saveMessageToHistory(bundleDetailsMsg);

    } catch (error) {
      console.error('Error fetching bundle details:', error);
      const errorMsg = {
        id: Date.now(),
        text: "Sorry, I encountered an error while loading bundle details. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle adding entire bundle to cart
  const handleAddBundleToCart = async (bundleId) => {
    setIsTyping(true);
    
    try {
      const result = await BundleService.addBundleToCart(bundleId);

      if (!result.success) {
        const errorMsg = {
          id: Date.now(),
          text: `❌ Sorry, I couldn't add the bundle to your cart. ${result.error === 'User not authenticated' ? 'Please log in first.' : result.error}`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
      } else {
        // Refresh cart count
        await loadCart();

        const successMsg = {
          id: Date.now(),
          text: `✅ **Complete Build Added!**\n\nI've added all ${result.itemsAdded} components from the bundle to your cart!\n\nYour build is ready to order! Would you like to:\n• View your cart\n• Check component compatibility\n• Modify any components`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, successMsg]);
        saveMessageToHistory(successMsg);
      }

    } catch (error) {
      console.error('Error adding bundle to cart:', error);
      const errorMsg = {
        id: Date.now(),
        text: "Sorry, I encountered an error while adding the bundle to your cart. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper function to save messages to chat history
  const saveMessageToHistory = async (message) => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await ChatHistoryService.saveMessage(data.user.id, message);
      }
    } catch (error) {
      console.error('Error saving message to history:', error);
    }
  };

  // ============= PHASE 3: ADVANCED FEATURES =============

  // 1. VOICE INPUT - Speech Recognition
  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const errorMsg = {
        id: Date.now(),
        text: "⚠️ Voice input is not supported in your browser. Please try Chrome or Edge.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = selectedLanguage === 'tl' ? 'tl-PH' : selectedLanguage === 'es' ? 'es-ES' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      const recordingMsg = {
        id: Date.now(),
        text: "🎤 Listening... Speak now!",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, recordingMsg]);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      const errorMsg = {
        id: Date.now(),
        text: `⚠️ Voice recognition error: ${event.error}. Please try again.`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // 2. IMAGE UPLOAD - Visual Search
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = {
        id: Date.now(),
        text: "⚠️ Image file is too large. Please upload an image smaller than 5MB.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Preview image and store it
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const rawDataUrl = e.target.result;
        const optimizedDataUrl = await optimizeImageForVision(rawDataUrl, { maxDimension: 1024, quality: 0.82 }) || rawDataUrl;
        const sizeKb = estimateBase64SizeKb(optimizedDataUrl);
        console.log(`📸 Image prepared for vision (${sizeKb} KB approx)`);
        setUploadedImage(optimizedDataUrl);
      } catch (processingError) {
        console.error('❌ Image optimization failed:', processingError);
        const optimizationMsg = {
          id: Date.now(),
          text: 'I had trouble processing that image. Please try a different file or reduce its resolution.',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, optimizationMsg]);
      }
    };
    reader.readAsDataURL(file);
  };

  const processImageSearch = async (imageData, userMessage = "") => {
    const startTime = Date.now();
    
    try {
      // Show analyzing message ONLY if it takes > 1 second
      const typingTimeout = setTimeout(() => {
        setIsTyping(true);
      }, 1000);

      let preparedImage = imageData;
      if (estimateBase64SizeKb(imageData) > 1400) {
        try {
          const optimized = await optimizeImageForVision(imageData, { maxDimension: 960, quality: 0.78 });
          if (optimized) {
            preparedImage = optimized;
            console.log('📦 Re-optimized image before vision call');
          }
        } catch (resizeError) {
          console.warn('⚠️ Unable to re-optimize image before vision call:', resizeError);
        }
      }

      // Check if Vision API is configured
      if (!VisionService.isConfigured()) {
        clearTimeout(typingTimeout);
        setIsTyping(false);
        
        const configErrorMsg = {
          id: Date.now() + 1,
          text: "⚠️ AI Vision API Not Configured\n\nTo enable real image recognition, please configure your API keys in the .env file.\n\nFalling back to keyword-based search...",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, configErrorMsg]);
        
        // Fall back to keyword search
        await processImageSearchFallback(imageData, userMessage);
        return;
      }

      // Use AI Vision API to analyze the image
      const visionResult = await VisionService.analyzeProductImage(preparedImage, userMessage);
      
      clearTimeout(typingTimeout);

      if (!visionResult.success) {
        const providerError = new Error(visionResult.error || 'Vision API failed');
        providerError.providerError = visionResult.error;
        providerError.provider = visionResult.provider;
        providerError.statusCode = visionResult.status;
        throw providerError;
      }

      const visionData = visionResult.data;

      // Fetch ALL products from database
      const allProducts = await AIService.fetchProducts();

      // Use Vision Service to match products based on detected features
      const matchedProducts = VisionService.matchProducts(visionData, allProducts);

      setIsTyping(false);

      // Show results
      if (matchedProducts.length > 0) {
        // Limit to top 5 results
        const resultsToShow = matchedProducts.slice(0, 5);

        setRecommendedProducts(resultsToShow);

        // Show products directly with professional message
        const resultsMsg = {
          id: Date.now() + 3,
          text: matchedProducts.length === 1
            ? `I found this product that matches your image:`
            : `I found ${matchedProducts.length} products that match your image. Here are the top ${resultsToShow.length} results:`,
          sender: "ai",
          timestamp: new Date(),
          products: resultsToShow,
          hasProducts: true,
        };
        setMessages(prev => [...prev, resultsMsg]);

        // Add follow-up suggestions
        const followUpMsg = {
          id: Date.now() + 4,
          text: "Would you like to:\n• See more details about any product?\n• Compare these products?\n• Add one to your cart?\n• Upload another image?",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, followUpMsg]);
      } else {
        // No matches found - show alternatives
        const visionCategorySlug = getVisionCategorySlug(visionData.productType);
        const detectedProduct = [visionData.brand, visionData.model || visionData.productType]
          .filter(Boolean)
          .join(' ')
          .trim() || 'that product';

        // Use detected clues to recommend the closest alternatives
        const curatedAlternatives = rankProductsByVisionClues(visionData, allProducts);
        const alternatives = (curatedAlternatives.length > 0 ? curatedAlternatives : allProducts).slice(0, 4);

        const categoryLabel = getCategoryDisplayName(visionCategorySlug);
        const guidanceText = categoryLabel
          ? `I could not find that exact ${detectedProduct}, but here are ${categoryLabel} items we currently have in stock:`
          : `I could not find that exact ${detectedProduct}, but here are the closest matches I found in our inventory:`;

        const noResultsMsg = {
          id: Date.now() + 3,
          text: `${guidanceText}`,
          sender: "ai",
          timestamp: new Date(),
          products: alternatives,
          hasProducts: true,
        };
        setMessages(prev => [...prev, noResultsMsg]);
        setRecommendedProducts(alternatives);
      }

      setUploadedImage(null);
    } catch (error) {
      console.error('Image search error:', error);
      setIsTyping(false);
      
      const errorMsg = {
        id: Date.now() + 5,
        text: formatVisionErrorMessage(error),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);

      const descriptionFallback = userMessage?.trim();
      if (descriptionFallback) {
        try {
          await processImageSearchFallback(imageData, descriptionFallback);
        } catch (fallbackError) {
          console.error('Keyword fallback error:', fallbackError);
        }
      }

      setUploadedImage(null);
    }
  };

  // Fallback function for keyword-based search (when Vision API is not configured)
  const processImageSearchFallback = async (imageData, userMessage = "") => {
    try {
      // Fetch ALL products from database
      const allProducts = await AIService.fetchProducts();

      // Extract keywords from user message to find similar products
      let matchedProducts = [];

      if (userMessage && userMessage.trim()) {
        const keywords = userMessage.toLowerCase().split(' ').filter(word => word.length > 2);

        // Search for products matching keywords
        matchedProducts = allProducts.filter(product => {
          const productName = product.name.toLowerCase();
          const productDesc = (product.description || '').toLowerCase();
          const categoryNames = (product.selected_components || []).map(c => c.name.toLowerCase()).join(' ');

          return keywords.some(keyword =>
            productName.includes(keyword) ||
            productDesc.includes(keyword) ||
            categoryNames.includes(keyword)
          );
        });
      }

      // Show results message
      const searchMsg = {
        id: Date.now() + 6,
        text: "🔍 **Keyword-Based Search Results**\n\nBased on your description, I found these products:",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, searchMsg]);

      // Check if we found any matches
      if (matchedProducts.length > 0) {
        const resultsToShow = matchedProducts.slice(0, 3);
        setRecommendedProducts(resultsToShow);

        const resultsMsg = {
          id: Date.now() + 7,
          text: `Found ${resultsToShow.length} similar product${resultsToShow.length > 1 ? 's' : ''}:`,
          sender: "ai",
          timestamp: new Date(),
          products: resultsToShow,
          hasProducts: true,
        };
        setMessages(prev => [...prev, resultsMsg]);
      } else {
        const noResultsMsg = {
          id: Date.now() + 7,
          text: userMessage
            ? `❌ Sorry, I couldn't find any products matching "${userMessage}".\n\nTry keywords like: "RAM", "processor", "GPU", "headset", "keyboard"`
            : "❌ Please add a description with your image, like:\n• 'gaming mouse'\n• 'graphics card'\n• 'RGB keyboard'",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, noResultsMsg]);
      }

      setUploadedImage(null);
    } catch (error) {
      console.error('Fallback search error:', error);
      throw error;
    }
  };

  // 3. PERFORMANCE BENCHMARKS
  const showPerformanceBenchmarks = async (productName) => {
    setIsTyping(true);
    
    // Simulated benchmark data
    const benchmarkData = {
      'Intel Core i7': {
        singleCore: 3200,
        multiCore: 28000,
        gaming: 95,
        rendering: 88,
        powerConsumption: '65W',
      },
      'AMD Ryzen': {
        singleCore: 3100,
        multiCore: 30000,
        gaming: 92,
        rendering: 95,
        powerConsumption: '105W',
      },
      'RTX 4070': {
        gaming4K: 85,
        gaming1440p: 120,
        rayTracing: 90,
        powerConsumption: '200W',
      },
      'RTX 3060': {
        gaming4K: 60,
        gaming1440p: 85,
        rayTracing: 70,
        powerConsumption: '170W',
      },
    };

    const matchedProduct = Object.keys(benchmarkData).find(key =>
      productName.toLowerCase().includes(key.toLowerCase())
    );

    if (matchedProduct) {
      const data = benchmarkData[matchedProduct];
      const benchmarkText = Object.entries(data)
        .map(([key, value]) => `• **${key.replace(/([A-Z])/g, ' $1').trim()}**: ${value}`)
        .join('\n');

      const benchmarkMsg = {
        id: Date.now(),
        text: `📊 **Performance Benchmarks for ${matchedProduct}**\n\n${benchmarkText}\n\n_Benchmark scores are based on industry standard tests_`,
        sender: "ai",
        timestamp: new Date(),
        hasBenchmarks: true,
      };
      setMessages(prev => [...prev, benchmarkMsg]);
    } else {
      const noDataMsg = {
        id: Date.now(),
        text: "I don't have benchmark data for this specific product yet, but I can help you compare it with similar products!",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, noDataMsg]);
    }
    
    setIsTyping(false);
  };

  // 4. MULTI-LANGUAGE SUPPORT
  const languageOptions = {
    en: { name: 'English', flag: '🇺🇸', code: 'en' },
    tl: { name: 'Tagalog', flag: '🇵🇭', code: 'tl' },
    es: { name: 'Español', flag: '🇪🇸', code: 'es' },
    zh: { name: '中文', flag: '🇨🇳', code: 'zh' },
  };

  const translateMessage = async (text, targetLang) => {
    // In production, integrate with Google Translate API or similar
    // For now, we'll return the original text
    // You can integrate with: https://cloud.google.com/translate
    
    if (targetLang === 'en') return text;

    // Simulated translations for common phrases
    const translations = {
      tl: {
        'Hello! I\'m your AI assistant. How can I help you today?': 'Kumusta! Ako ang iyong AI assistant. Paano kita matutulungan ngayon?',
        'Loading chat history...': 'Nag-load ng kasaysayan ng chat...',
        'What\'s your budget?': 'Ano ang iyong badyet?',
      },
      es: {
        'Hello! I\'m your AI assistant. How can I help you today?': '¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?',
        'Loading chat history...': 'Cargando historial de chat...',
        'What\'s your budget?': '¿Cuál es tu presupuesto?',
      },
    };

    return translations[targetLang]?.[text] || text;
  };

  const handleLanguageChange = async (langCode) => {
    setSelectedLanguage(langCode);
    const langName = languageOptions[langCode].name;

    const langChangeMsg = {
      id: Date.now(),
      text: `${languageOptions[langCode].flag} Language changed to ${langName}! I'll respond in ${langName} now.`,
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, langChangeMsg]);
  };

  // ============= END PHASE 3 FEATURES =============

  // ============= AI INTENT ANALYZER =============
  
  /**
   * Use AI to analyze user intent when regex patterns don't match
   * Returns: { isCommand, action, productReference, confidence }
   */
  const analyzeIntentWithAI = async (userInput, availableProducts) => {
    try {
      console.log('🤖 Using AI to analyze intent...');
      
      const productList = availableProducts.map((p, idx) => 
        `${idx + 1}. ${p.name || p.title} (₱${p.price})`
      ).join('\n');

      const intentPrompt = `You are an intent analyzer for an e-commerce AI assistant. Analyze if the user wants to execute a command.

Available products in context:
${productList}

User said: "${userInput}"

Analyze the intent and respond in JSON format:
{
  "isCommand": true/false,
  "action": "add_to_cart" | "compare" | "build_pc" | "show_details" | "view_cart" | "none",
  "productReference": "product name or position (1, 2, first, last)" or null,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Examples:
- "put that in my shopping bag" → {"isCommand": true, "action": "add_to_cart", "productReference": "that", "confidence": 0.9}
- "can you build that for me?" → {"isCommand": true, "action": "build_pc", "productReference": null, "confidence": 0.95}
- "compare these two" → {"isCommand": true, "action": "compare", "productReference": "first two", "confidence": 0.9}
- "show me what's in my cart" → {"isCommand": true, "action": "view_cart", "productReference": null, "confidence": 0.95}
- "what's the warranty?" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.8}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: intentPrompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3, // Low temperature for consistent intent detection
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      const intent = JSON.parse(data.choices[0].message.content);
      
      console.log('🎯 AI Intent Analysis:', intent);
      return intent;
    } catch (error) {
      console.error('❌ AI intent analysis failed:', error);
      return { isCommand: false, action: 'none', confidence: 0 };
    }
  };

  // ============= PRODUCT SEARCH DETECTION =============

  const showCategoryOverview = (categorySnapshot = []) => {
    const overviewEntries = hydrateCategoriesForOverview(categorySnapshot);
    const limited = overviewEntries.slice(0, 8);

    const overviewLines = limited
      .map((entry) => `• **${entry.name}** — ${entry.description}`)
      .join('\n');

    const overviewMsg = {
      id: Date.now(),
      text: `Here's a quick overview of what we currently have ready:
\n${overviewLines}
\nTell me which category, brand, or budget you'd like me to focus on next.`,
      sender: 'ai',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, overviewMsg]);
    saveMessageToHistory(overviewMsg);
    updateContext({ lastAction: 'category_overview', lastProducts: [] });
  };
  
  /**
   * Detect if user is asking for products and show ALL matching items
   * Returns true if product search was handled, false otherwise
   */
  const detectAndHandleProductSearch = async (userInput) => {
    const input = userInput.toLowerCase().trim();
    const intent = detectShoppingIntent(userInput);
    const contextUpdates = {};
    if (intent.priceFocus) contextUpdates.budget = intent.priceFocus;
    if (intent.useCase) contextUpdates.useCase = intent.useCase;
    if (intent.budgetAmount) contextUpdates.budgetAmount = intent.budgetAmount;
    if (Object.keys(contextUpdates).length) {
      updateContext(contextUpdates);
    }

    console.log('🔍 Checking if this is a product search query...');

    const definitionCue = /(what\s+is|define|definition|meaning|explain|difference\s+between|differentiate|clarify)/i.test(userInput);
    if (intent.action === 'definition' || definitionCue) {
      console.log('ℹ️ Detected definition/spec question, skipping product search.');
      return false;
    }

    const commandPhrases = [
      /add\s+.+\s+to\s+(my\s+)?cart/i,
      /add\s+.+\s+to\s+bag/i,
      /put\s+.+\s+in\s+cart/i,
      /buy\s+.+/i,
      /compare\s+.+/i,
      /show\s+details/i,
      /build\s+(a\s+)?pc/i,
      /cheaper\s+options/i,
    ];

    if (commandPhrases.some((pattern) => pattern.test(input))) {
      console.log('⚠️ This looks like a command, not a product search. Skipping.');
      return false;
    }

    const conversationalPhrases = [
      /^(hi|hello|hey|thanks|thank you|thanks?|bye|goodbye|ok|okay|yes|no|sure|alright|cool|nice|great|good|awesome|perfect|excellent)$/i,
      /^how are you/i,
      /^what('?s| is) (your|the)/i,
      /^can you (help|assist)/i,
      /^i (want|need|would like) (help|assistance)/i,
      /^tell me (about|more)/i,
    ];

    if (conversationalPhrases.some((pattern) => pattern.test(input))) {
      console.log('⚠️ This is conversational, not a product search. Skipping.');
      return false;
    }

    const searchPatterns = [
      /(?:do you have|you have|got any|have any)\s+(.+?)(?:\?|$)/i,
      /(?:show|display|list)\s+(?:me\s+)?(?:all\s+)?(?:the\s+)?(.+?)(?:\?|$)/i,
      /(?:available|in stock)\s+(.+?)(?:\?|$)/i,
      /(?:what|which)\s+(.+?)\s+(?:do you have|are available|can I buy)(?:\?|$)/i,
    ];

    let searchTerm = null;

    for (const pattern of searchPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        searchTerm = match[1].trim();
        console.log('✅ Product search pattern matched! Term:', searchTerm);
        break;
      }
    }

    if (!searchTerm && intent.category) {
      searchTerm = intent.category;
    }

    if (!searchTerm) {
      const simpleTerms = ['ram', 'rams', 'memory', 'processor', 'processors', 'cpu', 'cpus',
        'gpu', 'gpus', 'graphics', 'motherboard', 'motherboards',
        'storage', 'ssd', 'ssds', 'hdd', 'hdds',
        'psu', 'power supply', 'power supplies',
        'case', 'cases', 'chassis',
        'intel', 'amd', 'nvidia', 'rtx', 'gtx',
        'corsair', 'asus', 'msi', 'gigabyte', 'laptop', 'laptops'];

      const words = input.split(/\s+/);
      const hasSearchTerm = simpleTerms.some((term) =>
        words.some((word) => word === term || term === word)
      );

      if (hasSearchTerm && words.length <= 3) {
        searchTerm = input;
        console.log('✅ Simple product query detected:', searchTerm);
      }
    }

    if (searchTerm) {
      searchTerm = sanitizeSearchTerm(searchTerm);
      if (!searchTerm) {
        searchTerm = null;
      }
    }

    const categoriesSnapshot = catalog.categories.length
      ? catalog.categories
      : await ensureCategoriesLoaded();

    if (searchTerm && GENERIC_PRODUCT_TERMS.has(searchTerm)) {
      showCategoryOverview(categoriesSnapshot);
      return true;
    }

    if (!searchTerm && !intent.category && !intent.brandPreferences.length) {
      console.log('⚠️ Not a product search query, letting AI handle it');
      return false;
    }

    const normalizedTerms = AIService.normalizeCategoryKeyword(searchTerm || intent.category || input);
    console.log('🔄 Normalized search terms:', normalizedTerms);

    setIsTyping(true);

    try {
      const productsSnapshot = catalog.products.length
        ? catalog.products
        : await ensureProductsLoaded();

      const categoryInfo = resolveCategoryInfo(searchTerm || intent.category, categoriesSnapshot);
      let foundProducts = [];

      if (categoryInfo) {
        foundProducts = productsSnapshot.filter((product) =>
          productMatchesCategory(product, categoryInfo.slug) ||
          productMatchesCategory(product, categoryInfo.id)
        );
      }

      if (!foundProducts.length && searchTerm) {
        const normalizedSearch = searchTerm.toLowerCase();
        foundProducts = productsSnapshot.filter((product) => {
          const searchableText = `${product.name || ''} ${product.description || ''} ${product.brands?.name || ''}`.toLowerCase();
          return searchableText.includes(normalizedSearch);
        });
      }

      if (!foundProducts.length && intent.brandPreferences.length) {
        foundProducts = productsSnapshot.filter((product) => productMatchesBrand(product, intent.brandPreferences));
      } else if (intent.brandPreferences.length) {
        const brandFiltered = foundProducts.filter((product) => productMatchesBrand(product, intent.brandPreferences));
        if (brandFiltered.length) {
          foundProducts = brandFiltered;
        }
      }

      const budgetFiltered = filterByBudgetSignals(foundProducts, intent, categoryInfo?.slug);
      if (budgetFiltered.length) {
        foundProducts = budgetFiltered;
      }

      if (!foundProducts.length) {
        for (const term of normalizedTerms) {
          const results = await AIService.fetchProductsByCategory(term);
          foundProducts = [...foundProducts, ...results];
        }

        foundProducts = foundProducts.filter((product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
        );
      }

      if (intent.brandPreferences.length) {
        const brandFiltered = foundProducts.filter((product) => productMatchesBrand(product, intent.brandPreferences));
        if (brandFiltered.length) {
          foundProducts = brandFiltered;
        }
      }

      if (!foundProducts.length && categoryInfo) {
        const fallbackProducts = productsSnapshot.slice(0, 4);
        const unavailableMsg = {
          id: Date.now(),
          text: `I checked our ${categoryInfo.name} inventory, but it's currently sold out. I can flag you when new stock arrives or suggest comparable parts right away.`,
          sender: 'ai',
          timestamp: new Date(),
          products: fallbackProducts.length ? fallbackProducts : null,
        };
        setMessages((prev) => [...prev, unavailableMsg]);
        setRecommendedProducts(fallbackProducts);
        setIsTyping(false);
        return true;
      }

      if (!foundProducts.length && searchTerm && !categoryInfo) {
        console.log('🔍 No exact matches, trying fuzzy search...');
        const fuzzyMatches = fuzzyMatchProduct(searchTerm, productsSnapshot);
        if (fuzzyMatches.length > 0) {
          foundProducts = fuzzyMatches.slice(0, 20);
          const fuzzyMessage = {
            id: Date.now(),
            text: `I couldn't find exact matches for "${searchTerm}", but I found similar products that might interest you:`,
            sender: 'ai',
            timestamp: new Date(),
            products: foundProducts,
          };

          updateContext({
            lastProducts: foundProducts,
            lastCategory: searchTerm,
            lastSearchTerm: searchTerm,
            lastAction: 'product_search',
          });

          setMessages((prev) => [...prev, fuzzyMessage]);
          setRecommendedProducts(foundProducts);
          setIsTyping(false);
          return true;
        }
      }

      if (!foundProducts.length) {
        console.log('❌ No products found, suggesting alternatives...');
        const fallbackProducts = productsSnapshot.slice(0, 6);
        const sorryMessage = {
          id: Date.now(),
          text: `I couldn't find any products matching "${searchTerm || intent.category || 'that request'}" in our inventory.\n\nHere are a few popular items you might consider instead:`,
          sender: 'ai',
          timestamp: new Date(),
          products: fallbackProducts,
        };
        setMessages((prev) => [...prev, sorryMessage]);
        setRecommendedProducts(fallbackProducts);
        setIsTyping(false);
        return true;
      }

      const tailoredProducts = applyIntentFilters(foundProducts, intent, { categoryInfo });
      const summaryProducts = tailoredProducts.length ? tailoredProducts : foundProducts;
      const displayLabel = categoryInfo?.name || (searchTerm
        ? searchTerm.replace(/\b\w/g, (char) => char.toUpperCase())
        : null);
      const responseSummary = formatProfessionalProductSummary(
        summaryProducts,
        intent,
        displayLabel,
        categoryInfo
      );
      const responseText = responseSummary || `I found ${foundProducts.length} products matching "${searchTerm}". Let me know if you'd like a comparison, detailed specs, or compatible accessories.`;

      const aiMessage = {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        products: summaryProducts.slice(0, 20),
      };

      updateContext({
        lastProducts: summaryProducts.slice(0, 20),
        lastCategory: categoryInfo?.slug || searchTerm,
        lastSearchTerm: searchTerm,
        lastAction: 'product_search',
        budget: intent.priceFocus,
      });

      setMessages((prev) => [...prev, aiMessage]);
      setRecommendedProducts(summaryProducts.slice(0, 20));
      saveMessageToHistory(aiMessage);

      setIsTyping(false);
      return true;
    } catch (error) {
      console.error('❌ Error in product search:', error);
      setIsTyping(false);
      return false;
    }
  };

  // ============= BUDGET REFINEMENT HANDLER =============
  
  /**
   * Handle budget refinement requests after products are shown
   * Returns true if budget refinement was handled, false otherwise
   */
  const handleBudgetRefinement = async (userInput, currentMessages) => {
    const input = userInput.toLowerCase().trim();
    
    // Get the last AI message with products
    const lastAIMessage = [...currentMessages]
      .reverse()
      .find(msg => msg.sender === 'ai' && msg.products && msg.products.length > 0);
    
    if (!lastAIMessage || !lastAIMessage.products) {
      return false; // No products to filter
    }
    
    // Use AI to intelligently detect budget intent
    const budgetIntent = await detectBudgetIntent(userInput);
    
    if (!budgetIntent || !budgetIntent.hasBudget) {
      return false; // Not a budget request
    }
    
    console.log('💰 AI-detected budget intent:', budgetIntent);
    
    const allProducts = lastAIMessage.products;
    console.log('📦 Filtering', allProducts.length, 'products by budget');
    
    const { minBudget, maxBudget } = budgetIntent;
    
    // Filter products by budget
    const filteredProducts = allProducts.filter(product => {
      const price = getNumericPrice(product);
      if (price <= 0) return true; // Include products with no price
      
      if (minBudget !== null && maxBudget !== null) {
        // Range budget
        return price >= minBudget && price <= maxBudget;
      } else if (maxBudget !== null) {
        // Maximum budget only
        return price <= maxBudget;
      } else if (minBudget !== null) {
        // Minimum budget only
        return price >= minBudget;
      }
      
      return true;
    });
    
    console.log('✅ Filtered to', filteredProducts.length, 'products within budget');
    
    if (filteredProducts.length === 0) {
      const budgetLabel = minBudget && maxBudget 
        ? `₱${minBudget.toLocaleString()} to ₱${maxBudget.toLocaleString()}`
        : maxBudget 
          ? `₱${maxBudget.toLocaleString()}`
          : minBudget
            ? `at least ₱${minBudget.toLocaleString()}`
            : 'your budget';
      
      const noBudgetMatchMsg = {
        id: Date.now(),
        text: `I couldn't find any products within ${budgetLabel}.\n\nThe closest options I have are:`,
        sender: 'ai',
        timestamp: new Date(),
        products: allProducts.slice(0, 3),
      };
      setMessages(prev => [...prev, noBudgetMatchMsg]);
      setRecommendedProducts(allProducts.slice(0, 3));
      return true;
    }
    
    // Sort by price (cheapest first)
    filteredProducts.sort((a, b) => getNumericPrice(a) - getNumericPrice(b));
    
    const budgetLabel = minBudget && maxBudget
      ? `₱${minBudget.toLocaleString()} to ₱${maxBudget.toLocaleString()}`
      : maxBudget 
        ? `under ₱${maxBudget.toLocaleString()}`
        : minBudget
          ? `at least ₱${minBudget.toLocaleString()}`
          : 'your budget';
    
    const budgetMsg = {
      id: Date.now(),
      text: `Perfect! Here are ${filteredProducts.length} option${filteredProducts.length > 1 ? 's' : ''} ${budgetLabel}:`,
      sender: 'ai',
      timestamp: new Date(),
      products: filteredProducts.slice(0, 10),
    };
    
    setMessages(prev => [...prev, budgetMsg]);
    setRecommendedProducts(filteredProducts.slice(0, 10));
    saveMessageToHistory(budgetMsg);
    
    // Update context with budget info
    updateContext({
      budgetAmount: maxBudget || minBudget,
      lastProducts: filteredProducts.slice(0, 10),
    });
    
    return true;
  };

  /**
   * Use AI to detect budget intent from natural language
   */
  const detectBudgetIntent = async (userInput) => {
    try {
      const prompt = `You are a budget detection assistant. Analyze this user message and extract budget information.

User message: "${userInput}"

Detect if the user is mentioning a budget constraint. Common ways users express budgets:
- "my budget is 30k"
- "around 30 to 35 thousand"
- "I can spend max 40k"
- "not more than 50 thousand pesos"
- "between 25k and 30k"
- "I have 35000 to spend"
- "looking for something under 40k"
- "kaya ko 30k to 35k" (Tagalog: I can afford)
- "meron ka ba below 30k?" (Tagalog: Do you have below 30k?)
- "hanggang 35k lang" (Tagalog: only up to 35k)
- "sa loob ng 30k to 40k" (Tagalog: within 30k to 40k)

Numbers can be written as:
- "30k", "30000", "30,000"
- "30 thousand", "30 k"
- "₱30,000", "30k pesos"

Return JSON:
{
  "hasBudget": true/false,
  "minBudget": number or null,
  "maxBudget": number or null,
  "confidence": 0.0-1.0
}

Rules:
- Convert all amounts to actual numbers (30k = 30000)
- If only one number mentioned, treat as maxBudget
- For "around X", treat as maxBudget with some flexibility
- For "X to Y" or "between X and Y", set minBudget and maxBudget
- Return hasBudget: false if no budget is mentioned
- High confidence (>0.8) only if clear budget statement`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a budget extraction assistant. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 200,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        console.error('Budget detection API error:', response.status);
        return null;
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      console.log('🤖 AI Budget Detection Result:', result);
      
      return result;
    } catch (error) {
      console.error('Error detecting budget intent:', error);
      return null;
    }
  };

  // ============= COMMAND DETECTION SYSTEM =============
  
  /**
   * Detect and execute user commands from natural language
   * Returns true if a command was executed, false otherwise
   */
  const detectAndExecuteCommand = async (userInput, currentMessages) => {
    const input = userInput.toLowerCase().trim();
    
    console.log('🔍 COMMAND DETECTION START');
    console.log('📝 User input:', userInput);
    console.log('📝 Lowercase input:', input);
    
    // Get the last AI message with products
    const lastAIMessage = [...currentMessages]
      .reverse()
      .find(msg => msg.sender === 'ai' && msg.products && msg.products.length > 0);
    
    if (!lastAIMessage || !lastAIMessage.products) {
      console.log('⚠️ No products in recent messages to act on');
      console.log('📋 Available messages:', currentMessages.map(m => ({ 
        sender: m.sender, 
        hasProducts: !!m.products,
        productCount: m.products?.length || 0 
      })));
      return false; // No products to act on
    }

    const products = lastAIMessage.products;
    console.log('🎯 Command detection - Products available:', products.map(p => ({
      id: p.id,
      name: p.name || p.title,
      price: p.price
    })));

    // Helper to add user message acknowledgment
    const addAcknowledgment = (text) => {
      const ackMsg = {
        id: Date.now() - 1,
        text: text,
        sender: "user",
        timestamp: new Date(),
        isCommandAck: true, // Flag to style differently if needed
      };
      setMessages(prev => [...prev, ackMsg]);
    };

    // ===== VIEW CART COMMANDS =====
    const viewCartPatterns = [
      /what('?s| is)\s+(in\s+)?my\s+cart/i,
      /show\s+(me\s+)?my\s+cart/i,
      /view\s+cart/i,
      /check\s+cart/i,
      /cart\s+items/i,
      /my\s+cart$/i,
    ];
    
    const lastAddedPatterns = [
      /what\s+did\s+i\s+(just\s+)?(add|put)/i,
      /what\s+have\s+i\s+added/i,
      /last\s+(item|product|thing)\s+(added|in\s+cart)/i,
      /recent(ly)?\s+added/i,
    ];

    const isViewCart = viewCartPatterns.some(pattern => pattern.test(input));
    const isLastAdded = lastAddedPatterns.some(pattern => pattern.test(input));

    if (isViewCart || isLastAdded) {
      console.log(isViewCart ? '🛒 VIEW CART COMMAND DETECTED!' : '🕐 LAST ADDED COMMAND DETECTED!');
      
      // If user asks for last added item
      if (isLastAdded) {
        if (!lastAddedToCart) {
          const noRecentMsg = {
            id: Date.now(),
            text: `You haven't added anything to your cart yet. Browse our products and I'll help you find what you need!`,
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, noRecentMsg]);
          return true;
        }
        
        const recentMsg = {
          id: Date.now(),
          text: `You just added:\n\n${lastAddedToCart.name}\nPrice: ₱${lastAddedToCart.price.toLocaleString()}\nQuantity: ${lastAddedToCart.quantity}\n\nWould you like to view your entire cart or continue shopping?`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, recentMsg]);
        return true;
      }
      
      // View full cart
      try {
        // Fetch cart items
        const result = await CartService.getCartItems();
        const cartItems = result.data || [];
        
        if (!cartItems || cartItems.length === 0) {
          const emptyCartMsg = {
            id: Date.now(),
            text: `Your cart is empty. Browse our products and add items you'd like to purchase!`,
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, emptyCartMsg]);
          return true;
        }
        
        // Use the pre-calculated total from CartService
        const total = result.totalPrice || 0;
        
        // Format cart items
        const cartList = cartItems.map((item, idx) => 
          `${idx + 1}. ${item.product_name}\n   ₱${item.price_at_add.toLocaleString()} × ${item.quantity} = ₱${item.subtotal.toLocaleString()}`
        ).join('\n\n');
        
        const cartMsg = {
          id: Date.now(),
          text: `🛒 Your Cart (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})\n\n${cartList}\n\n💰 Total: ₱${total.toLocaleString()}\n\nWould you like to proceed to checkout or continue shopping?`,
          sender: "ai",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, cartMsg]);
        return true;
        
      } catch (error) {
        console.error('❌ Error fetching cart:', error);
        const errorMsg = {
          id: Date.now(),
          text: `I encountered an error while fetching your cart. Please try again or refresh the page.`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
        return true;
      }
    }

    // ===== ADD TO CART COMMANDS =====
    const addToCartPatterns = [
      /add\s+(to\s+)?(my\s+)?cart/i,
      /add\s+(this|that|it|one|the\s+\w+)(\s+to\s+(my\s+)?cart)?/i,
      /put\s+(this|that|it|one)\s+in\s+(my\s+)?cart/i,
      /i('ll|\s+will)?\s+take\s+(this|that|it|one)/i,
      /buy\s+(this|that|it|one)/i,
      /^add\s+\w+/i, // NEW: Matches "add intel", "add ryzen", "add ram", etc.
    ];

    const isAddToCart = addToCartPatterns.some(pattern => {
      const matches = pattern.test(input);
      console.log(`Testing pattern ${pattern}: ${matches}`);
      return matches;
    });

    console.log('🛒 Is add to cart command?', isAddToCart);

    if (isAddToCart) {
      console.log('✅ ADD TO CART COMMAND DETECTED!');
      
      // ===== EXTRACT QUANTITY ===== 🔢
      const quantity = extractQuantity(input);
      console.log(`🔢 Detected quantity: ${quantity}`);
      
      // Detect which product (first, second, last, by name, or just "one")
      let productToAdd = null;
      let productIndex = -1;

      // ===== CHECK FOR CONTEXTUAL REFERENCES ===== 🧠
      // "add the cheaper one", "add the first one", etc.
      const hasContextualRef = /the\s+(cheaper|cheapest|expensive|pricey|first|second|last|top)/i.test(input);
      
      if (hasContextualRef) {
        console.log('🧠 CONTEXT-AWARE COMMAND DETECTED!');
        productToAdd = getContextualProduct(input);
        
        if (productToAdd) {
          console.log(`✅ Matched product from context: "${productToAdd.name}"`);
        } else {
          console.log('⚠️ Context reference but no products in memory');
          const contextErrorMsg = {
            id: Date.now(),
            text: `I don't have any products to reference. Could you search for a product first, or tell me what you're looking for?`,
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, contextErrorMsg]);
          return true;
        }
      }

      // ===== TRY FUZZY MATCHING BY NAME ===== 🎯
      if (!productToAdd) {
        console.log('🔍 Attempting fuzzy product matching...');
        
        // Extract product name from input (remove command words)
        const productQuery = input
          .replace(/add|to|cart|my|the|this|that|it|one|please|can|you/gi, '')
          .trim();
        
        console.log(`  Search query: "${productQuery}"`);
        
        if (productQuery.length >= 3) {
          const fuzzyMatches = fuzzyMatchProduct(productQuery, products);
          
          if (fuzzyMatches.length > 0) {
            productToAdd = fuzzyMatches[0];
            console.log(`✅ FUZZY MATCH FOUND: "${productToAdd.name}" (${(fuzzyMatches[0].matchScore * 100).toFixed(1)}% confidence)`);
          } else {
            console.log('⚠️ No fuzzy matches found');
          }
        }
      }

      // ===== FALLBACK: EXACT NAME MATCHING ===== 📝
      if (!productToAdd) {
        console.log('🔍 Attempting exact name matching...');
        for (let i = 0; i < products.length; i++) {
          const productName = (products[i].name || products[i].title || '').toLowerCase();
          const productWords = productName.split(/\s+/);
          
          console.log(`  Checking product ${i}: "${productName}"`);
          
          const matches = productWords.filter(word => {
            if (word.length >= 3) {
              const found = input.includes(word.toLowerCase());
              if (found) {
                console.log(`    ✅ Found word "${word}" in input!`);
              }
              return found;
            }
            return false;
          });
          
          if (matches.length > 0) {
            productToAdd = products[i];
            productIndex = i;
            console.log(`✅ MATCHED PRODUCT BY NAME: "${productName}"`);
            break;
          }
        }
      }

      // If no name match, use position keywords
      if (!productToAdd) {
        console.log('⚠️ No name match found, trying position keywords...');
        
        if (/first|1st/i.test(input)) {
          productToAdd = products[0];
          productIndex = 0;
          console.log('✅ Matched by position: FIRST');
        } else if (/second|2nd/i.test(input)) {
          productToAdd = products[1];
          productIndex = 1;
          console.log('✅ Matched by position: SECOND');
        } else if (/third|3rd/i.test(input)) {
          productToAdd = products[2];
          productIndex = 2;
          console.log('✅ Matched by position: THIRD');
        } else if (/last/i.test(input)) {
          productToAdd = products[products.length - 1];
          productIndex = products.length - 1;
          console.log('✅ Matched by position: LAST');
        } else {
          // Default to first product
          productToAdd = products[0];
          productIndex = 0;
          console.log('⚠️ No position keyword, defaulting to FIRST product');
        }
      }

      if (productToAdd) {
        console.log('📦 Product to add:', productToAdd);
        console.log('📦 Product structure:', {
          id: productToAdd.id,
          name: productToAdd.name || productToAdd.title,
          price: productToAdd.price,
          variants: productToAdd.variants
        });
        
        // Get default variant
        const defaultVariant = productToAdd.variants?.[0] || {
          id: `${productToAdd.id}-default`,
          price: productToAdd.price,
          name: 'Default',
        };

        // Prepare cart item data in the format CartContext expects
        const cartItemData = {
          product_id: productToAdd.id,
          product_name: productToAdd.name || productToAdd.title,
          variant_name: defaultVariant.name,
          price: productToAdd.price,
          quantity: quantity  // ✨ Use detected quantity instead of hardcoded 1
        };

        console.log('🛒 Adding to cart:', cartItemData);
        console.log('🛒 addToCart function exists?', typeof addToCart);
        console.log('🛒 About to call addToCart...');

        // Add to cart using CartContext function
        try {
          console.log('🛒 Inside try block, calling addToCart NOW...');
          const result = await addToCart(cartItemData);
          console.log('🛒 addToCart completed! Result:', result);
          
          if (!result || !result.success) {
            console.error('❌ Failed to add to cart:', result?.error);
            
            const errorMsg = {
              id: Date.now(),
              text: `Sorry, I couldn't add ${productToAdd.name || productToAdd.title} to your cart.\n\n${result?.error || 'Please try again or use the "Add to Cart" button on the product card.'}`,
              sender: "ai",
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, errorMsg]);
            return true;
          }

          console.log('✅ Successfully added to cart');

          // Store last added item
          setLastAddedToCart({
            name: productToAdd.name || productToAdd.title,
            price: productToAdd.price,
            quantity: quantity,
            timestamp: new Date()
          });

          // Update conversation context
          updateContext({
            lastAction: 'added_to_cart',
            addedItemsSession: [...conversationContext.addedItemsSession, {
              product: productToAdd.name || productToAdd.title,
              quantity,
              price: productToAdd.price,
            }],
          });

          const quantityText = quantity > 1 ? ` (x${quantity})` : '';
          const totalPrice = productToAdd.price * quantity;
          const responseMsg = {
            id: Date.now(),
            text: `I've added ${quantity > 1 ? `${quantity} units of ` : ''}${productToAdd.name || productToAdd.title}${quantityText} to your cart!\n\nTotal: ₱${totalPrice.toLocaleString()}\n\nWould you like to add more products, view your cart, or continue shopping?`,
            sender: "ai",
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, responseMsg]);
          return true;
          
        } catch (error) {
          console.error('❌ Exception adding to cart:', error);
          
          const errorMsg = {
            id: Date.now(),
            text: `❌ An error occurred while adding to cart. Please try using the "Add to Cart" button on the product card instead.`,
            sender: "ai",
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, errorMsg]);
          return true;
        }
      }
    }

    // ===== SHOW DETAILS COMMANDS =====
    const showDetailsPatterns = [
      /show\s+(me\s+)?(more\s+)?details/i,
      /tell\s+me\s+more\s+about/i,
      /what\s+are\s+the\s+specs/i,
      /(full\s+)?specifications?/i,
      /more\s+info(rmation)?/i,
    ];

    const isShowDetails = showDetailsPatterns.some(pattern => pattern.test(input));

    if (isShowDetails) {
      let productToShow = products[0];

      // Detect specific product reference
      if (/first|1st/i.test(input)) productToShow = products[0];
      else if (/second|2nd/i.test(input)) productToShow = products[1];
      else if (/third|3rd/i.test(input)) productToShow = products[2];
      else if (/last/i.test(input)) productToShow = products[products.length - 1];

      if (productToShow) {
        const specs = productToShow.specs || [];
        const features = productToShow.features || [];
        
        const detailsText = `📋 **${productToShow.title || productToShow.name}**\n\n` +
          `💰 **Price:** ₱${productToShow.price.toLocaleString()}\n` +
          `📦 **Stock:** ${productToShow.stock || 0} units\n` +
          `⭐ **Rating:** ${productToShow.rating || 'N/A'}/5\n\n` +
          (specs.length > 0 ? `**Specifications:**\n${specs.map(s => `• ${s.name}: ${s.value}`).join('\n')}\n\n` : '') +
          (features.length > 0 ? `**Features:**\n${features.map(f => `• ${f}`).join('\n')}` : '');

        const responseMsg = {
          id: Date.now(),
          text: detailsText,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, responseMsg]);
        return true;
      }
    }

    // ===== COMPARE COMMANDS =====
    const comparePatterns = [
      /compare\s+(these|them|all)?/i,
      /what('s|\s+is)\s+the\s+difference/i,
      /which\s+one\s+is\s+better/i,
      /help\s+me\s+choose/i,
    ];

    const isCompare = comparePatterns.some(pattern => pattern.test(input));

    if (isCompare && products.length >= 2) {
      handleCompareProducts(products);
      return true;
    }

    // ===== CHEAPER OPTIONS COMMAND =====
    const cheaperPatterns = [
      /cheaper|affordable|budget|less\s+expensive/i,
      /lower\s+price/i,
      /save\s+money/i,
    ];

    const isCheaper = cheaperPatterns.some(pattern => pattern.test(input));

    if (isCheaper) {
      handleShowCheaperOptions(products);
      return true;
    }

    // ===== AI-POWERED INTENT DETECTION (FALLBACK) =====
    console.log('⚠️ No regex pattern matched. Using AI to analyze intent...');
    
    const aiIntent = await analyzeIntentWithAI(userInput, products);
    
    if (aiIntent.isCommand && aiIntent.confidence > 0.7) {
      console.log('🤖 AI detected command with high confidence!');
      console.log('📋 Action:', aiIntent.action);
      console.log('📦 Product reference:', aiIntent.productReference);
      
      // Execute the detected action
      switch (aiIntent.action) {
        case 'add_to_cart': {
          // Find the product based on AI's product reference
          let productToAdd = null;
          const ref = (aiIntent.productReference || '').toLowerCase();
          
          // Match by position
          if (/first|1st|one|1/.test(ref)) {
            productToAdd = products[0];
          } else if (/second|2nd|two|2/.test(ref)) {
            productToAdd = products[1];
          } else if (/third|3rd|three|3/.test(ref)) {
            productToAdd = products[2];
          } else if (/last/.test(ref)) {
            productToAdd = products[products.length - 1];
          } else if (/that|this|it/.test(ref)) {
            productToAdd = products[0]; // Default to first
          } else {
            // Try to match by product name
            for (const product of products) {
              const productName = (product.name || product.title).toLowerCase();
              if (ref.includes(productName) || productName.includes(ref)) {
                productToAdd = product;
                break;
              }
            }
          }
          
          // Fallback to first product if nothing matched
          if (!productToAdd) productToAdd = products[0];
          
          console.log('🤖 AI selected product:', productToAdd.name || productToAdd.title);
          
          // Add to cart
          const defaultVariant = productToAdd.variants?.[0] || {
            id: `${productToAdd.id}-default`,
            price: productToAdd.price,
            name: 'Default',
          };

          const cartItemData = {
            product_id: productToAdd.id,
            product_name: productToAdd.name || productToAdd.title,
            variant_name: defaultVariant.name,
            price: productToAdd.price,
            quantity: 1
          };

          try {
            const result = await addToCart(cartItemData);
            
            if (!result || !result.success) {
              const errorMsg = {
                id: Date.now(),
                text: `❌ Sorry, I couldn't add **${productToAdd.name || productToAdd.title}** to your cart.\n\n${result?.error || 'Please try again.'}`,
                sender: "ai",
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, errorMsg]);
              return true;
            }

            const responseMsg = {
              id: Date.now(),
              text: `✅ I've added **${productToAdd.name || productToAdd.title}** to your cart!\n\n💰 Price: ₱${productToAdd.price.toLocaleString()}\n📦 Quantity: 1`,
              sender: "ai",
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, responseMsg]);
            return true;
          } catch (error) {
            console.error('❌ Error adding to cart:', error);
            return false;
          }
        }
        
        case 'compare': {
          console.log('🤖 AI wants to compare products');
          const compareMsg = {
            id: Date.now(),
            text: `📊 Let me compare these products for you!`,
            sender: "ai",
            timestamp: new Date(),
            products: products.slice(0, Math.min(4, products.length)),
            showComparison: true,
          };
          setMessages(prev => [...prev, compareMsg]);
          return true;
        }
        
        case 'build_pc': {
          console.log('🤖 AI wants to build a PC');
          const buildMsg = {
            id: Date.now(),
            text: `🔨 Let me build a complete PC for you based on ${products[0]?.name || 'this component'}!\n\nI'll find compatible parts and create a balanced build. Give me a moment...`,
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, buildMsg]);
          
          // Trigger compatibility check
          setTimeout(() => {
            handleCheckCompatibility(products[0]);
          }, 1000);
          
          return true;
        }
        
        case 'show_details': {
          console.log('🤖 AI wants to show details');
          const productToShow = products[0];
          const specs = productToShow.specs || [];
          const features = productToShow.features || [];
          
          const detailsText = `📋 **${productToShow.title || productToShow.name}**\n\n` +
            `💰 **Price:** ₱${productToShow.price.toLocaleString()}\n` +
            `📦 **Stock:** ${productToShow.stock || 0} units\n` +
            `⭐ **Rating:** ${productToShow.rating || 'N/A'}/5\n\n` +
            (specs.length > 0 ? `**Specifications:**\n${specs.map(s => `• ${s.name}: ${s.value}`).join('\n')}\n\n` : '') +
            (features.length > 0 ? `**Features:**\n${features.map(f => `• ${f}`).join('\n')}` : '');

          const responseMsg = {
            id: Date.now(),
            text: detailsText,
            sender: "ai",
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, responseMsg]);
          return true;
        }
        
        case 'view_cart': {
          console.log('🤖 AI wants to view cart');
          
          try {
            const result = await CartService.getCartItems();
            const cartItems = result.data || [];
            
            if (!cartItems || cartItems.length === 0) {
              const emptyCartMsg = {
                id: Date.now(),
                text: `Your cart is empty. Browse our products and add items you'd like to purchase!`,
                sender: "ai",
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, emptyCartMsg]);
              return true;
            }
            
            const total = result.totalPrice || 0;
            const cartList = cartItems.map((item, idx) => 
              `${idx + 1}. ${item.product_name}\n   ₱${item.price_at_add.toLocaleString()} × ${item.quantity} = ₱${item.subtotal.toLocaleString()}`
            ).join('\n\n');
            
            const cartMsg = {
              id: Date.now(),
              text: `🛒 Your Cart (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})\n\n${cartList}\n\n💰 Total: ₱${total.toLocaleString()}\n\nWould you like to proceed to checkout or continue shopping?`,
              sender: "ai",
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, cartMsg]);
            return true;
            
          } catch (error) {
            console.error('❌ Error fetching cart:', error);
            return false;
          }
        }
        
        default:
          console.log('⚠️ Unknown action:', aiIntent.action);
          return false;
      }
    }
    
    console.log('⚠️ No command detected (confidence too low or not a command)');
    return false; // No command detected
  };

  // ============= END COMMAND DETECTION =============

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !uploadedImage) return;

    // If there's an uploaded image, handle image search with optional message
    if (uploadedImage) {
      const userMessage = {
        id: messages.length + 1,
        text: inputMessage.trim() || "📸 [Image uploaded]",
        sender: "user",
        timestamp: new Date(),
        image: uploadedImage, // Include image preview in user message
      };

      setMessages((prev) => [...prev, userMessage]);
      saveMessageToHistory(userMessage);

      const userQuery = inputMessage.trim();
      setInputMessage("");

      // Process image search with user message
      await processImageSearch(uploadedImage, userQuery);
      return;
    }

    // Normal text message handling
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessageToHistory(userMessage); // Save to database
    
    const userInput = inputMessage; // Store before clearing
    setInputMessage("");

    // ===== DEFINITION & EDUCATIONAL QUESTIONS (HIGH PRIORITY) =====
    const definitionHandled = await handleComponentQuestion(userInput);
    if (definitionHandled) {
      console.log('✅ Component explanation provided');
      return;
    }

    // ===== CHECK FOR BUDGET REFINEMENT (HIGH PRIORITY) =====
    const budgetRefined = await handleBudgetRefinement(userInput, updatedMessages);
    if (budgetRefined) {
      console.log('✅ Budget refinement applied');
      return;
    }

    // ===== CHECK FOR COMMANDS FIRST (HIGHEST PRIORITY) =====
    const commandExecuted = await detectAndExecuteCommand(userInput, updatedMessages);
    
    if (commandExecuted) {
      // Command was executed, no need to call AI
      console.log('✅ Command executed successfully');
      return;
    }

    // ===== DETECT PRODUCT SEARCH QUERIES (SECOND PRIORITY) =====
    const productSearchResult = await detectAndHandleProductSearch(userInput);
    
    if (productSearchResult) {
      // Product search was handled, no need to call AI
      console.log('✅ Product search handled successfully');
      return;
    }

    // ===== NO COMMAND OR SEARCH DETECTED - CALL AI (FALLBACK) =====
    setIsTyping(true);

    // Call real AI service
    try {
      const response = await AIService.chat(
        updatedMessages,
        userPreferences // Pass questionnaire data if available
      );

      // Extract products mentioned in AI response
      const products = await AIService.fetchProducts();
      const mentioned = AIService.extractRecommendedProducts(response.message, products);

      // Debug: Log product extraction
      console.log('🤖 AI Response:', response.message.substring(0, 200) + '...');
      console.log('📦 Total products available:', products.length);
      console.log('✅ Products extracted:', mentioned.length);
      if (mentioned.length > 0) {
        console.log('🔍 Product data structure:', mentioned[0]);
        console.log('🔍 Variants:', mentioned[0]?.variants);
        console.log('🔍 Selected Components:', mentioned[0]?.selected_components);
        console.log('📋 All extracted products:', mentioned.map(p => p.name));
        setRecommendedProducts(mentioned.slice(0, 5)); // Show top 5 products
      } else {
        console.log('⚠️ No products extracted from AI response');
      }

      // Detect if this is a general category question (show "View More") vs personalized recommendation (no "View More")
      const isGeneralQuestion = !userPreferences && /what|show|available|list|tell me about/i.test(inputMessage);

      // Detect category from user message for "View More" link
      let categoryForViewMore = null;
      if (isGeneralQuestion) {
        const lowerMessage = inputMessage.toLowerCase();
        if (lowerMessage.includes('ram') || lowerMessage.includes('memory')) categoryForViewMore = 'ram';
        else if (lowerMessage.includes('processor') || lowerMessage.includes('cpu')) categoryForViewMore = 'processor';
        else if (lowerMessage.includes('gpu') || lowerMessage.includes('graphics card')) categoryForViewMore = 'gpu';
        else if (lowerMessage.includes('motherboard')) categoryForViewMore = 'motherboard';
        else if (lowerMessage.includes('storage') || lowerMessage.includes('ssd') || lowerMessage.includes('hdd')) categoryForViewMore = 'storage';
        else if (lowerMessage.includes('case') || lowerMessage.includes('casing')) categoryForViewMore = 'case';
        else if (lowerMessage.includes('power supply') || lowerMessage.includes('psu')) categoryForViewMore = 'power-supply';
        else if (lowerMessage.includes('cooling') || lowerMessage.includes('cooler')) categoryForViewMore = 'cooling';
      }

      const aiResponse = {
        id: messages.length + 2,
        text: response.message,
        sender: "ai",
        timestamp: new Date(),
        products: mentioned.length > 0 ? mentioned.slice(0, 5) : null, // Show up to 5 products
        isGeneralQuestion, // Flag to show "View More" button
        categoryForViewMore, // Category to navigate to
      };

      setMessages((prev) => [...prev, aiResponse]);
      saveMessageToHistory(aiResponse); // Save to database
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorResponse = {
        id: messages.length + 2,
        text: "I apologize, but I'm experiencing technical difficulties. Please try again or contact our support team.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
      saveMessageToHistory(errorResponse); // Save error to database
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCameraClick = () => {
    setShowQuestionnaire(true);
    setIsMenuExpanded(false);
    if (isOpen) setIsOpen(false);
  };

  const handleChatToggle = () => {
    setIsOpen(!isOpen);
    setIsMenuExpanded(false);
  };

  const handleQuestionnaireSubmit = async (formData) => {
    console.log("PC Build Questionnaire submitted:", formData);

    // Extract processor preference from preferredBrands
    const enhancedFormData = { ...formData };
    if (formData.preferredBrands && !formData.processorPreference) {
      const hasIntel = formData.preferredBrands.includes('Intel');
      const hasAMD = formData.preferredBrands.includes('AMD');
      if (hasIntel && !hasAMD) {
        enhancedFormData.processorPreference = 'Intel';
      } else if (hasAMD && !hasIntel) {
        enhancedFormData.processorPreference = 'AMD';
      } else if (hasIntel && hasAMD) {
        enhancedFormData.processorPreference = 'Intel or AMD';
      }
    }

    // Store user preferences
    setUserPreferences(enhancedFormData);
    setShowQuestionnaire(false);

    // Open chat and get AI recommendations
    setIsOpen(true);
    setIsTyping(true);

    try {
      // Get personalized build recommendations
      const response = await AIService.getBuildRecommendations(enhancedFormData);
      console.log("AI Build Recommendations Response:", response);

      setTimeout(() => {
        // Check if response has recommendation text
        const recommendationText = response.recommendation || response.message ||
          "Thank you for completing the questionnaire! Based on your preferences, I'll help you find the perfect PC components. What would you like to start with?";

        const aiResponse = {
          id: Date.now(),
          text: recommendationText,
          sender: "ai",
          timestamp: new Date(),
          products: response.products ? response.products.slice(0, 5) : null, // Attach up to 5 products
          isGeneralQuestion: false, // This is personalized, don't show "View More"
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setTimeout(() => {
        const aiResponse = {
          id: Date.now(),
          text: "Thank you for completing the PC Build Questionnaire! I'm ready to help you find the perfect components. What type of component would you like to start with? (GPU, CPU, Motherboard, RAM, etc.)",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 500);
    }
  };

  // Add to cart function
  const handleAddToCart = async (product) => {
    try {
      console.log('Adding product to cart:', product);

      // Get selected variant for this product, or use first variant if available
      let selectedVariant = selectedVariants[product.id] || null;

      // If no variant selected but product has variants, use the first one automatically
      if (!selectedVariant) {
        if (product.variants && product.variants.length > 0) {
          selectedVariant = product.variants[0].sku || product.variants[0].name || product.variants[0];
        } else if (product.selected_components && product.selected_components.length > 0) {
          const firstComponent = product.selected_components[0];
          selectedVariant = typeof firstComponent === 'object' && firstComponent !== null
            ? firstComponent.name
            : firstComponent;
        }

        // Update the selected variants state for UI consistency
        if (selectedVariant) {
          setSelectedVariants(prev => ({
            ...prev,
            [product.id]: selectedVariant
          }));
        }
      }

      const result = await CartService.addToCart({
        product_id: product.id,
        variant_name: selectedVariant,
        price: product.price,
        quantity: 1
      });

      console.log('Cart service result:', result);

      if (result.error) {
        console.error('Error adding to cart:', result.error);
        // Show error message to user
        const errorMsg = {
          id: Date.now(),
          text: `Sorry, I couldn't add "${product.name}" to your cart. ${result.error === 'User not authenticated' ? 'Please log in first.' : result.error}`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        // ✅ Refresh cart count immediately!
        await loadCart();

        // Show success message with variant info
        const variantText = selectedVariant ? ` (${selectedVariant})` : '';
        const successMsg = {
          id: Date.now(),
          text: `✅ Added "${product.name}${variantText}" to your cart!\n\nWould you like me to suggest compatible products that work well with this?`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMsg]);

        // Optionally fetch and suggest compatible products
        setTimeout(async () => {
          try {
            const allProducts = await AIService.fetchProducts();
            const compatibilityMsg = {
              id: Date.now() + 1,
              text: `Here are some products that pair well with ${product.name}:`,
              sender: "ai",
              timestamp: new Date(),
              products: allProducts.slice(0, 2) // Show 2 compatible products
            };
            setMessages((prev) => [...prev, compatibilityMsg]);
          } catch (error) {
            console.error('Error fetching compatible products:', error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Exception in handleAddToCart:', error);
      const errorMsg = {
        id: Date.now(),
        text: `Sorry, something went wrong: ${error.message}. Please try again or add the product manually.`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <>
      {/* PC Build Questionnaire Modal with Close Button */}
      {showQuestionnaire && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowQuestionnaire(false)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-xl z-[60] transition-all hover:scale-110 border-2 border-white"
              aria-label="Close Questionnaire"
            >
              <X size={24} strokeWidth={3} />
            </button>
            <PCBuildQuestionnaire onSubmit={handleQuestionnaireSubmit} />
          </div>
        </div>
      )}

      {/* Collapsible Button Stack */}
      <div
        ref={menuRef}
        className="fixed bottom-4 [@media(min-width:761px)]:bottom-6 right-4 [@media(min-width:761px)]:right-6 z-40 flex flex-col items-center gap-2"
      >
        {/* Stack of Additional Buttons - Shown when menu is expanded */}
        <div className={`flex flex-col gap-2 items-center transition-all duration-300 ${
          isMenuExpanded
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}>
          {/* Chat Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleChatToggle}
                className={`${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-[#39FC1D] hover:bg-[#2dd817]'} text-white rounded-full p-2 [@media(min-width:761px)]:p-4 shadow-lg transition-all duration-300 hover:scale-110`}
                aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
              >
                {isOpen ?
                  <X size={20} className="[@media(min-width:761px)]:w-6 [@media(min-width:761px)]:h-6" /> :
                  <MessageCircle size={20} className="[@media(min-width:761px)]:w-6 [@media(min-width:761px)]:h-6" />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isOpen ? "Close AI Chat" : "Open AI Chat"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Camera/Questionnaire Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCameraClick}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 [@media(min-width:761px)]:p-4 shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="PC Build Questionnaire"
              >
                <Camera size={20} className="[@media(min-width:761px)]:w-6 [@media(min-width:761px)]:h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>PC Build Questionnaire</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Button - Toggles the menu */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsMenuExpanded(!isMenuExpanded)}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 [@media(min-width:761px)]:p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
              aria-label={isMenuExpanded ? "Close menu" : "Open menu"}
            >
              {isMenuExpanded ?
                <ChevronDown size={20} className="[@media(min-width:761px)]:w-6 [@media(min-width:761px)]:h-6" /> :
                <ChevronUp size={20} className="[@media(min-width:761px)]:w-6 [@media(min-width:761px)]:h-6" />
              }
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMenuExpanded ? "Close menu" : "Show options"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Chat Window - Enhanced with Expand/Collapse */}
      {isOpen && (
        <div className={`fixed bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 ${
          isExpanded
            ? 'bottom-16 md:bottom-24 right-2 md:right-6 w-[calc(100%-32px)] md:w-[800px] h-[500px] md:h-[600px] z-50' // Expanded: wider but same height
            : 'bottom-16 md:bottom-24 right-2 md:right-6 w-[calc(100%-16px)] md:w-96 max-w-[400px] h-[500px] md:h-[600px] z-50' // Normal mode
        }`}>
          {/* Header */}
          <div className="bg-green-500 text-white p-3 md:p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Bot size={18} className="text-[#39FC1D]" />
              </div>
              <div>
                <h3 className="font-semibold text-base">AI Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Expand/Collapse Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-green-600 hover:bg-opacity-30 rounded-full p-2 transition-colors cursor-pointer bg-white bg-opacity-20"
                aria-label={isExpanded ? "Minimize chat" : "Expand chat"}
              >
                {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-600 hover:bg-opacity-30 rounded-full p-2 transition-colors cursor-pointer bg-white bg-opacity-20"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages with Product Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* History Actions - Show only if no history loaded yet */}
            {!hasLoadedHistory && messages.length <= 2 && (
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={loadChatHistory}
                  className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors border border-blue-200 shadow-sm"
                >
                  <span>📜</span>
                  <span>Load Previous Chat</span>
                </button>
              </div>
            )}

            {/* Clear History Button - Show if history was loaded */}
            {hasLoadedHistory && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={clearChatHistory}
                  className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-colors border border-red-200 shadow-sm"
                >
                  <span>🗑️</span>
                  <span>Clear History & Start Fresh</span>
                </button>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-[#39FC1D] text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {/* Show uploaded image if present */}
                    {message.image && (
                      <div className="mb-2">
                        <img
                          src={message.image}
                          alt="Uploaded"
                          className="max-w-full h-auto rounded-lg border-2 border-white/20"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-white opacity-70"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Product Cards - Show if AI message has products */}
                {message.sender === "ai" && message.products && message.products.length > 0 && (
                  <div>
                    {/* Products Grid */}
                    <div className={`mt-2 ${
                      isExpanded
                        ? 'grid grid-cols-2 gap-2 max-w-full' // 2 columns when expanded, full width
                        : 'space-y-2 max-w-[85%]' // Stack vertically when normal, limited width
                    }`}>
                      {message.products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow"
                        >
                          <div className="flex gap-2">
                            {/* Product Image - Smaller */}
                            <img
                              src={product.images?.[0] || '/placeholder-product.png'}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.png';
                              }}
                            />

                            {/* Product Info - Compact */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs text-gray-900 truncate">
                                {product.name}
                              </h4>
                              <p className="text-sm font-bold text-green-600 mt-0.5">
                                ₱{product.price?.toLocaleString()}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                Stock: {product.stock_quantity || 0}
                              </p>
                            </div>
                          </div>

                          {/* Variant Selector - If product has variants */}
                          {((product.variants && product.variants.length > 0) ||
                            (product.selected_components && product.selected_components.length > 0)) && (
                            <div className="mt-2">
                              <select
                                value={selectedVariants[product.id] || ''}
                                onChange={(e) => setSelectedVariants(prev => ({
                                  ...prev,
                                  [product.id]: e.target.value
                                }))}
                                className="w-full text-[10px] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#39FC1D]"
                              >
                                <option value="">Select Variant</option>
                                {/* Check if product has variants array (like in product details page) */}
                                {product.variants && product.variants.length > 0 ? (
                                  product.variants.map((variant, idx) => {
                                    const variantLabel = variant.sku || variant.name || variant;
                                    return (
                                      <option key={idx} value={variantLabel}>
                                        {variantLabel}
                                      </option>
                                    );
                                  })
                                ) : (
                                  // Fallback to selected_components if no variants
                                  product.selected_components?.map((variant, idx) => {
                                    const variantName = typeof variant === 'object' && variant !== null ? variant.name : variant;
                                    return (
                                      <option key={idx} value={variantName}>
                                        {variantName}
                                      </option>
                                    );
                                  })
                                )}
                              </select>
                            </div>
                          )}

                          {/* Action Buttons - Smaller */}
                          <div className="flex gap-1.5 mt-2">
                            <button
                              onClick={() => navigate(`/products/details?id=${product.id}`)}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-medium py-1.5 px-2 rounded transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 bg-[#39FC1D] hover:bg-[#2dd817] text-white text-[10px] font-medium py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                            >
                              <ShoppingCart size={12} />
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View More Button - Only for general category questions - BELOW PRODUCTS */}
                    {message.isGeneralQuestion && message.categoryForViewMore && (
                      <button
                        onClick={() => {
                          // Navigate to All Products page with category filter
                          navigate('/products', { state: { category: message.categoryForViewMore } });
                          setIsOpen(false); // Close chat after navigation
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-3"
                      >
                        <span>View More {message.categoryForViewMore.charAt(0).toUpperCase() + message.categoryForViewMore.slice(1).replace('-', ' ')}s</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Quick Action Buttons - BELOW PRODUCTS */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Show Cheaper Options */}
                      <button
                        onClick={() => handleShowCheaperOptions(message.products)}
                        className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full transition-colors border border-blue-200"
                      >
                        <span>💰</span>
                        <span className="whitespace-nowrap">Cheaper Options</span>
                      </button>

                      {/* Compare Products */}
                      {message.products.length >= 2 && (
                        <button
                          onClick={() => handleCompareProducts(message.products)}
                          className="flex items-center gap-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full transition-colors border border-purple-200"
                        >
                          <span>📊</span>
                          <span className="whitespace-nowrap">Compare</span>
                        </button>
                      )}

                      {/* Check Compatibility */}
                      <button
                        onClick={handleCheckCompatibility}
                        className="flex items-center gap-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-full transition-colors border border-green-200"
                      >
                        <span>⚙️</span>
                        <span className="whitespace-nowrap">Check Build</span>
                      </button>

                      {/* Find Compatible Parts */}
                      <button
                        onClick={() => setInputMessage(`What components work well with ${message.products[0].name}?`)}
                        className="flex items-center gap-1.5 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full transition-colors border border-orange-200"
                      >
                        <span>🧩</span>
                        <span className="whitespace-nowrap">Compatible Parts</span>
                      </button>

                      {/* Show Bundles Button */}
                      <button
                        onClick={handleShowBundles}
                        className="flex items-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-colors border border-indigo-200"
                      >
                        <span>📦</span>
                        <span className="whitespace-nowrap">PC Bundles</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bundle Action Buttons - Show if message has bundle data */}
                {message.sender === "ai" && message.bundleData && message.showBundleActions && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleViewBundleDetails(message.bundleData.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors border border-blue-200"
                    >
                      <span>👁️</span>
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleAddBundleToCart(message.bundleData.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition-colors border border-green-200 font-semibold"
                    >
                      <ShoppingCart size={14} />
                      <span>Add Entire Bundle</span>
                    </button>
                  </div>
                )}

                {/* Bundle Selection Button - Show if message has bundleId */}
                {message.sender === "ai" && message.bundleId && !message.bundleData && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleViewBundleDetails(message.bundleId)}
                      className="w-full flex items-center justify-center gap-2 text-xs bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      <span>View This Bundle</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            {/* Phase 3: Advanced Features Toolbar */}
            <div className="flex items-center gap-2 mb-3">
              {/* Voice Input */}
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`p-2.5 rounded-lg transition-all ${
                      isRecording
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Voice Input'}
                  >
                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isRecording ? 'Stop Recording' : 'Voice Input'}
                </TooltipContent>
              </Tooltip>

              {/* Image Upload */}
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2.5 rounded-lg transition-all ${
                      uploadedImage
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Upload Image"
                  >
                    <ImageIcon size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Visual Search</TooltipContent>
              </Tooltip>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Language Selector */}
              <div className="flex-1 flex justify-end">
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FC1D] focus:border-transparent appearance-none cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                    title="Select Language"
                  >
                    {Object.entries(languageOptions).map(([code, lang]) => (
                      <option key={code} value={code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <Globe size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {uploadedImage && (
              <div className="mb-3 relative inline-block">
                <img
                  src={uploadedImage}
                  alt="Upload preview"
                  className="h-20 w-20 object-cover rounded-lg border-2 border-green-500 shadow-md"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
                <div className="mt-1 text-xs text-green-600 font-medium">📸 Image ready to send</div>
              </div>
            )}

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  uploadedImage
                    ? "Add a description (optional)..."
                    : isRecording
                    ? "🎤 Listening..."
                    : "Type a message..."
                }
                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39FC1D] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isRecording}
              />
              <button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && !uploadedImage) || isRecording}
                className="bg-[#39FC1D] hover:bg-[#2dd817] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatBox;
