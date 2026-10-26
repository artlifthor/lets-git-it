// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
	site: 'https://artlifthor.github.io',
	base: '/lets-git-it',
	integrations: [
		starlight({
			title: 'Powerlifting Programming Manual',
			plugins: [starlightLinksValidator()],
			components: { PageTitle: './src/components/PageTitle.astro' },
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/artlifthor/lets-git-it' }],
			sidebar: [
				{ label: 'Home', link: '/' },
				{ label: 'Part 1 · Foundations (Beginner)', items: [{ autogenerate: { directory: 'foundations' } }] },
				{ label: 'Part 2 · Building Programs (Intermediate)', items: [{ autogenerate: { directory: 'building-programs' } }] },
				{ label: 'Part 3 · Advanced Programming (Advanced)', items: [{ autogenerate: { directory: 'advanced' } }] },
				{ label: 'Part 4 · Peaking & Competition', items: [{ autogenerate: { directory: 'peaking' } }] },
				{ label: 'Part 5 · Technique & Injury Management', items: [{ autogenerate: { directory: 'technique-injury' } }] },
				{ label: 'PAP National Records', slug: 'pap-records' },
				{ label: 'References', slug: 'references' },
			],
		}),
	],
});
