import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Maximize2, Minimize2, ShoppingCart, Mic, MicOff, Image as ImageIcon, Globe } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { DotsLoader } from "./ui/LoadingIndicator";
import { useNavigate, useLocation } from "react-router-dom";
import AIService from "../services/AIService";
import VisionService from "../services/VisionService";
import CartService from "../services/CartService";
import CompatibilityService from "../services/CompatibilityService";
import ChatHistoryService from "../services/ChatHistoryService";
import BundleService from "../services/BundleService";
import { useCart } from "../context/CartContext";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";
import { supabase } from "../lib/supabase";
import Fuse from "fuse.js"; // Fuzzy search for typo-tolerant product matching
import { getNextApiKey, reportRateLimit, reportSuccess } from "../utils/apiKeyManager"; // API Key rotation

// ===== API CALL HELPER WITH KEY ROTATION ===== 🔄
async function makeGroqRequest(endpoint, body) {
  const apiKey = getNextApiKey();
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (response.status === 429) {
      reportRateLimit(apiKey);
      throw new Error('Rate limit exceeded. Switching to next API key...');
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    reportSuccess(apiKey);
    return response;
  } catch (error) {
    // If it's a rate limit error, report it
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      reportRateLimit(apiKey);
    }
    throw error;
  }
}

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
  const { settings, loading: settingsLoading } = useWebsiteSettings();
  const aiName = settings?.aiName || 'AI Assistant';
  const aiLogoUrl = settings?.aiLogoUrl || '/Logo/Ai.png';
  
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // For exit animation
  const [isExpanded, setIsExpanded] = useState(false); // For fullscreen mode
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi! I'm ${aiName}, your shopping assistant! 👋\n\nI'm here to help you with:\n✅ Finding and comparing products\n✅ Checking stock availability & warranties\n✅ Answering shipping & return questions\n✅ Tracking your orders\n✅ Building custom PC configurations\n\nHow may I assist you today?`,
      sender: "ai",
      timestamp: new Date(),
      showQuickActions: true // 🆕 Flag to show quick action buttons
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
  const [helpMessageIndex, setHelpMessageIndex] = useState(0); // Rotating help messages
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // ===== API OPTIMIZATION FEATURES ===== 🚀
  const [responseCache, setResponseCache] = useState(new Map()); // Cache AI responses
  const [rateLimitedUntil, setRateLimitedUntil] = useState(null); // Track rate limit timeout
  const debounceTimerRef = useRef(null); // Debounce timer for API calls
  const retryCountRef = useRef(0); // Track retry attempts

  // Rotating help messages for speech bubble
  const helpMessages = [
    "Need some help? 💬",
    "Looking for PC parts? 🖥️",
    "Ask me anything! 🤖",
    "Build your dream PC! 🎮",
    "Got questions? I'm here! ✨"
  ];

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { loadCart, addToCart } = useCart(); // Get cart functions from CartContext

  // Update initial welcome message when AI name loads from settings
  useEffect(() => {
    if (aiName && aiName !== 'AI Assistant') {
      setMessages(prevMessages => {
        // Only update the first message if it's still the default
        if (prevMessages.length === 1 && prevMessages[0].id === 1) {
          return [{
            id: 1,
            text: `Hi! I'm ${aiName}, your shopping assistant! 👋\n\nI'm here to help you with:\n✅ Finding and comparing products\n✅ Checking stock availability & warranties\n✅ Answering shipping & return questions\n✅ Tracking your orders\n✅ Building custom PC configurations\n\nHow may I assist you today?`,
            sender: "ai",
            timestamp: new Date(),
            showQuickActions: true
          }];
        }
        return prevMessages;
      });
    }
  }, [aiName]);

  // Hide chatbox on sign-in/sign-up pages
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup' || 
                      location.pathname === '/sign-in' || location.pathname === '/sign-up' ||
                      location.pathname.includes('/auth');

  const ensureProductsLoaded = useCallback(async () => {
    if (catalog.products.length) return catalog.products;
    if (productsLoadingRef.current) return catalog.products;
    productsLoadingRef.current = true;
    try {
      const products = await AIService.fetchProducts();
      setCatalog((prev) => ({ ...prev, products }));
      return products;
    } catch (error) {
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

  // Rotate help messages every 4 seconds when chat is closed
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setHelpMessageIndex((prev) => (prev + 1) % helpMessages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, helpMessages.length]);

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
    }
  };

  // Quick Action Handlers
  const handleShowCheaperOptions = async (currentProducts) => {
    if (!currentProducts || currentProducts.length === 0) return;
    
    setIsTyping(true);
    
    try {
      const allProducts = await AIService.fetchProducts();
      
      // Get category from current products - use component type for accuracy
      let category = 'product';
      const firstProduct = currentProducts[0];
      
      // Try to get category from selected_components first (most accurate)
      try {
        if (firstProduct.selected_components) {
          const components = typeof firstProduct.selected_components === 'string' 
            ? JSON.parse(firstProduct.selected_components) 
            : firstProduct.selected_components;
          if (Array.isArray(components) && components.length > 0) {
            category = (components[0].name || '').toLowerCase().trim();
          }
        }
      } catch (e) {
        // Fallback to name-based detection - extract first word that might be category
        const categoryName = firstProduct?.name?.toLowerCase() || '';
        // Try to match against common patterns
        const possibleCategories = ['laptop', 'processor', 'cpu', 'ram', 'memory', 'gpu', 'graphics', 
                                    'motherboard', 'ssd', 'hdd', 'power supply', 'psu', 'cooling', 
                                    'fan', 'case', 'monitor', 'keyboard', 'mouse', 'speaker', 'headset'];
        for (const cat of possibleCategories) {
          if (categoryName.includes(cat)) {
            category = cat;
            break;
          }
        }
      }
      
      // Find ALL products in same category, then sort by price
      const sameCategory = allProducts.filter(p => {
        let productCategory = '';
        try {
          if (p.selected_components) {
            const components = typeof p.selected_components === 'string' 
              ? JSON.parse(p.selected_components) 
              : p.selected_components;
            if (Array.isArray(components) && components.length > 0) {
              productCategory = (components[0].name || '').toLowerCase().trim();
            }
          }
        } catch (e) {
          // Fallback to name matching
          const pName = p.name.toLowerCase();
          if (pName.includes(category)) productCategory = category;
        }
        
        // Flexible category matching - works for ALL categories dynamically
        // Matches if either string contains the other (handles variations like "cooling" vs "fan")
        const categoryLower = category.toLowerCase();
        const productCategoryLower = productCategory.toLowerCase();
        const isMatch = productCategoryLower.includes(categoryLower) || 
                       categoryLower.includes(productCategoryLower) ||
                       productCategoryLower === categoryLower;
        
        return isMatch && p.stock_quantity > 0;
      }).sort((a, b) => a.price - b.price);

      // Get the 3-5 cheapest options that are NOT in current products
      const currentProductIds = new Set(currentProducts.map(p => p.id));
      const cheaper = sameCategory
        .filter(p => !currentProductIds.has(p.id)) // Exclude already shown products
        .slice(0, 5); // Show top 5 cheapest alternatives

      if (cheaper.length === 0) {
        const noOptionsText = selectedLanguage === 'tl'
          ? "Magandang balita! Ang mga produktong ipinakita ko sa'yo ay ilan na sa pinaka-abot-kayang opsyon sa kanilang kategorya. Nakakuha ka ng magandang halaga para sa iyong budget. Gusto mo bang tumingin sa ibang kategorya o baguhin ang iyong mga pangangailangan?"
          : selectedLanguage === 'es'
          ? "¡Buenas noticias! Los productos que te mostré ya están entre las opciones más asequibles de su categoría. Estás obteniendo un gran valor por tu presupuesto. ¿Te gustaría explorar otras categorías o ajustar tus requisitos?"
          : "Good news! The products I showed you are already among the most affordable options in their category. You're getting great value for your budget. Would you like to explore other categories or adjust your requirements?";
        
        const noOptionsMsg = {
          id: Date.now(),
          text: noOptionsText,
          sender: "ai",
          timestamp: new Date(),
          isGeneralQuestion: false
        };
        setMessages(prev => [...prev, noOptionsMsg]);
        setIsTyping(false);
        return;
      }

      // Use AI to generate intelligent explanation WITH language support
      const languageName = selectedLanguage === 'tl' ? 'Tagalog' : selectedLanguage === 'es' ? 'Spanish' : 'English';
      
      // Calculate price comparisons
      const currentPrices = currentProducts.map(p => parseFloat(p.price));
      const avgCurrentPrice = currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length;
      const maxCurrentPrice = Math.max(...currentPrices);
      
      const cheaperExplanationPrompt = `You are a friendly computer hardware sales assistant. A customer was looking at these products:

${currentProducts.map(p => `- ${p.name} (₱${parseFloat(p.price).toLocaleString()})`).join('\n')}

They want more budget-friendly options. Here are cheaper alternatives in the same category:

${cheaper.map((p, idx) => {
  const price = parseFloat(p.price);
  const savings = maxCurrentPrice - price;
  return `${idx + 1}. ${p.name}
   Price: ₱${price.toLocaleString()}${savings > 0 ? ` (Save up to ₱${savings.toLocaleString()} vs most expensive option)` : ''}
   Stock: ${p.stock_quantity} units
   ${p.description ? p.description.substring(0, 100) + '...' : ''}`;
}).join('\n\n')}

IMPORTANT: Respond in ${languageName} language.

Write a helpful, conversational response (2-3 sentences) that:
1. Acknowledges their budget concern
2. Briefly explains these are more affordable options in the same category
3. Mentions potential savings compared to the pricier options
4. Encourages them to ask questions

