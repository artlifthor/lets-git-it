// Turns PAP's records sheet tabs (CSV) into plain data. Values are kept exactly as published.
import { parse } from 'csv-parse/sync';

export const SECTIONS = {
	SQUAT: 'squat',
	'BENCH PRESS': 'bench',
	DEADLIFT: 'deadlift',
	TOTAL: 'total',
	'SINGLE-LIFT BENCH PRESS': 'benchOnly',
};

const EXPECTED_HEADER = ['TEAM', 'BIRTH YR', 'KG', 'DATE', 'VENUE'];
const WEIGHT_CLASS = /^\d+\+?$/;

function rows(csv) {
	return parse(csv, { relax_column_count: true }).map((row) => row.map((cell) => cell.trim()));
}

export function parseNotes(csv) {
	const lines = rows(csv)
		.flat()
		.flatMap((cell) => cell.split(/\r?\n/))
		.map((line) => line.trim());
	const updated = lines.find((line) => line.startsWith('Last Updated:'));
	if (!updated) throw new Error('NOTES tab has no "Last Updated:" line');
	const lastUpdated = updated.slice('Last Updated:'.length).trim();
	// Only plain date text: this value ends up in commit messages and on the page.
	if (!/^[A-Za-z0-9 ,./-]+$/.test(lastUpdated)) {
		throw new Error(`"Last Updated" is not a plain date: ${JSON.stringify(lastUpdated)}`);
	}
	return {
		lastUpdated,
		notes: lines.filter((line) => /^\d+\.\s/.test(line)).map((line) => line.replace(/^\d+\.\s+/, '')),
	};
}

export function parseDivision(csv) {
	const all = rows(csv);
	const headerIndex = all.findIndex((row) => row.includes('TEAM'));
	const header = headerIndex === -1 ? [] : all[headerIndex].slice(2, 7);
	if (header.join('|') !== EXPECTED_HEADER.join('|')) {
		throw new Error(`Unexpected columns: expected ${EXPECTED_HEADER.join(', ')}, found ${header.join(', ') || 'no header row'}`);
	}

	const result = Object.fromEntries(Object.values(SECTIONS).map((key) => [key, []]));
	let section = null;
	for (const row of all.slice(headerIndex + 1)) {
		const [first = '', lifter, team, , kg, date, venue] = row;
		if (!first) continue; // blank separators and the "New records:" footer
		if (WEIGHT_CLASS.test(first)) {
			if (!section) throw new Error(`Record row "${first}" appears before any section`);
			result[section].push({
				weightClass: first,
				lifter: lifter || null,
				team: team || null,
				kg: kg || null,
				date: date || null,
				venue: venue || null,
			});
		} else if (first in SECTIONS && row.slice(1).every((cell) => !cell)) {
			section = SECTIONS[first];
		} else {
			throw new Error(`Unknown section "${first}"`);
		}
	}
	return result;
}
