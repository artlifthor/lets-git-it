import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkChapter, isChapterPath } from '../scripts/lib/chapter-check.mjs';

const p = 'foundations/05-x.mdx';

const front = (fields) => `---\n${fields.join('\n')}\n---\n`;
const BODY = [
	'## In one minute', 'Summary.',
	'## Prerequisites', 'None.',
	'## Main idea', 'Text.',
	'## Common mistakes', '- One.',
	'## Key takeaways', '- One.',
	'## Sources', '1. A source.',
].join('\n\n');
const FIELDS = ['title: Example', 'level: beginner', 'lastReviewed: 2026-10-26'];
const VALID = front(FIELDS) + BODY;

const withoutLevel = front(FIELDS.filter((f) => !f.startsWith('level'))) + BODY;
const withLevel = (l) => front(['title: Example', `level: ${l}`, 'lastReviewed: 2026-10-26']) + BODY;
const withReviewed = (r) => front(['title: Example', 'level: beginner', `lastReviewed: ${r}`]) + BODY;
const without = (heading) => VALID.replace(`## ${heading}`, '## Something else');
const swapped = (a, b) => VALID.replace(`## ${a}`, '@@A@@').replace(`## ${b}`, `## ${a}`).replace('@@A@@', `## ${b}`);

test('valid chapter passes', () => assert.deepEqual(checkChapter(p, VALID), []));

test('missing level', () => assert.match(checkChapter(p, withoutLevel).join('\n'), /level/));

test('level must match part', () =>
	assert.match(checkChapter(p, withLevel('advanced')).join('\n'), /must be "beginner"/));

test('bad lastReviewed', () => assert.match(checkChapter(p, withReviewed('soon')).join('\n'), /lastReviewed/));

test('missing section', () => assert.match(checkChapter(p, without('Key takeaways')).join('\n'), /Key takeaways/));

test('out of order', () => assert.match(checkChapter(p, swapped('Key takeaways', 'Sources')).join('\n'), /order/));

test('heading case ignored', () =>
	assert.deepEqual(checkChapter(p, VALID.replace('## Key takeaways', '## Key Takeaways')), []));

test('isChapterPath', () => {
	assert.equal(isChapterPath('peaking/02-x.mdx'), true);
	assert.equal(isChapterPath('foundations/index.mdx'), false);
	assert.equal(isChapterPath('references.mdx'), false);
});
