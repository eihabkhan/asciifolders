import { Command } from 'commander';
import type { Style, Options } from '@/types';
import { generateAsciiTree } from '@/ascii';
import { promptToCopyToClipboard } from '@/clipboard';
import clipboardy from 'clipboardy';
import { currentDirectoryName } from '@/directory';

const program = new Command();

// Defaults
const DEPTH = '5'; // string because Commander expects a string
const STYLE: Style = 'arrows';
const ALL = false;

program
  .option(
    '-a, --all',
    'Generate tree for all files/dirs, including hidden ones.',
    ALL
  )
  .option('-d, --depth <depth>', 'Depth of dirs to be generated', DEPTH)
  .option(
    '-s, --style <style>',
    'Style of generated tree ("arrows" | "pipes")',
    STYLE
  )
  .action(async (options: Options) => {
    try {
      console.log('Generating ASCII Tree 🌳');
      const asciiTree = await generateAsciiTree(options);

      // Print Tree
      console.log(currentDirectoryName);
      console.log(asciiTree);

      const answer = await promptToCopyToClipboard();
      if (answer.toLowerCase() === 'yes') {
        await clipboardy.write(asciiTree);
        console.log('ASCII Tree copied to clipboard successfully.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });

export { program };
