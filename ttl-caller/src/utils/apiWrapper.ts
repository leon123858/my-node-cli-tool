import { WEB_URL } from '../const';
import { createFormBody, get__RequestVerificationToken } from './tools';

class ApiWrapper {
	fetchCookie;
	constructor(fetcher: any) {
		this.fetchCookie = fetcher;
	}

	async getSellerIdByStoreID(editTarget: string) {
		var details = {
			SellerID: editTarget,
		};
		var response = await this.fetchCookie(
			new Request(`${WEB_URL}/Backend/Seller/Query`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded;',
				},
				body: createFormBody(details),
				credentials: 'include',
			})
		);
		const result = await response.json();
		for (let i in result) {
			if (result[i]['StoreID'] === editTarget) {
				return result[i]['SellerID'] as string;
			}
		}
		throw 'no edit target';
	}

	async getInterviewerIdByInterviewerDisplayName(
		InterviewerName: string
	): Promise<string> {
		var response = await this.fetchCookie(
			new Request(`${WEB_URL}/Backend/AccountManage/GetAccountList`, {
				method: 'GET',
				credentials: 'include',
			})
		);

		const arr = await response.json();
		let InterviewerID = '';
		for (let i of arr) {
			if (i.DisplayName === InterviewerName) {
				if (InterviewerID !== '') {
					throw 'have same display name';
				}
				InterviewerID = i.Id;
			}
		}
		if (InterviewerID === '') {
			throw 'have no display name';
		}
		return InterviewerID;
	}

	async getInterviewerInfo(InterviewerID: string): Promise<{
		RegionName: string;
		Region: string;
		SellerType: string;
	}> {
		let details = {
			id: InterviewerID,
		};
		let response = await this.fetchCookie(
			new Request(`${WEB_URL}/Backend/Seller/GetInterviewById`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded;',
				},
				body: createFormBody(details),
				credentials: 'include',
			})
		);
		return await response.json();
	}

	async getUrlReTokenWithReg(url: string, reg: RegExp): Promise<string> {
		const response = await this.fetchCookie(
			new Request(url, {
				method: 'GET',
				credentials: 'include',
			})
		);
		if (response.status !== 200) {
			throw 'get page error';
		}
		const pageText = await response.text();
		const reToken = await get__RequestVerificationToken(pageText, reg);
		return reToken;
	}
}

export default ApiWrapper;
