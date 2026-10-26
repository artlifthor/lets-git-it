import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Required on chapters (enforced by scripts/check-chapters.mjs), absent on other pages.
				level: z.enum(['beginner', 'intermediate', 'advanced', 'competition', 'technique']).optional(),
				lastReviewed: z.coerce.date().optional(),
			}),
		}),
	}),
};
