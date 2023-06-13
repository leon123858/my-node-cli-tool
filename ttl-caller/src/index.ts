#! /usr/bin/env node
import { Command } from 'commander';
import { askMode, askString, MODE_TYPE } from './utils/prompts';
import makeFetchCookie from 'fetch-cookie';
import figlet from 'figlet';
import login from './utils/login';
import { createFormBody } from './utils/tools';
import { WEB_URL } from './const';
import ApiWrapper from './utils/apiWrapper';
import fs from 'fs/promises';
import { createLogFile } from './utils/log';

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
			// log file
			const errLog = createLogFile('./err.log');
			const haveCreated = createLogFile('./created.log');
			// read file
			const file = JSON.parse(
				await fs.readFile(
					(
						await askString('input the path for store file(**/*.json)')
					).string,
					{ encoding: 'utf-8' }
				)
			) as object[];
			// init fetch
			const cookieJar = new makeFetchCookie.toughCookie.CookieJar();
			const fetchCookie = makeFetchCookie(fetch, cookieJar);
			const apiManager = new ApiWrapper(fetchCookie);
			await login(fetchCookie);
			// lamda func in it
			const saveSeller = async ({
				isEdit = false,
				InterviewerName = '李文鈞',
				Title = 'storeName',
				StoreId,
				Password = '',
			}) => {
				if (!StoreId) {
					throw 'Should set StoreId as parameter';
				}
				let details: any = {};
				let response: Response;
				const InterviewerID =
					await apiManager.getInterviewerIdByInterviewerDisplayName(
						InterviewerName
					);
				const editId = isEdit
					? await apiManager.getSellerIdByStoreID(StoreId)
					: '';
				const { RegionName, Region, SellerType } =
					await apiManager.getInterviewerInfo(InterviewerID);
				const reToken = await apiManager.getUrlReTokenWithReg(
					!isEdit
						? `${WEB_URL}/Backend/Seller/SellerBasic`
						: `${WEB_URL}/Backend/Seller/SellerBasic/${editId}`,
					/id="SellerForm".*?value="(.*?)"/
				);
				details = !isEdit
					? {
							__RequestVerificationToken: reToken,
							SellerID: '00000000-0000-0000-0000-000000000000',
							Title: Title, // 店家名稱
							StoreID: StoreId, // 店家 ID
							Password: Password,
							Tel: '',
							Address: '',
							InterviewerID, // 訪員 ID
							RegionName, // 以下由訪員決定
							Region,
							SellerType,
							'X-Requested-With': 'XMLHttpRequest',
					  }
					: {
							__RequestVerificationToken: reToken,
							SellerID: editId,
							ImageID: '',
							Title: Title,
							Name: '',
							Gender: 0,
							StoreID: StoreId,
							PasswordForEdit: Password,
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
					return true;
				}
				haveCreated(`創建失敗:${finalResult.message}`);
				return false;
			};
			// main process
			for (let i of file) {
				const {
					對應訪銷人員: InterviewerName,
					店家名稱: Title,
					帳號: StoreId,
					密碼: Password,
				} = i as any;
				try {
					let result = await saveSeller({
						isEdit: false,
						InterviewerName,
						Title,
						StoreId,
						Password,
					});
					if (result) {
						continue;
					}
					// 不建議利用此 API 編輯, 許多變數的調整會有 bug
					// result = await saveSeller({
					// 	isEdit: true,
					// 	InterviewerName,
					// 	Title,
					// 	StoreId,
					// 	Password,
					// });
					// if (result) {
					// 	console.log(StoreId, 'OK!(edit)');
					// 	continue;
					// }
				} catch (err) {
					errLog(`${StoreId}:${err}`);
				}
			}
			break;
		}
		default: {
			console.log('未選擇');
		}
	}
})();
