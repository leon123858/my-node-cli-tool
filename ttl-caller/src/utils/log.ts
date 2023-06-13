import fs from 'fs';
import util from 'util';

export const createLogFile = (path: string) => {
	const logFile = fs.createWriteStream(path, {
		flags: 'w',
	});
	return function (v) {
		logFile.write(util.format(v) + '\n');
	};
};
