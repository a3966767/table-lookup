/**
 * ==============================================================
 * 桌次查詢系統 (Google 試算表版)
 * ==============================================================
 */

// 1. 請填入您的 Google 試算表「發布到網路 -> CSV」的網址
// 格式範例：https://docs.google.com/spreadsheets/d/e/.../pub?output=csv
// (請確保試算表 A 欄是「名字」，B 欄是「桌次」，不要有空白列)
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXf3vNAeqYDFVjLSi2cezpx0B70WUpgzqnMYkxn4H8Mfn-p_MV0-0fSbrFVPz-6QD334RE33vE0Z-X/pub?gid=0&single=true&output=csv";


// ==============================================================
// 以下為系統核心邏輯，如無特殊需求請勿更動
// ==============================================================

let guestData = {};

// DOM 元素選取
const nameInput = document.getElementById('nameInput');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultContainer');
const resultName = document.getElementById('resultName');
const resultTableNumber = document.getElementById('resultTableNumber');
const errorContainer = document.getElementById('errorContainer');
const loadingIndicator = document.getElementById('loadingIndicator');

/**
 * 解析 CSV 文字，轉換為 { "名字": "桌次" } 的物件格式
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const data = {};

    for (let i = 0; i < lines.length; i++) {
        // 去除可能的 \r 換行符號與前後空白
        const line = lines[i].trim();
        if (!line) continue;

        // 簡單逗號分隔 (適用於沒有複雜引號包覆的資料)
        const parts = line.split(',');
        if (parts.length >= 2) {
            const name = parts[0].trim();
            const tableNum = parts[1].trim();

            if (name) {
                data[name] = tableNum;
            }
        }
    }
    return data;
}

/**
 * 從 Google 試算表載入資料
 */
async function loadData() {
    // 檢查是否有填寫網址
    if (GOOGLE_SHEET_CSV_URL.includes('您的_')) {
        showError('系統尚未設定 Google 試算表網址。<br>請管理員編輯 app.js 檔案並填寫 CSV 網址。');
        return false;
    }

    try {
        // 顯示載入中
        loadingIndicator.classList.remove('hidden');

        // 加上一個時間戳記參數防止瀏覽器快取舊資料
        const urlWithTimestamp = `${GOOGLE_SHEET_CSV_URL}&t=${new Date().getTime()}`;
        const response = await fetch(urlWithTimestamp);

        if (!response.ok) {
            throw new Error('無法讀取試算表資料，請確認網址是否正確並已設定為公開。');
        }

        const csvText = await response.text();
        guestData = parseCSV(csvText);
        console.log(`成功載入資料：共 ${Object.keys(guestData).length} 筆`);

        return true;
    } catch (err) {
        console.error('載入失敗:', err);
        showError('資料載入失敗，請確認網路連線或聯絡管理員確認設定。');
        return false;
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

/**
 * 執行搜尋
 */
async function performSearch() {
    // 隱藏之前的結果與錯誤
    hideResults();

    const queryName = nameInput.value.trim();
    if (!queryName) {
        showError('請輸入您的Teams全名以進行查詢');
        return;
    }

    // 如果資料尚未載入 (例如使用者剛開網頁就按查詢)
    if (Object.keys(guestData).length === 0) {
        const success = await loadData();
        if (success) {
            checkName(queryName);
        }
    } else {
        // 資料已存在，直接查詢
        checkName(queryName);
    }
}

/**
 * 檢查名單並顯示結果
 */
function checkName(queryName) {
    // 精準匹配
    const tableNumber = guestData[queryName];

    if (tableNumber) {
        // 找到結果
        resultName.textContent = queryName;
        resultTableNumber.textContent = tableNumber;
        resultContainer.classList.remove('hidden');

        // 微小延遲確保 display 轉為 block 後，再加入 show class 觸發 CSS 動畫
        setTimeout(() => {
            resultContainer.classList.add('show');
        }, 10);

    } else {
        // 找不到，顯示優雅的錯誤提示
        showError(`抱歉，找不到「${queryName}」的桌次資料。<br>請確認輸入的名稱是否有誤，或洽詢現場工作人員。`);
    }
}

/**
 * 隱藏所有結果與錯誤區塊
 */
function hideResults() {
    resultContainer.classList.remove('show');
    resultContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
}

/**
 * 顯示錯誤訊息
 */
function showError(msg) {
    document.getElementById('errorText').innerHTML = msg;
    errorContainer.classList.remove('hidden');
}

// ==============================================================
// 事件綁定
// ==============================================================

// 點擊查詢按鈕
searchBtn.addEventListener('click', performSearch);

// 在輸入框按下 Enter 鍵也能觸發查詢
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// ==============================================================
// 網頁載入時初始化
// ==============================================================
document.addEventListener('DOMContentLoaded', () => {
    // 預先在背景拉取資料，加速使用者查詢體驗
    if (!GOOGLE_SHEET_CSV_URL.includes('您的_')) {
        loadData();
    }
});


