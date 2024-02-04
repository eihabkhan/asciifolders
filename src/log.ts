import chalk from 'chalk';
import logSymbols from 'log-symbols';

const _log = console.log;

export const log = {
  normal: (message: string) => _log(message),
  info: (message: string) => _log(`${logSymbols.info} ${message}`),
  success: (message: string) => _log(`${logSymbols.success} ${message}`),
  error: (message: string) =>
    _log(`${logSymbols.error} ${chalk.red(`${message}`)}`),
  warning: (message: string) =>
    _log(`${logSymbols.warning} ${chalk.yellow(`${message}`)}`),
};
