import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IGNORE_DIRS = ['.git', 'node_modules', 'dist', 'build', '.cursor', 'public/assets'];
const IGNORE_EXTS = ['.png', '.jpg', '.pdf', '.otf', '.ttf', '.mp3', '.mp4', '.wav', '.ico', '.woff', '.woff2'];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      if (!IGNORE_DIRS.some(d => filepath.includes(d))) {
        walk(filepath, callback);
      }
    } else if (stats.isFile()) {
      if (!IGNORE_EXTS.includes(path.extname(filepath).toLowerCase())) {
        callback(filepath);
      }
    }
  });
}

const rootDir = path.join(__dirname, '..');

console.log('Branding update: Fixing Magicwork (capital W) -> Magicwork');

walk(rootDir, (filepath) => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let originalContent = content;

    // Replace "Magicwork" with "Magicwork"
    content = content.replace(/Magicwork/g, 'Magicwork');
    // Replace "Magicwork" with "Magicwork"
    content = content.replace(/Magicwork/g, 'Magicwork');
    // Replace "magicwork" with "magicwork"
    content = content.replace(/magicwork/g, 'magicwork');

    if (content !== originalContent) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`Updated: ${filepath}`);
    }
  } catch (e) {
    // Skip binary files
  }
});

console.log('Branding update complete.');
