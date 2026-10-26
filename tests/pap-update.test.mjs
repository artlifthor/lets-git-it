import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NOTES_GID, csvUrl } from '../scripts/pap/tabs.mjs';
import { countRecords, fetchRecords, safetyProblems, sameRecords } from '../scripts/pap/update.mjs';

const read = (name) => readFileSync(`tests/fixtures/pap/${name}`, 'utf8');
const NOTES = read('notes.csv');
const DIVISION = read('m-open.csv');

const fakeWith = (overrides = {}) => async (url) => {
	for (const [gid, text] of Object.entries(overrides)) if (url === csvUrl(gid)) return text;
	return url === csvUrl(NOTES_GID) ? NOTES : DIVISION;
};
const fake = fakeWith();

// A records snapshot whose one division holds `n` filled squat records.
const withCount = (n) => ({
	divisions: [
		{
			men: { squat: Array.from({ length: n }, (_, i) => ({ weightClass: String(i), lifter: 'A', kg: '100' })) },
			women: { squat: [{ weightClass: '47', lifter: null }] },
		},
	],
});

test('all tabs ok', async () => {
	const { data, problems } = await fetchRecords(fake);
	assert.deepEqual(problems, []);
	assert.equal(data.divisions.length, 11);
	assert.equal(data.lastUpdated, 'July 13, 2026');
});

test('HTML instead of CSV is a problem', async () => {
	const { problems } = await fetchRecords(fakeWith({ 2086559126: '<!DOCTYPE html><html>' }));
	assert.equal(problems.length, 1);
	assert.match(problems[0], /Open \(women\)/);
});

test('a tab that fails to parse is a problem', async () => {
	const { problems } = await fetchRecords(fakeWith({ 2086559126: DIVISION.replace('BIRTH YR', 'AGE') }));
	assert.equal(problems.length, 1);
	assert.match(problems[0], /Open \(women\).*columns/);
});

test('countRecords counts only filled rows', () => assert.equal(countRecords(withCount(3)), 3));

test('drop over 5% is a problem', () => assert.match(safetyProblems(withCount(90), withCount(100)).join(), /5%/));

test('drop of 5% or less is fine', () => assert.deepEqual(safetyProblems(withCount(95), withCount(100)), []));

test('first run has no previous copy', () => assert.deepEqual(safetyProblems(withCount(10), null), []));

test('sameRecords', async () => {
	const { data: a } = await fetchRecords(fake);
	const changed = structuredClone(a);
	changed.divisions[0].men.squat[0].kg = '999.0';
	assert.ok(sameRecords(a, structuredClone(a)));
	assert.ok(!sameRecords(a, changed));
});
