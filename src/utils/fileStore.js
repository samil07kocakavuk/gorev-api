const fs = require('fs/promises');
const path = require('path');

/**
 * JSON dosyasi uzerinden kalici veri deposu.
 *
 * Onemli garanti:
 *   - Yazma islemleri dosya bazinda kuyruga alinir (ayni anda tek yazma).
 *   - Yazma atomiktir: once gecici dosyaya yazilir, sonra rename ile
 *     gercek dosyanin uzerine tasinir. Boylece yarim yazilmis dosya okunmaz.
 *   - Bozuk JSON sessizce bos listeye cevrilmez; hata firlatilir.
 *     (Sessizce bosaltmak veri kaybina yol acar.)
 */

const queues = new Map();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ayni dosya uzerinde calisan islemleri siraya koyar.
 */
function withLock(key, task) {
  const previous = queues.get(key) || Promise.resolve();
  const current = previous.then(task, task);

  // Zincir bir hatadan dolayi kopmasin.
  queues.set(key, current.then(() => undefined, () => undefined));

  return current;
}

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function ensureFile(file, initialValue) {
  if (await fileExists(file)) {
    return;
  }

  await fs.mkdir(path.dirname(file), { recursive: true });

  try {
    // 'wx' => dosya zaten varsa yazmaz, boylece es zamanli cagrilar birbirini ezmez.
    await fs.writeFile(file, JSON.stringify(initialValue, null, 2), {
      encoding: 'utf8',
      flag: 'wx',
    });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

async function renameWithRetry(source, target, attempts = 5) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await fs.rename(source, target);
      return;
    } catch (err) {
      lastError = err;

      // Windows'ta dosya kisa sure kilitli kalabiliyor; tekrar dene.
      const retryable = ['EPERM', 'EACCES', 'EBUSY'].includes(err.code);
      if (!retryable || attempt === attempts - 1) {
        throw err;
      }

      await delay(20 * (attempt + 1));
    }
  }

  throw lastError;
}

async function writeJsonAtomic(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });

  const tempFile = `${file}.${process.pid}.${Date.now()}.${Math.random()
    .toString(16)
    .slice(2)}.tmp`;

  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');

  try {
    await renameWithRetry(tempFile, file);
  } catch (err) {
    await fs.unlink(tempFile).catch(() => {});
    throw err;
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
    throw new Error(`Veri dosyasi okunamadi (bozuk JSON): ${file}`);
  }
}

module.exports = {
  ensureFile,
  readJson,
  writeJsonAtomic,
  withLock,
};
