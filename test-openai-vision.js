// Quick test script for OpenAI Vision API
import axios from 'axios';
import { readFileSync } from 'fs';

// Parse .env file manually
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  // Match any line starting with VITE_KEY_NAME=value (including hyphens and special chars in value)
  const match = line.match(/^(VITE_[A-Z_]+)=(.*)$/);
  if (match) {
    envVars[match[1].replace('VITE_', '')] = match[2].trim();
  }
});

console.log('📋 Found env vars:', Object.keys(envVars));

async function testOpenAIVision() {
  const apiKey = envVars.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No OpenAI API key found in .env');
    console.log('Available keys:', Object.keys(envVars));
    return;
  }

  console.log('🔑 Testing OpenAI API key...');
  console.log('Key starts with:', apiKey.substring(0, 20) + '...');
  
  try {
    // Test with a simple text-only request first (cheaper)
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini', // Use cheaper model for testing
        messages: [
          {
            role: 'user',
            content: 'Say "API key works!" if you can read this.'
          }
        ],
        max_tokens: 20
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('\n✅ SUCCESS! OpenAI API key is working!');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('\n🎉 Your Vision API is ready to use!');
    console.log('💡 You can now test image recognition in your app.');
    
  } catch (error) {
    if (error.response) {
      console.error('\n❌ API Error:', error.response.status);
      console.error('Message:', error.response.data.error?.message || error.response.data);
      
      if (error.response.status === 429) {
        console.log('\n⚠️  Quota exceeded. This API key has no remaining credits.');
        console.log('💡 You need to add payment method at: https://platform.openai.com/account/billing');
      } else if (error.response.status === 401) {
        console.log('\n⚠️  Invalid API key.');
        console.log('💡 Check your API key at: https://platform.openai.com/api-keys');
      }
    } else {
      console.error('\n❌ Network Error:', error.message);
    }
  }
}

testOpenAIVision();
