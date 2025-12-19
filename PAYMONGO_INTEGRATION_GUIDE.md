# PayMongo GCash Integration Guide

## ✅ What's Been Implemented

### 1. Environment Setup
- Added PayMongo TEST API keys to `.env` file
- Secret Key: `sk_test_YOUR_SECRET_KEY_HERE`
- Public Key: `pk_test_YOUR_PUBLIC_KEY_HERE`

### 2. Services Created
- **PayMongoService.js** - Complete PayMongo API integration
  - Create GCash payment sources
  - Create payments from sources
  - Verify payment status
  - Handle redirects

### 3. Components Created
- **GCashPayment.jsx** - Standalone GCash payment component (for future use)
- **PaymentSuccess.jsx** - Success page after payment
- **PaymentFailed.jsx** - Failure page if payment fails

### 4. Updated Files
- **Payment.jsx** - Integrated GCash payment flow
- **App.jsx** - Added payment result routes
- **ADD_PAYMONGO_COLUMNS.sql** - Database migration for PayMongo fields

## 🎯 How It Works

### User Flow:
1. User adds items to cart
2. Goes to checkout
3. Selects delivery type (Local Delivery or Pickup)
4. Selects address (if Local Delivery)
5. Selects **GCash** as payment method
6. Clicks "Place Order"
7. **Redirects to GCash payment page**
8. User enters GCash number and approves in app
9. **Redirects back to success/failed page**
10. Order status updated automatically

### Technical Flow:
```
1. Create order with status="pending"
2. Create PayMongo GCash source
3. Store source_id in orders.paymongo_source_id
4. Redirect to GCash checkout URL
5. User pays on GCash
6. PayMongo redirects to /payment-success
7. Verify payment status
8. Create payment (charge the source)
9. Update order status="confirmed", payment_status="paid"
10. Show success message
```

## 📋 Setup Steps

### Step 1: Run Database Migration
Go to Supabase SQL Editor and run:
```sql
-- File: ADD_PAYMONGO_COLUMNS.sql
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS paymongo_source_id TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS paymongo_payment_id TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
```

### Step 2: Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Restart
npm run dev
```

### Step 3: Test Payment Flow

#### Test with GCash Test Account:
1. Go to checkout
2. Select "GCash" payment
3. Click "Place Order"
4. You'll be redirected to PayMongo test page
5. Use test GCash number: **09171234567**
6. Use any OTP code (e.g., **111111**)
7. Approve payment
8. You'll be redirected back to success page

## 🧪 Testing Mode

Currently using **TEST MODE** - no real money charged!

### Test Credentials:
- GCash Number: `09171234567` (or any valid format)
- OTP: Any 6-digit code (e.g., `111111`)

### Test Cards (for future):
- Success: `4343434343434345`
- Declined: `4571736000000075`

## 💡 What Happens Next

### Order Status Flow:
```
pending → confirmed (after payment) → processing → shipped → delivered
```

### Payment Status:
```
pending → paid (after GCash payment)
```

### Admin Can:
- See PayMongo payment ID in order details
- Track which orders were paid via GCash
- Verify payment status

## 🚀 Going Live (When Ready)

### To Use Real Payments:
1. Complete PayMongo KYB verification
2. Replace TEST keys with LIVE keys in `.env`:
   ```
   VITE_PAYMONGO_SECRET_KEY=sk_live_...
   VITE_PAYMONGO_PUBLIC_KEY=pk_live_...
   ```
3. Test with small amount first
4. Monitor PayMongo dashboard for transactions

### Live Fees:
- GCash: 2.5% per transaction
- No monthly fees
- Example: ₱1,000 order = ₱25 fee

## 📱 User Experience

### For Local Delivery:
1. Select address
2. Select GCash
3. Pay via GCash
4. Order delivered to address

### For Store Pickup:
1. Select pickup
2. Select GCash
3. Pay via GCash
4. Pick up order from store

## 🔒 Security

- API keys stored in `.env` (never commit to git)
- Payments processed by PayMongo (PCI-DSS compliant)
- Order verification before payment
- Secure redirects with order ID
- Payment status checked on return

## ❓ Troubleshooting

### Issue: "No checkout URL received"
- Check if API keys are correct in `.env`
- Restart development server after adding keys

### Issue: Payment not updating order
- Check Supabase logs
- Verify `payment_status` column exists
- Check console for errors

### Issue: Redirect not working
- Verify URLs in redirect config
- Check if running on correct port

## 📞 Support

PayMongo Support: support@paymongo.com
PayMongo Docs: https://developers.paymongo.com/

## ✨ Next Features (Optional)

- [ ] Add Maya e-wallet support
- [ ] Add credit card payment
- [ ] Add payment webhooks for real-time updates
- [ ] Add refund functionality
- [ ] Add payment history in user profile
- [ ] Send email after successful payment

## 🎉 You're Ready!

Your GCash payment integration is complete and ready for testing!
