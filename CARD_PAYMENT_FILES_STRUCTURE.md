# 📁 Card Payment Files Structure

## Complete File Organization

```
Egie-Ecommerce/
│
├── 📄 .env (Updated - PayMongo keys removed)
│   └── ⚠️ Comment added: Use Supabase secrets instead
│
├── 📚 Documentation (NEW)
│   ├── CARD_PAYMENT_QUICK_START.md ⭐ Start here!
│   ├── CARD_PAYMENT_EDGE_FUNCTION_SETUP.md (Detailed guide)
│   └── CARD_PAYMENT_COMPLETE_SUMMARY.md (This overview)
│
├── supabase/
│   └── functions/
│       ├── _shared/
│       │   └── cors.ts (NEW - CORS headers for Edge Functions)
│       │
│       ├── create-gcash-source/ ✅ Existing
│       │   └── index.ts
│       │
│       └── process-card-payment/ 🆕 NEW
│           └── index.ts (Card payment Edge Function)
│
└── src/
    ├── services/
    │   ├── PayMongoService.js ⚠️ OLD (Don't use - insecure)
    │   │   └── Direct API calls (exposes keys)
    │   │
    │   └── PayMongoEdgeFunctionService.js ✅ UPDATED
    │       ├── createGCashSource() (existing)
    │       ├── processCardPayment() 🆕 NEW
    │       ├── createPayment() (existing)
    │       └── getSource() (existing)
    │
    └── views/
        └── Checkout/
            └── Checkout Components/
                └── Payment.jsx ✅ UPDATED
                    ├── handleCODPayment() (existing)
                    ├── handleGCashPayment() (existing)
                    └── handleCardPayment() 🔄 REFACTORED
                        └── Now uses Edge Function (secure)
```

## 🔄 Changes Summary

### Created Files (NEW)
```
✨ supabase/functions/process-card-payment/index.ts
✨ supabase/functions/_shared/cors.ts
✨ CARD_PAYMENT_QUICK_START.md
✨ CARD_PAYMENT_EDGE_FUNCTION_SETUP.md
✨ CARD_PAYMENT_COMPLETE_SUMMARY.md
```

### Modified Files (UPDATED)
```
🔄 src/services/PayMongoEdgeFunctionService.js
   └── Added: processCardPayment() method

🔄 src/views/Checkout/Checkout Components/Payment.jsx
   └── Updated: handleCardPayment() to use Edge Function

🔄 .env
   └── Removed: PayMongo keys (moved to Supabase secrets)
```

### Deprecated Files (DON'T USE)
```
⚠️ src/services/PayMongoService.js
   └── Reason: Exposes API keys in browser (security risk)
   └── Status: Kept for reference, but NOT imported in Payment.jsx
```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER (Browser)                        │
│  src/views/Checkout/Checkout Components/Payment.jsx         │
│                                                              │
│  [Card Form] → handleCardPayment()                          │
│      ↓                                                       │
│  PayMongoEdgeFunctionService.processCardPayment()           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS Request
                       ↓
┌─────────────────────────────────────────────────────────────┐
│               SUPABASE EDGE FUNCTION (Server)                │
│  supabase/functions/process-card-payment/index.ts           │
│                                                              │
│  1. Get PAYMONGO_SECRET_KEY from Supabase secrets 🔒       │
│  2. Create PayMongo Payment Method                          │
│  3. Create PayMongo Payment Intent                          │
│  4. Attach Payment Method to Intent                         │
│  5. Return payment status + redirect URL                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ PayMongo API Call (with secret key)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   PAYMONGO API (External)                    │
│  https://api.paymongo.com/v1/                               │
│                                                              │
│  - Validates card details                                   │
│  - Processes payment                                        │
│  - Handles 3D Secure authentication                         │
│  - Returns payment intent status                            │
└──────────────────────┬──────────────────────────────────────┘
                       │ Response
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE DATABASE                           │
│  Orders Table                                                │
│                                                              │
│  - order_id                                                 │
│  - payment_method = 'credit_card'                           │
│  - paymongo_payment_intent_id = 'pi_xxx' ← Stored here     │
│  - payment_status = 'pending' or 'paid'                     │
│                                                              │
│  Trigger: trigger_deduct_stock_on_payment_paid              │
│  When: payment_status changes to 'paid'                     │
│  Action: Deduct stock from products table                   │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Security Architecture

