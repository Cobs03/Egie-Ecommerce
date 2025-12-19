# PayMongo Edge Function Setup Guide

This guide shows you how to deploy secure Supabase Edge Functions for PayMongo integration, keeping your secret key safe on the server.

## 🔐 Why Edge Functions?

- **Security**: Secret key never exposed in frontend code
- **Server-side**: All PayMongo API calls happen on Supabase servers
- **Safe**: Frontend only sends order data, not API credentials
- **Best Practice**: Recommended by PayMongo and Supabase

## 📋 Prerequisites

1. Supabase CLI installed
2. Supabase project linked
3. PayMongo test/live secret key

## 🚀 Installation Steps

### Step 1: Install Supabase CLI

```powershell
# Windows (using Scoop)
scoop install supabase

# OR download from: https://github.com/supabase/cli/releases
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser for authentication.

### Step 3: Link Your Project

```bash
cd C:\Users\mjtup\OneDrive\Desktop\ECOMMERCEANDADMIN\ECOMMERCE_SOFTWARE\Egie-Ecommerce

supabase link --project-ref mhhnfftaoihhltbknenq
```

**Project Reference ID**: `mhhnfftaoihhltbknenq` (from your Supabase URL)

### Step 4: Set PayMongo Secret Key

```bash
# For TEST mode
supabase secrets set PAYMONGO_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Later, for LIVE mode (when your account is activated)
supabase secrets set PAYMONGO_SECRET_KEY=sk_live_YOUR_LIVE_KEY
```

**Important**: This secret is stored securely on Supabase servers, never in your code!

### Step 5: Deploy Edge Functions

```bash
# Deploy all three functions
supabase functions deploy create-gcash-source
supabase functions deploy create-payment
supabase functions deploy get-source-status
```

You should see:
```
✓ Deployed Function create-gcash-source
✓ Deployed Function create-payment
✓ Deployed Function get-source-status
```

## 📝 Update Your Frontend Code

### Replace PayMongoService with PayMongoEdgeFunctionService

In `Payment.jsx`, change the import:

```javascript
// OLD (insecure - exposes secret key)
import PayMongoService from '../../services/PayMongoService';

// NEW (secure - uses Edge Functions)
import PayMongoService from '../../services/PayMongoEdgeFunctionService';
```

In `PaymentSuccess.jsx`, make the same change:

```javascript
// OLD
import PayMongoService from '../../services/PayMongoService';

// NEW
import PayMongoService from '../../services/PayMongoEdgeFunctionService';
```

**That's it!** The rest of your code stays the same because `PayMongoEdgeFunctionService` has the same methods.

## ✅ Testing

1. **Restart your dev server** (if running)
2. Go to checkout and select **GCash payment**
3. Check browser console for:
   ```
   Calling Edge Function: create-gcash-source
   Amount: 4600 PHP
   GCash source created: src_xxxxx
   ```
4. You should be redirected to PayMongo's test page
5. Use test credentials:
   - **GCash Number**: `09171234567`
   - **OTP**: Any 6 digits (e.g., `111111`)

## 🔍 View Function Logs

To see what's happening on the server:

```bash
supabase functions logs create-gcash-source
supabase functions logs create-payment
supabase functions logs get-source-status
```

Or view all logs:

```bash
supabase functions logs --all
```

## 🛠️ Troubleshooting

### Error: "PAYMONGO_SECRET_KEY not configured"

```bash
# Check if secret is set
supabase secrets list

# If not listed, set it again
supabase secrets set PAYMONGO_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

### Error: "Failed to invoke function"

1. Check if functions are deployed:
   ```bash
   supabase functions list
   ```

2. Redeploy if needed:
   ```bash
   supabase functions deploy create-gcash-source
   ```

### Error: "API key does not exist"

This means:
- Your PayMongo account verification is incomplete
- Complete steps 3-5 at: https://dashboard.paymongo.com/activate
- Even TEST keys need basic verification

### CORS Error

If you get CORS errors, the Edge Functions already include CORS headers. Make sure you're calling them through the Supabase client, not direct fetch.

## 📂 Edge Function Structure

```
supabase/
  functions/
    create-gcash-source/
      index.ts          ← Creates PayMongo source
    create-payment/
      index.ts          ← Creates payment from source
    get-source-status/
      index.ts          ← Checks source status
```

## 🔄 Updating Functions

If you need to modify a function:

1. Edit the file in `supabase/functions/[function-name]/index.ts`
2. Redeploy:
   ```bash
   supabase functions deploy [function-name]
   ```

## 🌐 Function URLs

Your Edge Functions are available at:

```
https://mhhnfftaoihhltbknenq.supabase.co/functions/v1/create-gcash-source
https://mhhnfftaoihhltbknenq.supabase.co/functions/v1/create-payment
https://mhhnfftaoihhltbknenq.supabase.co/functions/v1/get-source-status
```

But you should always call them through the Supabase client (`supabase.functions.invoke()`) for automatic authentication.

## 🎉 Benefits of This Approach

✅ **Secure**: Secret key stays on server  
✅ **Simple**: Same code structure as before  
✅ **Scalable**: Supabase handles all server infrastructure  
✅ **Free**: Generous free tier for Edge Functions  
✅ **Best Practice**: Industry-standard approach  

## 🔐 Security Notes

- **Never commit** secret keys to Git
- **Never expose** secret keys in frontend code
- **Always use** environment variables or Supabase secrets
- **Edge Functions** automatically handle authentication
- **HTTPS only** - all traffic encrypted

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [PayMongo API Docs](https://developers.paymongo.com/docs)
- [PayMongo Authentication](https://developers.paymongo.com/docs/authentication)

## 🚀 Going Live

When ready for production:

1. Get your LIVE secret key from PayMongo dashboard
2. Update the secret:
   ```bash
   supabase secrets set PAYMONGO_SECRET_KEY=sk_live_YOUR_LIVE_KEY
   ```
3. No code changes needed - functions automatically use the new key!

---

**Need help?** Check the function logs or contact support.
