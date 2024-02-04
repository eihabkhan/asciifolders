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

export async function getDirectoryItems(dir: string): Promise<string[]> {
  const items = await fs.readdir(dir);
  // Sort items alphabetically
  // items.sort();
  return items;
}

export async function isDirectory(item: string, dir: string): Promise<boolean> {
  const stats = await fs.stat(path.join(dir, item));
  return stats.isDirectory();
}
