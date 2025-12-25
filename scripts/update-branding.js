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

console.log('Branding update: Magiwork -> Magiwork');

walk(rootDir, (filepath) => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;

    if (content.includes('Magiwork')) {
      content = content.replace(/Magiwork/g, 'Magiwork');
      changed = true;
    }
    if (content.includes('magiwork')) {
      content = content.replace(/magiwork/g, 'magiwork');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`Updated: ${filepath}`);
    }
  } catch (e) {
    // Skip binary or encoded files that fail utf8 read
  }
});

console.log('Branding update complete.');