### Old Architecture (INSECURE)
```
Browser → PayMongoService.js (with VITE_PAYMONGO_SECRET_KEY from .env)
              ↓
         PayMongo API

❌ Problems:
   - Secret key visible in browser DevTools
   - Anyone can inspect .env variables via browser
   - Keys sent over network in plain text
```

### New Architecture (SECURE)
```
Browser → PayMongoEdgeFunctionService.js
              ↓
         Supabase Edge Function (PAYMONGO_SECRET_KEY from Supabase secrets)
              ↓
         PayMongo API

✅ Benefits:
   - Secret key NEVER exposed to browser
   - Keys stored on Supabase servers
   - Server-side processing (PCI compliant)
   - Same pattern as GCash integration
```

## 🎯 Integration Points

### Frontend Integration
```javascript
// File: src/views/Checkout/Checkout Components/Payment.jsx

// OLD (Insecure):
import PayMongoService from '../../../services/PayMongoService';
const result = await PayMongoService.createPaymentIntent(...);

// NEW (Secure):
import PayMongoEdgeFunctionService from '../../../services/PayMongoEdgeFunctionService';
const result = await PayMongoEdgeFunctionService.processCardPayment(...);
```

### Edge Function Integration
```typescript
// File: supabase/functions/process-card-payment/index.ts

// Get secret key from Supabase (NOT from .env)
const secretKey = Deno.env.get('PAYMONGO_SECRET_KEY')

// Use secret key in API calls
fetch('https://api.paymongo.com/v1/payment_methods', {
  headers: {
    'Authorization': `Basic ${btoa(secretKey + ':')}`
  }
})
```

### Database Integration
```sql
-- File: database/SIMPLIFIED_STOCK_DEDUCTION.sql

-- Trigger 1: For online payments (GCash, Card)
CREATE TRIGGER trigger_deduct_stock_on_payment_paid
AFTER UPDATE ON payments
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.payment_method != 'cod')
EXECUTE FUNCTION deduct_stock_on_payment_paid();

-- Trigger 2: For COD payments
CREATE TRIGGER trigger_deduct_stock_on_order_confirm
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (NEW.status = 'confirmed' AND OLD.status = 'pending')
EXECUTE FUNCTION deduct_stock_on_order_confirm();
```

## 📋 Deployment Steps (Quick Reference)

```powershell
# 1. Install CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
supabase link --project-ref YOUR_PROJECT_REF

# 4. Set secrets (IMPORTANT!)
supabase secrets set PAYMONGO_SECRET_KEY=sk_test_your_key
supabase secrets set PAYMONGO_PUBLIC_KEY=pk_test_your_key

# 5. Deploy function
supabase functions deploy process-card-payment

# 6. Test
# Go to checkout page, use card: 4343 4343 4343 4345
```

## 🧪 Testing Checklist

- [ ] Install Supabase CLI
- [ ] Deploy Edge Function
- [ ] Set PayMongo secrets
- [ ] Test with card: 4343 4343 4343 4345
- [ ] Verify order created in database
- [ ] Verify payment intent ID stored
- [ ] Verify stock deducted
- [ ] Test 3DS card: 4571 7360 0000 0183
- [ ] Test declined card: 4120 0000 0000 0007
- [ ] Check PayMongo dashboard for payments

## 💡 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| "PayMongo secret key not configured" | Run: `supabase secrets set PAYMONGO_SECRET_KEY=sk_test_xxx` |
| "Function not found" | Run: `supabase functions deploy process-card-payment` |
| "Payment works but no stock deduction" | Check trigger is enabled in database |
| "Card validation error" | Check card number is 15-16 digits, expiry is MM/YY, CVV is 3-4 digits |

## 🎊 You're All Set!

Start with: **CARD_PAYMENT_QUICK_START.md**

Then read: **CARD_PAYMENT_EDGE_FUNCTION_SETUP.md** for details.

**Happy deploying!** 🚀
