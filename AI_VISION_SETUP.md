# AI Vision Image Search - Setup Guide

## Overview

This feature enables real image recognition using AI Vision APIs. Users can upload product images and the system will automatically identify and find similar products in your database - **no text description needed!**

## Features

✅ **Real Image Recognition** - AI identifies products from images
✅ **Multi-Provider Support** - OpenAI Vision or Google Vision
✅ **Smart Product Matching** - Matches based on brand, model, specs, and features
✅ **Fallback Mode** - Works without API keys (keyword-based)
✅ **Confidence Scoring** - Shows how confident the AI is about matches

## Quick Start

### Option 1: OpenAI Vision API (⭐ RECOMMENDED)

**Why OpenAI?**
- More accurate for tech products
- Better at reading text in images (model numbers, specs)
- Understands context and descriptions
- Latest GPT-4o model optimized for vision

**Setup Steps:**

1. **Get API Key**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Configure Environment**
   ```bash
   # In your .env file
   VITE_VISION_API_PROVIDER=openai
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   VITE_OPENAI_VISION_MODEL=gpt-4o
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

**Pricing:** 
- GPT-4o: $0.005 per image (high detail)
- GPT-4-turbo: $0.01 per image
- Very affordable for most use cases

---

### Option 2: Google Vision API

**Why Google?**
- Excellent label detection
- Great for general object recognition
- Strong text detection (OCR)
- Logo detection

**Setup Steps:**

1. **Get API Key**
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing
   - Enable "Cloud Vision API"
   - Go to Credentials → Create Credentials → API Key
   - Copy the key

2. **Configure Environment**
   ```bash
   # In your .env file
   VITE_VISION_API_PROVIDER=google
   VITE_GOOGLE_VISION_API_KEY=your-google-api-key-here
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

**Pricing:**
- First 1,000 images/month: FREE
- After: $1.50 per 1,000 images

---

## How It Works

### 1. Image Upload
User uploads a product image through the AI chat interface.

### 2. AI Analysis
The Vision API analyzes the image and extracts:
- **Product Type** (GPU, CPU, Mouse, Keyboard, etc.)
- **Brand** (NVIDIA, AMD, Intel, Logitech, etc.)
- **Model Number** (RTX 4090, Ryzen 9 7950X, etc.)
- **Specifications** (16GB, 3200MHz, RGB, etc.)
- **Features** (Gaming, Wireless, Mechanical, etc.)

### 3. Smart Matching
The system matches vision data with your database products using:
- Brand matching (30 points)
- Model matching (50 points)
- Product type (25 points)
- Keyword matching (5-8 points each)
- Specification matching (8 points each)

### 4. Results
Shows top 5 matching products sorted by relevance score.

---

## Usage Example

### User Uploads Image of RTX 4090

**AI Detects:**
```json
{
  "productType": "Graphics Card",
  "brand": "NVIDIA",
  "model": "RTX 4090",
  "specifications": ["24GB", "GDDR6X"],
  "keywords": ["gpu", "gaming", "nvidia", "geforce"],
  "confidence": 0.95
}
```

**System Matches:**
- NVIDIA GeForce RTX 4090 Gaming OC (Score: 113)
- NVIDIA RTX 4090 Founders Edition (Score: 108)
- ASUS ROG Strix RTX 4090 (Score: 98)

---

## Code Architecture

### Files Added/Modified

1. **`src/services/VisionService.js`** (NEW)
   - Main Vision API integration
   - Handles OpenAI and Google Vision
   - Smart product matching algorithm

2. **`src/components/AIChatBox.jsx`** (MODIFIED)
   - Imports VisionService
   - Uses real AI analysis
   - Fallback to keyword search if API not configured

3. **`.env.example`** (MODIFIED)
   - Added Vision API configuration

4. **`AI_VISION_SETUP.md`** (NEW)
   - This documentation file

---

## Testing

### Test Without API Keys (Fallback Mode)
```bash
# Don't set any Vision API keys
npm run dev
```
System will warn and fall back to keyword-based search.

