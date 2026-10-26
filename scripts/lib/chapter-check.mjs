import matter from 'gray-matter';

// Part folder → the level every chapter in it must declare.
export const PART_LEVELS = {
	foundations: 'beginner',
	'building-programs': 'intermediate',
	advanced: 'advanced',
	peaking: 'competition',
	'technique-injury': 'technique',
};

// Level-2 headings every chapter must have, in this order. Other headings may sit between them.
export const REQUIRED_SECTIONS = ['In one minute', 'Prerequisites', 'Common mistakes', 'Key takeaways', 'Sources'];

/** True for chapter files: inside a Part folder, Markdown/MDX, and not the Part's overview page. */
export function isChapterPath(relPath) {
	const parts = relPath.split('/');
	if (parts.length !== 2 || !(parts[0] in PART_LEVELS)) return false;
	return /\.mdx?$/.test(parts[1]) && !/^index\.mdx?$/.test(parts[1]);
}

/** Returns a list of problems with one chapter; an empty list means the chapter is valid. */
export function checkChapter(relPath, source) {
	const errors = [];
	const { data, content } = matter(source);
	const part = relPath.split('/')[0];
	const expectedLevel = PART_LEVELS[part];

	if (!data.level) {
		errors.push('missing "level" in frontmatter');
	} else if (data.level !== expectedLevel) {
		errors.push(`level must be "${expectedLevel}" for chapters in ${part}/ (found "${data.level}")`);
	}

	const reviewed = data.lastReviewed;
	if (!(reviewed instanceof Date) || Number.isNaN(reviewed.getTime())) {
		errors.push('missing or invalid "lastReviewed" date in frontmatter (use YYYY-MM-DD)');
	}

	const headings = [...content.matchAll(/^##[ \t]+(.+?)[ \t]*$/gm)].map((m) => m[1].toLowerCase());
	const positions = REQUIRED_SECTIONS.map((name) => headings.indexOf(name.toLowerCase()));
	REQUIRED_SECTIONS.forEach((name, i) => {
		if (positions[i] === -1) errors.push(`missing section "## ${name}"`);
	});
	const present = positions.filter((pos) => pos !== -1);
	if (present.some((pos, i) => i > 0 && pos < present[i - 1])) {
		errors.push(`sections out of order; required order: ${REQUIRED_SECTIONS.join(', ')}`);
	}

	return errors;
}
