import { WEB_URL } from '../const';
import { askString } from './prompts';
import { createFormBody, get__RequestVerificationToken } from './tools';

async function login(fetchCookie) {
	const email = (await askString('輸入帳號')).string;
	const password = (await askString('輸入密碼')).string;
	let response = await fetchCookie(
		new Request(`${WEB_URL}/Account/Login?ReturnUrl=%2F`, {
			method: 'GET',
			credentials: 'include',
		})
	);
	if (response.status !== 200) {
		throw 'get home error';
	}
	const homeText = await response.text();
	const reToken = await get__RequestVerificationToken(homeText);
	var details = {
		__RequestVerificationToken: reToken,
		Email: email,
		Password: password,
		RememberMe: false,
	};
	response = await fetchCookie(
		new Request(`${WEB_URL}/Account/Login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;',
			},
			body: createFormBody(details),
			credentials: 'include',
		})
	);
}

export default login;
