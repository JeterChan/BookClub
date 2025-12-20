# E2E 測試程式碼說明報告

> 📅 產生日期：2024-12-20  
> 📁 測試目錄：`BookClub/frontend/test/e2e/`  
> 🛠️ 測試框架：WebdriverIO 8.x + Mocha

---

## 目錄

1. [架構概覽](#1-架構概覽)
2. [Page Objects 說明](#2-page-objects-說明)
3. [測試規格說明](#3-測試規格說明)
4. [資料夾結構](#4-資料夾結構)
5. [設計模式與最佳實踐](#5-設計模式與最佳實踐)

---

## 1. 架構概覽

本專案採用 **Page Object Model (POM)** 設計模式進行 E2E 測試。此模式將頁面元素和操作封裝在獨立的類別中，提高測試的可維護性和可讀性。

### 1.1 技術棧

| 技術 | 用途 |
|------|------|
| **WebdriverIO 8.x** | 瀏覽器自動化框架 |
| **Mocha** | 測試運行器（`describe`、`it`、`before`） |
| **Expect (WDIO)** | 斷言庫 |
| **TypeScript** | 型別安全 |
| **Chrome Headless** | 測試瀏覽器環境 |

### 1.2 架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                     測試規格 (Specs)                         │
│   ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐  │
│   │ guest.access    │ │ member.access   │ │ admin.access │  │
│   │ .e2e.ts         │ │ .e2e.ts         │ │ .e2e.ts      │  │
│   └────────┬────────┘ └────────┬────────┘ └──────┬───────┘  │
│            │                   │                 │          │
│            ▼                   ▼                 ▼          │
│ ┌──────────────────────────────────────────────────────────┐│
│ │                   Page Objects 層                        ││
│ │  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌────────────┐ ││
│ │  │LoginPage │ │ClubsPage  │ │Dashboard │ │ClubSettings││ ││
│ │  └────┬─────┘ └─────┬─────┘ │   Page   │ │   Page     ││ ││
│ │       │             │       └────┬─────┘ └────────────┘ ││
│ │       └─────────────┴────────────┴───────────────────┐  ││
│ │                                                      │  ││
│ │                       BasePage                       │  ││
│ │           (通用方法：click, setValue, wait...)        │  ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Page Objects 說明

### 2.1 BasePage.ts — 基礎頁面類別

**位置**: `pageobjects/BasePage.ts`  
**行數**: 141 行  
**職責**: 提供所有頁面物件共用的基礎操作方法

#### 核心方法

| 方法名 | 參數 | 回傳值 | 說明 |
|--------|------|--------|------|
| `open(path)` | `string` | `void` | 開啟指定路徑（相對於 baseUrl） |
| `waitForVisible(selector, timeout?)` | `string`, `number` | `void` | 等待元素可見（預設 10 秒） |
| `waitForHidden(selector, timeout?)` | `string`, `number` | `void` | 等待元素消失 |
| `click(selector)` | `string` | `void` | 等待元素可點擊後執行點擊 |
| `setValue(selector, text)` | `string`, `string` | `void` | 輸入文字到指定元素 |
| `getText(selector)` | `string` | `Promise<string>` | 取得元素文字內容 |
| `isElementExisting(selector)` | `string` | `Promise<boolean>` | 檢查元素是否存在於 DOM |
| `isElementDisplayed(selector)` | `string` | `Promise<boolean>` | 檢查元素是否可見 |
| `takeScreenshot(filename)` | `string` | `void` | 截圖並儲存到 screenshots 資料夾 |
| `waitForNavigation(expectedUrl?)` | `string?` | `void` | 等待頁面導航完成 |
| `scrollToElement(selector)` | `string` | `void` | 滾動到元素位置 |
| `clearLocalStorage()` | - | `void` | 清除瀏覽器 LocalStorage |
| `getCurrentUrl()` | - | `Promise<string>` | 取得當前頁面 URL |
| `refresh()` | - | `void` | 重新載入頁面 |

#### 程式碼範例

```typescript
// 等待元素可見
async waitForVisible(selector: string, timeout: number = 10000) {
    const element = await $(selector);
    await element.waitForDisplayed({ timeout });
}

// 點擊元素（含等待可點擊檢查）
async click(selector: string) {
    const element = await $(selector);
    await element.waitForClickable();
    await element.click();
}
```

---

### 2.2 LoginPage.ts — 登入頁面

**位置**: `pageobjects/LoginPage.ts`  
**行數**: 103 行  
**對應頁面**: `/login` (Login.tsx)

#### 選擇器定義

```typescript
private get emailInput() { return $('input[type="email"]'); }
private get passwordInput() { return $('input[type="password"]'); }
private get loginButton() { return $('button[type="submit"]'); }
private get registerLink() { return $('a[href*="/register"]'); }
private get errorMessage() { return $('.error-message, [role="alert"]'); }
```

#### 主要方法

| 方法名 | 說明 |
|--------|------|
| `open()` | 開啟登入頁面並等待 email 輸入框載入 |
| `login(email, password)` | 執行完整登入流程（含等待跳轉和 Token 驗證） |
| `getErrorMessage()` | 取得登入錯誤訊息 |
| `hasErrorMessage()` | 檢查是否顯示錯誤 |
| `clickRegisterLink()` | 點擊前往註冊頁面連結 |
| `waitForLoginSuccess(timeout?)` | 等待登入成功跳轉至 `/welcome` 或 `/dashboard` |

#### 登入流程說明

```typescript
async login(email: string, password: string) {
    // 1. 等待表單載入
    await this.emailInput.waitForDisplayed();
    
    // 2. 填入帳密
    await this.emailInput.setValue(email);
    await this.passwordInput.setValue(password);
    
    // 3. 點擊登入
    await this.loginButton.click();
    
    // 4. 等待 URL 變更（離開 /login）
    await browser.waitUntil(
        async () => !(await browser.getUrl()).includes('/login'),
        { timeout: 10000 }
    );
    
    // 5. 驗證 Token 已儲存
    await browser.waitUntil(
        async () => {
            const hasToken = await browser.execute(() => 
                !!(localStorage.getItem('access_token'))
            );
            return hasToken;
        },
        { timeout: 5000 }
    );
}
```

---

### 2.3 RegisterPage.ts — 註冊頁面

**位置**: `pageobjects/RegisterPage.ts`  
**行數**: 78 行  
**對應頁面**: `/register`

#### 主要方法

| 方法名 | 說明 |
|--------|------|
| `open()` | 開啟註冊頁面 |
| `register(name, email, password, confirmPassword)` | 執行完整註冊流程 |
| `getErrorMessage()` | 取得註冊錯誤訊息 |
| `waitForRegisterSuccess()` | 等待註冊成功跳轉 |

---

### 2.4 DashboardPage.ts — 儀表板頁面

**位置**: `pageobjects/DashboardPage.ts`  
**行數**: 106 行  
**對應頁面**: `/dashboard`

#### 主要方法

| 方法名 | 說明 |
|--------|------|
| `open()` | 開啟儀表板 |
| `isLoggedIn()` | 檢查是否已登入（顯示歡迎訊息） |
| `getWelcomeMessage()` | 取得歡迎訊息文字 |
| `getUserName()` | 取得顯示的用戶名稱 |
| `logout()` | 執行登出操作 |
| `navigateToExploreClubs()` | 導航到讀書會探索頁面 |
| `navigateToProfile()` | 導航到個人資料頁面 |

---

### 2.5 ClubsPage.ts — 讀書會探索頁面

**位置**: `pageobjects/ClubsPage.ts`  
**行數**: 212 行  
**對應頁面**: `/clubs` (ClubExplore.tsx)

#### 選擇器說明

```typescript
// 讀書會卡片使用 role="article"
private get clubCards() { return $$('[role="article"]'); }

// 建立按鈕使用部分文字匹配
private get createClubButton() { return $('button*=建立讀書會'); }
```

#### 主要方法

| 方法名 | 說明 |
|--------|------|
| `open()` | 開啟讀書會列表頁面 |
| `searchClubs(keyword)` | 搜尋讀書會 |
| `getClubCardsCount()` | 取得卡片數量 |
| `clickFirstClub()` | 點擊第一個讀書會 |
| `clickClubByIndex(index)` | 點擊指定索引的讀書會 |
| `clickCreateClub()` | 點擊建立讀書會按鈕 |
| `isCreateClubButtonVisible()` | 檢查建立按鈕是否可見（訪客不可見） |
| `getFirstClubTitle()` | 取得第一個讀書會標題 |
| `waitForClubsLoaded()` | 等待列表載入完成 |
| `findClubIdByName(clubName)` | 根據名稱查找讀書會 ID |

#### 查找讀書會邏輯

```typescript
async findClubIdByName(clubName: string): Promise<string | null> {
    const cards = await this.clubCards;
    
    for (let i = 0; i < cards.length; i++) {
        const titleElement = await cards[i].$('h3');
        const title = await titleElement.getText();
        
        // 使用部分匹配
        if (title.includes(clubName)) {
            // 點擊查看詳情按鈕
            const viewButton = await cards[i].$('button=查看詳情');
            await viewButton.click();
            
            // 從 URL 提取 ID
            const url = await this.getCurrentUrl();
            const match = url.match(/\/clubs\/(\d+)/);
            return match ? match[1] : null;
        }
    }
    return null;
}
```

---

### 2.6 ClubDetailPage.ts — 讀書會詳情頁面

**位置**: `pageobjects/ClubDetailPage.ts`  
**行數**: 223 行  
**對應頁面**: `/clubs/:id`

#### 選擇器說明

```typescript
// 使用 *= 進行部分文字匹配（WebdriverIO 語法）
private get joinButton() { return $('button*=加入'); }
private get leaveButton() { return $('button*=退出'); }
private get manageButton() { return $('button*=管理'); }
```

#### 主要方法

| 方法名 | 說明 |
|--------|------|
| `open(clubId)` | 開啟指定讀書會詳情頁 |
| `getClubTitle()` | 取得讀書會標題 |
| `joinClub()` | 加入讀書會 |
| `leaveClub()` | 退出讀書會（含確認對話框處理） |
| `isJoinButtonVisible()` | 檢查加入按鈕是否可見 |
| `isLeaveButtonVisible()` | 檢查退出按鈕是否可見 |
| `isManageButtonVisible()` | 檢查管理按鈕是否可見（僅 owner/admin） |
| `switchToDiscussionsTab()` | 切換到討論頁籤 |
| `switchToMembersTab()` | 切換到成員頁籤 |
| `isCreateDiscussionButtonVisible()` | 檢查建立討論按鈕是否可見 |
| `isPrivateClub()` | 檢查是否為私密讀書會 |

---

### 2.7 ClubCreatePage.ts — 建立讀書會頁面

**位置**: `pageobjects/ClubCreatePage.ts`  
**行數**: 172 行  
**對應頁面**: `/clubs/create` (ClubCreate.tsx)

#### 主要方法

| 方法名 | 說明 |
|--------|------|
| `open()` | 開啟建立讀書會頁面 |
| `waitForTagsLoaded()` | 等待標籤選項載入 |
| `createClub(clubData)` | 建立讀書會（含完整診斷日誌） |
| `getCurrentClubId()` | 從 URL 取得新建的讀書會 ID |
| `isOnCreatePage()` | 確認是否在建立頁面 |

#### 建立讀書會參數

```typescript
interface ClubData {
    name: string;        // 讀書會名稱
    description: string; // 讀書會簡介
    isPublic?: boolean;  // 是否公開（預設 true）
}
```

#### 建立流程特點

- 包含詳細的 console.log 診斷訊息
- 自動選擇第一個標籤
- 區分必填欄位標記（*）和真正的錯誤訊息
- 等待導航到詳情頁面確認建立成功

---

### 2.8 ClubSettingsPage.ts — 讀書會設定頁面

**位置**: `pageobjects/ClubSettingsPage.ts`  
**行數**: 295 行  
**對應頁面**: `/clubs/:id/settings`

#### 主要方法

| 方法名 | 說明 |
|--------|------|
| `navigateToSettings(clubId)` | 導航至設定頁面（含權限檢查） |
| `updateClubName(newName)` | 更新讀書會名稱 |
| `updateClubDescription(newDescription)` | 更新讀書會簡介 |
| `uploadCoverImage(imagePath)` | 上傳封面圖片 |
| `toggleVisibility(isPrivate)` | 切換公開/私密 |
| `saveChanges()` | 儲存變更 |
| `isSaveSuccessful()` | 檢查儲存是否成功（Toast 訊息） |
| `switchToMembersTab()` | 切換至成員管理標籤 |
| `transferOwnership(newOwnerEmail)` | 轉讓讀書會擁有權 |
| `isSettingsPageLoaded()` | 驗證設定頁面載入成功 |

#### 導航錯誤處理

```typescript
async navigateToSettings(clubId: string) {
    await browser.url(`/clubs/${clubId}/settings`);
    
    // 檢查是否被重定向到登入頁面
    const currentUrl = await browser.getUrl();
    if (currentUrl.includes('/login')) {
        throw new Error(`導航失敗：被重定向到登入頁面
          可能原因：
          1. 使用者未登入或登入狀態已過期
          2. 使用者沒有該讀書會的管理員權限
          3. Session cookie 遺失或無效`);
    }
}
```

---

## 3. 測試規格說明

### 3.1 guest.access.e2e.ts — 訪客權限測試

**位置**: `specs/guest.access.e2e.ts`  
**行數**: 312 行  
**測試對象**: 未登入用戶（訪客）

#### 測試案例分類

| 測試 ID | 名稱 | 預期結果 |
|---------|------|----------|
| TC-G-001 | 訪客不能訪問儀表板 | ❌ 重定向到登入頁 |
| TC-G-002 | 訪客可以訪問登入頁面 | ✅ 成功 |
| TC-G-003 | 訪客可以訪問註冊頁面 | ✅ 成功 |
| TC-G-004 | 訪客可以瀏覽讀書會列表 | ✅ 成功 |
| TC-G-005 | 訪客不能訪問個人資料頁 | ❌ 重定向到登入頁 |
| TC-G-006 | 訪客可以查看讀書會列表 | ✅ 成功 |
| ... | ... | ... |

#### 測試前置條件

```typescript
before(async () => {
    // 確保是訪客狀態（清除所有認證資訊）
    await browser.url('http://localhost:5173');
    await browser.execute(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
});
```

---

### 3.2 member.access.e2e.ts — 會員權限測試

**位置**: `specs/member.access.e2e.ts`  
**行數**: 397 行  
**測試對象**: 已登入的一般會員

#### 測試帳號

```typescript
const testUser = {
    email: 'jjwang1118@gmail.com',
    password: '********', // TODO: 替換為真實密碼才可實測
    name: 'JJ Wang'
};
```

#### 測試案例分類

| Epic | 測試 ID | 名稱 |
|------|---------|------|
| Epic 1 | TC-M-001 | 會員可以訪問儀表板 |
| Epic 1 | TC-M-002 | 會員可以查看個人資訊 |
| Epic 2 | TC-M-003 | 會員可以瀏覽讀書會列表 |
| Epic 2 | TC-M-004 | 會員可以加入讀書會 |
| Epic 3 | TC-M-005 | 會員可以建立讀書會 |
| ... | ... | ... |

---

### 3.3 admin.access.e2e.ts — 管理員權限測試

**位置**: `specs/admin.access.e2e.ts`  
**行數**: 759 行  
**測試對象**: 讀書會管理員/擁有者

#### 測試帳號

```typescript
const ADMIN_EMAIL = 'jjwang1118@gmail.com';
const ADMIN_PASSWORD = '********';  // TODO: 替換為真實密碼
const MEMBER_EMAIL = '980072g@gmail.com';
const MEMBER_PASSWORD = '********'; // TODO: 替換為真實密碼
```

#### 測試案例分類

| 類別 | 測試範圍 | 測試 ID |
|------|----------|---------|
| A 類 | 讀書會設定管理 | TC-A-001 ~ TC-A-008 |
| B 類 | 成員管理 | TC-A-009 ~ TC-A-016 |
| C 類 | 活動管理 | TC-A-017 ~ TC-A-024 |

#### 測試前置條件

```typescript
before(async () => {
    // 以管理員身份登入
    await LoginPage.open();
    await LoginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    
    // 確認 Token 已儲存
    const hasToken = await browser.execute(() => 
        !!(localStorage.getItem('access_token'))
    );
    
    // 查找測試用讀書會
    testClubId = await ClubsPage.findClubIdByName('測試讀書會');
});
```

---

## 4. 資料夾結構

```
test/e2e/
├── fixtures/                    # 測試資料檔案（目前為空）
│
├── pageobjects/                 # Page Object 類別
│   ├── BasePage.ts             # 基礎頁面類別（141 行）
│   ├── LoginPage.ts            # 登入頁面（103 行）
│   ├── RegisterPage.ts         # 註冊頁面（78 行）
│   ├── DashboardPage.ts        # 儀表板頁面（106 行）
│   ├── ClubsPage.ts            # 讀書會列表頁面（212 行）
│   ├── ClubDetailPage.ts       # 讀書會詳情頁面（223 行）
│   ├── ClubCreatePage.ts       # 建立讀書會頁面（172 行）
│   └── ClubSettingsPage.ts     # 讀書會設定頁面（295 行）
│
├── screenshots/                 # 測試截圖
│   ├── TC-A-001/               # 各測試案例截圖
│   ├── TC-A-002/
│   ├── TC-A-009/
│   ├── TC-A-015/
│   ├── TC-G-008/
│   ├── TC-M-004/
│   └── TC-M-006/
│
└── specs/                       # 測試規格檔案
    ├── guest.access.e2e.ts     # 訪客權限測試（312 行）
    ├── member.access.e2e.ts    # 會員權限測試（397 行）
    └── admin.access.e2e.ts     # 管理員權限測試（759 行）
```

---

## 5. 設計模式與最佳實踐

### 5.1 Page Object Model (POM)

**優點**：
- 將頁面元素和操作封裝在專屬類別中
- 測試邏輯與頁面細節分離
- 元素變更只需修改一處

**實踐方式**：
```typescript
// ❌ 不好的做法：直接在測試中使用選擇器
await $('input[type="email"]').setValue('test@example.com');

// ✅ 好的做法：透過 Page Object
await LoginPage.login('test@example.com', 'password');
```

### 5.2 Getter 封裝選擇器

```typescript
// 使用 getter 延遲執行選擇器
private get emailInput() { return $('input[type="email"]'); }
```

**優點**：
- 每次存取都會重新查詢元素（避免過時參考）
- 保持選擇器定義的集中管理

### 5.3 等待策略

```typescript
// 明確等待元素可點擊
await element.waitForClickable();
await element.click();

// 等待頁面狀態變化
await browser.waitUntil(
    async () => (await browser.getUrl()).includes('/dashboard'),
    { timeout: 10000, timeoutMsg: '導航超時' }
);
```

### 5.4 錯誤處理與診斷

```typescript
// 包含詳細的診斷日誌
console.log('⏳ [開始] createClub 方法執行');
console.log(`📍 當前 URL: ${currentUrl}`);
console.log('✅ 表單已載入');

// 有意義的錯誤訊息
throw new Error(`導航失敗：被重定向到登入頁面
  可能原因：
  1. 使用者未登入或登入狀態已過期
  2. 使用者沒有該讀書會的管理員權限`);
```

### 5.5 單例模式

```typescript
// 所有 Page Object 都導出單例實例
export default new LoginPage();

// 測試中直接使用
import LoginPage from '../pageobjects/LoginPage';
await LoginPage.open();
```

---

## 附錄：快速參考

### 執行測試指令

```bash
# 執行所有 E2E 測試
npm run test:e2e

# 執行特定測試檔案
npm run test:e2e -- --spec="test/e2e/specs/admin.access.e2e.ts"

# 執行特定測試案例（使用 grep）
npm run test:e2e -- --spec="test/e2e/specs/admin.access.e2e.ts" --mochaOpts.grep="TC-A-001"

# 使用 WDIO 直接執行
npx wdio run wdio.conf.ts --spec test/e2e/specs/admin.access.e2e.ts
```

### WebdriverIO 常用選擇器語法

| 語法 | 說明 | 範例 |
|------|------|------|
| `$('selector')` | 單一元素 | `$('button')` |
| `$$('selector')` | 多個元素 | `$$('[role="article"]')` |
| `*=` | 部分文字匹配 | `$('button*=建立')` |
| `=` | 完整文字匹配 | `$('button=確認')` |

---

> 📝 本文件由 GitHub Copilot 自動產生  
> ⚠️ 密碼已掩碼處理，執行測試前請替換為真實密碼
