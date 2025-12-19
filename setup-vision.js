#!/usr/bin/env node

/**
 * AI Vision Setup Wizard
 * Interactive CLI to help configure AI Vision API
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.clear();
  log('╔═══════════════════════════════════════════╗', 'cyan');
  log('║   AI VISION IMAGE SEARCH SETUP WIZARD    ║', 'cyan');
  log('╚═══════════════════════════════════════════╝', 'cyan');
  log('');

  log('This wizard will help you configure AI Vision API for image-based product search.\n', 'blue');

  // Step 1: Choose provider
  log('📝 Step 1: Choose AI Vision Provider\n', 'bright');
  log('1. OpenAI Vision (⭐ RECOMMENDED)', 'green');
  log('   - More accurate for tech products');
  log('   - Best at reading model numbers');
  log('   - Cost: $0.005 per image\n');
  
  log('2. Google Vision', 'green');
  log('   - Excellent label detection');
  log('   - Free tier: 1,000 images/month');
  log('   - Cost: $0.0015 per image after free tier\n');
  
  log('3. Skip (Use keyword-based search)\n');

  const providerChoice = await question('Enter choice (1/2/3): ');
  
  let provider = '';
  let apiKey = '';

  if (providerChoice === '1') {
    provider = 'openai';
    log('\n✅ You selected: OpenAI Vision\n', 'green');
    log('📖 To get your API key:', 'yellow');
    log('   1. Go to https://platform.openai.com/api-keys');
    log('   2. Sign up or log in');
    log('   3. Click "Create new secret key"');
    log('   4. Copy the key (starts with sk-)\n');
    
    apiKey = await question('Enter your OpenAI API key (or press Enter to skip): ');
    
    if (apiKey.trim()) {
      log('\n🎉 API key received!', 'green');
    } else {
      log('\n⚠️  No API key provided. You can add it later in .env file.', 'yellow');
    }
  } else if (providerChoice === '2') {
    provider = 'google';
    log('\n✅ You selected: Google Vision\n', 'green');
    log('📖 To get your API key:', 'yellow');
    log('   1. Go to https://console.cloud.google.com/');
    log('   2. Create/select a project');
    log('   3. Enable "Cloud Vision API"');
    log('   4. Go to Credentials → Create Credentials → API Key\n');
    
    apiKey = await question('Enter your Google Vision API key (or press Enter to skip): ');
    
    if (apiKey.trim()) {
      log('\n🎉 API key received!', 'green');
    } else {
      log('\n⚠️  No API key provided. You can add it later in .env file.', 'yellow');
    }
  } else {
    log('\n⏭️  Skipping API configuration. Keyword-based search will be used.', 'yellow');
  }

  // Step 2: Update .env file
  if (provider && apiKey.trim()) {
    log('\n📝 Step 2: Updating .env file...\n', 'bright');
    
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');
    
    let envContent = '';
    
    // Read existing .env or create from .env.example
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      log('   Found existing .env file', 'green');
    } else if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf8');
      log('   Created .env from .env.example', 'green');
    } else {
      envContent = '# Environment Variables\n\n';
      log('   Created new .env file', 'green');
    }

    // Update or add Vision API config
    const providerLine = `VITE_VISION_API_PROVIDER=${provider}`;
    const keyLine = provider === 'openai' 
      ? `VITE_OPENAI_API_KEY=${apiKey}`
      : `VITE_GOOGLE_VISION_API_KEY=${apiKey}`;
    
    // Remove existing Vision config
    envContent = envContent
      .split('\n')
      .filter(line => !line.startsWith('VITE_VISION_API_PROVIDER'))
      .filter(line => !line.startsWith('VITE_OPENAI_API_KEY'))
      .filter(line => !line.startsWith('VITE_GOOGLE_VISION_API_KEY'))
      .filter(line => !line.startsWith('VITE_OPENAI_VISION_MODEL'))
      .join('\n');
    
    // Add new config
    envContent += `\n\n# AI Vision API Configuration\n`;
    envContent += `${providerLine}\n`;
    envContent += `${keyLine}\n`;
    
    if (provider === 'openai') {
      envContent += `VITE_OPENAI_VISION_MODEL=gpt-4o\n`;
    }

    fs.writeFileSync(envPath, envContent);
    log('   ✅ .env file updated successfully!\n', 'green');
  }

  // Step 3: Final instructions
  log('╔═══════════════════════════════════════════╗', 'cyan');
  log('║            SETUP COMPLETE! 🎉             ║', 'cyan');
  log('╚═══════════════════════════════════════════╝', 'cyan');
  log('');
  
  log('📋 Next Steps:\n', 'bright');
  log('1. Restart your development server:', 'green');
  log('   npm run dev\n');
  
  log('2. Open the AI chat in your app', 'green');
  log('3. Click the image icon 📷', 'green');
  log('4. Upload a product image', 'green');
  log('5. Watch AI identify and match products!\n');
  
  log('📚 For more information:', 'yellow');
  log('   Read: AI_VISION_SETUP.md\n');
  
  log('⚠️  Security Reminder:', 'red');
  log('   Never commit your .env file to Git!');
  log('   Add .env to your .gitignore\n');

  rl.close();
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
