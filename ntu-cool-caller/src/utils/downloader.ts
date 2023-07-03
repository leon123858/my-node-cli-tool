import fs from 'fs/promises';
import fsSync from 'fs';
import { WEB_URL } from '../const';

export const downloadFiles = async ({
	fetchCookie,
	folder,
	url,
	path,
}: {
	fetchCookie: any;
	folder?: string;
	url?: string;
	path?: string;
}) => {
	const response = await fetchCookie(
		new Request(
			url
				? `${url}?per_page=200`
				: `${WEB_URL}/api/v1/folders/${folder}/files?per_page=200`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
				credentials: 'include',
			}
		)
	);
	if (!response.ok) {
		throw 'status not OK';
	}
	const finalResult = (await response.json()) as object[];
	console.log('fileCount:', finalResult.length);
	await Promise.all(
		finalResult.map(async (obj: any) => {
			fetchCookie(obj.url)
				.then((res) => res.blob())
				.then(async (data) => {
					const buffer = Buffer.from(await data.arrayBuffer());
					if (path) {
						return fs.writeFile(`./files/${path}/${obj.filename}`, buffer);
					}
					return fs.writeFile(`./files/${obj.filename}`, buffer);
				});
		})
	);
};

export const getFolder = async (fetchCookie: any, folder: string) => {
	const response = await fetchCookie(
		new Request(`${WEB_URL}/api/v1/folders/${folder}/folders?per_page=200`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			credentials: 'include',
		})
	);
	if (!response.ok) {
		throw 'status not OK';
	}
	const finalResult = (await response.json()) as object[];
	console.log('FolderCount:', finalResult.length);
	await Promise.all(
		finalResult.map(async (obj: any) => {
			if (!fsSync.existsSync(`./files/${obj.name}`)) {
				fsSync.mkdirSync(`./files/${obj.name}`);
			}
			return downloadFiles({ fetchCookie, url: obj.files_url, path: obj.name });
		})
	);
};
