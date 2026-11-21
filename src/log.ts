import chalk from 'chalk';
import logSymbols from 'log-symbols';

// Everything except the tree goes to stderr, so stdout is only ever the tree
// and `asciifolders > tree.txt` or `asciifolders | pbcopy` just work
const write = (message: string) => console.error(message);

export const log = {
  info: (message: string) => write(`${logSymbols.info} ${message}`),
  success: (message: string) => write(`${logSymbols.success} ${message}`),
  error: (message: string) => write(`${logSymbols.error} ${chalk.red(message)}`),
  warning: (message: string) => write(`${logSymbols.warning} ${chalk.yellow(message)}`),
};
