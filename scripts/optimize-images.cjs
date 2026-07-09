const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Kansiot
const INPUT_DIR = path.join(__dirname, '../public/assets');
const OUTPUT_DIR = path.join(__dirname, '../public/assets_optimized');

// Tuetut tiedostomuodot
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

async function optimizeImages() {
  console.log('Aloitetaan kuvien pakkaus ja kääntö (EXIF-tietojen perusteella)...');
  
  // Luo ulostulokansio jos se ei ole olemassa
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Etsitään kaikki kansiot public/assets alta
  const decades = fs.readdirSync(INPUT_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let totalSaved = 0;
  let fileCount = 0;

  for (const decade of decades) {
    const decadeInPath = path.join(INPUT_DIR, decade);
    const decadeOutPath = path.join(OUTPUT_DIR, decade);

    // Luo vuosikymmen-kansio ulostuloon
    if (!fs.existsSync(decadeOutPath)) {
      fs.mkdirSync(decadeOutPath, { recursive: true });
    }

    const files = fs.readdirSync(decadeInPath);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!SUPPORTED_FORMATS.includes(ext)) continue;

      const inputFilePath = path.join(decadeInPath, file);
      // Tallennetaan kaikki webp muotoon parhaan laadun ja koon takia
      const outputFileName = file.replace(ext, '.webp');
      const outputFilePath = path.join(decadeOutPath, outputFileName);

      try {
        const inputStats = fs.statSync(inputFilePath);
        
        // sharp() .rotate() lukee EXIF-tiedot ja kääntää kuvan automaattisesti oikein päin!
        const info = await sharp(inputFilePath)
          .rotate() // Automaattinen EXIF kääntö!
          .resize({ width: 1920, withoutEnlargement: true }) // Maksimi leveys mobiiliin/näytöille
          .webp({ quality: 80 }) // Erinomainen laatu/koko -suhde
          .toFile(outputFilePath);

        const savedBytes = inputStats.size - info.size;
        totalSaved += savedBytes;
        fileCount++;
        
        console.log(`✅ Pakattu: ${decade}/${file} (-${(savedBytes / 1024 / 1024).toFixed(2)} MB)`);
      } catch (err) {
        console.error(`❌ Virhe käsiteltäessä ${decade}/${file}:`, err.message);
      }
    }
  }

  console.log('\n=============================================');
  console.log(`🎉 VALMIS! Pakattiin ${fileCount} kuvaa.`);
  console.log(`💾 Säästetty tila: ${(totalSaved / 1024 / 1024 / 1024).toFixed(2)} Gigatavua!`);
  console.log('=============================================');
  console.log('Kuvat löytyvät nyt kansiosta: public/assets_optimized');
}

optimizeImages();
