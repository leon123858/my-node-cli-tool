#! /usr/bin/env node
import { Command } from 'commander';
import { askMode, MODE_TYPE, askString } from './utils/prompts';
import figlet from 'figlet';
import makeFetchCookie from 'fetch-cookie';
import { WEB_URL } from './const';
import { downloadFiles, getFolder } from './utils/downloader';

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
		case MODE_TYPE.下載資料夾: {
			const sessionKey = (await askString('請輸入你的 NTU COOL Session'))
				.string;
			const folder = (await askString('folder id')).string;
			// init fetch
			const cookieJar = new makeFetchCookie.toughCookie.CookieJar();
			await cookieJar.setCookie(
				`_normandy_session=${sessionKey}`,
				WEB_URL as string
			);
			const fetchCookie = makeFetchCookie(fetch, cookieJar);
			await downloadFiles({ fetchCookie, folder });
			await getFolder(fetchCookie, folder);
			break;
		}
		default: {
			console.log('未選擇');
		}
	}
})();
