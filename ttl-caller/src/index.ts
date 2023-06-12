#! /usr/bin/env node
import { Command } from 'commander';
import { askMode, MODE_TYPE, askString } from './utils/prompts';
import makeFetchCookie from 'fetch-cookie';
import figlet from 'figlet';
import login from './utils/login';
import { createFormBody, get__RequestVerificationToken } from './utils/tools';
import { WEB_URL } from './const';

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
			console.log('開始創建店家');
			const cookieJar = new makeFetchCookie.toughCookie.CookieJar();
			const fetchCookie = makeFetchCookie(fetch, cookieJar);
			await login(fetchCookie);
			let details: any = {};
			let response: Response;
			const InterviewerName = '李文鈞';
			let InterviewerID = '';
			const isEdit = true;
			let editTarget = 'leontest12';
			let editId = '';
			if (isEdit) {
				details = {
					SellerID: editTarget,
				};
				response = await fetchCookie(
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
						editId = result[i]['SellerID'];
					}
				}
				if (editId === '') {
					console.error('no edit target');
					break;
				}
			}
			response = await fetchCookie(
				new Request(`${WEB_URL}/Backend/AccountManage/GetAccountList`, {
					method: 'GET',
					credentials: 'include',
				})
			);
			if (InterviewerID === '') {
				const arr = await response.json();
				let err = false;
				for (let i of arr) {
					if (i.DisplayName === InterviewerName) {
						if (InterviewerID !== '') {
							console.error('have same display name');
							err = true;
						}
						InterviewerID = i.Id;
					}
				}
				if (err) {
					break;
				}
			}

			response = await fetchCookie(
				new Request(
					!isEdit
						? `${WEB_URL}/Backend/Seller/SellerBasic`
						: `${WEB_URL}/Backend/Seller/SellerBasic/${editId}`,
					{
						method: 'GET',
						credentials: 'include',
					}
				)
			);
			if (response.status !== 200) {
				throw 'get page error';
			}
			const pageText = await response.text();
			const reToken = await get__RequestVerificationToken(
				pageText,
				/id="SellerForm".*?value="(.*?)"/
			);

			details = {
				id: InterviewerID,
			};
			response = await fetchCookie(
				new Request(`${WEB_URL}/Backend/Seller/GetInterviewById`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded;',
					},
					body: createFormBody(details),
					credentials: 'include',
				})
			);
			const { RegionName, Region, SellerType } = await response.json();
			details = !isEdit
				? {
						__RequestVerificationToken: reToken,
						SellerID: '00000000-0000-0000-0000-000000000000',
						Title: 'leontest12', // 店家名稱
						StoreID: 'leontest12', // 店家 ID
						Password: 'test123',
						InterviewerID: InterviewerID, // 訪員 ID
						RegionName, // 以下由訪員決定
						Region,
						SellerType,
				  }
				: {
						__RequestVerificationToken: reToken,
						SellerID: editId,
						ImageID: '',
						Title: 'leontest1111',
						Name: '',
						Gender: 0,
						StoreID: 'leontest12',
						PasswordForEdit: '',
						Status: 0,
						Tel: '',
						Mobile: '',
						Birthday: '',
						WorkTypeID: 'a79e8eba-9777-470f-8aba-35dff012879d',
						JobTitle: '',
						EducationID: '20350feb-2dd4-41eb-a158-b65c17f94b0f',
						Email: '',
						Address: '',
						RegionName, // 以下由訪員決定
						Region,
						SellerType, // 以上由訪員決定
						'X-Requested-With': 'XMLHttpRequest',
				  };
			response = await fetchCookie(
				new Request(`${WEB_URL}/Backend/Seller/SaveSeller`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded;',
					},
					body: createFormBody(details),
					credentials: 'include',
				})
			);
			const finalResult = await response.json();
			if (finalResult.result) {
				console.log('創建成功');
			} else {
				console.log('創建失敗');
				console.log(finalResult.message);
			}
			break;
		}
		default: {
			console.log('未選擇');
		}
	}
})();
