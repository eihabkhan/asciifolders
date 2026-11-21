import fs from 'fs/promises';
import path from 'path';
import ignore, { type Ignore } from 'ignore';

// Dependency and build folders that are never worth listing
export const IGNORE_DIRECTORIES = [
  'node_modules',
  'vendor',
  'site-packages',
  'gems',
  'target',
  '.git',
  'dist',
];

export type Entry = { name: string; isDirectory: boolean };

/** A set of .gitignore-style rules, relative to the folder they came from */
export type Matcher = { base: string; rules: Ignore };

export async function readEntries(dir: string): Promise<Entry[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });

  return Promise.all(
    dirents.map(async (dirent) => ({
      name: dirent.name,
      // Follow symlinks, so a linked folder is listed as a folder
      isDirectory:
        dirent.isDirectory() ||
        (dirent.isSymbolicLink() && (await isDirectory(path.join(dir, dirent.name)))),
    }))
  );
}

export async function isDirectory(target: string): Promise<boolean> {
  try {
    return (await fs.stat(target)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Sorts by name so the output is the same on every machine. Plain byte order
 * by default; --dirs-first keeps its locale-aware order.
 */
export function sortEntries(entries: Entry[], dirsFirst: boolean): Entry[] {
  if (!dirsFirst) {
    return entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  }

  return entries.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;

    return a.name.localeCompare(b.name);
  });
}

export function createMatcher(base: string, patterns: string | string[]): Matcher {
  return { base, rules: ignore().add(patterns) };
}

/** The rules in `dir/.gitignore`, if there is one */
export async function readGitignore(dir: string): Promise<Matcher | null> {
  try {
    return createMatcher(dir, await fs.readFile(path.join(dir, '.gitignore'), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * .gitignore files in the folders above `root`, up to the repository root.
 * They still apply when you run it on a subfolder, like `asciifolders src`.
 */
export async function readParentGitignores(root: string): Promise<Matcher[]> {
  const parents: string[] = [];
  let dir = path.resolve(root);

  while (!(await exists(path.join(dir, '.git')))) {
    const parent = path.dirname(dir);
    // Reached the filesystem root without finding a repository
    if (parent === dir) return [];

    dir = parent;
    parents.unshift(dir);
  }

  const matchers = await Promise.all(parents.map(readGitignore));

  return matchers.filter((matcher): matcher is Matcher => matcher !== null);
}

export function isIgnoredByRules(matchers: Matcher[], target: string, isDir: boolean): boolean {
  return matchers.some(({ base, rules }) => {
    const relative = path.relative(base, target);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return false;

    const posix = relative.split(path.sep).join('/');

    return rules.ignores(isDir ? `${posix}/` : posix);
  });
}

async function exists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}
