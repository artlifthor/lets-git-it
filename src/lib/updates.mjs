// Update posts live under src/content/docs/updates/ and are listed newest first on the Updates page.
export const UPDATE_TYPES = {
	research: 'Research update',
	coaching: 'Coaching trends report',
	site: 'Site news',
};

export function listUpdates(entries) {
	return entries
		.filter((e) => e.id.startsWith('updates/') && e.data.date instanceof Date)
		.sort((a, b) => b.data.date - a.data.date);
}
