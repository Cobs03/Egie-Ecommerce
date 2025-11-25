# 🏷️ Dynamic Brand Filtering System

## Overview
This guide documents the dynamic brand filtering system where brands update based on selected category.

---

## 🎯 Feature Requirements

### What You Wanted
1. ✅ Click "Processor" category → Show only brands that have processors
2. ✅ Click "RAM" category → Show only brands that have RAM
3. ✅ Click "All Products" (navbar) → Show all brands from all products
4. ✅ Brand filter updates dynamically when category changes
5. ✅ Replace static brand list with database-driven list

---

## 🛠️ Implementation

### 1. Created BrandService (NEW!)
**Path**: `ECOMMERCE_SOFTWARE/Egie-Ecommerce/src/services/BrandService.js`

**Methods**:

#### `getBrandsByCategory(categoryId)`
- Fetches brands that have products in a specific category
- Returns unique brands with their details (id, name, slug, logo_url)
- Used when a category is selected (e.g., "Processor", "RAM")

```javascript
static async getBrandsByCategory(categoryId) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      brand_id,
      brands!inner(id, name, slug, logo_url)
    `)
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .not('brand_id', 'is', null)
  
  // Extract unique brands and return sorted by name
}
```

#### `getBrandsWithProducts()`
- Fetches all brands that have any active products
- Used when "All Products" is selected (no category filter)

```javascript
static async getBrandsWithProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      brand_id,
      brands!inner(id, name, slug, logo_url)
    `)
    .eq('status', 'active')
    .not('brand_id', 'is', null)
  
  // Extract unique brands and return sorted by name
}
```

---

### 2. Updated SearchFill Component
**Path**: `ECOMMERCE_SOFTWARE/Egie-Ecommerce/src/views/Products/Product Components/SearchFill.jsx`

**Changes**:

#### Added Props
```javascript
const SearchFill = ({ filters, onChange, selectedCategory }) => {
  // selectedCategory: UUID of selected category or null for "All Products"
}
```

#### Dynamic Brand Loading
```javascript
useEffect(() => {
  const fetchBrands = async () => {
    setLoadingBrands(true);
    
    if (selectedCategory) {
      // Category selected → Get brands for that category
      result = await BrandService.getBrandsByCategory(selectedCategory);
    } else {
      // No category (All Products) → Get all brands with products
      result = await BrandService.getBrandsWithProducts();
    }

    setAllBrands(result.data);
    setLoadingBrands(false);
  };

  fetchBrands();
}, [selectedCategory]); // Re-fetch when category changes
```

#### Auto-clear Selected Brands
```javascript
// Clear selected brands when category changes (better UX)
useEffect(() => {
  setSelectedBrands([]);
  onChange({ brands: [] });
}, [selectedCategory]);
```

#### Updated Brand Checkbox UI
```javascript
{(showAllBrands ? allBrands : allBrands.slice(0, 4)).map((brand) => (
  <label key={brand.id} className="flex items-center cursor-pointer">
    <input
      type="checkbox"
      value={brand.id}  // Now uses brand.id instead of brand name
      checked={selectedBrands.includes(brand.id)}
      onChange={() => toggleBrand(brand.id)}
    />
    <span className="ml-3 text-gray-300">{brand.name}</span>
  </label>
))}
```

#### Added Show All/Less Button
```javascript
{allBrands.length > 4 && (
  <button onClick={() => setShowAllBrands(!showAllBrands)}>
    {showAllBrands ? "Show Less" : `Show All (${allBrands.length})`}
  </button>
)}
```

---

### 3. Updated Products Component
**Path**: `ECOMMERCE_SOFTWARE/Egie-Ecommerce/src/views/Products/Products.jsx`

**Change**: Pass selectedCategory to SearchFill
```javascript
<SearchFill 
  filters={filters} 
  onChange={handleFilterChange} 
  selectedCategory={selectedCategory}  // ← NEW!
/>
```

---

### 4. Updated ProductService
**Path**: `ECOMMERCE_SOFTWARE/Egie-Ecommerce/src/services/ProductService.js`

**Method**: `getFilteredProducts()`

**Changes**:

#### Added Brand Join
```javascript
let query = supabase
  .from('products')
  .select(`
    *,
    brands!inner(id, name, slug, logo_url)  // ← JOIN brands table
  `)
  .eq('status', 'active')
```

