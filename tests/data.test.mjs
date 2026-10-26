import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const library = JSON.parse(readFileSync('src/data/library.json', 'utf8'));
const studies = JSON.parse(readFileSync('src/data/studies.json', 'utf8'));

test('library has the 7 owner books', () =>
	assert.deepEqual(
		library.map((b) => b.title).sort(),
		[
			'Powerlifting: Foundations and Methods',
			'Practical Programming for Strength Training',
			'The Reactive Training Manual',
			'Scientific Principles of Strength Training',
			'Supertraining',
			'The Science and Development of Muscle Hypertrophy',
			'The Squat Bible',
		].sort(),
	));

test('ids unique across library and studies', () => {
	const ids = [...library, ...studies].map((x) => x.id);
	assert.equal(new Set(ids).size, ids.length);
});

test('study DOIs well-formed', () => studies.forEach((s) => assert.match(s.doi, /^10\.\d{4,9}\/\S+$/)));

test('chapters references exist', () =>
	[...library, ...studies]
		.flatMap((x) => x.chapters)
		.forEach((c) => assert.ok(existsSync(`src/content/docs/${c}.mdx`), c)));
