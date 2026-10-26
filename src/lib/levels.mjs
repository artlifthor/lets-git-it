// Chapter level badges and the "Last reviewed" date format.
export const LEVEL_LABELS = {
	beginner: 'Beginner',
	intermediate: 'Intermediate',
	advanced: 'Advanced',
	competition: 'Peaking & Competition',
	technique: 'Technique & Injury',
};

const reviewedFormat = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	timeZone: 'UTC',
});

export function formatReviewed(date) {
	return reviewedFormat.format(date);
}
