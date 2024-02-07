import path from 'path';
import type { Options } from '@/types';
import {
  currentDirectory,
  getDirectoryItems,
  isDirectory,
  isIgnoredDirectory,
  shouldIgnoreItem,
} from '@/directory';

function getBranch(options: Options): string {
  return options.style === 'arrows' ? '├── ' : '|--- ';
}

function getLeaf(options: Options): string {
  return options.style === 'arrows' ? '└── ' : '└--- ';
}

async function parseSubdirectory(
  dir: string,
  item: string,
  prefix: string,
  options: Options
): Promise<string> {
  // Decrement depth
  const newDepth = parseInt(options.depth) - 1;
  const subTree = await parseDirectory(
    path.join(dir, item),
    prefix,
    { ...options, depth: newDepth.toString() } // Pass the decremented depth
  );
  return subTree;
}

async function parseDirectory(
  dir: string,
  prefix = '',
  options: Options
): Promise<string> {
  let tree = '';

  const items = await getDirectoryItems(dir, options);

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;

    if (shouldIgnoreItem(item, options)) continue;
    if (isIgnoredDirectory(item)) continue;

    const branch = getBranch(options);
    const isDir = await isDirectory(item, dir);

    tree +=
      prefix +
      (i === items.length - 1 ? getLeaf(options) : branch) +
      item +
      '\n';

    if (isDir && parseInt(options.depth) > 0) {
      const subPrefix =
        prefix +
        (i === items.length - 1
          ? '    '
          : options.style === 'arrows'
          ? '│   '
          : '|   ');
      tree += await parseSubdirectory(dir, item, subPrefix, options);
    }
  }

  return tree;
}

export async function generateAsciiTree(options: Options): Promise<string> {
  const asciiTree = await parseDirectory(currentDirectory, '', options);

  return asciiTree;
}
