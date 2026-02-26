import fs from 'fs';

/**
 * Normalizes names into valid JS keys (e.g., "Ludvig Åberg" -> "LudvigAberg")
 */
function generateKey(name) {
  return name
    .normalize('NFD') // Splits accented characters into base + accent
    .replace(/[\u0300-\u036f]/g, '') // Removes the accent marks
    .replace(/[^a-zA-Z0-9]/g, ''); // Strips everything except letters and numbers
}

async function fetchAllGolfers() {
  try {
    let currentPage = 1;
    let pageCount = 1;
    const allAthleteRefs = [];

    console.log('⛳️ Starting multi-page discovery...');

    while (currentPage <= pageCount) {
      const pageUrl = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/athletes?limit=1000&active=true&page=${currentPage}`;
      const response = await fetch(pageUrl);
      const data = await response.json();

      if (data.items) {
        allAthleteRefs.push(...data.items);
        pageCount = data.pageCount;
        console.log(
          `- Scanned page ${currentPage} of ${pageCount} (${data.items.length} refs found)`,
        );
      }
      currentPage++;
    }

    console.log(`\n📦 Total athletes found: ${allAthleteRefs.length}`);
    console.log('🛠 Starting hydration... (this takes a few minutes)');

    // We'll store the final data in this object
    const golfersRecord = {};

    for (let i = 0; i < allAthleteRefs.length; i++) {
      const refUrl = allAthleteRefs[i].$ref.replace('http://', 'https://');

      try {
        const detailResponse = await fetch(refUrl);
        if (!detailResponse.ok) continue;

        const detailData = await detailResponse.json();

        if (detailData.id && detailData.displayName) {
          const originalName = detailData.displayName;
          const baseKey = generateKey(originalName);

          let finalKey = baseKey;
          let counter = 2;

          // Collision handling: if "TomKim" exists, the next one is "TomKim_2"
          while (golfersRecord[finalKey]) {
            finalKey = `${baseKey}_${counter}`;
            counter++;
          }

          golfersRecord[finalKey] = {
            id: detailData.id,
            name: originalName,
          };
        }

        if ((i + 1) % 100 === 0) {
          console.log(`✅ Processed ${i + 1} / ${allAthleteRefs.length}...`);
        }
      } catch (err) {
        console.error(`❌ Error at index ${i}:`, err.message);
      }
    }

    // Wrap the record in a constant export for easy use in your TS/JS files
    const fileContent = `export const GOLFERS_2026 = ${JSON.stringify(golfersRecord, null, 2)} as const;`;

    fs.writeFileSync('golfers_2026.ts', fileContent);

    console.log(`\n🏆 MISSION COMPLETE`);
    console.log(
      `Generated 'golfers_2026.ts' with ${Object.keys(golfersRecord).length} mapped records.`,
    );
  } catch (error) {
    console.error('Fatal error during fetch:', error);
  }
}

fetchAllGolfers();
