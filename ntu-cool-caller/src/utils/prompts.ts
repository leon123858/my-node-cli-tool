import prompts from 'prompts';

enum MODE_TYPE {
	'下載資料夾' = 'downloadFiles',
}

const modeChoices = Object.keys(MODE_TYPE).map((key) => {
	return {
		title: key,
		value: MODE_TYPE[key as keyof typeof MODE_TYPE],
	};
});

const askMode = () =>
	prompts({
		type: 'select',
		name: 'mode',
		message: '想做甚麼?',
		choices: modeChoices,
	});

const askString = (prompt: string) =>
	prompts({
		type: 'text',
		name: 'string',
		message: prompt,
	});

export { askString, askMode, MODE_TYPE };
