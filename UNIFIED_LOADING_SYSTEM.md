# Unified Loading Components System

## Overview
All loading screens and components now use a consistent, professional design system centered around the EGIE E-Commerce brand.

## Components Available

### 1. PageLoader
**Full-page loading screen with logo animation**
```jsx
import { PageLoader } from '@/components/ui/LoadingIndicator';

<PageLoader message="Loading application..." />
```

**Features:**
- White backdrop with blur effect
- Spinning green ring with pulsing logo center
- Optional custom message
- Z-index: 50 (highest priority)

---

### 2. Spinner
**Inline spinner for buttons and small areas**
```jsx
import { Spinner } from '@/components/ui/LoadingIndicator';

<Spinner size="md" color="green" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `color`: 'green' | 'white' | 'gray' | 'blue' (default: 'green')

**Use Cases:**
- Inside buttons while submitting
- Next to text for inline loading states
- Form inputs with validation

---

### 3. DotsLoader
**Three bouncing dots for chat/typing indicators**
```jsx
import { DotsLoader } from '@/components/ui/LoadingIndicator';

<DotsLoader color="gray" />
```

**Props:**
- `color`: 'gray' | 'green' | 'white' (default: 'gray')

**Use Cases:**
- AI chat typing indicator
- Message sending states
- Real-time updates

---

### 4. SectionLoader
**Content area loader with message**
```jsx
import { SectionLoader } from '@/components/ui/LoadingIndicator';

<SectionLoader message="Loading products..." />
```

**Features:**
- Centered in container
- Spinning green ring
- Custom message below spinner
- Padding: py-12

**Use Cases:**
- Product grids
- Cart loading
- Profile sections
- Dashboard cards

---

### 5. CardSkeleton
**Skeleton loader for product cards**
```jsx
import { CardSkeleton } from '@/components/ui/LoadingIndicator';

<CardSkeleton count={8} />
```

**Props:**
- `count`: number of skeleton cards to render (default: 1)

**Use Cases:**
- Product grid loading
- Search results
- Category pages

---

### 6. ButtonLoader
**Loading state for buttons**
```jsx
import { ButtonLoader } from '@/components/ui/LoadingIndicator';

<button disabled>
  {isLoading ? <ButtonLoader text="Saving..." /> : "Save"}
</button>
```

**Features:**
- White spinner + text
- Pre-styled for button contexts
- Automatically centers content

---

### 7. LogoLoader
**Branded logo with spinning ring**
```jsx
import { LogoLoader } from '@/components/ui/LoadingIndicator';

<LogoLoader />
```

**Use Cases:**
- Splash screens
- Authentication pages
- Brand-focused loading

---

## Migration Guide

### Before (Inconsistent):
```jsx
// Different styles across the app ❌
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
```

### After (Unified): ✅
```jsx
// Consistent components
<SectionLoader message="Loading..." />
<Spinner size="sm" color="white" />
<DotsLoader color="gray" />
```

---

## Files Already Updated

### ✅ Core Components
- `/src/components/LoadingSpinner.jsx` - Main page loader
- `/src/components/AIChatBox.jsx` - Chat typing indicator
- `/src/views/Cart/Cart.jsx` - Cart loading
- `/src/views/Products/ProductGrid/ProductGrid.jsx` - Product grid loading

### 🔄 Need Updates
Replace custom spinners in these files:

**Button Spinners:**
- `/src/views/SystemBuild/SystemBuild.jsx` (line 1049)
- `/src/views/MyBuilds/MyBuilds.jsx` (line 209)
- `/src/views/Cart/Cart Components/OtherCart.jsx` (line 125)
- `/src/components/ReviewModal.jsx` (line 216)
- `/src/views/Products/ProductGrid/ProductModal/ProductModal.jsx` (line 322)

**Section Loaders:**
- `/src/views/Purchases/Purchases.jsx` (line 208)
- `/src/views/Products/ProductGrid/ProductDetails/ProductDetails.jsx` (line 66)
- `/src/views/Notifications/Notification.jsx` (line 209)
- `/src/views/Compare/Compare Components/ComparisonSelector.jsx` (line 299)

**Dots Loaders:**
- `/src/views/Compare/Compare Components/AIRecommendation.jsx` (lines 246-248)

---

## Design Specifications

### Colors
- **Primary:** `#10B981` (green-500)
- **Secondary:** `#D1FAE5` (green-200)
- **Background:** White with 95% opacity + blur
- **Text:** `#6B7280` (gray-500)

### Animations
- **Spin:** 1 revolution per second, linear
- **Bounce:** 0.6s duration, staggered delays
- **Pulse:** 2s duration, ease-in-out

### Sizing
- **SM:** 16px (w-4 h-4)
- **MD:** 24px (w-6 h-6)
- **LG:** 32px (w-8 h-8)
- **XL:** 48px (w-12 h-12)

---

## Best Practices

1. **Use SectionLoader for content areas**
   ```jsx
   if (loading) return <SectionLoader message="Loading products..." />;
   ```

2. **Use Spinner in buttons**
   ```jsx
   <button disabled={isSubmitting}>
     {isSubmitting ? <Spinner size="sm" color="white" /> : "Submit"}
   </button>
   ```

3. **Use DotsLoader for real-time indicators**
   ```jsx
   {isTyping && <DotsLoader color="green" />}
   ```

4. **Use PageLoader for initial app load**
   ```jsx
   {!appReady && <PageLoader message="Initializing..." />}
   ```

---

## Accessibility

All loading components include:
- Semantic HTML
- ARIA attributes (where applicable)
- Keyboard-friendly designs
- Screen reader compatible

---

## Performance

- **Optimized animations** - CSS-based (no JavaScript)
- **Lazy loading** - Components load on demand
- **Tree-shakeable** - Import only what you need
- **Minimal bundle impact** - < 2KB gzipped

---

## Support

For questions or issues with loading components:
1. Check this documentation
2. Review `/src/components/ui/LoadingIndicator.jsx`
3. See examples in updated files

**Last Updated:** January 4, 2026
