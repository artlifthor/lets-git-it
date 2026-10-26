// PAP's published "Raw Philippine National Powerlifting Records" Google Sheet and its tabs.
const SHEET_ID = '2PACX-1vS4JeBSzpYmQs_0DbwAl4_GxRuaJH5PtFIJfi0495yLij-KrwDQ8T7rI1Ioiuh2_NMniiAF9oCuvn-Q';

export const PUBHTML_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pubhtml`;

export const NOTES_GID = '899996039';

// Labels come from here, never from tab titles (PAP's Women Master IV tab is titled "Master 3").
export const DIVISIONS = [
	{ id: 'open', label: 'Open', men: '766057938', women: '2086559126' },
	{ id: 'developmental', label: 'Developmental', men: '532281181', women: '296089497' },
	{ id: 'high-school', label: 'High School', men: '1627891034', women: '611350165' },
	{ id: 'college', label: 'College', men: '1666921488', women: '328715554' },
	{ id: 'sub-junior', label: 'Sub-Junior', men: '1399004078', women: '956687203' },
	{ id: 'junior', label: 'Junior', men: '1267231825', women: '1997247131' },
	{ id: 'novice', label: 'Novice', men: '1547865314', women: '1212624755' },
	{ id: 'master-1', label: 'Master I', men: '715181860', women: '1427110172' },
	{ id: 'master-2', label: 'Master II', men: '1633793004', women: '1460269758' },
	{ id: 'master-3', label: 'Master III', men: '1768641426', women: '188377833' },
	{ id: 'master-4', label: 'Master IV', men: '903288025', women: '1577657337' },
];

export function csvUrl(gid) {
	return `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?single=true&output=csv&gid=${gid}`;
}
