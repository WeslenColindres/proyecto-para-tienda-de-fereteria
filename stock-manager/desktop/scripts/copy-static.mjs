import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const srcRendererDir = path.join(projectRoot, 'src', 'renderer');
const distRendererDir = path.join(projectRoot, 'dist', 'renderer');
const extensionsToCopy = new Set(['.html', '.css']);

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyAssets(srcDir, destDir) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyAssets(srcPath, destPath);
      continue;
    }

    if (!extensionsToCopy.has(path.extname(entry.name))) {
      continue;
    }

    await ensureDir(path.dirname(destPath));
    await fs.copyFile(srcPath, destPath);
  }
}

async function main() {
  await ensureDir(distRendererDir);
  await copyAssets(srcRendererDir, distRendererDir);
}

main().catch((error) => {
  console.error('Error copying static assets:', error);
  process.exitCode = 1;
});