IMPORTANT: Write naturally like a helpful salesperson. NO asterisks, NO markdown formatting. Just plain conversational text.`;

      const aiExplanation = await makeGroqRequest('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: cheaperExplanationPrompt }],
        temperature: 0.7,
        max_tokens: 300
      });

      const aiData = await aiExplanation.json();
      const explanation = aiData.choices[0].message.content.replace(/\*\*/g, '').replace(/\*/g, '');

      const aiResponse = {
        id: Date.now(),
        text: explanation,
        sender: "ai",
        timestamp: new Date(),
        products: cheaper,
        isGeneralQuestion: false
      };

      setMessages(prev => [...prev, aiResponse]);
      saveMessageToHistory(aiResponse);
    } catch (error) {
      const errorMsg = {
        id: Date.now(),
        text: "I had trouble finding cheaper alternatives. Please try asking me directly, like 'show me budget laptops' or 'affordable processors'.",
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCompareProducts = async (products) => {
    if (products.length < 2) {
      const noProductsMsg = {
        id: Date.now(),
        text: "I need at least 2 products to compare. Please ask me to show you multiple items from the same category first!",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, noProductsMsg]);
      return;
    }

    setIsTyping(true);

    try {
      // Smart category detection from product names, descriptions, and categories
      const detectCategory = (product) => {
        const name = (product.name || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const category = (product.category_id || product.category || '').toLowerCase();
        const combined = `${name} ${desc} ${category}`;
        
        if (combined.includes('laptop') || combined.includes('notebook')) return 'laptop';
        if (combined.includes('processor') || combined.includes('cpu') || combined.includes('ryzen') || combined.includes('intel core')) return 'processor';
        if (combined.includes('ram') || combined.includes('memory') || combined.includes('ddr')) return 'ram';
        if (combined.includes('gpu') || combined.includes('graphics') || combined.includes('rtx') || combined.includes('gtx') || combined.includes('radeon')) return 'gpu';
        if (combined.includes('motherboard') || combined.includes('mobo')) return 'motherboard';
        if (combined.includes('ssd') || combined.includes('nvme') || combined.includes('hdd') || combined.includes('hard drive')) return 'storage';
        if (combined.includes('power supply') || combined.includes('psu')) return 'psu';
        if (combined.includes('monitor') || combined.includes('display')) return 'monitor';
        if (combined.includes('keyboard')) return 'keyboard';
        if (combined.includes('mouse')) return 'mouse';
        if (combined.includes('headset') || combined.includes('headphone')) return 'headset';
        return 'unknown';
      };

      // Group by detected category
      const categoryGroups = {};
      products.forEach(product => {
        const category = detectCategory(product);
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(product);
      });

      // Check if we have products from same category
      const categories = Object.keys(categoryGroups);
      const validCategories = categories.filter(cat => cat !== 'unknown' && categoryGroups[cat].length >= 2);

      // Smart handling: If we have BOTH known and unknown products, 
      // and the user explicitly wants to compare them all, merge them
      let productsToCompare = [];
      
      if (validCategories.length > 0) {
        // Use the category with most products
        const mainCategory = validCategories.sort((a, b) => 
          categoryGroups[b].length - categoryGroups[a].length
        )[0];
        productsToCompare = categoryGroups[mainCategory];
        
        // If there are "unknown" products and they're from the same brand family as the main category,
        // include them too (e.g., "LENOVO", "MSI" products when comparing laptops)
        if (categoryGroups['unknown'] && categoryGroups['unknown'].length > 0) {
          const unknownProducts = categoryGroups['unknown'];
          const knownBrands = productsToCompare.map(p => (p.brands?.name || '').toLowerCase());
          
          // Add unknown products if they share brands with known products
          unknownProducts.forEach(unknownProd => {
            const unknownBrand = (unknownProd.brands?.name || '').toLowerCase();
            if (knownBrands.includes(unknownBrand) || productsToCompare.length + unknownProducts.length <= 6) {
              // If same brand OR if total products is reasonable, include them
              productsToCompare.push(unknownProd);
            }
          });
        }
      } else if (categoryGroups['unknown']?.length >= 2) {
        // All products are unknown, but user wants to compare them
        productsToCompare = categoryGroups['unknown'];
        
        const mixedMsg = {
          id: Date.now(),
          text: "I'll compare these products for you. Note: For the most accurate comparison, products should have detailed descriptions. Here's what I found:",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, mixedMsg]);
      } else {
        // Truly mixed categories
        const mixedMsg = {
          id: Date.now(),
          text: "I noticed the products shown are from different categories. For a fair comparison, products should be from the same category. For example, compare laptops with laptops, or processors with processors. Would you like me to show you products from a specific category?",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, mixedMsg]);
        setIsTyping(false);
        return;
      }

      // Generate AI comparison
      const category = validCategories.length > 0 ? validCategories[0] : 'product';
      const comparisonPrompt = `You are a helpful computer hardware sales assistant. Compare ALL ${productsToCompare.length} ${category} products for a customer:

${productsToCompare.map((p, idx) => `
Product ${idx + 1}: ${p.name}
- Price: ₱${p.price.toLocaleString()}
- Brand: ${p.brands?.name || 'N/A'}
- Stock: ${p.stock_quantity} units
- Description: ${p.description || 'No description'}`).join('\n')}

Provide a natural, conversational comparison that:
1. Start by acknowledging you're comparing ALL ${productsToCompare.length} products
2. Compare key differences (price range, specs if you can tell from names, value propositions)
3. Give recommendations based on different use cases or budgets (budget option, mid-range, premium)
4. Mention stock availability if relevant
5. End with encouragement to ask questions

IMPORTANT RULES:
- Write like you're talking to a customer in a store
- NO asterisks (**), NO markdown formatting
- Use simple, clear language
- Be helpful and friendly
- Keep it conversational (3-5 short paragraphs)
- Make sure to mention ALL products by name at least once`;

      const aiComparison = await makeGroqRequest('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: comparisonPrompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiData = await aiComparison.json();
      const comparisonText = aiData.choices[0].message.content.replace(/\*\*/g, '').replace(/\*/g, '');

      const aiResponse = {
        id: Date.now(),
        text: comparisonText,
        sender: "ai",
        timestamp: new Date(),
        products: productsToCompare, // Show ALL compared products (no limit)
        isGeneralQuestion: false
      };

      setMessages(prev => [...prev, aiResponse]);
      saveMessageToHistory(aiResponse);
    } catch (error) {
      const errorMsg = {
        id: Date.now(),
        text: "I had trouble comparing those products. Please try asking me directly, like 'compare these laptops' or 'what's the difference between product A and B'?",
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFindCompatibleParts = async (product) => {
    if (!product) return;
    
    setIsTyping(true);

    try {
      // Detect product category
      const detectCategory = (productName) => {
        const name = productName.toLowerCase();
        if (name.includes('processor') || name.includes('cpu')) return 'processor';
        if (name.includes('motherboard')) return 'motherboard';
        if (name.includes('ram') || name.includes('memory')) return 'ram';
        if (name.includes('gpu') || name.includes('graphics')) return 'gpu';
        if (name.includes('ssd') || name.includes('nvme') || name.includes('storage')) return 'storage';
        if (name.includes('power supply') || name.includes('psu')) return 'psu';
        if (name.includes('laptop')) return 'laptop';
        return 'component';
      };

      const category = detectCategory(product.name);
      const allProducts = await AIService.fetchProducts();

      // Use AI to find compatible parts intelligently
      const productList = allProducts.slice(0, 40).map(p => `- ${p.name} (PHP ${p.price.toLocaleString()})`).join('\n');
      
      const compatibilityPrompt = `You are a computer hardware compatibility expert. A customer has this product:

Product: ${product.name}
Price: PHP ${product.price.toLocaleString()}
Category: ${category}
${product.description ? `Description: ${product.description}` : ''}

Based on this ${category}, what OTHER components would work well with it? Available products:

${productList}

Provide a helpful response that:
1. Starts with a friendly acknowledgment (1 sentence)
2. Suggests 3-5 compatible products from the list that would work well together
3. Briefly explains WHY each suggestion makes sense
4. Keeps total response conversational and helpful

