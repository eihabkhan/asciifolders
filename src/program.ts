import fs from 'fs/promises';
import { Command, InvalidArgumentError } from 'commander';
import clipboardy from 'clipboardy';
import ora from 'ora';
import pkg from '@package' with { type: 'json' };
import type { Style, Options } from '@/types';
import { generateAsciiTree } from '@/ascii';
import { promptToCopyToClipboard } from '@/clipboard';
import { log } from '@/log';

const program = new Command();

// Defaults
const DEPTH = '5'; // string because Commander expects a string
const STYLE: Style = 'arrows';
const STYLES: Style[] = ['arrows', 'pipes'];

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function parseDepth(value: string): number {
  const depth = Number(value);
  if (!Number.isInteger(depth) || depth < 0) {
    throw new InvalidArgumentError(`--depth must be a whole number of 0 or more, got "${value}"`);
  }

  return depth;
}

/** A folder we can read, or a friendly error */
async function checkFolder(dir: string): Promise<void> {
  let stats;
  try {
    stats = await fs.stat(dir);
  } catch {
    throw new Error(`No such folder: ${dir}`);
  }
  if (!stats.isDirectory()) throw new Error(`Not a folder: ${dir}`);

  await fs.access(dir, fs.constants.R_OK).catch(() => {
    throw new Error(`Can't read folder: ${dir}`);
  });
}

program
  .name('asciifolders')
  .description('Generate ASCII directory trees from any folder on your machine')
  .version(pkg.version, '-v, --version', 'Print the version')
  .argument('[dir]', 'Folder to generate the tree for', '.')
  .option('-a, --all', 'Include hidden files and folders', false)
  .option('-df, --dirs-first', 'List directories before files', false)
  .option('-d, --depth <depth>', 'How many levels of folders to descend into', DEPTH)
  .option('-s, --style <style>', 'Style of generated tree ("arrows" | "pipes")', STYLE)
  .option('-i, --ignore <pattern>', 'Skip files matching a .gitignore-style pattern (repeatable)', collect, [])
  .option('--no-gitignore', 'Include files and folders listed in .gitignore')
  .option('-c, --copy', 'Copy the tree to the clipboard without asking', false)
  .option('--no-prompt', "Don't ask to copy the tree (automatic when not run in a terminal)")
  .addHelpText(
    'after',
    `
Examples:
  $ npx asciifolders                     Tree of the current folder
  $ npx asciifolders src -d 2            Two levels of ./src
  $ npx asciifolders -i "*.test.ts"      Skip test files
  $ npx asciifolders > tree.txt          Save the tree to a file

Only the tree is written to stdout. When stdin or stdout isn't a terminal
(pipes, scripts, AI agents), it never prompts.

Links:
  - Website: https://asciifolders.com
  - GitHub:  https://github.com/eihabkhan/asciifolders

© ${new Date().getFullYear()}. By Eihab Khan <https://www.eihabkhan.com/>`
  )
  .action(async (dir: string, options: Options) => {
    const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    // ora writes to stderr; keep it quiet when nobody is watching. Terminals
    // that report 0 columns (some agent and CI ptys) make ora loop forever.
    const spinner = ora({
      text: 'Generating ASCII Tree 🌳',
      isSilent: !interactive || !process.stderr.columns,
    });

    try {
      const depth = parseDepth(options.depth);
      if (!STYLES.includes(options.style)) {
        throw new InvalidArgumentError(`--style must be "arrows" or "pipes", got "${options.style}"`);
      }
      await checkFolder(dir);

      spinner.start();
      const tree = await generateAsciiTree(dir, {
        all: options.all,
        depth,
        style: options.style,
        dirsFirst: options.dirsFirst,
        gitignore: options.gitignore,
        ignore: options.ignore,
      });
      spinner.stop();

      process.stdout.write(`${tree}\n`);
      spinner.succeed('ASCII Tree generated');

      if (options.copy) {
        await clipboardy.write(tree);
        log.success('ASCII Tree automatically copied to clipboard.');
        return;
      }

      // Scripts, pipes and AI agents can't answer a prompt
      if (!options.prompt || !interactive) return;

      const answer = await promptToCopyToClipboard();
      if (answer === 'yes') {
        await clipboardy.write(tree);
        log.success('ASCII Tree copied to clipboard.');
      }
    } catch (error) {
      spinner.stop();
      // Ctrl+C on the copy prompt isn't an error
      if (error instanceof Error && error.message.includes('User force closed the prompt')) return;

      log.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

export { program };
