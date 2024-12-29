import type { Options } from '@/types';
import fs from 'fs/promises';
import path from 'path';

// Ignore list
const IGNORE_DIRECTORIES = [
  'node_modules',
  'vendor',
  'site-packages',
  'gems',
  'target',
  '.git',
  'dist',
];

export const currentDirectory = process.cwd();
export const currentDirectoryName = path.basename(currentDirectory);

export function shouldIgnoreItem(item: string, options: Options): boolean {
  return !options.all && item.startsWith('.');
}

export function isIgnoredDirectory(item: string): boolean {
  return IGNORE_DIRECTORIES.includes(item);
}

export async function getDirectoryItems(dir: string, options: Options): Promise<string[]> {
  const items = await fs.readdir(dir);


  if (options.dirsFirst) {
    const processed = await Promise.all(
      items.map(async item => ({
        name: item,
        isDirectory: await isDirectory(item, dir),
      }))
    );

    return processed
    .sort((x, y) => {
      if (x.isDirectory === y.isDirectory) {
        return x.name.localeCompare(y.name);
      }

      return x.isDirectory ? -1 : 1;
    }).map(i => i.name);
  }

  // Sort items alphabetically
  return items;
}

export async function isDirectory(item: string, dir: string): Promise<boolean> {
  const stats = await fs.stat(path.join(dir, item));

  return stats.isDirectory();
}
