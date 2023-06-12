async function get__RequestVerificationToken(
	text,
	regexString = /id="loginForm".*?value="(.*?)"/,
	index = 1
) {
	const regex = new RegExp(regexString);
	const result = text.match(regex);
	if (!result) {
		throw 'should find __RequestVerificationToken in form';
	}
	// console.log(result);
	const reToken = result[index];
	return reToken;
}

function createFormBody(details: object) {
	var formBodyComponents: string[] = [];
	for (var property in details) {
		var encodedKey = encodeURIComponent(property);
		var encodedValue = encodeURIComponent(details[property]);
		formBodyComponents.push(`${encodedKey}=${encodedValue}`);
	}
	var formBody = formBodyComponents.join('&');
	return formBody;
}

export { get__RequestVerificationToken, createFormBody };
