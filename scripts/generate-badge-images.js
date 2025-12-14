import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Badge configurations with detailed prompts
const BADGES = [
  {
    key: 'otter',
    name: 'Sleepy Otter',
    prompt: 'A minimal, soft illustration of a sleepy otter. The otter is lying down peacefully with closed eyes, floating on water or resting on a surface. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, gentle and calming aesthetic. White background, centered composition, suitable for a badge icon.'
  },
  {
    key: 'tortoise',
    name: 'Unbothered Tortoise',
    prompt: 'A minimal, soft illustration of an unbothered tortoise. The tortoise has a calm expression, is in a relaxed pose, with a textured shell. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, zen and peaceful aesthetic. White background, centered composition, suitable for a badge icon.'
  },
  {
    key: 'polarBear',
    name: 'Calm Polar Bear',
    prompt: 'A minimal, soft illustration of a calm polar bear. The bear is sitting peacefully with a serene expression, soft white fur, gentle features. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, tranquil and peaceful aesthetic. White background, centered composition, suitable for a badge icon.'
  },
  {
    key: 'capybara',
    name: 'Chilled Capybara',
    prompt: 'A minimal, soft illustration of a chilled capybara. The capybara is relaxed, maybe floating in water or sitting calmly, with a peaceful expression. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, laid-back and zen aesthetic. White background, centered composition, suitable for a badge icon.'
  },
  {
    key: 'quokka',
    name: 'Serene Quokka',
    prompt: 'A minimal, soft illustration of a serene quokka with a gentle smile. The quokka has a happy, peaceful expression, round body, small ears. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, joyful and serene aesthetic. White background, centered composition, suitable for a badge icon.'
  },
  {
    key: 'owl',
    name: 'Resourceful Owl',
    prompt: 'A minimal, soft illustration of a resourceful owl. The owl has wise, large eyes, is perched calmly, with soft feathers. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, wise and thoughtful aesthetic. White background, centered composition, suitable for a badge icon.'
  },
  {
    key: 'deer',
    name: 'Resilient Deer',
    prompt: 'A minimal, soft illustration of a resilient deer. The deer stands gracefully with elegant antlers, calm expression, poised stance. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, elegant and strong aesthetic. White background, centered composition, suitable for a badge icon.'
  },
  {
    key: 'koala',
    name: 'Cool Koala',
    prompt: 'A minimal, soft illustration of a cool koala. The koala is relaxed, maybe hugging a branch or sitting calmly, with fluffy ears and a peaceful expression. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, laid-back and cool aesthetic. White background, centered composition, suitable for a badge icon.'
  },
  {
    key: 'panda',
    name: 'Zenned Panda',
    prompt: 'A minimal, soft illustration of a zenned panda. The panda is in a meditative pose, with distinctive black eye patches, calm expression, peaceful demeanor. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, zen and meditative aesthetic. White background, centered composition, suitable for a badge icon.'
  },
  {
    key: 'alpaca',
    name: 'Collected Alpaca',
    prompt: 'A minimal, soft illustration of a collected alpaca. The alpaca has a long elegant neck, fluffy top, calm and composed expression, graceful posture. Style: soft pastel colors (mint green #94D1C4, warm orange #FFAF42, soft purple #BDB2CD), minimal line art, rounded shapes, elegant and composed aesthetic. White background, centered composition, suitable for a badge icon.'
  },
];

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'badges');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateImage(badge) {
  console.log(`\n🎨 Generating image for: ${badge.name}...`);
  
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: badge.prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    });

    const imageUrl = response.data[0].url;
    console.log(`✅ Generated image URL: ${imageUrl}`);

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imagePath = path.join(OUTPUT_DIR, `${badge.key}.png`);
    
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    console.log(`💾 Saved to: ${imagePath}`);

    return imagePath;
  } catch (error) {
    console.error(`❌ Error generating ${badge.name}:`, error.message);
    throw error;
  }
}

async function generateAllBadges() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables.');
    console.log('💡 Please add OPENAI_API_KEY to your .env file');
    process.exit(1);
  }

  console.log('🚀 Starting badge image generation...');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📊 Total badges: ${BADGES.length}\n`);

  const results = [];

  for (const badge of BADGES) {
    try {
      const imagePath = await generateImage(badge);
      results.push({ badge: badge.name, path: imagePath, status: 'success' });
      
      // Rate limiting: DALL-E 3 has rate limits, wait between requests
      if (BADGES.indexOf(badge) < BADGES.length - 1) {
        console.log('⏳ Waiting 2 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      results.push({ badge: badge.name, status: 'error', error: error.message });
    }
  }

  console.log('\n📊 Generation Summary:');
  console.log('='.repeat(50));
  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✅ ${result.badge}: ${result.path}`);
    } else {
      console.log(`❌ ${result.badge}: ${result.error}`);
    }
  });

  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`\n✨ Successfully generated ${successCount}/${BADGES.length} badges`);
}

generateAllBadges().catch(console.error);








