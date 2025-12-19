import axios from 'axios';
import { readFileSync } from 'fs';

// Parse .env file
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^(VITE_[A-Z_]+)=(.*)$/);
  if (match) {
    envVars[match[1].replace('VITE_', '')] = match[2].trim();
  }
});

console.log('🔑 Testing Groq Vision API...');
console.log('API Key:', envVars.GROQ_API_KEY ? envVars.GROQ_API_KEY.substring(0, 15) + '...' : 'NOT FOUND');
console.log('Model:', envVars.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct');
console.log('');

async function testGroqVision() {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: envVars.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify this computer hardware product. Return JSON with: productType, brand, model, specs (array), keywords (array), confidence (0-1).'
              },
              {
                type: 'image_url',
                image_url: {
                  url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/LPU-v1-die.jpg'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${envVars.GROQ_API_KEY}`
        },
        timeout: 30000
      }
    );

    console.log('✅ SUCCESS! Groq Vision API is working!\n');
    console.log('📋 Response:');
    console.log(JSON.stringify(JSON.parse(response.data.choices[0].message.content), null, 2));
    console.log('\n🎉 Your AI Vision feature is ready to use!');
    console.log('💡 Start your app with: npm run dev');
    
  } catch (error) {
    if (error.response) {
      console.error('\n❌ API Error:', error.response.status);
      console.error('Message:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('\n❌ Network Error:', error.message);
    }
  }
}

testGroqVision();