#### Added Brand Filter
```javascript
// Apply brand filter (array of brand IDs)
if (filters.brands && filters.brands.length > 0) {
  query = query.in('brand_id', filters.brands)
}
```

#### Flatten Brand Data
```javascript
const processedData = data.map(product => ({
  ...product,
  brand: product.brands,
  brand_name: product.brands?.name || 'Unknown'
}));
```

---

### 5. Updated ProductGrid Component
**Path**: `ECOMMERCE_SOFTWARE/Egie-Ecommerce/src/views/Products/ProductGrid/ProductGrid.jsx`

**Changes**:

#### Pass Brand Filter to Supabase
```javascript
const supabaseFilters = {
  category: selectedCategory,
  brands: filters.brands,  // ← NEW! Array of brand IDs
  minPrice: filters.minPrice,
  maxPrice: filters.maxPrice,
  inStock: true
};
```

#### Update Dependencies
```javascript
useEffect(() => {
  setFilters(supabaseFilters);
}, [selectedCategory, filters.brands, filters.minPrice, filters.maxPrice, setFilters]);
//                    ^^^^^^^^^^^^^^ Added brand filter dependency
```

#### Remove Client-Side Brand Filtering
```javascript
// REMOVED: Client-side brand filtering (now done by Supabase)
// if (filters.brands && filters.brands.length > 0) {
//   filteredProducts = filteredProducts.filter((p) =>
//     filters.brands.includes(p.brand)
//   );
// }
```

---

## 🎨 User Flow

### Scenario 1: Click "Processor" Category
```
User clicks "Processor" category
        ↓
Products.jsx: setSelectedCategory(processorCategoryId)
        ↓
SearchFill.jsx: useEffect detects category change
        ↓
BrandService.getBrandsByCategory(processorCategoryId)
        ↓
Query: SELECT DISTINCT brands FROM products WHERE category_id = processorCategoryId
        ↓
Returns: [Intel, AMD, ...] (only brands with processors)
        ↓
SearchFill displays: Intel, AMD checkboxes
        ↓
User checks "Intel"
        ↓
ProductGrid filters: category=Processor AND brand_id=Intel
        ↓
Shows: Only Intel processors ✅
```

### Scenario 2: Click "All Products" (Navbar)
```
User clicks "All Products" in navbar
        ↓
Products.jsx: setSelectedCategory(null)
        ↓
SearchFill.jsx: useEffect detects category change
        ↓
BrandService.getBrandsWithProducts()
        ↓
Query: SELECT DISTINCT brands FROM products (all categories)
        ↓
Returns: [Intel, AMD, Corsair, Kingston, Samsung, ...] (all brands)
        ↓
SearchFill displays: All available brands
        ↓
User checks "Corsair"
        ↓
ProductGrid filters: No category filter AND brand_id=Corsair
        ↓
Shows: All Corsair products (RAM, PSU, Keyboards, etc.) ✅
```

### Scenario 3: Switch Between Categories
```
User on "Processor" category (sees Intel, AMD)
        ↓
User clicks "RAM" category
        ↓
SearchFill: Brands auto-clear (UX improvement)
        ↓
BrandService.getBrandsByCategory(ramCategoryId)
        ↓
Returns: [Corsair, Kingston, G.SKILL, ...] (only RAM brands)
        ↓
SearchFill displays: New brand list for RAM
        ↓
Intel/AMD checkboxes disappear (they don't make RAM)
        ↓
Corsair/Kingston checkboxes appear ✅
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERACTION                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Category Component: User clicks "Processor"             │
│  → setSelectedCategory(processorCategoryId)              │
└─────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│    SearchFill.jsx        │  │   ProductGrid.jsx         │
│  useEffect triggers      │  │  useEffect triggers       │
│  on category change      │  │  on category change       │
└──────────────────────────┘  └──────────────────────────┘
              │                       │
              ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   BrandService           │  │   ProductService          │
│ .getBrandsByCategory()   │  │ .getFilteredProducts()    │
└──────────────────────────┘  └──────────────────────────┘
              │                       │
              ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                      │
│                                                          │
│  brands table:        products table:                    │
│  - id                 - id                               │
│  - name               - category_id                      │
│  - slug               - brand_id                         │
│  - logo_url           - name, price, etc.                │
└─────────────────────────────────────────────────────────┘
              │                       │
              ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  SearchFill updates:     │  │  ProductGrid displays:    │
│  - Intel checkbox        │  │  - Intel Core i7-13700K   │
│  - AMD checkbox          │  │  - AMD Ryzen 7 7700X      │
│  (Only processor brands) │  │  (Only processors)        │
└──────────────────────────┘  └──────────────────────────┘
```

