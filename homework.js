// ========================================
// 第六週作業：電商 API 資料串接練習
// 執行方式：node homework.js
// 環境需求：Node.js 18+（內建 fetch）
// ========================================

// 載入環境變數
require("dotenv").config({ path: ".env" });

// API 設定（從 .env 讀取）
const API_PATH = process.env.API_PATH;
const BASE_URL = "https://livejs-api.hexschool.io";
const ADMIN_TOKEN = process.env.API_KEY;
const PRODUCTS_PATH =`${BASE_URL}${API_PATH}products`; //取產品列表
const CARTS_PATH    =`${BASE_URL}${API_PATH}carts`;    //取購物車列表
// ========================================
// 任務一：基礎 fetch 練習
// ========================================

/**
 * 1. 取得產品列表: 
 * 使用 fetch 發送 GET 請求
 * @returns {Promise<Array>} - 回傳 products 陣列
 */
async function getProducts() {
	try {
        // 1. 使用 fetch() 發送 GET 請求
        const response = await fetch(PRODUCTS_PATH);
        //console.log(PRODUCTS_PATH)
        // 2. 使用 response.json() 解析回應
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        // 3. 回傳 data.products
        return data.products||[];
    } catch (error) {
		console.log("getProducts fail:" + error);
        return [];
	}
}

/**
 * 2. 取得購物車列表 
 * @returns {Promise<Object>} - 回傳 { carts: [...], total: 數字, finalTotal: 數字 }
 */
async function getCart() {
	try {
		// 1. 使用 fetch() 發送 GET 請求
		const response = await fetch(CARTS_PATH);
		//console.log(CARTS_PATH)
		if (!response.ok) {
			return { "status": false, carts: [], total: 0, finalTotal: 0 };
		}
	
		// 2. 使用 response.json() 解析回應
		const data       = await response.json();
		const cartList   = data.carts || [];
		const total      = cartList.reduce(
			(acc, item) => acc + item.product.origin_price * item.quantity,
			0
		);
		const finalTotal = cartList.reduce(
			(acc, item) => acc + item.product.price * item.quantity,
			0
		);
		return {...data, total, finalTotal};	
		
	} catch (error) {
		console.log("getCart fail:" +  error);
        throw error;
	}
}

/**
 * 3. 錯誤處理：當 API 回傳錯誤時，回傳錯誤訊息
 * @returns {Promise<Object>} - 回傳 { success: boolean, data?: [...], error?: string }
 */
async function getProductsSafe() {
	// 1. 加上 try-catch 處理錯誤
	try {
		const response = await fetch(PRODUCTS_PATH);
		
		// 2. 檢查 response.ok 判斷是否成功
		if(!response.ok){
			return { success: false, error: `HTTP Status：${response.status}` };
		}
        // 3. 成功回傳 { success: true, data: [...] }
		const data     = await response.json();
		return { success: true, data: data.products };
	} catch (error) {
		// 4. 失敗回傳 { success: false, error: '錯誤訊息' }
        return { success: false, error: error.message };
	}
}

// ========================================
// 任務二：POST 請求 - 購物車操作
// ========================================

/**
 * 1. 加入商品到購物車
 * @param {string} productId - 產品 ID
 * @param {number} quantity - 數量
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function addToCart(productId, quantity) {
	try {
		//0. 檢查輸入
		if (quantity < 1) {
			throw new Error(`產品數量不可小於 1 RRR ((((；゜Д゜)))`);
		}	
		// 1. 發送 POST 請求
		const fetchHdr  = { "Content-Type": "application/json"};
		const fetchBody = { data: { productId , quantity } };
		const addCart = await fetch(CARTS_PATH, {
			method: "POST",
			headers: fetchHdr,
			body: JSON.stringify(fetchBody),
		});
		if (!addCart.ok) {
			throw new Error(`Add Cart Status：${addCart.status}`);
		}
		// 2. 回傳更新後的購物車資料
		const carts = await addCart.json();
		return carts;

	} catch (error) {
		console.log("addToCart Fail:"+ error);
        throw error;	
	}
}

/**
 * 2. 編輯購物車商品數量
 * @param {string} cartId - 購物車項目 ID
 * @param {number} quantity - 新數量
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function updateCartItem(cartId, quantity) {
	try {
		// 1. 發送 PATCH 請求
		const fetchHdr  = { "Content-Type": "application/json"};
		const fetchBody = { data: { id: cartId, quantity: quantity } };
		const updCart   = await fetch(CARTS_PATH, {
			method: "PATCH",
			headers: fetchHdr,
			body: JSON.stringify(fetchBody),
		});
		if (!updCart.ok) {
			throw new Error(`Update Cart Status：${updCart.status}`);
		}
		// 2. 回傳更新後的購物車資料
		const carts    = await updCart.json();
		return carts;	
	} catch (error) {
		console.log("updateCartItem Fail:"+ error);
        throw error;		
	}
}

/**
 * 3. 刪除購物車特定商品
 * @param {string} cartId - 購物車項目 ID
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function removeCartItem(cartId) {
	try {
		// 1. 提示：發送 DELETE 請求
		const delCartPath   = `${CARTS_PATH}/${cartId}`; 
		const delCart       = await fetch(delCartPath, {
			method: "DELETE"
		});
		if (!delCart.ok) {
			throw new Error(`Del Cart[${cartId}] Status：${delCart.status}`);
		}
		// 2. 回傳更新後的購物車資料
		const carts    = await delCart.json();
		return carts;	
	} catch (error) {
		console.log("removeCartItem ["+cartId+"]Fail:"+ error);
        throw error;			
	}
}

/**
 * 4. 清空購物車
 * @returns {Promise<Object>} - 回傳清空後的購物車資料
 */
