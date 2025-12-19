# Compatible Products Testing Guide

## What We Just Implemented

The **Compatible Components** section now shows real products from your database that have matching compatibility tags with the current product.

## How It Works

### 1. Database Query
When you view a product details page, the system:
- Checks if the product has `compatibility_tags`
- Queries the database for other products with ANY matching tags
- Excludes the current product from results
- Only shows active products
- Limits to 12 results (with pagination)

### 2. The Query Behind the Scenes
```javascript
// Example: Current product has tags: ['AMD AM5', 'DDR5', 'PCIe 4.0']
const { data } = await supabase
  .from('products')
  .select('*')
  .overlaps('compatibility_tags', ['AMD AM5', 'DDR5', 'PCIe 4.0'])
  .neq('id', currentProductId) // Don't show current product
  .eq('status', 'active')
  .limit(12);
```

### 3. What Shows Up
- Product image
- Product name
- Up to 2 matching tags (with "+X" if more)
- Price
- Stock availability
- Clickable to open product modal

## Testing Steps

### Step 1: Add Tags to Multiple Products

**Example Setup:**

**Product A: ASUS ROG Strix B650 Motherboard**
- Tags: `AMD AM5`, `DDR5`, `PCIe 4.0`, `ATX`

**Product B: AMD Ryzen 7 7700X CPU**
- Tags: `AMD AM5`, `DDR5`

**Product C: Corsair Vengeance 32GB RAM**
- Tags: `DDR5`, `AMD AM5`, `Intel LGA1700`

**Product D: Samsung 980 PRO SSD**
- Tags: `M.2 NVMe`, `PCIe 4.0`

### Step 2: View Product Details

1. Go to your customer-facing store
2. Click on **Product A (Motherboard)**
3. Scroll down to see "Compatible Components" section
4. You should see:
   - Product B (CPU) - matches: AMD AM5, DDR5
   - Product C (RAM) - matches: DDR5, AMD AM5
   - Product D (SSD) - matches: PCIe 4.0

### Step 3: Verify Matching Logic

**Click on Product B (CPU):**
- Should show Product A (Motherboard) and Product C (RAM) as compatible
- Both share `AMD AM5` and `DDR5` tags

**Click on Product D (SSD):**
- Should show Product A (Motherboard) as compatible
- Both share `PCIe 4.0` tag

## Example Tag Strategy for PC Components

### Motherboards
```
Tags: [Socket Type, RAM Type, Storage Support, Form Factor]
Example: ['AMD AM5', 'DDR5', 'M.2 NVMe', 'PCIe 4.0', 'ATX']
```

### CPUs
```
Tags: [Socket Type, RAM Support]
Example: ['AMD AM5', 'DDR5']
```

### RAM
```
Tags: [RAM Type, Compatible Platforms]
Example: ['DDR5', 'AMD AM5', 'Intel LGA1700']
```

### Storage (SSD/HDD)
```
Tags: [Interface, Speed]
Example: ['M.2 NVMe', 'PCIe 4.0']
```

### GPUs
```
Tags: [Slot Size, Power Connector]
Example: ['Dual Slot', '8-pin PCIe']
```

### Power Supplies
```
Tags: [Connectors, Form Factor]
Example: ['24-pin ATX', '8-pin EPS', '8-pin PCIe', 'ATX']
```

## Troubleshooting

### No Compatible Products Showing?

**Check 1: Product has tags**
```sql
SELECT name, compatibility_tags 
FROM products 
WHERE id = 'your-product-id';
```

**Check 2: Other products have matching tags**
```sql
-- Find products with 'AMD AM5' tag
SELECT name, compatibility_tags 
FROM products 
WHERE 'AMD AM5' = ANY(compatibility_tags);
```

**Check 3: Products are active**
```sql
SELECT name, status 
FROM products 
WHERE status = 'active';
```

### Products Not Matching Correctly?

**Issue:** Tags don't match exactly
- ❌ Wrong: `AMD-AM5` vs `AMD AM5`
- ✅ Correct: `AMD AM5` (consistent formatting)

**Solution:** Use the suggested tags in admin to maintain consistency

### Loading Forever?

**Check browser console for errors:**
```javascript
// Open browser DevTools (F12)
// Look for errors like:
// - "RLS policy violation" → Database permissions issue
// - "Column doesn't exist" → Migration not run
```

## Advanced: Category-Specific Matching

If you want to show ONLY CPUs when viewing a motherboard:

```javascript
// Get the CPU category ID first
const cpuCategoryId = 'your-cpu-category-id';

// Query only CPUs with matching tags
const { data } = await supabase
  .from('products')
  .select('*')
  .overlaps('compatibility_tags', product.compatibility_tags)
  .contains('selected_components', [{ id: cpuCategoryId }])
  .neq('id', product.id)
  .limit(6);
```

## Benefits

✅ **Automatic matching** - Once tags are set, it just works
✅ **Cross-category recommendations** - Motherboard shows CPUs, RAM, Storage
✅ **Accurate compatibility** - Based on real specs (socket types, etc.)
✅ **Scalable** - Add new products with tags, they automatically appear
✅ **Fast queries** - GIN index makes tag searches quick

## Next Steps

1. **Add tags to all products** in admin panel
2. **Test by viewing products** in customer store
3. **Verify compatible products show up** correctly
4. **Refine tags** if matching isn't accurate

## Need More Control?

If you need to manually specify which products are compatible (not just tag-based), let me know and we can implement the manual mapping approach!
