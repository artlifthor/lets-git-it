import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EVIDENCE_LEVELS } from '../src/lib/evidence.mjs';
import { LEVEL_LABELS, formatReviewed } from '../src/lib/levels.mjs';

test('evidence labels', () =>
	assert.deepEqual(Object.values(EVIDENCE_LEVELS), [
		'Strong evidence',
		'Moderate evidence',
		'Emerging evidence',
		'Coaching practice',
	]));

test('level labels cover all levels', () =>
	assert.deepEqual(Object.keys(LEVEL_LABELS), ['beginner', 'intermediate', 'advanced', 'competition', 'technique']));

test('formatReviewed', () => assert.equal(formatReviewed(new Date('2026-10-26')), 'October 26, 2026'));
