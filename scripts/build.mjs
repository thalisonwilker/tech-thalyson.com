import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

const filesToCopy = ['index.html', 'styles.css', 'robots.txt', 'sitemap.xml'];
if (existsSync('CNAME')) {
  filesToCopy.push('CNAME');
}

for (const file of filesToCopy) {
  await copyFile(file, `dist/${file}`);
}

await cp('assets', 'dist/assets', { recursive: true });
await cp('data', 'dist/data', { recursive: true });

console.log('✅ Site build concluído em dist/');
