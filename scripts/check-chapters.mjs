// Checks every chapter's metadata and required sections. Runs before every build.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { checkChapter, isChapterPath } from './lib/chapter-check.mjs';

const root = 'src/content/docs';
const files = readdirSync(root, { recursive: true })
	.map((f) => relative(root, join(root, f)).split(sep).join('/'))
	.filter(isChapterPath);

let failed = false;
for (const file of files) {
	for (const error of checkChapter(file, readFileSync(join(root, file), 'utf8'))) {
		console.error(`${file}: ${error}`);
		failed = true;
	}
}

if (failed) process.exit(1);
console.log(`Chapter check: ${files.length} chapters OK`);
