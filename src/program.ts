import { Command } from 'commander';
import type { Style } from '@/types';

const program = new Command();

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
    'Style of generated tree (Arrows | Lines)',
    STYLE
  );

export { program };