---

## ✅ Testing Guide

### Test 1: Category-Specific Brands
1. Go to Products page
2. Click "Processor" category
3. Check brand filter sidebar
4. ✅ Should show: Intel, AMD (processor brands only)
5. Should NOT show: Corsair, Kingston (they don't make processors)

### Test 2: All Products Brands
1. Click "All Products" in navbar
2. Check brand filter sidebar
3. ✅ Should show: All brands (Intel, AMD, Corsair, Kingston, Samsung, etc.)

### Test 3: Brand Filter Works
1. Select "Processor" category
2. Check "Intel" brand
3. ✅ Should show: Only Intel processors
4. Uncheck "Intel", check "AMD"
5. ✅ Should show: Only AMD processors

### Test 4: Brands Auto-Clear on Category Change
1. Select "Processor" category
2. Check "Intel" brand
3. Products show: Intel processors
4. Click "RAM" category
5. ✅ Intel checkbox should auto-uncheck
6. ✅ Brand list should update to RAM brands
7. ✅ Products should show: All RAM (not filtered by Intel anymore)

### Test 5: Show All Brands
1. Click "All Products"
2. If more than 4 brands exist:
3. ✅ Should show: First 4 brands + "Show All (X)" button
4. Click "Show All"
5. ✅ Should expand: All brands visible
6. Click "Show Less"
7. ✅ Should collapse: Back to 4 brands

### Test 6: Multiple Brand Selection
1. Select "RAM" category
2. Check "Corsair" and "Kingston"
3. ✅ Should show: Products from both Corsair AND Kingston
4. Uncheck "Kingston"
5. ✅ Should show: Only Corsair products

---

## 🐛 Troubleshooting

### Issue 1: Brands don't update when changing category
**Cause**: selectedCategory not passed to SearchFill  
**Solution**: Verify Products.jsx passes `selectedCategory={selectedCategory}` to SearchFill

### Issue 2: No brands showing
**Cause**: No products in database or brand_id is null  
**Solution**: 
```sql
-- Check if products have brands assigned
SELECT COUNT(*) FROM products WHERE brand_id IS NOT NULL;

-- Check brands table
SELECT * FROM brands WHERE is_active = true;
```

### Issue 3: Brand filter not working
**Cause**: ProductService not filtering by brand_id  
**Solution**: Verify ProductService.getFilteredProducts() has:
```javascript
if (filters.brands && filters.brands.length > 0) {
  query = query.in('brand_id', filters.brands)
}
```

### Issue 4: Brands show but products don't filter
**Cause**: useProducts hook not passing brand filter  
**Solution**: Check ProductGrid.jsx passes brands in supabaseFilters:
```javascript
const supabaseFilters = {
  category: selectedCategory,
  brands: filters.brands,  // Must be here!
  // ...
};
```

---

## 📊 Database Schema

### brands table
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### products table (relevant fields)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand_id UUID REFERENCES brands(id),  -- Foreign key to brands
  category_id UUID REFERENCES product_categories(id),  -- Foreign key to categories
  price DECIMAL(10, 2),
  status VARCHAR(20),  -- 'active', 'draft', 'archived'
  -- ... other fields
);
```

---

## 🎯 Key Points

### Static → Dynamic Migration
- **Before**: Hardcoded brand list in SearchFill
- **After**: Dynamic list from database based on category

### Brand Filtering
- **Before**: Filter by brand name (string)
- **After**: Filter by brand_id (UUID) - more reliable

### UX Improvements
- Auto-clear selected brands when category changes
- Show "Loading brands..." state
- Show "No brands available" if none found
- "Show All / Show Less" for long brand lists

### Performance
- Brands fetched once per category change
- Products filtered server-side (Supabase)
- No unnecessary client-side filtering

---

## 📝 Summary

✅ **Created**: BrandService with category-aware brand fetching  
✅ **Updated**: SearchFill to fetch brands dynamically  
✅ **Updated**: ProductService to filter by brand_id  
✅ **Updated**: ProductGrid to pass brand filter  
✅ **Improved**: UX with auto-clear and show all/less  

**Result**: Clicking a category now shows only brands that have products in that category!

---

**Created**: November 2024  
**Status**: ✅ Complete  
**Testing**: Required in production environment
