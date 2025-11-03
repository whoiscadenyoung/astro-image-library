import { defineCollection, z } from "astro:content"
// import { createLibraryCollection } from "astro-image-library/collections/";

const imageLibrary = defineCollection({
  // schema: extendImageLibrarySchema(z.object({
  //   title: z.string()
  // }))
})

export const collections = {
  imageLibrary
};