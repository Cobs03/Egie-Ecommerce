# 🎓 STUDENT QUICK REFERENCE

## 🆓 Get FREE Google Vision API (5 Minutes!)

### Step 1: Sign Up (2 min)
```
🌐 Go to: https://console.cloud.google.com/
📧 Sign in with Gmail
💰 Accept $300 FREE credit (90 days)
```

### Step 2: Enable API (2 min)
```
🔍 Search: "Cloud Vision API"
✅ Click "Enable"
🔑 Go to: Credentials → Create → API Key
📋 Copy your key (starts with "AIza...")
```

### Step 3: Configure Project (1 min)
```bash
# In your .env file:
VITE_VISION_API_PROVIDER=google
VITE_GOOGLE_VISION_API_KEY=AIza...your-key-here
```

### Step 4: Test It!
```bash
npm run dev
```

---

## 📊 What You Get FREE

| Resource | Amount | Duration |
|----------|--------|----------|
| **Images/month** | 1,000 | Forever |
| **Bonus Credit** | $300 | 90 days |
| **Extra Images** | 200,000 | (with $300 credit) |

**Total First 90 Days: ~201,000 images FREE!** 🎉

---

## ⚡ Alternative: OpenAI (If You Want Best Accuracy)

### Free Trial
```
🌐 https://platform.openai.com/
💰 $5 credit for new users (3 months)
📸 = 1,000 GPT-4o images
```

### GitHub Student Pack
```
🎓 https://education.github.com/pack
✅ Verify student status
💎 Get premium tools free
🔍 Check for OpenAI credits
```

---

## 🛡️ Security Checklist

```bash
# 1. Create .env file
touch .env

# 2. Add to .gitignore
echo ".env" >> .gitignore

# 3. NEVER commit API keys!
git status  # Check .env is not tracked
```

---

## 🚨 Common Issues

### ❌ "API key not valid"
**Fix:** 
1. Check key is correct
2. Enable Vision API in console
3. Wait 1-2 minutes after creation

### ❌ "Quota exceeded"
**Fix:**
1. Check usage in Google Console
2. You get 1,000 FREE per month
3. Use $300 credit for more

### ❌ "Billing not enabled"
**Fix:**
1. Must enable billing for free trial
2. No charges - you have $300 credit!
3. Set billing alert at $50 (safe)

---

## 💡 Pro Tips

### 1. Monitor Usage
```
Google Console → APIs → Dashboard
Set alert at 500 images (50%)
```

### 2. Test First
```bash
node test-vision.js
```

### 3. Start Small
```
Test with 10-20 images
Verify accuracy
Then scale up
```

### 4. Optimize
```javascript
// Compress images before upload
// Cache results to avoid duplicates
// Use batch processing if possible
```

---

## 📱 Quick Links

| What | Link |
|------|------|
| **Google Console** | https://console.cloud.google.com/ |
| **Enable API** | https://console.cloud.google.com/apis/library |
| **Get Key** | https://console.cloud.google.com/apis/credentials |
| **Check Usage** | https://console.cloud.google.com/apis/dashboard |
| **Student Pack** | https://education.github.com/pack |
| **OpenAI** | https://platform.openai.com/ |

---

## 🎯 Success Path

```
[1] Create Google Cloud account (2 min)
     ↓
[2] Enable Vision API (1 min)
     ↓
[3] Get API key (1 min)
     ↓
[4] Add to .env file (30 sec)
     ↓
[5] Test: npm run dev (30 sec)
     ↓
[6] Upload image in app
     ↓
[7] 🎉 Watch AI identify product!
```

**Total Time: ~5 minutes**
**Cost: $0 (FREE!)**

---

## 💬 Need More Help?

1. **Read Full Guide:** `STUDENT_FREE_API_GUIDE.md`
2. **Check Setup Docs:** `AI_VISION_SETUP.md`
3. **Run Test Script:** `node test-vision.js`
4. **Check Console Logs:** Browser DevTools

---

## ✅ Final Checklist

```
✅ Google Cloud account created
✅ Vision API enabled
✅ API key generated
✅ Key added to .env
✅ .env in .gitignore
✅ Test successful
✅ Ready to use!
```

---

**🎓 You're all set! Go build something amazing! 🚀**

**Remember:** 1,000 free images per month + $300 credit = plenty for your project!
