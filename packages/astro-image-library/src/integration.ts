import { addVirtualImports, createResolver, defineIntegration } from "astro-integration-kit";
import { integrationOptionsSchema } from "./schemas/integration-options-schema.ts";
import { readFileSync } from "node:fs";

export const integration = defineIntegration({
	name: "astro-image-library",
	optionsSchema: integrationOptionsSchema,
	setup({ options, name }) {
		const { resolve } = createResolver(import.meta.url);
		const assetsDir = resolve(options.assetsDir);
		const registryDir = resolve(options.registryDir);
		
		return {
			hooks: {
				"astro:config:setup": (params) => {
					params.logger.info(assetsDir);
					params.logger.info(registryDir);

					addVirtualImports(params, {
						name,
						imports: [
							{
								id: "virtual:astro-image-library/internal",
								content: `export const options = ${JSON.stringify(options)}`,
							}
						]
					})
				},
				"astro:build:start": (params) => {
					params.logger.info("Build started");
				},
        "astro:config:done": ({ injectTypes }) => {
          injectTypes({
            filename: "image-library-integration.d.ts",
            content: readFileSync(resolve("./virtual.d.ts"), "utf-8")
          })
        }
			},
		};
	},
});