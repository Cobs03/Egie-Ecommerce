# Quick Start: Deploy Card Payment Edge Function

## 🚀 Quick Commands (Copy & Paste)

```powershell
# 1. Navigate to project
cd c:\Users\mjtup\OneDrive\Desktop\ECOMMERCEANDADMIN\ECOMMERCE_SOFTWARE\Egie-Ecommerce

# 2. Install Supabase CLI (if needed)
npm install -g supabase

# 3. Login
supabase login

# 4. Link your project (replace YOUR_PROJECT_REF with your actual project reference)
supabase link --project-ref YOUR_PROJECT_REF

# 5. Set PayMongo secrets (replace with your actual keys from PayMongo dashboard)
supabase secrets set PAYMONGO_SECRET_KEY=sk_test_your_key_here
supabase secrets set PAYMONGO_PUBLIC_KEY=pk_test_your_key_here

# 6. Deploy the function
supabase functions deploy process-card-payment
```

## ✅ Verification Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase CLI
- [ ] Project linked
- [ ] PayMongo secrets set in Supabase
- [ ] Edge Function deployed successfully
- [ ] Test payment with card `4343 4343 4343 4345`
- [ ] Order created in database
- [ ] Payment intent ID saved to order
- [ ] Stock deducted automatically

## 🔑 Where to Get PayMongo API Keys

1. Go to: https://dashboard.paymongo.com/developers
2. Copy **Secret Key** (starts with `sk_test_`)
3. Copy **Public Key** (starts with `pk_test_`)
4. Use these in Step 5 above

## 🧪 Test Cards

| Card | Result |
|------|--------|
| `4343 4343 4343 4345` | Success (no 3DS) |
| `4571 7360 0000 0183` | Success (with 3DS redirect) |
| `4120 0000 0000 0007` | Declined |

**Expiry:** Any future date (e.g., `12/25`)  
**CVV:** Any 3 digits (e.g., `123`)  
**Name:** Any name (e.g., `JUAN DELA CRUZ`)

## 🎯 What This Does

Your PayMongo API keys are now stored **securely on Supabase servers**, not in your frontend code. This means:

✅ API keys are **never exposed** in browser DevTools  
✅ Payment processing happens **server-side** (secure)  
✅ Frontend only sends card details to **your own Supabase function**  
✅ Same secure pattern as your existing GCash integration  

## 📖 Full Guide

For detailed explanation, see: `CARD_PAYMENT_EDGE_FUNCTION_SETUP.md`

## 💡 Common Issues

**Issue:** "PayMongo secret key not configured"  
**Fix:** Make sure you ran Step 5 (supabase secrets set)

**Issue:** "Function not found"  
**Fix:** Make sure you deployed the function (Step 6)

**Issue:** Payment works but stock not deducting  
**Fix:** Your trigger `trigger_deduct_stock_on_payment_paid` is already working! Check orders table to verify.

---

**Ready to test? Follow the 6 steps above!** 🚀
