# 🚀 Quick Start: AI Vision Image Search

## Installation

### 1. Install Required Dependencies

```bash
npm install axios
```

### 2. Configure API Keys

Choose **ONE** of the following options:

#### Option A: OpenAI Vision (⭐ Recommended)

1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env` file:

```env
VITE_VISION_API_PROVIDER=openai
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
VITE_OPENAI_VISION_MODEL=gpt-4o
```

#### Option B: Google Vision

1. Get API key from https://console.cloud.google.com/
2. Add to `.env` file:

```env
VITE_VISION_API_PROVIDER=google
VITE_GOOGLE_VISION_API_KEY=your-google-api-key-here
```

### 3. Run Setup Wizard (Optional)

```bash
node setup-vision.js
```

### 4. Start Development Server

```bash
npm run dev
```

## Usage

1. Open your app
2. Click the AI chat icon
3. Click the image upload button (📷)
4. Upload a product image
5. Optionally add a text description
6. AI will identify and find matching products!

## What's Changed

### ✅ New Files
- `src/services/VisionService.js` - AI Vision API integration
- `AI_VISION_SETUP.md` - Detailed documentation
- `setup-vision.js` - Interactive setup wizard
- `.env.example` - Configuration template
- `README_VISION.md` - This file

### ✅ Modified Files
- `src/components/AIChatBox.jsx` - Now uses real AI vision

## How It Works

### Before (Keyword Search)
```
User: [uploads image of RTX 4090]
User: "graphics card"
System: Searches for keyword "graphics card"
Result: Shows all graphics cards
```

### After (AI Vision)
```
User: [uploads image of RTX 4090]
AI Vision: Detects "NVIDIA RTX 4090, 24GB GDDR6X"
System: Matches based on brand, model, specs
Result: Shows RTX 4090 variants, prioritized by relevance
```

## Features

### 🎯 Intelligent Detection
- **Brand Recognition** - Identifies NVIDIA, AMD, Intel, etc.
- **Model Extraction** - Reads RTX 4090, Ryzen 9, etc.
- **Spec Detection** - Finds 16GB, 3200MHz, RGB, etc.
- **Category Identification** - GPU, CPU, Mouse, Keyboard, etc.

### 📊 Smart Matching
Products are scored based on:
- **Brand match** (30 points)
- **Model match** (50 points)  
- **Product type** (25 points)
- **Keywords** (5 points each)
- **Specifications** (8 points each)

### 🔄 Fallback Mode
If no API key is configured, system automatically falls back to keyword-based search with a helpful message.

## Testing

### Test 1: Upload Product Image
```
1. Find a high-quality image of any tech product
2. Upload through AI chat
3. Check if AI correctly identifies brand and model
4. Verify matching products are relevant
```

### Test 2: Test with Description
```
1. Upload image
2. Add text: "gaming mouse"
3. AI should combine vision + text for better results
```

### Test 3: Fallback Mode
```
1. Don't configure API keys
2. Upload image with description
3. Should work with keyword search
```

## Troubleshooting

### ❌ "axios is not defined"
**Solution:** Run `npm install axios`

### ⚠️ "Vision API Not Configured"
**Solution:** Add API keys to `.env` file

### 🔍 "No products found"
**Possible causes:**
- Product not in your database
- Poor image quality
- Need better keywords

**Solutions:**
- Add more products to database
- Use clearer product images
- Add text description with image

### 💰 "API quota exceeded"
**Solutions:**
- Check billing on OpenAI/Google dashboard
- Use lower detail mode (cheaper)
- Switch to Google (free tier)

## API Costs

### OpenAI Vision
- **gpt-4o:** $0.005 per image (high detail)
- **gpt-4-turbo:** $0.01 per image
- **gpt-4-vision:** $0.01 per image

Example: 1,000 images = $5.00 (gpt-4o)

### Google Vision
- **Free tier:** 1,000 images/month
- **After free:** $0.0015 per 1,000 images

Example: 10,000 images = $0.00 (first 1k) + $13.50 = $13.50

## Best Practices

### ✅ DO
- Use high-quality product images
- Include brand/model in image if possible
- Add text description for ambiguous images
- Monitor API usage regularly
- Start with OpenAI for best results

### ❌ DON'T
- Upload extremely large images (>5MB)
- Commit API keys to Git
- Use blurry or low-quality images
- Expect perfect results without descriptions
- Share API keys publicly

## Security

### Protecting API Keys

1. **Never commit `.env` file**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   ```

2. **Use environment variables in production**
   ```bash
   # Vercel, Netlify, etc.
   Add keys in dashboard settings
   ```

3. **Rotate keys regularly**
   - Every 3-6 months
   - Immediately if compromised

4. **Monitor usage**
   - Set up billing alerts
   - Check usage dashboard weekly

## Performance Tips

### Reduce Costs
```javascript
// In VisionService.js, line 91
image_url: {
  url: imageData,
  detail: 'low' // Change from 'high' to 'low'
}
```

### Improve Accuracy
- Use high-resolution images
- Ensure text (model numbers) is clear
- Include context in user message
- Fine-tune matching algorithm weights

## Support

### Documentation
- 📖 **Full Guide:** `AI_VISION_SETUP.md`
- 🔧 **Code:** `src/services/VisionService.js`
- 💬 **Chat:** `src/components/AIChatBox.jsx`

### External Resources
- [OpenAI Vision Docs](https://platform.openai.com/docs/guides/vision)
- [Google Vision Docs](https://cloud.google.com/vision/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [Google Pricing](https://cloud.google.com/vision/pricing)

## Next Steps

1. ✅ Install axios
2. ✅ Configure API keys
3. ✅ Test with sample images
4. ✅ Add more products to database
5. ✅ Monitor performance and costs

## Changelog

### v1.0.0 - Initial Release
- ✅ OpenAI Vision integration
- ✅ Google Vision integration
- ✅ Smart product matching
- ✅ Fallback keyword search
- ✅ Confidence scoring
- ✅ Multi-provider support

---

**🎉 Ready to go! Upload an image and see the magic happen!**

For detailed information, see: `AI_VISION_SETUP.md`
