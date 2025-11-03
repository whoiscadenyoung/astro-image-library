import type { AstroIntegrationLogger } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto"

async function scanImages(
  dir: string,
  baseDir: string = dir
): Promise<string[]> {
  const images: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subImages = await scanImages(fullPath, baseDir);
        images.push(...subImages);
      } else if (entry.isFile()) {
        // const ext = path.extname(entry.name).toLowerCase();
        // if ([".png", ""].includes(ext)) {
          const relativePath = path.relative(baseDir, fullPath);
          images.push(relativePath)
        // }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}: \n${error}`)
  }

  return images;
}

/**
 * Convert image path to an ID
 * 
 * @param imagePath Relative image path in library
 * @returns kebab-case ID for image file
 */
function getMetadataId(imagePath: string): string {
  // Convert path to kebab-case ID: images/products/case.jpg -> images-products-case
  return imagePath
    .replace(/\\/g, '/') // Normalize path separators
    .replace(path.extname(imagePath), '') // Remove extension
    .replace(/[^a-zA-Z0-9+]/g, '-') // Replace non-alphanumeric with hyphens
    .toLowerCase();
}

/**
 * Calculate the MD5 hash of a file
 * 
 * @param filePath Full path to image
 * @returns MD5 hash
 */
async function calculateChecksum(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash("md5").update(buffer).digest("hex");
}

type MetadataEntry = {
  image: string; // Relative path for use by Astro Image Loader
  alt: string;
  credit?: string;
  dateAdded: string;
  _checksum?: string; // Hash of image file to detect changes
  _lastSync?: string; // ISO timestamp of last sync
}

function generateDefaultMetadata(imagePath: string, checksum: string): MetadataEntry {
  // const filename = path.basename(imagePath, path.extname(imagePath));

  return {
    image: imagePath,
    alt: "",
    credit: "",
    dateAdded: new Date().toISOString(),
    _checksum: checksum,
    _lastSync: new Date().toISOString()
  }
}

async function loadExistingMetadata(
  registryDir: string, 
  metadataId: string
): Promise<MetadataEntry | null> {
  const metadataPath = path.join(registryDir, `${metadataId}.json`);

  try {
    const content = await fs.readFile(metadataPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist or is invalid
    return null;
  }
}

async function saveMetadata(
  registryDir: string,
  metadataId: string,
  metadata: MetadataEntry
): Promise<void> {
  const metadataPath = path.join(registryDir, `${metadataId}.json`);

  const content = JSON.stringify(metadata, null, 2);
  await fs.writeFile(metadataPath, content, "utf-8");
}

// TODO: Use zod for this
// TODO: Paths should be resolved already from integration--but maybe check?
type RegistryConfig = {
  assetsDir: string;
  registryDir: string;
}

type SyncReport = {
  added: string[];
  updated: string[];
  orphaned: string[];
  unchanged: number;
}

export async function generateRegistry(config: RegistryConfig, logger: AstroIntegrationLogger) {
  const report: SyncReport = {
    added: [],
    updated: [],
    orphaned: [],
    unchanged: 0
  }

  const imageFiles = await scanImages(config.assetsDir);
  logger.info(`Found ${imageFiles.length} images in ${config.assetsDir}`);

  const validIds = new Set<string>();

  for (const imagePath of imageFiles) {
    const metadataId = getMetadataId(imagePath);
    if (validIds.has(metadataId)) {
      logger.error(`Conflicting IDs for ${imagePath}: ${metadataId}. Ensure file names in each directory are different.`)
    }
    validIds.add(metadataId);

    const fullImagePath = path.join(config.assetsDir, imagePath);
    const checksum = await calculateChecksum(fullImagePath);

    // Check if metadata already exists
    const existingMetadata = await loadExistingMetadata(config.registryDir, metadataId);

    if (!existingMetadata) {
      const metadata = generateDefaultMetadata(imagePath, checksum);
      await saveMetadata(config.registryDir, metadataId, metadata);
      report.added.push(metadataId);
      logger.info(`Added registry entry for: ${metadataId}`)
    } else {
      const imageChanged = existingMetadata._checksum !== checksum;
      const pathChanged = existingMetadata.image !== imagePath;

      if (imageChanged || pathChanged) {
        const updatedMetadata: MetadataEntry = {
          ...existingMetadata,
          image: imagePath,
          _checksum: checksum,
          _lastSync: new Date().toISOString()
        };

        await saveMetadata(config.registryDir, metadataId, updatedMetadata);
        report.updated.push(metadataId);
        logger.info(`Updated registry entry for: ${metadataId} (Image Changed: ${imageChanged}, Path Changed: ${pathChanged})`)
      } else {
        const updatedMetadata: MetadataEntry = {
          ...existingMetadata,
          _lastSync: new Date().toISOString()
        };
        await saveMetadata(config.registryDir, metadataId, updatedMetadata);
        report.unchanged++;
      }
    }
  }

  return report;
}