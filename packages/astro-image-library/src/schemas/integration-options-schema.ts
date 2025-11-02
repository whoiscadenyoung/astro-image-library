import { z } from "astro/zod";

export const integrationOptionsSchema = z.object({
  /**
   * Path to assets directory, relative to project root
   * 
   * @default `./src/assets/library`
   */
  assetsDir: z.string().optional().default("./src/assets/library"),
  /**
   * Path to library registry directory, relative to project root
   * 
   * @default `./src/content/library`
   */
  registryDir: z.string().optional().default("./src/content/library")
});

export type IntegrationOptions = z.infer<typeof integrationOptionsSchema>;