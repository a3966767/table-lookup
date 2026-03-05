/**
 * ==============================================================
 * 桌次查詢系統 (靜態高併發版)
 * ==============================================================
 * 
 * 此版本直接由 data.js 讀取名單，無需透過 Google 試算表。
 * 查詢速度最快，且可無限制承受高達數十萬人的瞬間併發流量。
 */

// DOM 元素選取
const nameInput = document.getElementById('nameInput');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultContainer');
const resultName = document.getElementById('resultName');
const resultTableNumber = document.getElementById('resultTableNumber');
const errorContainer = document.getElementById('errorContainer');

/**
 * 執行搜尋
 */
function performSearch() {
    // 隱藏之前的結果與錯誤
    hideResults();

    const queryName = nameInput.value.trim();
    if (!queryName) {
        showError('請輸入您的Teams全名以進行查詢');
        return;
    }

    checkName(queryName);
}

/**
 * 檢查名單並顯示結果
 */
function checkName(queryName) {
    // 從預先載入的 data.js (guestData) 中精準匹配
    // 若找不到精準匹配，試著檢查是否包含 (可選，目前使用精確匹配)
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
    // 檢查資料是否成功載入
    if (typeof guestData === 'undefined') {
        showError('系統資料檔案 (data.js) 遺失或格式錯誤，請聯絡管理員。');
        searchBtn.disabled = true;
        nameInput.disabled = true;
    }
});
