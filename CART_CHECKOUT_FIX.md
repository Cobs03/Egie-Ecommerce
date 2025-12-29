# Cart Checkout Fix - Selected Items Only

## Issue Fixed
Previously, when users checked/unchecked items in the cart and clicked "Proceed to Checkout", **all cart items** were being sent to checkout regardless of which items were actually selected. This has been fixed.

## Solution Overview
The fix implements a proper selection tracking system across the cart and checkout flow:

1. **CartContext** - Stores selected items globally
2. **Cart.jsx** - Uses context for selection state
3. **Order.jsx** - Filters and passes only selected items to checkout
4. **OrderSum.jsx** - Displays only the selected items

## Files Modified

### 1. CartContext.jsx
**Location:** `src/context/CartContext.jsx`

**Changes:**
- Added `selectedItems` state (Set) to track which items user checked
- Added `checkoutItems` array to store filtered items for checkout page
- Both are cleared on logout and cart clear
- Exposed in context value for components to use

```jsx
// New state
const [selectedItems, setSelectedItems] = useState(new Set());
const [checkoutItems, setCheckoutItems] = useState([]);

// Added to context value
selectedItems,
setSelectedItems,
checkoutItems,
setCheckoutItems,
```

### 2. Cart.jsx
**Location:** `src/views/Cart/Cart.jsx`

**Changes:**
- Removed local `selectedItems` state
- Now uses `selectedItems` and `setSelectedItems` from CartContext
- Selection state now persists across navigation

```jsx
// Before
const [selectedItems, setSelectedItems] = useState(new Set());

// After
const { 
  selectedItems,
  setSelectedItems,
} = useCart();
```

### 3. Order.jsx
**Location:** `src/views/Cart/Cart Components/Order.jsx`

**Changes:**
- Added imports: `cartItems`, `selectedItems`, `setCheckoutItems` from context
- Enhanced `handleCheckout` validation:
  - Checks if any items are selected (new validation)
  - Checks if delivery method is selected (existing)
  - Shows specific error messages for each case
- Filters cart items to only include selected ones
- Saves filtered items to `checkoutItems` before navigation

```jsx
const handleCheckout = (e) => {
  e.preventDefault();
  
  // Filter only selected items for checkout
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  
  // Check if any items are selected
  if (selectedCartItems.length === 0) {
    setError("Please select at least one item to checkout");
    setIsExpanded(true);
    return;
  }
  
  // Check if delivery method is selected
  if (!deliveryType) {
    setError("Please select a delivery method before proceeding");
    setIsExpanded(true);
    return;
  }
  
  // Save selected items to context before navigation
  setCheckoutItems(selectedCartItems);
  
  // Proceed to checkout
  navigate("/checkout");
};
```

### 4. OrderSum.jsx
**Location:** `src/views/Checkout/Checkout Components/OrderSum.jsx`

**Changes:**
- Added `checkoutItems` from context
- Uses `checkoutItems` instead of all `cartItems` for display
- Recalculates `subtotal` based on selected items only
- Falls back to all cart items if `checkoutItems` is empty (backward compatibility)

```jsx
// Import checkoutItems
const { checkoutItems } = useCart();

// Use checkout items if available
const itemsToDisplay = checkoutItems.length > 0 ? checkoutItems : dbCartItems;

// Recalculate subtotal from selected items
const subtotal = itemsToDisplay.reduce((sum, item) => {
  return sum + (item.price_at_add * item.quantity);
}, 0);
```

## How It Works Now

### User Flow:
1. **Cart Page:**
   - User sees all cart items with checkboxes
   - User can check/uncheck individual items
   - "Select All" checkbox for convenience
   - Selected items tracked in `selectedItems` Set

2. **Click "Proceed to Checkout":**
   - System validates at least one item is selected
   - System validates delivery method is selected
   - Filters `cartItems` to only include items in `selectedItems` Set
   - Saves filtered list to `checkoutItems` in context
   - Navigates to `/checkout`

3. **Checkout Page:**
   - Displays only items from `checkoutItems`
   - Calculates subtotal from selected items only
   - Total = (selected items subtotal) + shipping - voucher discount

### Error Messages:
- **No items selected:** "Please select at least one item to checkout"
- **No delivery method:** "Please select a delivery method before proceeding"

## Testing Checklist

✅ Select some items (not all) and checkout
✅ Try to checkout without selecting any items
✅ Try to checkout without selecting delivery method
✅ Verify subtotal matches selected items only
✅ Select all items and checkout
✅ Uncheck all items and verify error
✅ Test on both desktop and mobile views

## Technical Notes

### Why Use Context Instead of Navigation State?
Using React Router's `navigate(path, { state: {...} })` would work but:
- State is lost on page refresh
- Can't be accessed by other components easily
- Context provides better persistence and accessibility

### Set vs Array for selectedItems
Using `Set` for `selectedItems` provides:
- O(1) lookup time with `.has(id)`
- No duplicates by design
- Easy add/remove with `.add()` and `.delete()`

### Backward Compatibility
The OrderSum fallback ensures:
```jsx
const itemsToDisplay = checkoutItems.length > 0 ? checkoutItems : dbCartItems;
```
- If `checkoutItems` is empty (shouldn't happen in normal flow)
- Falls back to showing all cart items
- Prevents checkout page from being completely blank

## Future Improvements (Optional)

1. **Clear checkoutItems on successful order:**
   - After order placement, clear `checkoutItems` array
   - Prevents old data from persisting

2. **Save selection preference:**
   - Remember which items user typically selects
   - Could use localStorage for persistence

3. **Multi-select shortcuts:**
   - "Select Favorites" button
   - "Select by Category" filter
   - Keyboard shortcuts (Ctrl+A, etc.)

4. **Visual feedback:**
   - Show count of selected items in checkout button
   - "3 items selected" text near checkout button
   - Highlight selected items differently

## Commit Message

```
fix: Cart checkout now only includes selected/checked items

Previously all cart items would be sent to checkout regardless of checkbox state.

Changes:
- CartContext: Added selectedItems Set and checkoutItems array
- Cart.jsx: Now uses context for selection state
- Order.jsx: Filters cart items before checkout navigation, validates selection
- OrderSum.jsx: Displays only checkoutItems with recalculated subtotal

Validation added:
- Requires at least one item selected
- Shows specific error messages
- Expands delivery options on error

Fixes #[issue-number]
```
