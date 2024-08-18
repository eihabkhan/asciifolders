import { Command } from 'commander';
import type { Style, Options } from '@/types';
import { generateAsciiTree } from '@/ascii';
import { promptToCopyToClipboard } from '@/clipboard';
import clipboardy from 'clipboardy';
import { currentDirectoryName } from '@/directory';
import { log } from '@/log';
import ora from 'ora';

const program = new Command();

// Defaults
const DEPTH = '5'; // string because Commander expects a string
const STYLE: Style = 'arrows';
const ALL = false;
const DIRS_FIRST = false;
const AUTO_COPY = false;

program
  .option(
    '-a, --all',
    'Generate tree for all files/dirs, including hidden ones.',
    ALL
  )
  .option('-df, --dirs-first', 'List directories before files', DIRS_FIRST)
  .option('-d, --depth <depth>', 'Depth of dirs to be generated', DEPTH)
  .option(
    '-s, --style <style>',
    'Style of generated tree ("arrows" | "pipes")',
    STYLE
  )
  .option(
    '-c, --copy',
    'Automatically copy the generated tree to clipboard',
    AUTO_COPY
  )
  .addHelpText(
    'afterAll',
    `

Links:
  - Website: https://asciifolders.com
  - GitHub:  https://github.com/eihabkhan/asciifolders

© ${new Date().getFullYear()}. By Eihab Khan <https://www.eihabkhan.com/>`
  )
  .action(async (options: Options) => {
    try {
      const spinner = ora('Generating ASCII Tree 🌳');
      spinner.start();

      const asciiTree = await generateAsciiTree(options);
      // Print Tree
      log.normal(currentDirectoryName);
      log.normal(asciiTree);

      spinner.succeed('ASCII Tree generated');

      if(options.copy) {
        await clipboardy.write(asciiTree);
        log.success('ASCII Tree automatically copied to clipboard.');
        return;
      }

      const answer = await promptToCopyToClipboard();
      if (answer.toLowerCase() === 'yes') {
        await clipboardy.write(asciiTree);
        log.success('ASCII Tree copied to clipboard.');
      }
    } catch (error) {
      log.error(`An error occurred:, ${error}`);
    }
  });

export { program };
