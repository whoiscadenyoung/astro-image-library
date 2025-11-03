import { addVirtualImports, defineIntegration } from "astro-integration-kit";
import { integrationOptionsSchema } from "./schemas/integration-options-schema.ts";
import { generateRegistry } from "./utils/generate-registry.ts";
// import fs from "node:fs";

export const integration = defineIntegration({
	name: "astro-image-library",
	optionsSchema: integrationOptionsSchema,
	setup({ options, name }) {
		// const { resolve } = createResolver(import.meta.url);
		const assetsDir = options.assetsDir;
		const registryDir = options.registryDir;
		
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
				"astro:build:start": async (params) => {
					params.logger.info("Build started");

					const report = await generateRegistry({ assetsDir, registryDir }, params.logger);
					params.logger.info(JSON.stringify(report, null, 2))
				},
        "astro:config:done": () => {
          // injectTypes({
          //   filename: "image-library-integration.d.ts",
          //   content: readFileSync(resolve("./virtual.d.d.ts"), "utf-8")
          // })
        }
			},
		};
	},
});