async function clearCart() {
	try {
		const clearCart       = await fetch(CARTS_PATH, {
			method: "DELETE"
		});
		if (!clearCart.ok) {
			throw new Error(`Clear Cart Status：${clearCart.status}`);
		}
		// 2. 回傳更新後的購物車資料
		const carts    = await clearCart.json();
		return carts;		
	} catch (error) {
		console.log("clearCart Fail:"+ error);
        throw error;			
	}
}

// ========================================
// HTTP 知識測驗 (額外練習)
// ========================================

/*
請回答以下問題（可以寫在這裡或另外繳交）：

1. HTTP 狀態碼的分類（1xx, 2xx, 3xx, 4xx, 5xx 各代表什麼）
   答：
1xx,資訊類： 
例如 100 continue 一 當用戶使用PUT請求上傳檔案，伺服器使用100 Continue告訴用戶繼續上傳
https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Reference/Status/100

2xx,請求成功： 
例如 200 ok 一 用戶使用GET請求資料，伺服器回應200 ok並附上資料

3xx,轉向： 
例如 303 see other 一 伺服器告訴用戶：轉存取另一個URI資源

4xx,client端失敗回應： 
例如 404 Not found 一 伺服器告訴用戶：請求的資源不存在

5xx,server端錯誤回應： 
例如 503 Service Unavailable 一 伺服器告訴用戶：伺服器無法完成請求

主要參考 https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Reference/Status#%E8%B3%87%E8%A8%8A%E5%9B%9E%E6%87%89


2. GET、POST、PATCH、PUT、DELETE 的差異
   答：
 GET、取得資料
 POST、新增資料
 PATCH、更新部分資料（傳遞單筆資料部分屬性，更新原有資料）
 PUT、更新完整資料（傳遞單筆資料所有屬性，覆蓋原有資料）
 DELETE 刪除資源
 
參考：https://hackmd.io/@hexschool/SkJZZrH2-g#HTTP-方法-—-你要服務生做什麼

3. 什麼是 RESTful API？
   答：
   1.REST = REpresentational State Transfer，
   透過 HTTP 把資源當下的狀態，用某種呈現格式(例如：JSON)，傳給用戶端
   2.RESTful = 符合 REST 風格的 API
   透過網址(例如：/carts)描述要存取的資源，透過方法(例如：GET、POST..)來描述要取還是要存

參考：https://hackmd.io/@hexschool/SkJZZrH2-g#RESTful-API-是什麼
*/

// ========================================
// 匯出函式供測試使用
// ========================================
module.exports = {
	API_PATH,
	BASE_URL,
	ADMIN_TOKEN,
	getProducts,
	getCart,
	getProductsSafe,
	addToCart,
	updateCartItem,
	removeCartItem,
	clearCart,
};

// ========================================
// 直接執行測試
// ========================================
if (require.main === module) {
	async function runTests() {
		console.log("=== 第六週作業測試 ===\n");
		console.log("API_PATH:", API_PATH);
		console.log("");

		if (!API_PATH) {
			console.log("請先在 .env 檔案中設定 API_PATH！");
			return;
		}

		// 任務一測試
		console.log("--- 任務一：基礎 fetch ---");
		try {
			const products = await getProducts();
			console.log(
				"getProducts:",
				products ? `成功取得 ${products.length} 筆產品` : "回傳 undefined",
			);
		} catch (error) {
			console.log("getProducts 錯誤:", error.message);
		}

		try {
			const cart = await getCart();
			console.log(
				"getCart:",
				cart ? `購物車有 ${cart.carts?.length || 0} 筆商品` : "回傳 undefined",
			);
		} catch (error) {
			console.log("getCart 錯誤:", error.message);
		}

		try {
			const result = await getProductsSafe();
			console.log(
				"getProductsSafe:",
				result?.success ? "成功" : result?.error || "回傳 undefined",
			);
		} catch (error) {
			console.log("getProductsSafe 錯誤:", error.message);
		}

		console.log("\n=== 測試結束 ===");
		console.log("\n提示：執行 node test.js 進行完整驗證");
	}

	runTests();
}