IMPORTANT:
- Write naturally, like talking to a customer
- NO asterisks or markdown formatting
- Be specific about compatibility (RAM speed, socket type, power requirements, etc.)
- Consider the customer's budget based on their current selection
- If it's a laptop, suggest accessories (not internal components)`;

      const aiResponse = await makeGroqRequest('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: compatibilityPrompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiData = await aiResponse.json();
      const compatibilityText = aiData.choices[0].message.content.replace(/\*\*/g, '').replace(/\*/g, '');

      // Extract mentioned product names from AI response to show as cards
      const mentionedProducts = allProducts.filter(p => 
        compatibilityText.toLowerCase().includes(p.name.toLowerCase().split(' ').slice(0, 3).join(' '))
      ).slice(0, 5);

      const aiMessage = {
        id: Date.now(),
        text: compatibilityText,
        sender: "ai",
        timestamp: new Date(),
        products: mentionedProducts.length > 0 ? mentionedProducts : null,
        isGeneralQuestion: false
      };

      setMessages(prev => [...prev, aiMessage]);
      saveMessageToHistory(aiMessage);
    } catch (error) {
      const errorMsg = {
        id: Date.now(),
        text: "I had trouble finding compatible parts. Please try asking me directly, like 'what works well with this processor?' or 'what components are compatible with this motherboard?'",
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
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
    } finally {
      setIsTyping(false);
    }
  };

  // Handle showing recommended bundles
  const handleShowBundles = async () => {
    setIsTyping(true);

    try {
      const { data: bundles, error } = await BundleService.fetchBundles();

      if (error) {
      }

      if (error || !bundles || bundles.length === 0) {
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

      // Show bundle options
      const bundleOptionsMsg = {
        id: Date.now(),
        text: `🎁 **Pre-Configured PC Bundles**\n\nGreat choice! I found ${bundles.length} expertly curated PC bundle${bundles.length > 1 ? 's' : ''} for you. Each bundle contains carefully selected, compatible components that work perfectly together - saving you time and ensuring optimal performance!\n\n✨ **Why choose a bundle?**\n• ✅ Guaranteed compatibility\n• 💰 Better value than buying separately\n• ⚡ Ready to order immediately\n• 🛡️ All components tested together\n\nTake a look at these options:`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, bundleOptionsMsg]);

      // Add individual bundle cards
      bundles.forEach((bundle, index) => {
        // Extract values with fallbacks for different column names
        const bundleName = bundle.bundle_name || bundle.name || 'Unnamed Bundle';
        const bundlePrice = bundle.official_price || bundle.total_price || 0;
        const productCount = bundle.product_count || 0;
        const bundleDesc = bundle.description || 'Complete PC Bundle';

        const bundleMsg = {
          id: Date.now() + index + 1,
          text: `📦 **${bundleName}**\n${bundleDesc}\n\n💰 **Bundle Price:** ₱${parseFloat(bundlePrice).toLocaleString()}\n📦 **Includes:** ${productCount} carefully selected component${productCount > 1 ? 's' : ''}\n\n🎯 Click "View Details" to see what's included or "Add Entire Bundle" to add everything to your cart!`,
          sender: "ai",
          timestamp: new Date(),
          bundleId: bundle.id,
          bundleData: bundle,
          showBundleActions: true,
        };
        setMessages(prev => [...prev, bundleMsg]);
      });

    } catch (error) {
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
        text: `📦 **${bundleName}** - Complete Bundle Breakdown\n\n${bundleDesc}\n\n**🔧 What's Included in This Bundle:**\n${productsList}\n\n💰 **Total Bundle Price:** ₱${parseFloat(bundlePrice).toLocaleString()}\n\n✨ **Why This Bundle?**\nAll components are handpicked and tested for compatibility. You're getting everything you need in one convenient package!\n\n👉 You can add individual items to your cart or grab the entire bundle at once!`,
        sender: "ai",
        timestamp: new Date(),
        products: bundle.products || [],
        bundleData: bundle,
        showBundleActions: true,
      };

      setMessages(prev => [...prev, bundleDetailsMsg]);
      saveMessageToHistory(bundleDetailsMsg);

    } catch (error) {
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
        text: "recording", // Special flag for animated recording
        sender: "ai",
        timestamp: new Date(),
        isRecording: true, // Flag to show animated recording
      };
      setMessages(prev => [...prev, recordingMsg]);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsRecording(false);
      // Remove the recording message
      setMessages(prev => prev.filter(msg => !msg.isRecording));
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      // Remove the recording message
      setMessages(prev => prev.filter(msg => !msg.isRecording));
      
      // Provide helpful error messages based on error type
      let errorMessage = '';
      
      switch(event.error) {
        case 'not-allowed':
          errorMessage = '🔒 Microphone access denied. Click the lock icon in the address bar and allow microphone access. Note: HTTPS is required for microphone access.';
          break;
        case 'no-speech':
          errorMessage = '🎤 No speech detected. Please try again and speak clearly.';
          break;
        case 'audio-capture':
          errorMessage = '🎤 Microphone not found. Please connect a microphone and try again.';
          break;
        case 'network':
          errorMessage = '📡 Network error. Please check your internet connection.';
          break;
        case 'aborted':
          // User cancelled, no error needed
          return;
        default:
          errorMessage = `⚠️ Voice recognition error: ${event.error}. Please try again.`;
      }
      
      const errorMsg = {
        id: Date.now(),
        text: errorMessage,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    };

    recognition.onend = () => {
      setIsRecording(false);
      // Remove the recording message if still present
      setMessages(prev => prev.filter(msg => !msg.isRecording));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Remove the recording message
      setMessages(prev => prev.filter(msg => !msg.isRecording));
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
          }
        } catch (resizeError) {
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

      // Skip the technical detection message - go straight to results for better UX

      // Show results
      if (matchedProducts.length > 0) {
        // Check if we have an exact or very close match
        const topMatch = matchedProducts[0];
        const isExactMatch = topMatch.matchScore >= 80;
        
        // Separate exact matches from similar products
        const exactMatches = matchedProducts.filter(p => p.matchScore >= 80);
        const similarProducts = matchedProducts.filter(p => p.matchScore < 80);

        if (isExactMatch) {
          // Show exact match with stock status
          const stockInfo = VisionService.getStockStatus(topMatch);
          const stockStatus = `${stockInfo.statusEmoji} ${stockInfo.status} ${stockInfo.quantity > 0 ? `(${stockInfo.quantity} available)` : ''}`;
          
          const exactMatchMsg = {
            id: Date.now() + 3,
            text: `Great news! I found exactly what you're looking for! 🎉\n\n${stockStatus}\n\nHere's your product:`,
            sender: "ai",
            timestamp: new Date(),
            products: [topMatch],
            hasProducts: true,
          };
          setMessages(prev => [...prev, exactMatchMsg]);
          setRecommendedProducts([topMatch]);

          // Find and show related/compatible products using the new method
          const relatedProducts = VisionService.findRelatedProducts(topMatch, allProducts);
          
          if (relatedProducts.length > 0) {
            const relatedMsg = {
              id: Date.now() + 4,
              text: `You might also be interested in these related products that work great with your selection:`,
              sender: "ai",
              timestamp: new Date(),
              products: relatedProducts.slice(0, 4),
              hasProducts: true,
            };
            setMessages(prev => [...prev, relatedMsg]);
          } else if (similarProducts.length > 0) {
            // Fallback to similar products if no related products found
            const relatedMsg = {
              id: Date.now() + 4,
              text: `I also found these similar products you might like:`,
              sender: "ai",
              timestamp: new Date(),
              products: similarProducts.slice(0, 4),
              hasProducts: true,
            };
            setMessages(prev => [...prev, relatedMsg]);
          }
        } else {
          // Show all matches as similar products
          const resultsToShow = matchedProducts.slice(0, 5);
          setRecommendedProducts(resultsToShow);

          const resultsMsg = {
            id: Date.now() + 3,
            text: `I found several great options that match what you're looking for! Here are the top ${resultsToShow.length} products I'd recommend:`,
            sender: "ai",
            timestamp: new Date(),
            products: resultsToShow,
            hasProducts: true,
          };
          setMessages(prev => [...prev, resultsMsg]);
        }

        // Add follow-up suggestions
        const followUpMsg = {
          id: Date.now() + 5,
          text: "How can I help you further?\n\n• I can show you more details about any product\n• Compare these products side-by-side\n• Help you add items to your cart\n• Find compatible accessories\n• Search for something else",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, followUpMsg]);
      } else {
        // No matches found - show alternatives
        const visionCategorySlug = getVisionCategorySlug(visionData.productType);
        
        // First, refine the product type if it's too generic
        let refinedProductType = visionData.productType;
        if (visionData.productType && visionData.productType.toLowerCase() === 'peripheral' && visionData.keywords && Array.isArray(visionData.keywords)) {
          const keywords = visionData.keywords.map(k => k.toLowerCase()).join(' ');
          if (keywords.includes('keyboard') || keywords.includes('keys')) {
            refinedProductType = 'Keyboard';
          } else if (keywords.includes('mouse') || keywords.includes('mice')) {
            refinedProductType = 'Mouse';
          } else if (keywords.includes('headset') || keywords.includes('headphone')) {
            refinedProductType = 'Headset';
          } else if (keywords.includes('speaker') || keywords.includes('audio')) {
            refinedProductType = 'Speaker';
          }
        }
        
        // Build a meaningful product description from detected data
        let detectedProduct = 'that product';
        if (refinedProductType && refinedProductType !== 'Unknown' && refinedProductType !== 'Electronics') {
          // Use product type if available
          if (visionData.brand && visionData.brand !== 'Unknown') {
            if (visionData.model && visionData.model !== 'Unknown') {
              detectedProduct = `${visionData.brand} ${visionData.model}`;
            } else {
              detectedProduct = `${visionData.brand} ${refinedProductType}`;
            }
          } else {
            detectedProduct = refinedProductType;
          }
        } else if (visionData.description && visionData.description !== 'Product') {
          // Fallback to description
          detectedProduct = visionData.description;
        }

        // Filter products by category first if we detected a category
        let alternatives = [];
        if (refinedProductType && refinedProductType !== 'Unknown' && refinedProductType !== 'Electronics') {
          let detectedType = refinedProductType.toLowerCase();
          
          // If detected as generic "peripheral", try to determine specific type from keywords
          if (detectedType === 'peripheral' && visionData.keywords && Array.isArray(visionData.keywords)) {
            const keywords = visionData.keywords.map(k => k.toLowerCase()).join(' ');
            if (keywords.includes('keyboard') || keywords.includes('keys')) {
              detectedType = 'keyboard';
            } else if (keywords.includes('mouse') || keywords.includes('mice')) {
              detectedType = 'mouse';
            } else if (keywords.includes('headset') || keywords.includes('headphone')) {
              detectedType = 'headset';
            } else if (keywords.includes('speaker') || keywords.includes('audio')) {
              detectedType = 'speaker';
            }
          }
          
          // Expand search terms based on product type
          const categoryMap = {
            'speaker': ['speaker', 'speakers', 'audio', 'sound'],
            'speakers': ['speaker', 'speakers', 'audio', 'sound'],
            'mouse': ['mouse', 'mice', 'gaming mouse'],
            'keyboard': ['keyboard', 'keyboards', 'gaming keyboard'],
            'headset': ['headset', 'headphone', 'headphones', 'earphone', 'audio'],
            'monitor': ['monitor', 'display', 'screen'],
            'graphics card': ['graphics', 'gpu', 'video card', 'rtx', 'gtx'],
            'processor': ['processor', 'cpu', 'ryzen', 'intel'],
            'motherboard': ['motherboard', 'mobo', 'mainboard'],
            'ram': ['ram', 'memory', 'ddr'],
            'storage': ['storage', 'ssd', 'hdd', 'drive'],
            'power supply': ['power supply', 'psu'],
            'case': ['case', 'chassis', 'tower'],
            'cooling': ['cooling', 'cooler', 'fan'],
            'peripheral': ['keyboard', 'mouse', 'headset', 'speaker', 'webcam'] // Generic fallback
          };
          
          // Get expanded keywords
          let searchKeywords = [detectedType];
          for (const [key, synonyms] of Object.entries(categoryMap)) {
            if (detectedType.includes(key) || key.includes(detectedType)) {
              searchKeywords = synonyms;
              break;
            }
          }
          
          // Also add specific keywords from vision data (but filter out too generic ones)
          if (visionData.keywords && Array.isArray(visionData.keywords)) {
            const specificKeywords = visionData.keywords
              .map(k => k.toLowerCase())
              .filter(k => k.length > 3 && !['peripheral', 'device', 'product', 'item'].includes(k));
            searchKeywords.push(...specificKeywords);
          }
          
          alternatives = allProducts.filter(product => {
            const productName = (product.name || product.title || '').toLowerCase();
            const categoryName = (product.category_id || product.category || '').toLowerCase();
            const productDesc = (product.description || '').toLowerCase();
            
            // Define incompatible categories to exclude
            const incompatibleCategories = {
              'keyboard': ['gpu', 'graphics', 'processor', 'cpu', 'motherboard', 'ram', 'memory', 'ssd', 'hdd', 'storage', 'psu', 'power supply'],
              'mouse': ['gpu', 'graphics', 'processor', 'cpu', 'motherboard', 'ram', 'memory', 'ssd', 'hdd', 'storage', 'psu', 'power supply'],
              'headset': ['gpu', 'graphics', 'processor', 'cpu', 'motherboard', 'ram', 'memory', 'ssd', 'hdd', 'storage', 'psu', 'power supply'],
              'speaker': ['gpu', 'graphics', 'processor', 'cpu', 'motherboard', 'ram', 'memory', 'ssd', 'hdd', 'storage', 'psu', 'power supply'],
              'monitor': ['keyboard', 'mouse', 'headset', 'speaker'],
            };
            
            // Check if product is from an incompatible category
            const excludeKeywords = incompatibleCategories[detectedType] || [];
            const isIncompatible = excludeKeywords.some(excluded => 
              productName.includes(excluded) || categoryName.includes(excluded)
            );
            
            if (isIncompatible) {
              return false; // Skip this product
            }
            
            // Check if any keyword matches
            const matches = searchKeywords.some(kw => 
              productName.includes(kw) || 
              categoryName.includes(kw) ||
              productDesc.includes(kw)
            );
            
            if (matches) {
            }
            
            return matches;
          });
          
        }

        // If no category matches, try brand matches
        if (alternatives.length === 0 && visionData.brand && visionData.brand !== 'Unknown') {
          alternatives = allProducts.filter(product => {
            const brandName = (product.brands?.name || product.brand_name || product.brand || '').toLowerCase();
            return brandName.includes(visionData.brand.toLowerCase());
          });
        }

        // If still no matches, show a message that we don't have this category
        if (alternatives.length === 0) {
          const noProductsMsg = {
            id: Date.now() + 3,
            text: `I'm sorry, but we don't currently have any ${detectedProduct} in our inventory. 😔\n\nWould you like to see our available products in other categories? I can help you find:\n• Computer components (CPU, GPU, RAM, Storage)\n• Gaming peripherals (Keyboards, Mice, Headsets)\n• PC accessories\n\nJust let me know what you're interested in!`,
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, noProductsMsg]);
          setUploadedImage(null);
          return;
        }

        // Use detected clues to recommend the closest alternatives from filtered products only
        const curatedAlternatives = rankProductsByVisionClues(visionData, alternatives);
        const topAlternatives = curatedAlternatives.slice(0, 6);

        const categoryLabel = getCategoryDisplayName(visionCategorySlug);
        
        // Build friendly message without "None" or undefined values
        let guidanceText;
        if (categoryLabel) {
          guidanceText = `I couldn't find that exact ${detectedProduct} in our current inventory, but I found some excellent ${categoryLabel} alternatives that might interest you:`;
        } else if (detectedProduct !== 'that product') {
          guidanceText = `I couldn't find that exact ${detectedProduct} right now, but here are some great alternatives I think you'll like:`;
        } else {
          guidanceText = `I analyzed your image and found these products that might be what you're looking for:`;
        }

        const noResultsMsg = {
          id: Date.now() + 3,
          text: guidanceText,
          sender: "ai",
          timestamp: new Date(),
          products: topAlternatives,
          hasProducts: true,
        };
        setMessages(prev => [...prev, noResultsMsg]);
        setRecommendedProducts(topAlternatives);

        // Add helpful suggestion
        const suggestionMsg = {
          id: Date.now() + 4,
          text: "Need help finding something specific? Just let me know what features or specs you're looking for, and I'll help you find the perfect match!",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, suggestionMsg]);
      }

      setUploadedImage(null);
    } catch (error) {
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
        text: "Let me search our inventory based on your description...",
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
          text: `Perfect! I found ${resultsToShow.length} product${resultsToShow.length > 1 ? 's' : ''} that match your description:`,
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
            ? `I couldn't find any products matching "${userMessage}". Could you try describing it differently?\n\nFor example: "gaming keyboard", "16GB RAM", or "RTX graphics card"`
            : "To help me find the right product, could you describe what you're looking for?\n\nFor example:\n• 'gaming mouse'\n• 'graphics card'\n• '32GB RAM'",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, noResultsMsg]);
      }

      setUploadedImage(null);
    } catch (error) {
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
  "action": "add_to_cart" | "compare" | "build_pc" | "view_cart" | "none",
  "productReference": "product name or position (1, 2, first, last)" or null,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

IMPORTANT: Only detect ACTIONS, not questions or recommendations!
- "add to cart" / "buy this" / "I'll take it" / "buy it now" → add_to_cart
- "I'll buy it later" / "maybe later" / "add later" → NOT add to cart (action: "none")
- "that's good" / "sounds good" / "nice" / "okay" → NOT add to cart (action: "none")
- "compare these" / "which is better" → compare
- "build me a PC" / "make a bundle" → build_pc
- "show my cart" / "what's in my cart" → view_cart
- "recommend a laptop" / "which is best" / "tell me about" → NOT a command (action: "none")
- "show all X" / "I mean all X" / "display all X" / "list all X" → NOT add to cart (action: "none")

Examples:
- "put that in my shopping bag" → {"isCommand": true, "action": "add_to_cart", "productReference": "that", "confidence": 0.9}
- "I'll buy it later" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.95}
- "that's really good" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.9}
- "oh nice" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.85}
- "add to cart now" → {"isCommand": true, "action": "add_to_cart", "productReference": "product", "confidence": 0.95}
- "can you build that for me?" → {"isCommand": true, "action": "build_pc", "productReference": null, "confidence": 0.95}
- "compare these two" → {"isCommand": true, "action": "compare", "productReference": "first two", "confidence": 0.9}
- "show me what's in my cart" → {"isCommand": true, "action": "view_cart", "productReference": null, "confidence": 0.95}
- "what's the warranty?" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.8}
- "recommend the best gaming laptop" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.9}
- "which one is better?" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.7}
- "show all rams" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.85}
- "I mean all ram" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.9}
- "display all processors" → {"isCommand": false, "action": "none", "productReference": null, "confidence": 0.9}`;

      const response = await makeGroqRequest('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: intentPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Low temperature for consistent intent detection
        max_tokens: 200,
      });

      const data = await response.json();
      const intent = JSON.parse(data.choices[0].message.content);
      
      return intent;
    } catch (error) {
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

    const definitionCue = /(what\s+is|define|definition|meaning|explain|difference\s+between|differentiate|clarify)/i.test(userInput);
    if (intent.action === 'definition' || definitionCue) {
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
      return false;
    }

    // Use new intelligent intent detection instead of keyword normalization
    setIsTyping(true);

    try {
      // Use AI to detect intent and search intelligently
      const detectedIntent = await AIService.detectIntent(input);
      // Search products using intelligent matching
      let foundProducts = await AIService.searchProductsByIntent(detectedIntent);
      
      // Apply additional filters if needed
      if (intent.brandPreferences && intent.brandPreferences.length > 0) {
        const brandFiltered = foundProducts.filter((product) => 
          productMatchesBrand(product, intent.brandPreferences)
        );
        if (brandFiltered.length > 0) {
          foundProducts = brandFiltered;
        }
      }

      // Apply budget filters if specified in original intent
      const budgetFiltered = filterByBudgetSignals(foundProducts, intent, detectedIntent.category);
      if (budgetFiltered.length > 0) {
        foundProducts = budgetFiltered;
      }

      if (!foundProducts.length) {
        // No products found - generate AI natural response instead of hardcoded message
        setIsTyping(true);
        
        try {
          const conversationHistory = messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }));

          const noResultsPrompt = `You are a helpful e-commerce assistant. The user asked: "${input}"

