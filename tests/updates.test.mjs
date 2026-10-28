import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UPDATE_TYPES, listUpdates } from '../src/lib/updates.mjs';

const entry = (id, data) => ({ id, data: { title: id, ...data } });

test('update types have reader-facing labels', () =>
	assert.deepEqual(UPDATE_TYPES, { research: 'Research update', coaching: 'Coaching trends report', site: 'Site news' }));

test('lists only update pages, newest first', () => {
	const entries = [
		entry('foundations/01-what-is-powerlifting', {}),
		entry('updates', {}),
		entry('updates/2026-11-coaching-trends', { date: new Date('2026-11-15'), updateType: 'coaching' }),
		entry('updates/2026-10-manual-complete', { date: new Date('2026-10-28'), updateType: 'site' }),
		entry('updates/2027-01-research', { date: new Date('2027-01-15'), updateType: 'research' }),
	];
	assert.deepEqual(
		listUpdates(entries).map((e) => e.id),
		['updates/2027-01-research', 'updates/2026-11-coaching-trends', 'updates/2026-10-manual-complete'],
	);
});

test('update pages without a date are left out', () =>
	assert.deepEqual(listUpdates([entry('updates/draft', { updateType: 'research' })]), []));
