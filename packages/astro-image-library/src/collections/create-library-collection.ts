// import config from "virtual:astro-image-library/internal";

type Options = {
  basePath?: string;
}

export function createLibraryCollection(options: Options) {
  const { basePath } = options;
  // console.log(config.options.assetsDir)
  // console.log(config.options.registryDir)

  console.log(basePath);
}