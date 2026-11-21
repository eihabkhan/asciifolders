import { select } from '@inquirer/prompts';

export async function promptToCopyToClipboard() {
  return select(
    {
      message: '📋 Would you like to copy the tree to the clipboard?',
      choices: [
        { name: 'Yes', value: 'yes' },
        { name: 'No', value: 'no' },
      ],
    },
    // Keep the prompt off stdout, which only carries the tree
    { output: process.stderr }
  );
}