### Test With OpenAI Vision
```bash
# Set in .env
VITE_VISION_API_PROVIDER=openai
VITE_OPENAI_API_KEY=sk-your-key

npm run dev
```

### Test Images
Upload images of:
- Graphics cards with visible brand/model
- Processors in boxes
- Gaming peripherals (mouse, keyboard)
- RAM modules
- Monitors

---

## Advanced Configuration

### Adjust Model for Cost vs Accuracy

```bash
# Highest accuracy (default)
VITE_OPENAI_VISION_MODEL=gpt-4o

# Balanced
VITE_OPENAI_VISION_MODEL=gpt-4-turbo

# Budget (lower detail)
# Modify VisionService.js line 91: detail: 'low'
```

### Customize Product Matching

Edit `VisionService.js` → `matchProducts()` function:

```javascript
// Adjust scoring weights
if (visionData.brand && productData.brand.includes(...)) {
  score += 30; // Change this number
}
```

### Add Custom Product Categories

Edit `VisionService.js` → `identifyProductType()`:

```javascript
const categories = {
  'Your Category': ['keyword1', 'keyword2'],
  // ... existing categories
};
```

---

## Troubleshooting

### ⚠️ "Vision API Not Configured" Message
**Solution:** Set API keys in `.env` file and restart server.

### ❌ "Failed to analyze image"
**Possible Causes:**
1. Invalid API key → Check key in OpenAI/Google console
2. API quota exceeded → Check billing dashboard
3. Image too large → Compress image (max 5MB)
4. Invalid image format → Use JPG/PNG

### 🔍 No Products Found
**Possible Causes:**
1. Product not in database
2. Image quality too poor
3. No matching keywords
**Solution:** Add more products or improve image quality

### 💰 High API Costs
**Solutions:**
1. Use `detail: 'low'` in OpenAI requests (cheaper)
2. Switch to Google Vision (free tier)
3. Cache vision results (TODO: implement caching)
4. Limit image size before uploading

---

## API Comparison

| Feature | OpenAI Vision | Google Vision |
|---------|--------------|---------------|
| **Accuracy for Tech Products** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Model Number Detection** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Brand Detection** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Free Tier** | ❌ | ✅ 1k/month |
| **Cost After Free** | $0.005/image | $0.0015/image |
| **Setup Difficulty** | Easy | Medium |
| **Context Understanding** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Recommendation:** Start with OpenAI Vision for best results.

---

## Future Enhancements

### Planned Features:
- [ ] Result caching to reduce API calls
- [ ] Image preprocessing (auto-crop, enhance)
- [ ] Multi-image comparison
- [ ] Vision result history
- [ ] Admin dashboard for vision analytics
- [ ] Custom model fine-tuning
- [ ] Batch image processing

---

## Security Best Practices

### ✅ DO:
- Store API keys in `.env` file (never commit!)
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate keys periodically
- Monitor API usage

### ❌ DON'T:
- Commit API keys to Git
- Share keys publicly
- Hardcode keys in source code
- Use same key for dev/prod

---

## Support

### Need Help?
1. Check troubleshooting section above
2. Review OpenAI/Google Vision documentation
3. Check console logs for errors
4. Test with example images first

### Resources:
- **OpenAI Vision Docs:** https://platform.openai.com/docs/guides/vision
- **Google Vision Docs:** https://cloud.google.com/vision/docs
- **OpenAI Pricing:** https://openai.com/pricing
- **Google Pricing:** https://cloud.google.com/vision/pricing

---

## License & Attribution

This feature uses third-party APIs:
- OpenAI GPT-4 Vision (https://openai.com)
- Google Cloud Vision (https://cloud.google.com/vision)

Please review their terms of service before production use.

---

## Changelog

### Version 1.0.0 (Current)
- ✅ OpenAI Vision integration
- ✅ Google Vision integration
- ✅ Smart product matching algorithm
- ✅ Fallback keyword search
- ✅ Confidence scoring
- ✅ Multi-provider support

---

**🎉 You're all set! Upload an image and let AI do the magic!**
