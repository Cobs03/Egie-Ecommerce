# API Key Rotation Pool - Setup Guide 🔄

## Overview
Your AI shopping assistant now uses a **rotating API key pool** to bypass Groq's rate limits (30 requests/minute per key). By adding multiple API keys from your classmates, the system will automatically switch between them when one hits the rate limit.

## How It Works

### Automatic Key Rotation
- **Round-robin selection**: Keys are used in rotation
- **Rate limit detection**: When a 429 error occurs, the key is blocked for 60 seconds
- **Automatic switching**: System immediately switches to the next available key
- **Smart recovery**: Blocked keys are automatically unblocked after 60 seconds
- **Statistics tracking**: Monitor usage per key in browser console

### Benefits
- **No more waiting**: If one key is rate-limited, another takes over instantly
- **Higher throughput**: With 4 keys, you get ~120 requests/minute instead of 30
- **Zero downtime**: Users never see rate limit errors
- **Fair distribution**: Load is evenly distributed across all keys

## Setup Instructions

### Step 1: Collect API Keys from Classmates

Each classmate needs to:
1. Go to https://console.groq.com/keys
2. Sign in with their account
3. Click "Create API Key"
4. Copy their key (starts with `gsk_...`)
5. Share it with you

### Step 2: Add Keys to .env File

Open your `.env` file in the `Egie-Ecommerce` folder and update the `VITE_GROQ_API_KEYS` field:

```env
VITE_GROQ_API_KEYS=gsk_YOUR_KEY1,gsk_CLASSMATE1_KEY,gsk_CLASSMATE2_KEY,gsk_CLASSMATE3_KEY
```

**Important:**
- Separate keys with commas (no spaces)
- No quotes needed
- Keep all keys on one line
- You can add as many keys as you want

**Example:**
```env
VITE_GROQ_API_KEYS=gsk_YOUR_KEY_HERE,gsk_CLASSMATE1_KEY,gsk_CLASSMATE2_KEY,gsk_CLASSMATE3_KEY
```

### Step 3: Restart Development Server

After updating the .env file:

```powershell
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
```

## Monitoring API Key Usage

### View Statistics in Console

The system logs key rotation statistics every 50 requests. Open your browser's Developer Tools (F12) and check the Console:

```
[ApiKeyManager] Key Rotation Statistics:
  Total Requests: 150
  Successful Requests: 147
  Rate Limit Hits: 3
  
  Key Usage:
    Key 1 (gsk_Va...fS): 40 requests, 1 rate limits, last used 2s ago
    Key 2 (gsk_AB...56): 38 requests, 1 rate limits, last used 5s ago
    Key 3 (gsk_DE...12): 35 requests, 0 rate limits, last used 8s ago
    Key 4 (gsk_JK...78): 34 requests, 1 rate limits, last used 10s ago
```

### Manual Statistics Check

You can also manually check statistics in the browser console:

```javascript
// Get current statistics
apiKeyManager.getStats()

// View detailed logs
apiKeyManager.logStats()
```

## How Rate Limiting Works

### Groq API Limits (Free Tier)
- **30 requests per minute** per API key
- **14,400 requests per day** per API key
- **429 error** when limit exceeded

### Automatic Handling
1. **Request made** → Uses current key from rotation pool
2. **429 error detected** → Key blocked for 60 seconds
3. **Switch to next key** → Request retried with new key
4. **Success reported** → Statistics updated
5. **After 60 seconds** → Blocked key automatically unblocked

### Example Scenario

**With 1 key:**
- 30 requests/min → Hit limit → **Wait 60 seconds** ❌

**With 4 keys:**
- 120 requests/min → Key 1 hits limit → Switch to Key 2 → **No waiting!** ✅
- After 60s, Key 1 automatically available again

## Troubleshooting

### All Keys Are Rate-Limited
If all keys are blocked simultaneously, the system will:
1. Use the key that was blocked longest ago
2. Log a warning in the console
3. Continue working (may encounter rate limits)

**Solution:** Add more keys or reduce AI usage temporarily

### Invalid API Key Error
If you see authentication errors:
1. Check that keys are formatted correctly (start with `gsk_`)
2. Verify keys are comma-separated with no spaces
3. Ensure no quote marks around keys
4. Test each key individually at https://console.groq.com/playground

### Keys Not Rotating
If rotation isn't working:
1. Check browser console for error messages
2. Verify .env file is updated correctly
3. Restart the development server
4. Clear browser cache (Ctrl+Shift+Delete)

### Rate Limits Still Showing
This is normal behavior:
- The system logs rate limit hits for tracking
- Users should never see errors (automatic switching)
- If users see errors, check that multiple keys are configured

## Best Practices

### For You
1. **Use at least 3-4 keys** for smooth operation
2. **Monitor console logs** to see if more keys are needed
3. **Rotate contributors** - share the load fairly
4. **Keep keys secure** - don't commit .env to git

### For Classmates Contributing Keys
1. **Free tier is fine** - no paid account needed
2. **Keep their key secure** - only share with trusted team
3. **Monitor usage** at https://console.groq.com/usage
4. **Can revoke anytime** if needed

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit .env to GitHub**
   - Add `.env` to `.gitignore` (already done)
   - Never share .env file publicly

2. **Share keys securely**
   - Use private Discord DM or Messenger
   - Don't post in public channels
   - Delete messages after copying

3. **Revoke if compromised**
   - If a key is exposed publicly, revoke it immediately
   - Generate new key at https://console.groq.com/keys

4. **Separate dev/production**
   - Use different keys for development and production
   - Never use production keys in shared development

## Technical Details

### Implementation Files
- **`src/utils/apiKeyManager.js`** - API key rotation logic
- **`src/components/AIChatBox.jsx`** - 9 API call locations updated
- **`.env`** - API key configuration

### Key Features
- Round-robin rotation algorithm
- Automatic rate limit detection (429 status codes)
- 60-second blocking period for rate-limited keys
- Statistics tracking and logging
- Graceful fallback when all keys blocked

### API Endpoints Using Rotation
All Groq API calls in the AI assistant:
1. Cheaper product explanations
2. Product comparisons
3. Compatible product suggestions
4. Command intent detection
5. No results responses
6. Product introductions
7. Closing questions
8. No budget match responses
9. Budget detection

## FAQ

**Q: How many keys should I add?**
A: Start with 3-4 keys. If you see frequent rate limiting in console, add more.

**Q: Can I mix free and paid API keys?**
A: Yes! Paid keys have higher limits (6000 req/min) and will improve performance.

**Q: What if a classmate's key expires?**
A: The system will automatically skip expired keys and use remaining valid ones. Update .env to remove the expired key.

**Q: Does this cost anything?**
A: No, Groq's free tier (30 req/min) is sufficient. The rotation pool just combines multiple free tier keys.

**Q: Can I use this in production?**
A: Yes, but use a dedicated set of keys for production (don't mix dev/prod keys).

**Q: How do I know if it's working?**
A: Check browser console for "ApiKeyManager" logs showing key rotation and statistics.

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify .env configuration
3. Test each key individually
4. Restart development server
5. Clear browser cache

**Happy shopping with unlimited AI assistance!** 🚀
