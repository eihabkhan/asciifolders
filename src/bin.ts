#! /usr/bin/env node
import { program } from '@/program';

program.parse(process.argv);

const options = program.opts();

if (options.all) console.log('All files');

if (options.depth) console.log(`Going deep: ${options.depth}`);
if (options.style) console.log(`Printing in: ${options.style}`);
