# 🤖 AI Assistant - Voice Command Guide

Your AI Assistant now understands natural language commands! You can control it with simple phrases instead of clicking buttons.

## 🛒 Add to Cart Commands

Tell the AI to add products to your cart using natural language:

### Examples:
- "**add to cart**"
- "**add this to my cart**"
- "**put it in my cart**"
- "**I'll take this one**"
- "**buy this**"
- "**add the first one**" (selects first product)
- "**add the second one**" (selects second product)
- "**add the last one**" (selects last product)

### How it works:
1. AI shows you products (e.g., after image search or product query)
2. You type: "add to cart" or "add this one"
3. AI automatically adds it to your cart ✅
4. Default quantity: 1 unit
5. Default variant: First available option

---

## 📋 Show Details Commands

Get detailed information about products:

### Examples:
- "**show me details**"
- "**tell me more about this**"
- "**what are the specs?**"
- "**specifications**"
- "**more info**"
- "**show details of the first one**"
- "**tell me about the second product**"

### Response includes:
- ✅ Full product name
- ✅ Price
- ✅ Stock availability
- ✅ Rating
- ✅ Complete specifications
- ✅ Feature list

---

## ⚖️ Compare Products Commands

Compare multiple products side-by-side:

### Examples:
- "**compare these**"
- "**compare them**"
- "**what's the difference?**"
- "**which one is better?**"
- "**help me choose**"

### Requirements:
- At least 2 products must be shown
- Products should be from the same category
- AI will show side-by-side comparison

---

## 💰 Find Cheaper Options Commands

Search for more affordable alternatives:

### Examples:
- "**show me cheaper options**"
- "**anything more affordable?**"
- "**budget options**"
- "**less expensive**"
- "**save money**"
- "**lower price**"

### What you get:
- Products in the same category
- Lower price than current selection
- Up to 5 alternatives

---

## 🎯 Product Selection Keywords

Target specific products in the list:

- "**first**" or "**1st**" → First product
- "**second**" or "**2nd**" → Second product  
- "**third**" or "**3rd**" → Third product
- "**last**" → Last product in the list
- "**this**" or "**that**" or "**one**" → First product (default)

### Examples:
- "add the second one to cart"
- "show details of the last product"
- "compare the first and third"

---

## 💡 Usage Tips

### 1. **Natural Language Works!**
You don't need exact phrases. The AI understands variations:
- ✅ "add to cart" = "put in my cart" = "I'll buy this"
- ✅ "show details" = "tell me more" = "what are the specs"

### 2. **Context Matters**
Commands work on the **last set of products shown**:
```
You: "show me processors"
AI: [Shows 3 processors]
You: "add the first one"  ← Works! ✅
```

### 3. **Combine with Image Search**
Upload image → AI finds products → Use commands:
```
You: [Uploads Intel CPU image]
AI: [Shows Intel Core i7-13700K]
You: "add to cart"  ← Instant add! ✅
```

### 4. **No Products = No Commands**
Commands only work when products are visible:
```
You: "what's the weather?"
AI: "I help with PC parts..."
You: "add to cart"  ← Won't work (no products) ❌
```

---

## 🔄 Command Flow Example

### Scenario 1: Image Search + Add to Cart
```
User: [Uploads AMD Ryzen image]
AI: "Found: AMD Ryzen 7 5800X"
    [Shows product card]

User: "add to cart"
AI: "✅ I've added AMD Ryzen 7 5800X (₱12,500) to your cart!"
```

### Scenario 2: Product Query + Details + Add
```
User: "show me gaming keyboards"
AI: [Shows 3 keyboards]

User: "show details of the second one"
AI: [Shows specs for keyboard #2]

User: "looks good, add it"
AI: "✅ Added to cart!"
```

### Scenario 3: Compare + Choose + Add
```
User: "available RAMs"
AI: [Shows 4 RAM options]

User: "compare these"
AI: [Shows comparison table]

User: "add the cheapest one"
AI: "✅ Added RAM (₱2,500) to cart!"
```

---

## 🚀 Advanced Usage

### Multiple Commands in Sequence
```
User: "show me SSDs"
AI: [Shows 5 SSDs]

User: "compare the first and last"
AI: [Comparison shown]

User: "show cheaper options"
AI: [Shows affordable alternatives]

User: "add the second one"
AI: "✅ Added to cart!"
```

### Smart Defaults
- **No product specified?** → Defaults to first product
- **No variant specified?** → Uses default variant
- **No quantity specified?** → Adds 1 unit

---

## 🛠️ Technical Details

### Command Detection System
- Uses **regex pattern matching**
- Understands **natural language variations**
- Case-insensitive processing
- Handles typos and informal language

### Priority Order
1. Command detection runs **first**
2. If command found → Execute immediately
3. If no command → Call AI for response

### Supported Commands (Current)
✅ Add to Cart  
✅ Show Details  
✅ Compare Products  
✅ Find Cheaper Options  

### Coming Soon
🔜 Remove from cart  
🔜 Update quantity  
🔜 Switch variants  
🔜 Check compatibility  
🔜 Build PC configuration  

---

## 📊 Success Indicators

When a command works, you'll see:
- ✅ **Immediate response** (no AI thinking delay)
- ✅ **Confirmation message** from AI
- ✅ **Action completed** (cart updated, details shown, etc.)
- ✅ **Console log**: "Command executed successfully"

When a command fails:
- ⚠️ **AI responds normally** (treats as regular question)
- ⚠️ **Console log**: "No products in recent messages"

---

## 🎨 User Experience Benefits

### Before (Old Way):
1. User: "show me processors"
2. AI: Shows products with buttons
3. User clicks "View Details" button
4. New page opens
5. User clicks "Add to Cart" button
6. Cart modal appears

### After (New Way):
1. User: "show me processors"
2. AI: Shows products
3. User: "**add to cart**"
4. ✅ **Done!** In cart instantly

**Result:** 5 clicks reduced to 1 message! ⚡

---

## 🔍 Debugging Commands

Open browser console (F12) to see:
```
🎯 Command detection - Products available: ['Ryzen 7', 'Core i7']
✅ Command executed successfully
```

Or if no command:
```
⚠️ No products in recent messages to act on
```

---

## 📝 Best Practices

1. **Be Clear but Natural**
   - ✅ "add to cart" (clear)
   - ✅ "I'll take it" (natural)
   - ❌ "asdfkj cart" (unclear)

2. **Use After Products Shown**
   - Wait for AI to show products
   - Then use commands

3. **Check Console for Confirmation**
   - F12 → Console tab
   - See command execution logs

4. **Experiment with Phrases**
   - Try different variations
   - See what works for you

---

## 🎯 Summary

Your AI Assistant is now **voice-controlled**! Instead of clicking buttons:

✅ Just type: "**add to cart**"  
✅ Just type: "**show details**"  
✅ Just type: "**compare these**"  

**It's that simple!** 🚀

---

*For technical support or to report issues, please contact the development team.*
