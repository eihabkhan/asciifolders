import { select } from '@inquirer/prompts';

export async function promptToCopyToClipboard() {
  const answer = await select({
    message: '📋 Would you like to copy the tree to the clipboard?',
    choices: [
      {
        name: 'Yes',
        value: 'yes',
      },
      {
        name: 'No',
        value: 'no',
      },
    ],
  });

  return answer;
}
