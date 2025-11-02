import { type AnyZodObject, z } from "astro/zod";

/**
 * Schema definition for the image library configuration.
 * This schema validates the structure of the image library object
 * 
 * Properties:
 * - 
 */
export const imageLibrarySchema = z.object({
  
})

/**
 * Extends the base `imageLibrarySchema` with additional schema definitions.
 * Include any additional fields that need to be defined and validated in the content collection.
 * 
 * @template Z A Zod object schema to merge with the base schema
 * @param schema The Zod schema to extend the base `imageLibrarySchema`
 * @returns A new schema resulting from merging the base `imageLibrarySchema` with the provided schema.
 */
export const extendImageLibrarySchema = <Z extends AnyZodObject>(schema: Z) => 
  imageLibrarySchema.merge(schema);

// TODO: Add description
const imageLibraryEntrySchema = z.object({
  data: imageLibrarySchema,
  filePath: z.string().optional()
});
export type ImageLibraryEntry = z.infer<typeof imageLibraryEntrySchema>;

// TODO: Add description
const imageLibraryCollectionSchema = z.array(imageLibraryEntrySchema);
export type ImageLibraryCollection = z.infer<typeof imageLibraryCollectionSchema>;

/**
 * Validates that the Image Library Collection defined in the `content.config.ts` matches the collection schema.
 * 
 * @param obj Schema object that should extend imageLibrarySchema
 */
export function checkImageLibraryCollection(obj: unknown): asserts obj is ImageLibraryCollection {
  const result = imageLibraryCollectionSchema.safeParse(obj);

  if (!result.success) {
    throw new Error(
      `Invalid collection entry provided to astro-image-library. Make sure to use "extendImageLibrarySchema" to extend the schema in your "content.config.ts" defintion. Validation failed with:\n\n${result.error}`
    )
  }
}