Unfortunately, we don't have any ${detectedIntent.category || 'products'} available right now.

Generate a SHORT, natural, apologetic response (2-3 sentences max) explaining we don't have this item currently. Be friendly and offer to help with alternatives or notify them when it's available.

Examples:
- "I'm sorry, we don't have any SSDs in stock at the moment. Would you like me to notify you when they arrive, or can I help you find something else?"
- "Unfortunately, we're currently out of keyboards. I can let you know as soon as we restock, or I could show you our mouse collection instead?"
- "We don't have any processors available right now, but I'd be happy to alert you when new stock arrives!"

Your response:`;

          const aiResponse = await makeGroqRequest('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages: [
              // Send only current prompt, no history to avoid context mixing
              { role: 'user', content: noResultsPrompt }
            ],
            temperature: 0.7,
            max_tokens: 150,
          });

          const data = await aiResponse.json();
          const aiText = data.choices[0].message.content.trim();

          const noResultsMsg = {
            id: Date.now(),
            text: aiText,
            sender: 'ai',
            timestamp: new Date(),
            products: null,
          };
          
          setMessages((prev) => [...prev, noResultsMsg]);
        } catch (error) {
          // Fallback to simple message
          const noResultsMsg = {
            id: Date.now(),
            text: `I don't have any ${detectedIntent.category || 'products'} available at the moment. Can I help you find something else?`,
            sender: 'ai',
            timestamp: new Date(),
            products: null,
          };
          setMessages((prev) => [...prev, noResultsMsg]);
        }
        
        setIsTyping(false);
        return true;
      }

      // Apply intent filters and format response
      const tailoredProducts = applyIntentFilters(foundProducts, intent, { categoryInfo: null });
      const summaryProducts = tailoredProducts.length ? tailoredProducts : foundProducts;
      
      // Validate that products match the requested category
      const requestedCategory = detectedIntent.category?.toLowerCase();
      if (requestedCategory && summaryProducts.length > 0) {
        const firstProduct = summaryProducts[0];
        let productCategory = '';
        
        try {
          if (firstProduct.selected_components) {
            const components = typeof firstProduct.selected_components === 'string' 
              ? JSON.parse(firstProduct.selected_components) 
              : firstProduct.selected_components;
            if (Array.isArray(components) && components.length > 0) {
              productCategory = (components[0].name || '').toLowerCase();
            }
          }
        } catch (e) {
          productCategory = '';
        }
        
        // Check if product category matches requested category
        const categoryMatches = productCategory.includes(requestedCategory) || 
                               requestedCategory.includes(productCategory) ||
                               firstProduct.name.toLowerCase().includes(requestedCategory);
        
        if (!categoryMatches) {
          // Generate apology and correct search
          const apologyMsg = {
            id: Date.now(),
            text: `I apologize for the confusion. Let me search specifically for ${requestedCategory}s...`,
            sender: 'ai',
            timestamp: new Date(),
            products: null,
          };
          
          setMessages((prev) => [...prev, apologyMsg]);
          
          // Retry with stricter search
          const correctedProducts = await AIService.searchProductsByIntent({
            ...detectedIntent,
            category: requestedCategory
          });
          
          if (correctedProducts.length === 0) {
            const noResultsMsg = {
              id: Date.now(),
              text: `Unfortunately, we don't have any ${requestedCategory}s available right now. Would you like me to show you other products or notify you when they're back in stock?`,
              sender: 'ai',
              timestamp: new Date(),
              products: null,
            };
            setMessages((prev) => [...prev, noResultsMsg]);
            setIsTyping(false);
            return true;
          }
          
          // Use corrected products
          summaryProducts.length = 0;
          summaryProducts.push(...correctedProducts);
        }
      }
      
      const displayLabel = detectedIntent.category 
        ? detectedIntent.category.charAt(0).toUpperCase() + detectedIntent.category.slice(1)
        : 'products';
      
      // Generate AI-powered natural response instead of template
      let responseText = '';
      try {
        const productSummary = summaryProducts.slice(0, 5).map((p, idx) => 
          `${idx + 1}. ${p.name} - ₱${formatCurrency(getNumericPrice(p))} (Stock: ${p.stock_quantity || 0})`
        ).join('\n');

        // IMPORTANT: Only include conversation history if it's related to the CURRENT category
        // This prevents mixing laptop context when asking about RAM, etc.
        const currentCategory = detectedIntent.category?.toLowerCase();
        const relevantHistory = messages.slice(-6).filter(m => {
          if (m.sender === 'user') {
            // Check if user message mentions current category
            const msgLower = m.text.toLowerCase();
            return !currentCategory || msgLower.includes(currentCategory);
          }
          // Include AI responses only if they're about current category
          if (m.products && m.products.length > 0) {
            // Check if products match current category
            try {
              const firstProduct = m.products[0];
              if (firstProduct.selected_components) {
                const components = typeof firstProduct.selected_components === 'string' 
                  ? JSON.parse(firstProduct.selected_components) 
                  : firstProduct.selected_components;
                if (Array.isArray(components) && components.length > 0) {
                  const msgCategory = (components[0].name || '').toLowerCase();
                  return !currentCategory || msgCategory.includes(currentCategory) || currentCategory.includes(msgCategory);
                }
              }
            } catch (e) {
              // Fallback: include if text mentions category
              return !currentCategory || m.text.toLowerCase().includes(currentCategory);
            }
          }
          return false; // Exclude unrelated messages
        }).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

        // If no relevant history, start fresh with just current query
        const conversationHistory = relevantHistory.length > 0 ? relevantHistory : [];

        // Detect if user asked for "affordable" products
        const askedForAffordable = input.toLowerCase().includes('affordable') || 
                                   input.toLowerCase().includes('budget') || 
                                   input.toLowerCase().includes('cheap') ||
                                   input.toLowerCase().includes('cheapest');
        
        // Calculate price range for context
        const prices = summaryProducts.map(p => getNumericPrice(p));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
        
        const priceContext = askedForAffordable 
          ? `IMPORTANT CONTEXT: User asked for AFFORDABLE/CHEAP options. These products are sorted by price (cheapest first). Price range: ₱${minPrice.toLocaleString()} to ₱${maxPrice.toLocaleString()}. The cheapest option is ₱${minPrice.toLocaleString()}.`
          : `Price range: ₱${minPrice.toLocaleString()} to ₱${maxPrice.toLocaleString()}.`;

        // Use AI to generate natural introduction WITH language support
        const languageName = selectedLanguage === 'tl' ? 'Tagalog' : selectedLanguage === 'es' ? 'Spanish' : 'English';
        const introPrompt = `You are a helpful e-commerce assistant. The user just asked: "${input}"

IMPORTANT: This is a NEW question about ${displayLabel.toUpperCase()}. DO NOT reference previous products or categories.

You found ${summaryProducts.length} ${displayLabel.toLowerCase()} products:
${productSummary}

${priceContext}
${detectedIntent.budget?.min || detectedIntent.budget?.max ? `User specified budget: ${detectedIntent.budget.min ? '₱' + detectedIntent.budget.min.toLocaleString() : ''} ${detectedIntent.budget.max ? 'to ₱' + detectedIntent.budget.max.toLocaleString() : ''}` : ''}

IMPORTANT: Respond in ${languageName} language.

Generate a SHORT, natural, conversational introduction (1-2 sentences max) for these ${displayLabel.toLowerCase()} products. Be friendly and helpful.
${askedForAffordable ? `EMPHASIZE that these are the CHEAPEST/most AFFORDABLE ${displayLabel.toLowerCase()} options, sorted by price. Mention the starting price ₱${minPrice.toLocaleString()}.` : ''}

DO NOT mention any other product categories or previous conversations. Focus ONLY on these ${displayLabel.toLowerCase()} products.

Style Guidelines:
- Be natural and conversational
- Vary your wording - don't use the same phrases repeatedly
- If user asked for affordable items, mention the starting price
- Keep it brief (1-2 sentences)
- Sound enthusiastic and helpful

Your response:`;

        const aiResponse = await makeGroqRequest('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.3-70b-versatile',
          messages: [
            // ONLY send current query context, not full history
            // This prevents mixing laptop context when asking about RAM
            { role: 'user', content: introPrompt }
          ],
          temperature: 0.7,
          max_tokens: 150,
        });

        const data = await aiResponse.json();
        const aiIntro = data.choices[0].message.content.trim();
        
        // Build detailed product list WITHOUT asterisks for clean, readable format
        const productLines = summaryProducts.slice(0, 5).map((product, index) => {
          const name = product.name || product.title;
          const brand = product.brands?.name ? ` • Brand: ${product.brands.name}` : '';
          const stock = typeof product.stock_quantity !== 'undefined' ? product.stock_quantity : product.stock || 0;
          const shortDescription = product.description?.split('. ')[0];
          const descriptionText = shortDescription ? ` • ${shortDescription}` : '';
          return `${index + 1}. ${name} — ₱${formatCurrency(getNumericPrice(product))} • Stock: ${stock}${brand}${descriptionText}`;
        }).join('\n\n');

        // Generate AI closing message in correct language
        const closingPrompt = `Generate a SHORT closing question (1 sentence) asking if they want more details or help comparing products.

Language: ${languageName}

Examples (${languageName}):
${selectedLanguage === 'tl'
  ? `- "Gusto mo bang makita ang mas maraming detalye, o tulungan kita na ihambing sila?"
