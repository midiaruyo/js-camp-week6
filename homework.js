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
		console.log("getProducts fail:", error);
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
		console.log("getCart fail:", error);
        return { "status": false, carts: [], total: 0, finalTotal: 0 };
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
	// 1. 發送 POST 請求
	const fetchHdr  = { "Content-Type": "application/json"};
	const fetchBody = { data: { productId: productId, quantity: quantity } };
    const addCart   = await fetch(CARTS_PATH, {
        method: "POST",
        headers: fetchHdr,
        body: JSON.stringify(fetchBody),
    });
	if (!addCart.ok) {
        throw new Error(`Add Cart Status：${addCart.status}`);
    }
	// 2. 回傳更新後的購物車資料
	const getCarts = await fetch(CARTS_PATH);
	if (!getCarts.ok) {
        throw new Error(`get Cart Status：${getCarts.status}`);
    }
	const carts    = await getCarts.json();
	return carts;
}

/**
 * 2. 編輯購物車商品數量
 * @param {string} cartId - 購物車項目 ID
 * @param {number} quantity - 新數量
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function updateCartItem(cartId, quantity) {
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
	const getCarts  = await fetch(CARTS_PATH);
	if (!getCarts.ok) {
        throw new Error(`get Cart Status：${getCarts.status}`);
    }
	const carts    = await getCarts.json();
	return carts;
}

/**
 * 3. 刪除購物車特定商品
 * @param {string} cartId - 購物車項目 ID
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function removeCartItem(cartId) {
	// 1. 提示：發送 DELETE 請求
	const delCartPath   = `${CARTS_PATH}/${cartId}`; 
    const delCart       = await fetch(delCartPath, {
        method: "DELETE"
    });
	if (!delCart.ok) {
        throw new Error(`Del Cart[${cartId}] Status：${delCart.status}`);
    }
	// 2. 回傳更新後的購物車資料
	const getCarts  = await fetch(CARTS_PATH);
	if (!getCarts.ok) {
        throw new Error(`get Cart Status：${getCarts.status}`);
    }
	const carts    = await getCarts.json();
	return carts;
}

/**
 * 4. 清空購物車
 * @returns {Promise<Object>} - 回傳清空後的購物車資料
 */
async function clearCart() {
	// 請實作此函式
	// 提示：發送 DELETE 請求到 /carts
	// 1. 提示：發送 DELETE 請求
    const clearCart       = await fetch(CARTS_PATH, {
        method: "DELETE"
    });
	if (!clearCart.ok) {
        throw new Error(`Clear Cart Status：${clearCart.status}`);
    }
	// 2. 回傳更新後的購物車資料
	const getCarts  = await fetch(CARTS_PATH);
	if (!getCarts.ok) {
        throw new Error(`get Cart Status：${getCarts.status}`);
    }
	const carts    = await getCarts.json();
	return carts;
}

// ========================================
// HTTP 知識測驗 (額外練習)
// ========================================

/*
請回答以下問題（可以寫在這裡或另外繳交）：

1. HTTP 狀態碼的分類（1xx, 2xx, 3xx, 4xx, 5xx 各代表什麼）
   答：

2. GET、POST、PATCH、PUT、DELETE 的差異
   答：

3. 什麼是 RESTful API？
   答：


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
