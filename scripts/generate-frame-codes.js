const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting frame code generation...');

  // 1. Find all items of type 'FRAME'
  const frames = await prisma.item.findMany({
    where: { type: 'FRAME' }
  });

  if (frames.length === 0) {
    console.log('No frames found. Creating default frames...');
    // Create some default frames if none exist
    const defaultFrames = [
      { name: 'Gold Frame', description: 'A shiny golden frame', price: 100, type: 'FRAME', rarity: 'RARE', data: { cssClass: 'border-4 border-yellow-500' } },
      { name: 'Neon Frame', description: 'A glowing neon frame', price: 200, type: 'FRAME', rarity: 'EPIC', data: { cssClass: 'border-4 border-blue-500 shadow-[0_0_10px_#3b82f6]' } },
      { name: 'Fire Frame', description: 'A burning fire frame', price: 300, type: 'FRAME', rarity: 'LEGENDARY', data: { cssClass: 'border-4 border-red-500 animate-pulse' } }
    ];

    for (const frame of defaultFrames) {
      await prisma.item.create({ data: frame });
    }
    // Re-fetch
    frames.push(...await prisma.item.findMany({ where: { type: 'FRAME' } }));
  }

  console.log(`Found ${frames.length} frames.`);

  let outputText = 'FRAME REDEMPTION CODES\n======================\n\n';

  for (const frame of frames) {
    console.log(`Generating codes for: ${frame.name}`);
    outputText += `Frame: ${frame.name} (ID: ${frame.id})\n`;
    outputText += `----------------------------------------\n`;

    for (let i = 0; i < 10; i++) {
      // Generate a random 8-character code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Check if code exists (unlikely but safe)
      const existing = await prisma.redemptionCode.findUnique({ where: { code } });
      if (existing) {
        i--; // Retry
        continue;
      }

      await prisma.redemptionCode.create({
        data: {
          code,
          itemId: frame.id
        }
      });

      outputText += `${code}\n`;
    }
    outputText += '\n';
  }

  // Write to file
  const outputPath = path.join(process.cwd(), 'frame_codes.txt');
  fs.writeFileSync(outputPath, outputText);

  console.log(`Codes generated and saved to ${outputPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