- "May gusto ka bang malaman pa tungkol dito?"
- "Interesado ka ba sa isa sa mga ito?"`
  : selectedLanguage === 'es'
  ? `- "¿Quieres más detalles o te ayudo a compararlos?"
- "¿Te interesa alguno de estos?"
- "¿Necesitas más información?"`
  : `- "Would you like more details about any of these, or shall I help you compare them?"
- "Interested in any of these?"
- "Need more information about these products?"`}

Your response (${languageName}):`;

        const closingResponse = await makeGroqRequest('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: closingPrompt }],
          temperature: 0.7,
          max_tokens: 80,
        });

        const closingData = await closingResponse.json();
        const aiClosing = closingData.choices[0].message.content.trim();

        responseText = `${aiIntro}\n\n${productLines}\n\n${aiClosing}`;
        
      } catch (error) {
        // Fallback to simple response
        const fallbackText = selectedLanguage === 'tl' 
          ? `Nakita ko ${summaryProducts.length} ${displayLabel.toLowerCase()} para sa'yo. Sabihin mo lang kung gusto mo ng mas maraming detalye!`
          : selectedLanguage === 'es'
          ? `Encontré ${summaryProducts.length} ${displayLabel.toLowerCase()} para ti. ¡Dime si quieres más detalles!`
          : `I found ${summaryProducts.length} ${displayLabel.toLowerCase()} for you. Let me know if you'd like more details or have specific preferences!`;
        responseText = fallbackText;
      }

      const aiMessage = {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        products: summaryProducts.slice(0, 20),
      };

      updateContext({
        lastProducts: summaryProducts.slice(0, 20),
        lastCategory: detectedIntent.category,
        lastSearchTerm: input,
        lastAction: 'product_search',
        budget: intent.priceFocus,
        detectedIntent: detectedIntent, // Store AI-detected intent
      });

      setMessages((prev) => [...prev, aiMessage]);
      setRecommendedProducts(summaryProducts.slice(0, 20));
      saveMessageToHistory(aiMessage);

      setIsTyping(false);
      return true;
    } catch (error) {
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
    
    const allProducts = lastAIMessage.products;
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
    
    if (filteredProducts.length === 0) {
      const budgetLabel = minBudget && maxBudget 
        ? `₱${minBudget.toLocaleString()} to ₱${maxBudget.toLocaleString()}`
        : maxBudget 
          ? `₱${maxBudget.toLocaleString()}`
          : minBudget
            ? `at least ₱${minBudget.toLocaleString()}`
            : 'your budget';
      
      // Generate AI response for no budget matches
      try {
        const closestProducts = allProducts.slice(0, 3);
        const productSummary = closestProducts.map((p, idx) => 
          `${idx + 1}. ${p.name} - ₱${formatCurrency(getNumericPrice(p))}`
        ).join('\n');

        const noBudgetPrompt = `You are a helpful e-commerce assistant. The user is looking for products within ${budgetLabel}, but we don't have any exact matches.

However, we have these close alternatives:
${productSummary}

Generate a SHORT, apologetic response (1-2 sentences) explaining we don't have products in their exact budget, but here are the closest options. Be friendly and helpful.

Examples:
- "I don't have anything exactly at ₱30,000, but here are the closest options I found!"
- "Unfortunately nothing fits that exact budget, but these are pretty close and might work for you:"
- "I couldn't find products at that price point, but check out these nearby options:"

Your response:`;

        const aiResponse = await makeGroqRequest('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: noBudgetPrompt }],
          temperature: 0.7,
          max_tokens: 100,
        });

        const data = await aiResponse.json();
        const aiText = data.choices[0].message.content.trim();

        const noBudgetMatchMsg = {
          id: Date.now(),
          text: aiText,
          sender: 'ai',
          timestamp: new Date(),
          products: closestProducts,
        };
        setMessages(prev => [...prev, noBudgetMatchMsg]);
        setRecommendedProducts(closestProducts);
      } catch (error) {
        // Fallback
        const noBudgetMatchMsg = {
          id: Date.now(),
          text: `I don't have products exactly within ${budgetLabel}, but here are the closest options:`,
          sender: 'ai',
          timestamp: new Date(),
          products: allProducts.slice(0, 3),
        };
        setMessages(prev => [...prev, noBudgetMatchMsg]);
        setRecommendedProducts(allProducts.slice(0, 3));
      }
      
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
    
    // Check if we're in PC building context
    const isPCBuildContext = context.buildingPC || /build.*pc|gaming\s*pc|custom\s*pc/i.test(userInput);
    
    let responseText = '';
    if (isPCBuildContext && maxBudget) {
      // Detailed PC build response
      responseText = `Great! With a budget of ${budgetLabel}, I can help you build a solid gaming PC. 

For a gaming PC in this price range, you'll need these essential components:

🖥️ PROCESSOR (CPU): The brain of your PC - handles all calculations and processes
💾 GRAPHICS CARD (GPU): Powers your games - most important for gaming performance
🔧 MOTHERBOARD: Connects all components together
💿 MEMORY (RAM): Temporary storage for running programs - 8GB minimum, 16GB recommended
💾 STORAGE (SSD/HDD): Where you store games and files - SSD is much faster
⚡ POWER SUPPLY (PSU): Provides power to all components
📦 CASE: Houses everything and keeps it cool
❄️ COOLING: Keeps your components from overheating

Let me show you available components from our store that fit your budget:`;
    } else {
      // Regular budget response
      responseText = `Perfect! Here are ${filteredProducts.length} option${filteredProducts.length > 1 ? 's' : ''} ${budgetLabel}:`;
    }
    
    const budgetMsg = {
      id: Date.now(),
      text: responseText,
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

      const response = await makeGroqRequest('https://api.groq.com/openai/v1/chat/completions', {
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
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return result;
    } catch (error) {
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
    
    // Get the last AI message with products
    const lastAIMessage = [...currentMessages]
      .reverse()
      .find(msg => msg.sender === 'ai' && msg.products && msg.products.length > 0);
    
    if (!lastAIMessage || !lastAIMessage.products) {
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

    // ===== SHOW PRODUCT DETAILS COMMANDS =====
    const detailsPatterns = [
      // "show me the details/specs"
      /show\s+(me\s+)?(the\s+)?details/i,
      /show\s+(me\s+)?(the\s+)?spec(ification)?s?/i,
      
      // "specs/details of X"
      /spec(ification)?s?\s+(of|for|about)/i,
      /details?\s+(of|for|about)/i,
      
      // "what are the specs"
      /what\s+(are|is)\s+(the\s+)?spec(ification)?s?/i,
      /what\s+(are|is)\s+(the\s+)?details?/i,
      
      // "tell me about"
      /tell\s+me\s+(more\s+)?about/i,
      /tell\s+me\s+(the\s+)?spec(ification)?s?/i,
      
      // "more info"
      /more\s+info(rmation)?/i,
      
      // "how about its specs"
      /(how\s+)?about\s+(its|the)\s+spec(ification)?s?/i,
      
      // Just "specification" or "specifications"
      /^spec(ification)?s?$/i,
      
      // "first/second one" with specs/details
      /(first|second|last|that)\s+(one|product|item|keyboard|laptop|mouse|processor|ram|gpu).*spec/i,
      /(first|second|last|that)\s+(one|product|item).*details?/i,
      
      // "specs of the asus" or "specs of first"
      /spec(ification)?s?\s+of\s+(the\s+)?(first|second|last|asus|amd|intel|corsair|msi)/i,
    ];

    const isDetailsRequest = detailsPatterns.some(pattern => pattern.test(input));

    if (isDetailsRequest) {
      // Get the last shown products from context
      const { lastProducts } = conversationContext;
      
      if (!lastProducts || lastProducts.length === 0) {
        const noProductMsg = {
          id: Date.now(),
          text: `I don't have any products to show details for. Please search for a product first, and then I can show you more details!`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, noProductMsg]);
        return true;
      }

      // Smart product selection based on user's query
      let productToShow = null;
      const lowerInput = input.toLowerCase();
      
      // Check for position keywords (first, second, last)
      if (/\b(first|1st|one)\b/i.test(lowerInput)) {
        productToShow = lastProducts[0];
      } else if (/\b(second|2nd|two)\b/i.test(lowerInput)) {
        productToShow = lastProducts[1] || lastProducts[0];
      } else if (/\b(third|3rd|three)\b/i.test(lowerInput)) {
        productToShow = lastProducts[2] || lastProducts[0];
      } else if (/\blast\b/i.test(lowerInput)) {
        productToShow = lastProducts[lastProducts.length - 1];
      } else {
        // Try to match by product name or brand
        for (const product of lastProducts) {
          const productName = (product.name || '').toLowerCase();
          const brandName = (product.brands?.name || '').toLowerCase();
          
          // Extract significant words from input (remove common words)
          const significantWords = lowerInput
            .replace(/\b(show|me|the|specs?|specification|details?|of|about|for|can|you|please|keyboard|mouse|laptop|ram|gpu)\b/gi, '')
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 2);
          
          // Check if any significant words match product name or brand
          const matchesProduct = significantWords.some(word => 
            productName.includes(word) || brandName.includes(word)
          );
          
          if (matchesProduct) {
            productToShow = product;
            break;
          }
        }
        
        // Default to first product if no specific match
        if (!productToShow) {
          productToShow = lastProducts[0];
          console.log('📍 Selected: DEFAULT (first product)');
        }
      }
      
      // Extract specifications from database
      let specificationsText = '';
      let hasSpecs = false;
      
      if (productToShow.selected_components && Array.isArray(productToShow.selected_components)) {
        productToShow.selected_components.forEach(component => {
          if (component.specifications) {
            hasSpecs = true;
            specificationsText += `\n**${component.name} Specifications:**\n`;
            const specs = typeof component.specifications === 'string' 
              ? JSON.parse(component.specifications) 
              : component.specifications;
            
            // Handle nested specifications properly
            Object.entries(specs).forEach(([key, value]) => {
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                // If value is an object, extract its properties
                Object.entries(value).forEach(([subKey, subValue]) => {
                  if (subValue) {
                    const formattedKey = subKey.replace(/([A-Z_])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
                    specificationsText += `• ${formattedKey}: ${subValue}\n`;
                  }
                });
              } else if (value && typeof value !== 'object') {
                // Simple value - display directly
                const formattedKey = key.replace(/([A-Z_])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
                specificationsText += `• ${formattedKey}: ${value}\n`;
              }
            });
          }
        });
      }
      
      // Also check top-level specifications field
      if (productToShow.specifications && typeof productToShow.specifications === 'object') {
        const specs = productToShow.specifications;
        
        Object.entries(specs).forEach(([key, value]) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            // This is a nested specification object (like the keyboard has)
            hasSpecs = true;
            
            // Check if this is a component ID (UUID format) or actual spec name
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
            
            if (!isUUID) {
              specificationsText += `\n**${key} Specifications:**\n`;
            } else {
              // If it's a UUID, don't show it as a heading, just show the specs
              if (!specificationsText.includes('**Product Specifications:**')) {
                specificationsText += `\n**Product Specifications:**\n`;
              }
            }
            
            // Extract the actual specification values
            Object.entries(value).forEach(([specKey, specValue]) => {
              if (specValue) {
                const formattedKey = specKey.replace(/([A-Z_])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
                specificationsText += `• ${formattedKey}: ${specValue}\n`;
              }
            });
          } else if (value && typeof value !== 'object') {
            // Simple value at top level
            hasSpecs = true;
            if (!specificationsText.includes('**Product Specifications:**')) {
              specificationsText += `\n**Product Specifications:**\n`;
            }
            const formattedKey = key.replace(/([A-Z_])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
            specificationsText += `• ${formattedKey}: ${value}\n`;
          }
        });
      }
      
      // If no specifications found in database, show a helpful message
      if (!hasSpecs) {
        const noSpecsMsg = {
          id: Date.now(),
          text: `**${productToShow.name}**\n\n💰 Price: ₱${formatCurrency(getNumericPrice(productToShow))}\n🏷️ Brand: ${productToShow.brands?.name || 'N/A'}\n📦 Stock: ${productToShow.stock_quantity || 0} units available\n\n${productToShow.description || 'No description available.'}\n\n⚠️ **Detailed specifications are not available for this product yet.** Our team is working on updating the product database with complete technical specifications.\n\nWould you like to:\n• Add this to your cart anyway?\n• See other similar products?\n• Ask about something else?`,
          sender: "ai",
          timestamp: new Date(),
          products: [productToShow],
        };
        
        setMessages(prev => [...prev, noSpecsMsg]);
        setIsTyping(false);
        return true;
      }

      // DIRECTLY format specifications without AI interpretation
      // This ensures 100% accuracy from database
      let formattedSpecsMessage = `**${productToShow.name}**\n\n`;
      formattedSpecsMessage += `💰 **Price:** ₱${formatCurrency(getNumericPrice(productToShow))}\n`;
      formattedSpecsMessage += `🏷️ **Brand:** ${productToShow.brands?.name || 'N/A'}\n`;
      formattedSpecsMessage += `📦 **Stock:** ${productToShow.stock_quantity || 0} units available\n`;
      
      if (productToShow.description) {
        formattedSpecsMessage += `\n📝 **Description:**\n${productToShow.description}\n`;
      }
      
      formattedSpecsMessage += `\n📋 **Specifications:**\n${specificationsText}`;
      formattedSpecsMessage += `\nWould you like to add this to your cart or see other options?`;

      const specsMsg = {
        id: Date.now(),
        text: formattedSpecsMessage,
        sender: "ai",
        timestamp: new Date(),
        products: [productToShow],
      };
      
      setMessages(prev => [...prev, specsMsg]);
      setMessages(prev => [...prev, specsMsg]);
      setIsTyping(false);
      return true;
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
      return matches;
    });

    // Check if user is asking to "show all" or clarifying, not adding
    const isClarificationOrShowAll = /(show|display|list|I mean|clarify|all of|view all)\s+(all|the|these|those)?\s+\w+/i.test(input);
    
    if (isClarificationOrShowAll) {
      return false; // Let product search handle it
    }

    if (isAddToCart) {
      // ===== EXTRACT QUANTITY ===== 🔢
      const quantity = extractQuantity(input);
      // Detect which product (first, second, last, by name, or just "one")
      let productToAdd = null;
      let productIndex = -1;

      // ===== CHECK FOR CONTEXTUAL REFERENCES ===== 🧠
      // "add the cheaper one", "add the first one", etc.
      const hasContextualRef = /the\s+(cheaper|cheapest|expensive|pricey|first|second|last|top)/i.test(input);
      
      if (hasContextualRef) {
        productToAdd = getContextualProduct(input);
        
        if (productToAdd) {
        } else {
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
        // Extract product name from input (remove command words)
        const productQuery = input
          .replace(/add|to|cart|my|the|this|that|it|one|please|can|you/gi, '')
          .trim();
        
        if (productQuery.length >= 3) {
          const fuzzyMatches = fuzzyMatchProduct(productQuery, products);
          
          if (fuzzyMatches.length > 0) {
            productToAdd = fuzzyMatches[0];
            console.log(`✅ FUZZY MATCH FOUND: "${productToAdd.name}" (${(fuzzyMatches[0].matchScore * 100).toFixed(1)}% confidence)`);
          } else {
          }
        }
      }

      // ===== FALLBACK: EXACT NAME MATCHING ===== 📝
      if (!productToAdd) {
        for (let i = 0; i < products.length; i++) {
          const productName = (products[i].name || products[i].title || '').toLowerCase();
          const productWords = productName.split(/\s+/);
          
          const matches = productWords.filter(word => {
            if (word.length >= 3) {
              const found = input.includes(word.toLowerCase());
              if (found) {
              }
              return found;
            }
            return false;
          });
          
          if (matches.length > 0) {
            productToAdd = products[i];
            productIndex = i;
            break;
          }
        }
      }

      // If no name match, use position keywords
      if (!productToAdd) {
        if (/first|1st/i.test(input)) {
          productToAdd = products[0];
          productIndex = 0;
        } else if (/second|2nd/i.test(input)) {
          productToAdd = products[1];
          productIndex = 1;
        } else if (/third|3rd/i.test(input)) {
          productToAdd = products[2];
          productIndex = 2;
        } else if (/last/i.test(input)) {
          productToAdd = products[products.length - 1];
          productIndex = products.length - 1;
        } else {
          // Default to first product
          productToAdd = products[0];
          productIndex = 0;
        }
      }

      if (productToAdd) {
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

        // Add to cart using CartContext function
        try {
          const result = await addToCart(cartItemData);
          if (!result || !result.success) {
            const errorMsg = {
              id: Date.now(),
              text: `Sorry, I couldn't add ${productToAdd.name || productToAdd.title} to your cart.\n\n${result?.error || 'Please try again or use the "Add to Cart" button on the product card.'}`,
              sender: "ai",
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, errorMsg]);
            return true;
          }

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
    const aiIntent = await analyzeIntentWithAI(userInput, products);
    
    if (aiIntent.isCommand && aiIntent.confidence > 0.7) {
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
            return false;
          }
        }
        
        case 'compare': {
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
        
        case 'view_cart': {
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
            return false;
          }
        }
        
        default:
          return false;
      }
    }
    
    console.log('⚠️ No command detected (confidence too low or not a command)');
    return false; // No command detected
  };

  // ============= END COMMAND DETECTION =============

  // 🆕 Handle quick action button clicks
  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    // Auto-send after a brief delay to show the user what was clicked
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !uploadedImage) return;

    // ===== CHECK RATE LIMIT =====
    if (rateLimitedUntil && new Date() < rateLimitedUntil) {
      const waitSeconds = Math.ceil((rateLimitedUntil - new Date()) / 1000);
      const rateLimitMsg = {
        id: Date.now(),
        text: `⏳ I'm currently experiencing high demand. Please wait ${waitSeconds} seconds before trying again. Thank you for your patience!`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, rateLimitMsg]);
      return;
    }

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

    // ===== CHECK FOR SIMPLE ACKNOWLEDGMENTS (DON'T SHOW PRODUCTS AGAIN) =====
    const simpleAcknowledgments = /^(oh\s+)?(that'?s?\s+)?(really\s+)?(good|great|nice|cool|awesome|okay|ok|alright|thanks|thank you|fine|perfect)(\s+thanks?)?[!.]*$/i;
    if (simpleAcknowledgments.test(userInput.trim())) {
      const ackResponses = [
        "Great! Let me know if you need anything else or have any questions!",
        "Awesome! I'm here if you need more help or want to explore other options.",
        "Glad you like it! Feel free to ask if you need more information.",
        "Perfect! Just let me know if there's anything else I can help you with.",
        "Nice! I'm here if you want to check out other products or need assistance."
      ];
      const ackMsg = {
        id: Date.now(),
        text: ackResponses[Math.floor(Math.random() * ackResponses.length)],
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, ackMsg]);
      setIsTyping(false);
      return;
    }

    // ===== DEFINITION & EDUCATIONAL QUESTIONS (HIGH PRIORITY) =====
    const definitionHandled = await handleComponentQuestion(userInput);
    if (definitionHandled) {
      return;
    }

    // ===== CHECK FOR BUDGET REFINEMENT (HIGH PRIORITY) =====
    const budgetRefined = await handleBudgetRefinement(userInput, updatedMessages);
    if (budgetRefined) {
      return;
    }

    // ===== CHECK FOR COMMANDS FIRST (HIGHEST PRIORITY) =====
    const commandExecuted = await detectAndExecuteCommand(userInput, updatedMessages);
    
    if (commandExecuted) {
      // Command was executed, no need to call AI
      return;
    }

    // ===== DETECT PRODUCT SEARCH QUERIES (SECOND PRIORITY) =====
    const productSearchResult = await detectAndHandleProductSearch(userInput);
    
    if (productSearchResult) {
      // Product search was handled, no need to call AI
      return;
    }

    // ===== NO COMMAND OR SEARCH DETECTED - CALL AI (FALLBACK) =====
    setIsTyping(true);

    // ===== CHECK CACHE FIRST =====
    const cacheKey = userInput.trim().toLowerCase();
    const cached = responseCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < 300000)) { // Cache valid for 5 minutes
      console.log('💾 Using cached response');
      const aiResponse = {
        id: messages.length + 2,
        text: cached.text,
        sender: "ai",
        timestamp: new Date(),
        products: cached.products,
        isGeneralQuestion: cached.isGeneralQuestion,
        categoryForViewMore: cached.categoryForViewMore,
      };
      setMessages((prev) => [...prev, aiResponse]);
      saveMessageToHistory(aiResponse);
      setIsTyping(false);
      return;
    }

    // Call real AI service with retry logic
    let retryAttempts = 0;
    const maxRetries = 2;
    
    while (retryAttempts <= maxRetries) {
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
        if (mentioned.length > 0) {
          console.log('📋 All extracted products:', mentioned.map(p => p.name));
          setRecommendedProducts(mentioned.slice(0, 5)); // Show top 5 products
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

        // ===== CACHE THE RESPONSE =====
        setResponseCache(prev => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, {
            text: response.message,
            products: mentioned.length > 0 ? mentioned.slice(0, 5) : null,
            isGeneralQuestion,
            categoryForViewMore,
            timestamp: Date.now()
          });
          // Limit cache size to 50 entries
          if (newCache.size > 50) {
            const firstKey = newCache.keys().next().value;
            newCache.delete(firstKey);
          }
          return newCache;
        });

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
        retryCountRef.current = 0; // Reset retry count on success
        break; // Exit retry loop on success
        
      } catch (error) {
        console.error('AI Error:', error);
        
        // Detect rate limit error (429)
        if (error.message && error.message.includes('429')) {
          console.warn('⏳ Rate limited by Groq API');
          
          // Set rate limit timeout (60 seconds)
          const limitUntil = new Date(Date.now() + 60000);
          setRateLimitedUntil(limitUntil);
          
          const rateLimitError = {
            id: messages.length + 2,
            text: `⏳ I'm experiencing high demand right now. Please wait about 60 seconds and try again.\n\nIn the meantime, you can:\n• Browse our products directly\n• Check out our PC bundles\n• View compatible components\n\nThank you for your patience! 😊`,
            sender: "ai",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, rateLimitError]);
          saveMessageToHistory(rateLimitError);
          break; // Don't retry on rate limit
        }
        
        // Retry logic for other errors
        retryAttempts++;
        if (retryAttempts <= maxRetries) {
          console.log(`🔄 Retrying... Attempt ${retryAttempts}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryAttempts)); // Exponential backoff
          continue;
        }
        
        // Max retries reached - show error
        let errorMessage = "I apologize, but I'm experiencing technical difficulties. Please try again or contact our support team for assistance.";
        
        if (error.message && error.message.includes('timeout')) {
          errorMessage = "The request took too long to process. Please try again with a simpler question.";
        } else if (error.message && error.message.includes('network')) {
          errorMessage = "I'm having trouble connecting. Please check your internet connection and try again.";
        }
        
        const errorResponse = {
          id: messages.length + 2,
          text: errorMessage,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
        saveMessageToHistory(errorResponse);
        break; // Exit retry loop
      }
    }
    
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
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

  const handleChatToggle = () => {
    setIsOpen(!isOpen);
  };

  // Handle closing with animation
  const handleCloseChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 280); // Match animation duration
  };

  // Add to cart function
  const handleAddToCart = async (product) => {
    try {
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

      if (result.error) {
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
          }
        }, 1000);
      }
    } catch (error) {
      const errorMsg = {
        id: Date.now(),
        text: `Sorry, something went wrong: ${error.message}. Please try again or add the product manually.`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Don't render on auth pages
  if (isAuthPage) {
    return null;
  }

  // Don't render until settings are loaded to prevent showing fallback logo
  if (settingsLoading) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes shake-bottom {
          0%, 100% {
            transform: rotate(0deg);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: rotate(-10deg);
          }
          20%, 40%, 60%, 80% {
            transform: rotate(10deg);
          }
        }
        
        .animate-spin-smooth {
          animation: shake-bottom 2s ease-in-out infinite;
          transform-origin: bottom center;
        }
      `}</style>
      
      {/* AI Chat Button - Only show when chat is closed */}
      {!isOpen && (
        <div className="fixed bottom-6 [@media(min-width:761px)]:bottom-8 right-4 [@media(min-width:761px)]:right-6 z-[600] flex items-end gap-3">
          {/* Speech Bubble */}
          <div className="animate-bounce-slow mb-1">
            <div className="relative">
              <div 
                key={helpMessageIndex}
                className="bg-[#1E90FF] text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg whitespace-nowrap animate-fade-in-left"
              >
                {helpMessages[helpMessageIndex]}
              </div>
              {/* Triangle tail pointing to button */}
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[10px] border-l-[#1E90FF]"></div>
              </div>
            </div>
          </div>
          
          {/* Chat Button */}
          <div className="animate-bounce-slow">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleChatToggle}
                  className="bg-white hover:bg-[#2dd817] border-2 border-solid border-[#2dd817] rounded-full p-1.5 [@media(min-width:761px)]:p-2 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-green-500/30 animate-pulse-glow overflow-hidden"
                  aria-label="AI Chatbox"
                >
                  <img
                    src={aiLogoUrl}
                    alt={aiName}
                    className="w-10 h-10 [@media(min-width:761px)]:w-12 [@media(min-width:761px)]:h-12 rounded-full object-cover animate-spin-smooth"
                  />
                </button>
              </TooltipTrigger>

            </Tooltip>
          </div>
        </div>
      )}

      {/* Chat Window - Enhanced with Expand/Collapse */}
      {(isOpen || isClosing) && (
        <div className={`fixed bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 ${isClosing ? 'animate-slide-down' : 'animate-slide-up'} ${
          isExpanded
            ? 'bottom-16 md:bottom-24 right-2 md:right-6 w-[calc(100%-32px)] md:w-[800px] h-[60vh] min-h-[300px] max-h-[calc(100vh-120px)] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] z-[600]'
            : 'bottom-16 md:bottom-24 right-2 md:right-6 w-[calc(100%-16px)] md:w-96 max-w-[400px] h-[55vh] min-h-[280px] max-h-[calc(100vh-120px)] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] z-[600]'
        }`}>
          {/* Header */}
          <div className="bg-green-500 text-white p-3 md:p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full overflow-hidden flex items-center justify-center">
                <img 
                  src={aiLogoUrl} 
                  alt={aiName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-base">{aiName}</h3>
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
                onClick={handleCloseChat}
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
                    
                    {/* Show animated recording indicator if recording */}
                    {message.isRecording ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {/* Animated sound wave bars */}
                          <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '12px', animationDelay: '0ms', animationDuration: '800ms' }}></div>
                          <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '20px', animationDelay: '150ms', animationDuration: '800ms' }}></div>
                          <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '16px', animationDelay: '300ms', animationDuration: '800ms' }}></div>
                          <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '24px', animationDelay: '450ms', animationDuration: '800ms' }}></div>
                          <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '18px', animationDelay: '600ms', animationDuration: '800ms' }}></div>
                        </div>
                        <span className="text-sm font-medium text-red-600">Listening...</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    )}
                    
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

                {/* 🆕 Quick Action Buttons - Show after first message */}
                {message.showQuickActions && message.sender === "ai" && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-start px-2">
                    <button
                      onClick={() => handleQuickQuestion("Track my order")}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium py-2 px-3 rounded-lg border border-orange-200 transition-colors flex items-center gap-1"
                    >
                      <span>📍</span>
                      <span>Track Order</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("What's your return policy?")}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium py-2 px-3 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                    >
                      <span>📦</span>
                      <span>Return/Refund</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("Help me build a PC")}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium py-2 px-3 rounded-lg border border-purple-200 transition-colors flex items-center gap-1"
                    >
                      <span>💻</span>
                      <span>Build a PC</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("Show me special deals and promotions")}
                      className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium py-2 px-3 rounded-lg border border-green-200 transition-colors flex items-center gap-1"
                    >
                      <span>🎁</span>
                      <span>View Deals</span>
                    </button>
                  </div>
                )}

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

                      {/* Find Compatible Parts - Intelligent AI-based */}
                      <button
                        onClick={() => handleFindCompatibleParts(message.products[0])}
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
                  <DotsLoader color="gray" />
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
                <TooltipTrigger asChild>
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
                <TooltipTrigger asChild>
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
                onKeyDown={handleKeyDown}
                placeholder={
                  uploadedImage
                    ? "Add a description (optional)..."
                    : isRecording
                    ? "Recording... Speak now!"
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
