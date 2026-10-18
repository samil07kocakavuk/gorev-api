const fs = require('fs/promises');
const path = require('path');

/**
 * JSON dosyasi uzerinden basit bir kalici veri deposu (file store).
 * Harici bir veritabani kurmadan verilerin sunucu yeniden baslasa bile
 * korunmasini saglar.
 */

async function ensureFile(file, initialValue) {
  try {
    await fs.access(file);
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(initialValue, null, 2), 'utf8');
  }
}

async function readJson(file, fallback) {
  await ensureFile(file, fallback);

  const raw = await fs.readFile(file, 'utf8');
  if (!raw.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    // Bozuk dosya durumunda uygulamayi cokertmek yerine bos liste dondur.
    return fallback;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { ensureFile, readJson, writeJson };
