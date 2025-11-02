import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { createResolver } from "astro-integration-kit";
import { hmrIntegration } from "astro-integration-kit/dev";

const { default: astroImageLibrary } = await import("astro-image-library");

// https://astro.build/config
export default defineConfig({
	integrations: [
		astroImageLibrary({
			
		}),
		hmrIntegration({
			directory: createResolver(import.meta.url).resolve("../packages/astro-image-library/dist"),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
