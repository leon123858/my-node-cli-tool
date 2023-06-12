#! /usr/bin/env node
import { Command } from 'commander';
import { askMode, MODE_TYPE } from './utils/prompts';
import figlet from 'figlet';

const program = new Command();
console.log(figlet.textSync('TTL CLI'));

program
	.version('1.0.0')
	.description('An CLI interface for ttl')
	.option('-m, --mode  [value]', '直接執行某行為')
	.parse(process.argv);

const options = program.opts();

(async function () {
	const mode: MODE_TYPE = options.mode || (await askMode()).mode;

	switch (mode) {
		case MODE_TYPE.創建店家: {
			console.log('helloWorld');
			break;
		}
		default: {
			console.log('未選擇');
		}
	}
})();
