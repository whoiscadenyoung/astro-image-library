/// <reference types="astro/client" />

declare module "virtual:astro-image-library/internal" {
  export const options: import("./schemas/integration-options-schema.ts").IntegrationOptions;
}