import path from 'path';
import type { Options } from '@/types';
import {
  IGNORE_DIRECTORIES,
  createMatcher,
  isIgnoredByRules,
  readEntries,
  readGitignore,
  readParentGitignores,
  sortEntries,
  type Entry,
  type Matcher,
} from '@/directory';

export type TreeOptions = Pick<Options, 'all' | 'style' | 'dirsFirst' | 'gitignore' | 'ignore'> & {
  depth: number;
};

function connectors(style: TreeOptions['style']) {
  const arrows = style === 'arrows';

  return {
    branch: arrows ? '├── ' : '|--- ',
    leaf: arrows ? '└── ' : '└--- ',
    pipe: arrows ? '│   ' : '|   ',
    space: '    ',
  };
}

function isVisible(dir: string, entry: Entry, matchers: Matcher[], options: TreeOptions): boolean {
  if (!options.all && entry.name.startsWith('.')) return false;
  if (IGNORE_DIRECTORIES.includes(entry.name)) return false;

  return !isIgnoredByRules(matchers, path.join(dir, entry.name), entry.isDirectory);
}

async function renderDirectory(
  dir: string,
  prefix: string,
  depth: number,
  matchers: Matcher[],
  options: TreeOptions,
  lines: string[]
): Promise<void> {
  let entries: Entry[];
  try {
    entries = await readEntries(dir);
  } catch {
    // Unreadable subfolders (permissions, broken links) are listed but left empty
    return;
  }

  const own = options.gitignore ? await readGitignore(dir) : null;
  const active = own ? [...matchers, own] : matchers;
  // Filter before drawing, so the last visible entry gets the └── connector
  const visible = sortEntries(
    entries.filter((entry) => isVisible(dir, entry, active, options)),
    options.dirsFirst
  );
  const { branch, leaf, pipe, space } = connectors(options.style);

  for (const [i, entry] of visible.entries()) {
    const isLast = i === visible.length - 1;
    lines.push(prefix + (isLast ? leaf : branch) + entry.name);

    if (entry.isDirectory && depth > 0) {
      await renderDirectory(
        path.join(dir, entry.name),
        prefix + (isLast ? space : pipe),
        depth - 1,
        active,
        options,
        lines
      );
    }
  }
}

/** The tree for `root`, starting with the folder's own name */
export async function generateAsciiTree(root: string, options: TreeOptions): Promise<string> {
  const resolved = path.resolve(root);
  const matchers = options.gitignore ? await readParentGitignores(resolved) : [];
  if (options.ignore.length > 0) matchers.push(createMatcher(resolved, options.ignore));

  const lines = [path.basename(resolved) || resolved];
  await renderDirectory(resolved, '', options.depth, matchers, options, lines);

  return lines.join('\n');
}
