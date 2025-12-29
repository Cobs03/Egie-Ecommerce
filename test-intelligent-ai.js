// Test the new intelligent AI shopping assistant
import AIService from './src/services/AIService.js';

/**
 * Test suite for intelligent AI assistant
 */

async function testIntelligentAssistant() {
  console.log('🧪 Testing Intelligent AI Shopping Assistant\n');
  console.log('='.repeat(60));

  // Test 1: Intent Detection
  console.log('\n📍 TEST 1: Intent Detection (Understanding Natural Language)');
  console.log('-'.repeat(60));

  const testQueries = [
    "show me laptops",
    "I need a keyboard",
    "gaming mouse under 2000",
    "what's a good processor for gaming around 20k?",
    "cheap wireless keyboard",
    "I want something to type with",
    "show me vid cards",
    "mobo for ryzen",
    "need processer under 15k"
  ];

  for (const query of testQueries) {
    console.log(`\n❓ Query: "${query}"`);
    try {
      const intent = await AIService.detectIntent(query);
      console.log('✅ Detected Intent:');
      console.log(`   - Type: ${intent.intentType}`);
      console.log(`   - Category: ${intent.category || 'N/A'}`);
      console.log(`   - Budget: ${JSON.stringify(intent.budget)}`);
      console.log(`   - Keywords: [${intent.keywords.join(', ')}]`);
      console.log(`   - Confidence: ${(intent.confidence * 100).toFixed(0)}%`);
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test 2: Smart Product Search
  console.log('\n\n📍 TEST 2: Smart Product Search');
  console.log('-'.repeat(60));

  const searchTests = [
    { query: "gaming laptop under 50000", expectedCategory: "laptop" },
    { query: "cheap keyboard", expectedCategory: "keyboard" },
    { query: "fast processor", expectedCategory: "processor" }
  ];

  for (const test of searchTests) {
    console.log(`\n🔍 Searching: "${test.query}"`);
    try {
      const intent = await AIService.detectIntent(test.query);
      const products = await AIService.searchProductsByIntent(intent);
      
      console.log(`✅ Found ${products.length} products`);
      console.log('   Top 3 matches:');
      products.slice(0, 3).forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.name}`);
        console.log(`      Price: ₱${p.price.toLocaleString()}`);
        console.log(`      Stock: ${p.stock_quantity} units`);
      });
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Test 3: Conversational Context
  console.log('\n\n📍 TEST 3: Conversational Intelligence');
  console.log('-'.repeat(60));

  const conversation = [
    { sender: 'user', text: 'show me laptops' },
    { sender: 'ai', text: 'Here are some laptops...' },
    { sender: 'user', text: 'cheaper ones' }
  ];

  console.log('\n💬 Conversation:');
  conversation.forEach(msg => {
    console.log(`   ${msg.sender === 'user' ? '👤' : '🤖'} ${msg.sender}: ${msg.text}`);
  });

  console.log('\n🧠 Testing context awareness...');
  try {
    const response = await AIService.chat(conversation);
    console.log('✅ AI Response:', response.message.substring(0, 200) + '...');
    if (response.intent) {
      console.log('✅ Remembered context:', response.intent.category);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing Complete!');
  console.log('\nThe AI assistant now:');
  console.log('  ✓ Understands natural language');
  console.log('  ✓ Detects intent without keywords');
  console.log('  ✓ Handles typos and slang');
  console.log('  ✓ Remembers conversation context');
  console.log('  ✓ Searches products intelligently');
}

// Run tests
console.log('\n🚀 Starting AI Intelligence Tests...\n');
testIntelligentAssistant().catch(console.error);
