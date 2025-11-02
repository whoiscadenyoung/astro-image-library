import { defineCollection, z } from "astro:content"
import { extendImageLibrarySchema } from "astro-image-library";

const imageLibrary = defineCollection({
  schema: extendImageLibrarySchema(z.object({
    title: z.string()
  }))
})

export const collections = {
  imageLibrary
};