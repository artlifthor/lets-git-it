// Refreshes the saved copy of PAP's national records, but only when the new data passes safety checks.
// Exit codes: 0 = updated or unchanged, 2 = safety problems (nothing written; see pap-problems.md).
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseDivision, parseNotes } from './parse.mjs';
import { DIVISIONS, NOTES_GID, PUBHTML_URL, csvUrl } from './tabs.mjs';

const SNAPSHOT = 'src/data/pap-records/records.json';
const PROBLEMS_FILE = 'pap-problems.md';
const MAX_DROP = 0.05;

async function readTab(fetchText, gid, name, parser) {
	try {
		const text = await fetchText(csvUrl(gid));
		if (text.trim().startsWith('<')) throw new Error('not CSV (sheet may be unpublished or moved)');
		return { value: parser(text) };
	} catch (error) {
		return { problem: `${name}: ${error.message}` };
	}
}

export async function fetchRecords(fetchText) {
	const problems = [];
	const notes = await readTab(fetchText, NOTES_GID, 'Notes', parseNotes);
	if (notes.problem) problems.push(notes.problem);

	const divisions = [];
	for (const { id, label, men, women } of DIVISIONS) {
		const division = { id, label };
		for (const [sex, gid] of [['men', men], ['women', women]]) {
			const tab = await readTab(fetchText, gid, `${label} (${sex})`, parseDivision);
			if (tab.problem) problems.push(tab.problem);
			division[sex] = tab.value;
		}
		divisions.push(division);
	}

	const data = { source: PUBHTML_URL, lastUpdated: notes.value?.lastUpdated, notes: notes.value?.notes, divisions };
	return { data, problems };
}

export function countRecords(data) {
	return data.divisions
		.flatMap((d) => [d.men, d.women])
		.flatMap((sections) => Object.values(sections ?? {}).flat())
		.filter((record) => record.lifter).length;
}

export function safetyProblems(newData, oldData) {
	if (!oldData) return [];
	const before = countRecords(oldData);
	const after = countRecords(newData);
	return after < before * (1 - MAX_DROP) ? [`Record count dropped more than 5% (${before} → ${after})`] : [];
}

export function sameRecords(a, b) {
	return JSON.stringify(a) === JSON.stringify(b);
}

function output(key, value) {
	if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

async function main() {
	const oldData = existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, 'utf8')) : null;
	const { data, problems } = await fetchRecords(async (url) => {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return response.text();
	});
	if (problems.length === 0) problems.push(...safetyProblems(data, oldData));

	if (problems.length > 0) {
		const report = [
			'The monthly PAP records update was blocked because the sheet did not pass the safety checks.',
			'The website keeps showing the last good copy. Nothing was published.',
			'',
			...problems.map((p) => `- ${p}`),
			'',
			`Sheet: ${PUBHTML_URL}`,
		].join('\n');
		writeFileSync(PROBLEMS_FILE, report + '\n');
		console.error(report);
		output('changed', 'false');
		process.exit(2);
	}

	if (sameRecords(data, oldData)) {
		console.log('PAP records unchanged');
		output('changed', 'false');
		return;
	}

	mkdirSync(dirname(SNAPSHOT), { recursive: true });
	writeFileSync(SNAPSHOT, JSON.stringify(data, null, 2) + '\n');
	const summary = `PAP records updated: ${countRecords(data)} records (as of ${data.lastUpdated})`;
	console.log(summary);
	output('changed', 'true');
	output('summary', summary);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
