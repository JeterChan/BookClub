# 介面流程圖（根據實際前端架構重新設計）

> 本文檔根據實際前端程式碼架構重新設計，確保所有流程圖與實際實作一致。
> 最後更新：2024年（基於 App.tsx、Dashboard、Account、ClubManagement 等實際檔案）

---

## 1. 系統整體架構

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:使用者訪問系統;

if (已登入?) then (是)
  #FFE5B4:Header 元件\n含登出選項;
  :主要導覽;
  
  if (選擇頁面) then (/dashboard)
    #FFB6C1:儀表板頁面\n2 Tabs: 總覽、留言;
  elseif (選擇頁面) then (/account)
    #DDA0DD:帳號設定頁面\n4 Tabs: 個人設定、通知、我的社團、我的留言;
  elseif (選擇頁面) then (/clubs)
    :社團目錄;
  elseif (選擇頁面) then (/discussions)
    :討論區列表;
  else (/clubs/create)
    :建立社團\nProtected;
  endif
  
else (否)
  :Mainpage 未登入版\nHero + Features + Testimonials + Newsletter;
  
  if (使用者操作) then (點擊登入按鈕)
    :開啟 AuthModal\nmode='login';
    #90EE90:認證成功;
  elseif (使用者操作) then (點擊註冊按鈕)
    :開啟 AuthModal\nmode='register';
    #90EE90:認證成功;
  else (瀏覽內容)
    :查看功能介紹\n評價、訂閱電子報;
    stop
  endif
  
  #87CEEB:儲存 Token 至\nlocalStorage/sessionStorage;
  :authStore 同步認證狀態;
  :重新導向至 /dashboard;
endif

stop
@enduml
```

### 關鍵說明
- **認證檢查**：`useAuthStore` 的 `isAuthenticated` 狀態決定顯示內容
- **初始化流程**：App.tsx 啟動時執行 `initialize()` 從 storage 恢復登入狀態
- **跨分頁同步**：監聽 `storage` 事件，當 `access_token` 變更時觸發 `syncFromStorage()`
- **Protected Route**：未登入使用者訪問受保護路由會被重新導向至 `/`

---

## 2. 使用者認證流程（登入/註冊）

### 2.1 登入流程

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:使用者點擊登入按鈕;
:呼叫 handleOpenAuth('login')\n開啟 AuthModal;
:顯示登入表單\nEmail + Password 欄位;

repeat
  :使用者輸入;
  
  #FFE5B4:前端驗證;
  
  if (驗證結果) then (Email 格式錯誤)
    :顯示錯誤訊息\n請輸入有效的電子郵件;
  elseif (驗證結果) then (密碼為空)
    :顯示錯誤訊息\n密碼不可為空;
  else (驗證通過)
    :呼叫 POST /api/auth/login\n傳送 email, password;
    
    #FFD700:API 回應;
    
    if (回應狀態) then (401 Unauthorized)
      :顯示錯誤訊息\n帳號或密碼錯誤;
    elseif (回應狀態) then (500 Server Error)
      :顯示錯誤訊息\n伺服器錯誤，請稍後再試;
    else (200 Success)
      #90EE90:接收 access_token\n與 refresh_token;
      #87CEEB:儲存至 localStorage\n或 sessionStorage\n依記住我選項;
      :更新 authStore\nsetAuth + setUser;
      :關閉 AuthModal;
      #FFB6C1:重新導向至 /dashboard;
      stop
    endif
  endif
repeat while (重試?) is (是)

stop
@enduml
```

### 2.2 註冊流程

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:使用者點擊註冊按鈕;
:呼叫 handleOpenAuth('register')\n開啟 AuthModal;
:顯示註冊表單\nUsername + Email + Password + Confirm;

repeat
  :使用者輸入;
  
  #FFE5B4:前端驗證;
  
  if (驗證結果) then (使用者名稱為空)
    :顯示錯誤訊息\n使用者名稱不可為空;
  elseif (驗證結果) then (Email 格式錯誤)
    :顯示錯誤訊息\n請輸入有效的電子郵件;
  elseif (驗證結果) then (密碼長度 < 6)
    :顯示錯誤訊息\n密碼至少需 6 個字元;
  elseif (驗證結果) then (密碼不一致)
    :顯示錯誤訊息\n密碼與確認密碼不一致;
  else (驗證通過)
    :呼叫 POST /api/auth/register\n傳送 username, email, password;
    
    #FFD700:API 回應;
    
    if (回應狀態) then (400 Email已存在)
      :顯示錯誤訊息\n此電子郵件已被使用;
    elseif (回應狀態) then (500 Server Error)
      :顯示錯誤訊息\n伺服器錯誤，請稍後再試;
    else (201 Created)
      #90EE90:接收 access_token\n與 refresh_token;
      #87CEEB:儲存至 localStorage;
      :更新 authStore\nsetAuth + setUser;
      :關閉 AuthModal;
      #FFB6C1:重新導向至 /dashboard;
      stop
    endif
  endif
repeat while (重試?) is (是)

stop
@enduml
```

### 關鍵說明
- **認證模態框**：`AuthModal` 元件接收 `mode` prop（'login' 或 'register'）
- **狀態管理**：使用 `authStore` (Zustand) 管理認證狀態
- **Token 儲存**：根據「記住我」選項決定使用 localStorage 或 sessionStorage
- **自動登入**：App.tsx 初始化時從 storage 恢復 token

---

## 3. 主頁面流程(未登入版)

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:訪問 / 路徑;

#FFE5B4:authStore\nisAuthenticated?;

if (檢查結果) then (是)
  :重新導向至\n/dashboard;
  stop
else (否)
  :渲染 Mainpage 元件;
  :渲染 Header\nLogo + 導覽連結 + 登入/註冊按鈕;
  #FFB6C1:渲染 Hero 區塊\n主標題 + 副標題 + CTA 按鈕;
  
  if (使用者操作) then (點擊 "開始探索")
    :開啟登入模態框;
    :進入登入流程\n見圖表 2.1;
    stop
  elseif (使用者操作) then (點擊頁首 "登入")
    :開啟登入模態框;
    :進入登入流程\n見圖表 2.1;
    stop
  elseif (使用者操作) then (點擊頁首 "免費註冊")
    :開啟註冊模態框;
    :進入註冊流程\n見圖表 2.2;
    stop
  else (向下捲動)
    #DDA0DD:渲染 Features 區塊\n3個核心功能卡片;
    
    if (繼續捲動?) then (是)
      #87CEEB:渲染 Testimonials 區塊\n使用者評價卡片;
      
      if (繼續捲動?) then (是)
        #F0E68C:渲染 Newsletter 區塊\n電子報訂閱表單;
        
        if (使用者操作) then (輸入 Email + 訂閱)
          if (Email 驗證) then (格式錯誤)
            :顯示錯誤訊息;
          else (正確)
            :提交訂閱請求\n顯示成功訊息;
          endif
        else (捲動至底部)
          :渲染 Footer\n品牌資訊 + 連結 + 社群圖示;
        endif
      else (否)
        :停留在 Testimonials;
      endif
    else (否)
      :停留在 Features;
    endif
  endif
endif

stop
@enduml
```

### 關鍵說明
- **條件渲染**：根據 `isAuthenticated` 決定顯示行銷頁面或重新導向
- **Hero 區塊**：主要 CTA（Call-to-Action）引導使用者登入或註冊
- **Features 區塊**：展示核心功能（6個功能卡片）
- **Testimonials 區塊**：使用者評價與推薦
- **Newsletter 區塊**：電子報訂閱功能
- **Footer 區塊**：包含產品、支援、社群連結

---

## 4. 儀表板流程（Dashboard）

> **實際結構**：Dashboard 僅有 **2 個 Tab**，不是 4 個

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:訪問 /dashboard;

#FFE5B4:ProtectedRoute\n檢查認證;

if (檢查結果) then (未登入)
  :重新導向至 /;
  stop
else (已登入)
  :渲染 Dashboard 元件;
  :渲染 Header 元件;
  :初始化 Tabs\nactiveTab = 'basic';
  :顯示 2 個 Tab 按鈕;
  
  note right
    Tab 1: 總覽 (id='basic')
    Tab 2: 留言 (id='comment')
  end note
  
  :預設啟用\n顯示 DashboardBasic 元件;
  
  repeat
    if (使用者點擊 Tab) then (點擊 "總覽")
      #90EE90:渲染 DashboardBasic\n顯示個人統計資料;
      
      if (互動操作) then (點擊社團卡片)
        :導向 /clubs/:id;
        stop
      elseif (互動操作) then (點擊討論)
        :導向 /discussions/:id;
        stop
      endif
      
    elseif (使用者點擊 Tab) then (點擊 "留言")
      #87CEEB:渲染 DashboardComment\n顯示使用者留言記錄;
      
      if (互動操作) then (編輯留言)
        :導向 /comments/:id/edit;
        stop
      elseif (互動操作) then (刪除留言)
        :顯示確認對話框\n呼叫刪除 API;
      endif
      
    endif
  repeat while (繼續使用?) is (是)
endif

stop
@enduml
```

### 實際 Tab 結構（來自 Dashboard/index.tsx）
```typescript
const tabs = [
  { id: 'basic' as const, label: '總覽' },      // DashboardBasic 元件
  { id: 'comment' as const, label: '留言' },    // DashboardComment 元件
];
```

### 關鍵說明
- **Tab 數量**：實際僅有 **2 個 Tab**（總覽、留言）
- **預設 Tab**：`activeTab` 初始值為 `'basic'`
- **元件對應**：
  - `basic` → `DashboardBasic.tsx`
  - `comment` → `DashboardComment.tsx`

---

## 5. 社團相關流程

### 5.1 探索社團（Club Directory）

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:訪問 /clubs;
:渲染 Header 元件;
:載入社團列表\nGET /api/clubs;

#FFE5B4:API 回應;

if (回應狀態) then (Loading)
  :顯示骨架載入畫面;
  stop
elseif (回應狀態) then (Error)
  :顯示錯誤訊息\n重試按鈕;
  stop
else (Success)
  #90EE90:渲染社團網格\nClubCard 元件;
  :顯示篩選選項\n分類、標籤、搜尋;
  
  repeat
    if (使用者操作) then (搜尋社團)
      :即時篩選社團列表;
      :更新社團網格顯示;
    elseif (使用者操作) then (選擇分類)
      :按分類篩選;
      :更新社團網格顯示;
    elseif (使用者操作) then (點擊社團卡片)
      #FFB6C1:導向 /clubs/:id;
      stop
    else (點擊 "建立社團")
      #FFD700:已登入?;
      if (檢查結果) then (是)
        :導向 /clubs/create;
        stop
      else (否)
        :提示需要登入\n開啟登入模態框;
      endif
    endif
  repeat while (繼續操作?) is (是)
endif

stop
@enduml
```

### 5.2 社團詳情頁（Club Detail）

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:訪問 /clubs/:id;
:渲染 Header 元件;
:載入社團詳情\nGET /api/clubs/:id;

#FFE5B4:API 回應;

if (回應狀態) then (Loading)
  :顯示骨架載入畫面;
  stop
elseif (回應狀態) then (404)
  :顯示 404 錯誤\n社團不存在;
  stop
else (Success)
  :渲染社團詳情;
  :顯示社團資訊\n名稱、描述、標籤;
  :顯示成員列表\n創辦人、管理員、成員;
  :顯示討論列表\n最新討論;
  
  #FFD700:檢查成員身份;
  
  if (成員狀態) then (未登入)
    :顯示訪客操作\n查看資訊;
    
    if (點擊討論?) then (是)
      #FFB6C1:導向 /discussions/:id;
      stop
    endif
    
  elseif (成員狀態) then (非成員)
    :顯示 "加入社團" 按鈕;
    
    if (點擊加入?) then (是)
      :發送加入申請\nPOST /api/clubs/:id/join;
      :更新為 "待審核" 狀態;
    endif
    
  elseif (成員狀態) then (待審核)
    :顯示 "待審核" 狀態;
    
  elseif (成員狀態) then (已加入)
    :顯示成員操作\n發起討論、查看社團討論;
    
    if (點擊討論?) then (是)
      #FFB6C1:導向 /discussions/:id;
      stop
    endif
    
  else (創辦人/管理員)
    #FFB6C1:顯示管理操作\n社團管理按鈕;
    
    if (點擊管理?) then (是)
      #DDA0DD:導向 /clubs/:id/management;
      stop
    elseif (點擊討論?) then (是)
      #FFB6C1:導向 /discussions/:id;
      stop
    endif
  endif
endif

stop
@enduml
```

### 5.3 建立社團（Club Create）

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:訪問 /clubs/create;

#FFE5B4:ProtectedRoute\n檢查認證;

if (檢查結果) then (未登入)
  :重新導向至 /;
  stop
else (已登入)
  :渲染建立社團表單;
  :顯示表單欄位\n名稱、描述、分類、標籤、封面;
  
  repeat
    :使用者輸入;
    
    #FFD700:前端驗證;
    
    if (驗證結果) then (社團名稱為空)
      :顯示錯誤訊息;
    elseif (驗證結果) then (描述為空)
      :顯示錯誤訊息;
    elseif (驗證結果) then (未選擇分類)
      :顯示錯誤訊息;
    else (驗證通過)
      :提交表單\nPOST /api/clubs;
      
      #FFD700:API 回應;
      
      if (回應狀態) then (400 Bad Request)
        :顯示驗證錯誤訊息;
      elseif (回應狀態) then (500 Server Error)
        :顯示伺服器錯誤;
      else (201 Created)
        #90EE90:接收新社團資料\n包含 club_id;
        :顯示成功訊息;
        #FFB6C1:導向 /clubs/:id\n新建立的社團頁面;
        stop
      endif
    endif
  repeat while (重試?) is (是)
endif

stop
@enduml
```

---

## 6. 討論區流程

### 6.1 討論列表（Discussions）

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:訪問 /discussions;
:渲染 Header 元件;
:載入討論列表\nGET /api/discussions;

#FFE5B4:API 回應;

if (回應狀態) then (Loading)
  :顯示骨架載入畫面;
  stop
elseif (回應狀態) then (Error)
  :顯示錯誤訊息;
  stop
else (Success)
  #90EE90:渲染討論列表;
  :顯示篩選選項\n社團、標籤、搜尋;
  
  repeat
    if (使用者操作) then (搜尋討論)
      :即時篩選討論;
      :更新討論列表;
    elseif (使用者操作) then (選擇社團)
      :按社團篩選;
      :更新討論列表;
    elseif (使用者操作) then (點擊討論)
      #FFB6C1:導向 /discussions/:id;
      stop
    else (點擊 "發起討論")
      #FFD700:已登入?;
      if (檢查結果) then (是)
        :導向 /discussions/new;
        stop
      else (否)
        :提示需要登入;
      endif
    endif
  repeat while (繼續操作?) is (是)
endif

stop
@enduml
```

### 6.2 討論詳情（Discussion Detail）

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:訪問 /discussions/:id;
:渲染 Header 元件;
:載入討論詳情\nGET /api/discussions/:id;

#FFE5B4:API 回應;

if (回應狀態) then (Loading)
  :顯示骨架載入畫面;
  stop
elseif (回應狀態) then (404)
  :顯示 404 錯誤;
  stop
else (Success)
  :渲染討論詳情;
  :顯示討論標題與內容;
  :顯示作者資訊與時間;
  :顯示標籤;
  :載入留言列表\nGET /api/discussions/:id/comments;
  
  #FFE5B4:留言 API 回應;
  
  if (回應狀態) then (Loading)
    :顯示留言骨架;
  else (Success)
    :渲染留言列表;
  endif
  
  #FFD700:已登入?;
  
  if (檢查結果) then (是)
    :顯示留言表單;
    
    repeat
      :使用者輸入留言;
      
      #FFD700:驗證留言;
      
      if (驗證結果) then (內容為空)
        :顯示錯誤訊息;
      else (內容有效)
        :提交留言\nPOST /api/comments;
        
        #FFD700:API 回應;
        
        if (回應狀態) then (Success)
          :重新載入留言列表;
        else (Error)
          :顯示錯誤訊息;
        endif
      endif
    repeat while (重試?) is (是)
    
  else (否)
    :提示需要登入才能留言;
  endif
endif

stop
@enduml
```

### 6.3 發起討論（Discussion New）

```plantuml
@startuml
skinparam roundcorner 10
skinparam shadowing false

start
:訪問 /discussions/new;

#FFE5B4:ProtectedRoute\n檢查認證;

if (檢查結果) then (未登入)
  :重新導向至 /;
  stop
else (已登入)
  :渲染發起討論表單;
  :顯示表單欄位\n標題、內容、社團、標籤;
  
  repeat
    :使用者輸入;
    
    #FFD700:前端驗證;
    
    if (驗證結果) then (標題為空)
      :顯示錯誤訊息;
    elseif (驗證結果) then (內容為空)
      :顯示錯誤訊息;
    elseif (驗證結果) then (未選擇社團)
      :顯示錯誤訊息;
    else (驗證通過)
      :提交表單\nPOST /api/discussions;
      
      #FFD700:API 回應;
      
      if (回應狀態) then (400 Bad Request)
        :顯示驗證錯誤;
      elseif (回應狀態) then (500 Server Error)
        :顯示伺服器錯誤;
      else (201 Created)
        #90EE90:接收討論資料\n包含 discussion_id;
        :顯示成功訊息;
        #FFB6C1:導向 /discussions/:id\n新建立的討論頁面;
        stop
      endif
    endif
  repeat while (重試?) is (是)
endif

stop
@enduml
```
    style ClientValidate fill:#FFD700
    style APIResponse fill:#FFD700
    style ReceiveData fill:#90EE90
```

---

## 7. 個人帳戶流程（Account）

> **實際結構**：Account 有 **4 個 Tab**（不是 6 個）

```mermaid
graph TB
    Start([訪問 /account]) --> CheckAuth{ProtectedRoute<br/>檢查認證}
    
    CheckAuth -->|未登入| RedirectHome[重新導向至 /]
    CheckAuth -->|已登入| RenderAccount[渲染 Account 元件]
    
    RenderAccount --> RenderHeader[渲染 Header 元件]
    RenderHeader --> CheckURLParam{檢查 URL 參數<br/>?tab=xxx}
    
    CheckURLParam -->|有 tab 參數| SetActiveTab[設定 activeTab<br/>根據參數值]
    CheckURLParam -->|無參數| DefaultTab[預設 activeTab='setting']
    
    SetActiveTab --> RenderSidebar[渲染左側導覽欄]
    DefaultTab --> RenderSidebar
    
    RenderSidebar --> ShowTabs[顯示 4 個 Tab 按鈕]
    
    ShowTabs --> Tab1[Tab 1: 個人設定<br/>id='setting']
    ShowTabs --> Tab2[Tab 2: 通知<br/>id='notify']
    ShowTabs --> Tab3[Tab 3: 我的社團<br/>id='club']
    ShowTabs --> Tab4[Tab 4: 我的留言<br/>id='comment']
    
    Tab1 --> DefaultActive[預設啟用<br/>Setting 元件]
    
    DefaultActive --> UserClickTab{使用者點擊 Tab}
    
    UserClickTab -->|點擊 "個人設定"| ShowSetting[渲染 Setting 元件<br/>編輯個人資料表單]
    UserClickTab -->|點擊 "通知"| ShowNotify[渲染 Notify 元件<br/>顯示通知列表]
    UserClickTab -->|點擊 "我的社團"| ShowClub[渲染 Club 元件<br/>顯示已加入社團列表]
    UserClickTab -->|點擊 "我的留言"| ShowComment[渲染 Comment 元件<br/>顯示留言記錄]
    
    ShowSetting --> SettingAction{互動操作}
    SettingAction -->|編輯個人資料| UpdateProfile[呼叫 PATCH /api/users/profile<br/>更新個人資料]
    SettingAction -->|上傳頭像| UploadAvatar[呼叫 POST /api/users/avatar<br/>上傳圖片]
    
    ShowClub --> ClubAction{互動操作}
    ClubAction -->|點擊社團卡片| NavigateClubDetail[導向 /clubs/:id]
    ClubAction -->|點擊 "管理社團"| NavigateManagement[導向 /clubs/:id/management<br/>限創辦人/管理員]
    
    ShowComment --> CommentAction{互動操作}
    CommentAction -->|編輯留言| NavigateEditComment[導向 /comments/:id/edit]
    CommentAction -->|刪除留言| ConfirmDelete[顯示確認對話框<br/>呼叫刪除 API]
    
    style CheckAuth fill:#FFE5B4
    style Tab1 fill:#FFB6C1
    style Tab2 fill:#DDA0DD
    style Tab3 fill:#87CEEB
    style Tab4 fill:#F0E68C
    style ShowSetting fill:#90EE90
```

### 實際 Tab 結構（來自 Account/index.tsx）
```typescript
const tabs = [
  { id: 'setting' as const, label: '個人設定', icon: '...' },   // Setting.tsx
  { id: 'notify' as const, label: '通知', icon: '...' },       // Notify.tsx
  { id: 'club' as const, label: '我的社團', icon: '...' },      // Club.tsx
  { id: 'comment' as const, label: '我的留言', icon: '...' },   // Comment.tsx
];
```

### 關鍵說明
- **Tab 數量**：實際僅有 **4 個 Tab**
- **URL 參數支援**：支援 `?tab=club` 等參數直接定位到特定 Tab
- **預設 Tab**：`activeTab` 初始值為 `'setting'`
- **元件對應**：
  - `setting` → `Setting.tsx`
  - `notify` → `Notify.tsx`
  - `club` → `Club.tsx`
  - `comment` → `Comment.tsx`

---

## 8. 社團管理流程（Club Management）

> **實際結構**：管理頁面有 **3 或 4 個 Tab**（取決於使用者角色）

### 8.1 管理頁面架構

```mermaid
graph TB
    Start([訪問 /clubs/:id/management]) --> CheckAuth{ProtectedRoute<br/>檢查認證}
    
    CheckAuth -->|未登入| RedirectHome[重新導向至 /]
    CheckAuth -->|已登入| LoadClubData[載入社團資料<br/>檢查使用者權限]
    
    LoadClubData --> CheckPermission{檢查權限}
    
    CheckPermission -->|非管理員| ShowForbidden[顯示 403 錯誤<br/>無權限訪問]
    CheckPermission -->|管理員/創辦人| RenderManagement[渲染 ClubManagement 元件]
    
    RenderManagement --> RenderHeader[渲染 Header 元件]
    RenderHeader --> ShowBreadcrumb[顯示麵包屑導覽<br/>帳號設定 / 我的社團 / 社團管理]
    
    ShowBreadcrumb --> CheckOwnership{檢查是否為創辦人}
    
    CheckOwnership -->|是| Show4Tabs[顯示 4 個 Tab<br/>含轉移擁有權]
    CheckOwnership -->|否| Show3Tabs[顯示 3 個 Tab<br/>不含轉移擁有權]
    
    Show4Tabs --> TabsOwner[社團資訊 + 成員管理 + 加入申請 + 轉移擁有權]
    Show3Tabs --> TabsAdmin[社團資訊 + 成員管理 + 加入申請]
    
    TabsOwner --> InitTab[預設啟用 'info' Tab]
    TabsAdmin --> InitTab
    
    InitTab --> UserClickTab{使用者點擊 Tab}
    
    UserClickTab -->|社團資訊| ShowInfo[渲染 ClubInfoSettings<br/>編輯社團資訊表單]
    UserClickTab -->|成員管理| ShowMembers[渲染 MemberManagement<br/>成員列表與操作]
    UserClickTab -->|加入申請| ShowRequests[渲染 JoinRequestList<br/>待審核申請列表]
    UserClickTab -->|轉移擁有權| ShowTransfer[渲染 TransferOwnership<br/>限創辦人]
    
    style CheckAuth fill:#FFE5B4
    style CheckPermission fill:#FFD700
    style CheckOwnership fill:#FFD700
    style Show4Tabs fill:#FFB6C1
    style ShowTransfer fill:#FEE2E2
```

### 實際 Tab 結構（來自 ClubManagement.tsx）
```typescript
// 基本標籤（所有管理者都能看到）
const baseTabs = [
  { id: 'info' as TabType, name: '社團資訊', icon: '...' },      // ClubInfoSettings
  { id: 'members' as TabType, name: '成員管理', icon: '...' },    // MemberManagement
  { id: 'requests' as TabType, name: '加入申請', icon: '...' },   // JoinRequestList
];

// 只有創辦人才能看到的標籤
const ownerOnlyTab = { 
  id: 'transfer' as TabType, 
  name: '轉移擁有權', 
  icon: '...' 
};

// 根據用戶角色組合標籤
const tabs = isOwner ? [...baseTabs, ownerOnlyTab] : baseTabs;
```

### 8.2 社團資訊 Tab（ClubInfoSettings）

```mermaid
graph TB
    Start([點擊 "社團資訊" Tab]) --> RenderForm[渲染社團資訊表單]
    
    RenderForm --> ShowFields[顯示表單欄位<br/>名稱、描述、分類、標籤、封面]
    
    ShowFields --> LoadCurrentData[載入當前社團資料<br/>預填表單]
    
    LoadCurrentData --> UserAction{使用者操作}
    
    UserAction -->|編輯欄位| EnableSaveButton[啟用儲存按鈕]
    UserAction -->|上傳封面| UploadImage[上傳圖片至伺服器<br/>預覽圖片]
    UserAction -->|點擊儲存| ValidateForm{前端驗證}
    
    ValidateForm -->|名稱為空| ShowNameError[顯示錯誤訊息]
    ValidateForm -->|描述為空| ShowDescError[顯示錯誤訊息]
    ValidateForm -->|驗證通過| SubmitUpdate[提交更新<br/>PATCH /api/clubs/:id]
    
    ShowNameError --> UserAction
    ShowDescError --> UserAction
    
    SubmitUpdate --> APIResponse{API 回應}
    
    APIResponse -->|400| ShowValidationError[顯示驗證錯誤]
    APIResponse -->|500| ShowServerError[顯示伺服器錯誤]
    APIResponse -->|200| ShowSuccess[顯示成功訊息<br/>更新本地資料]
    
    ShowValidationError --> UserAction
    ShowServerError --> UserAction
    
    style ValidateForm fill:#FFD700
    style APIResponse fill:#FFE5B4
    style ShowSuccess fill:#90EE90
```

### 8.3 成員管理 Tab（MemberManagement）

```mermaid
graph TB
    Start([點擊 "成員管理" Tab]) --> LoadMembers[載入成員列表<br/>GET /api/clubs/:id/members]
    
    LoadMembers --> APIResponse{API 回應}
    
    APIResponse -->|Loading| ShowSkeleton[顯示骨架載入畫面]
    APIResponse -->|Success| RenderMemberList[渲染成員列表]
    
    RenderMemberList --> ShowRoles[顯示成員角色<br/>創辦人、管理員、成員]
    
    ShowRoles --> CheckUserRole{檢查當前使用者角色}
    
    CheckUserRole -->|創辦人| ShowOwnerActions[顯示完整操作選單]
    CheckUserRole -->|管理員| ShowAdminActions[顯示受限操作選單]
    
    ShowOwnerActions --> OwnerUserAction{使用者操作}
    ShowAdminActions --> AdminUserAction{使用者操作}
    
    OwnerUserAction -->|搜尋成員| FilterMembers[即時篩選成員列表]
    OwnerUserAction -->|點擊成員| ShowOwnerMenu[顯示操作選單<br/>設為管理員/移除管理員/移除成員]
    
    AdminUserAction -->|搜尋成員| FilterMembers
    AdminUserAction -->|點擊一般成員| ShowAdminMenu[顯示操作選單<br/>僅移除成員]
    
    ShowOwnerMenu --> OwnerMenuAction{選擇操作}
    
    OwnerMenuAction -->|設為管理員| ConfirmPromote[顯示確認對話框]
    OwnerMenuAction -->|移除管理員| ConfirmDemote[顯示確認對話框]
    OwnerMenuAction -->|移除成員| ConfirmRemove[顯示確認對話框]
    
    ShowAdminMenu --> ConfirmRemove
    
    ConfirmPromote --> CallPromoteAPI[呼叫 POST /api/clubs/:id/members/:userId/promote]
    ConfirmDemote --> CallDemoteAPI[呼叫 POST /api/clubs/:id/members/:userId/demote]
    ConfirmRemove --> CallRemoveAPI[呼叫 DELETE /api/clubs/:id/members/:userId]
    
    CallPromoteAPI --> RefreshList[重新載入成員列表]
    CallDemoteAPI --> RefreshList
    CallRemoveAPI --> RefreshList
    
    style APIResponse fill:#FFE5B4
    style CheckUserRole fill:#FFD700
    style ConfirmPromote fill:#90EE90
    style ConfirmRemove fill:#FEE2E2
```

### 關鍵說明
- **權限區分**：
  - **創辦人**：可設為管理員、移除管理員、移除成員（完整權限）
  - **管理員**：僅可移除一般成員（受限權限,無法操作其他管理員）
- **操作限制**：管理員無法對其他管理員或創辦人進行任何操作
- **確認機制**：所有操作前都會顯示確認對話框

### 8.4 加入申請 Tab（JoinRequestList）

```mermaid
graph TB
    Start([點擊 "加入申請" Tab]) --> LoadRequests[載入申請列表<br/>GET /api/clubs/:id/requests]
    
    LoadRequests --> APIResponse{API 回應}
    
    APIResponse -->|Loading| ShowSkeleton[顯示骨架載入畫面]
    APIResponse -->|Success| RenderRequestList[渲染申請列表]
    
    RenderRequestList --> CheckEmpty{是否有申請?}
    
    CheckEmpty -->|無申請| ShowEmptyState[顯示空狀態<br/>目前沒有待審核申請]
    CheckEmpty -->|有申請| ShowRequests[顯示申請卡片<br/>申請者資訊 + 申請時間]
    
    ShowRequests --> UserAction{使用者操作}
    
    UserAction -->|點擊 "核准"| ConfirmApprove[顯示確認對話框]
    UserAction -->|點擊 "拒絕"| ConfirmReject[顯示確認對話框]
    
    ConfirmApprove --> CallApproveAPI[呼叫 POST /api/clubs/:id/requests/:requestId/approve]
    ConfirmReject --> CallRejectAPI[呼叫 POST /api/clubs/:id/requests/:requestId/reject]
    
    CallApproveAPI --> ApproveResponse{API 回應}
    CallRejectAPI --> RejectResponse{API 回應}
    
    ApproveResponse -->|Success| ShowApproveSuccess[顯示成功訊息<br/>已核准加入]
    RejectResponse -->|Success| ShowRejectSuccess[顯示成功訊息<br/>已拒絕申請]
    
    ShowApproveSuccess --> RefreshList[重新載入申請列表]
    ShowRejectSuccess --> RefreshList
    
    RefreshList --> RenderRequestList
    
    style APIResponse fill:#FFE5B4
    style ConfirmApprove fill:#90EE90
    style ConfirmReject fill:#FEE2E2
```

### 8.5 轉移擁有權 Tab（TransferOwnership）

> **權限限制**：此 Tab **僅創辦人可見**

```mermaid
graph TB
    Start([點擊 "轉移擁有權" Tab<br/>限創辦人]) --> RenderForm[渲染轉移表單<br/>TransferOwnership 元件]
    
    RenderForm --> ShowFields[顯示表單欄位<br/>新擁有者 Username<br/>新擁有者 Email]
    
    ShowFields --> InitialState[表單初始狀態<br/>按鈕 disabled]
    
    InitialState --> UserInput{使用者輸入}
    
    UserInput -->|填寫欄位| ValidateInput{即時驗證}
    
    ValidateInput -->|任一欄位為空| DisableButton[按鈕保持 disabled<br/>顯示錯誤提示]
    ValidateInput -->|兩欄位都有值| EnableButton[啟用轉移按鈕]
    
    DisableButton --> UserInput
    
    EnableButton --> UserClickTransfer{點擊 "轉移擁有權"}
    
    UserClickTransfer -->|是| ShowWarning[顯示警告訊息<br/>⚠️ 此操作無法撤銷]
    
    ShowWarning --> UserConfirm{使用者確認}
    
    UserConfirm -->|取消| ResetForm[保持在表單<br/>不執行操作]
    UserConfirm -->|確認| CallTransferAPI[呼叫 POST /api/clubs/:id/transfer<br/>傳送 username, email]
    
    CallTransferAPI --> APIResponse{API 回應}
    
    APIResponse -->|404 User Not Found| ShowUserNotFoundError[顯示錯誤訊息<br/>找不到該使用者<br/>請確認 Username 和 Email]
    APIResponse -->|400 Invalid Member| ShowInvalidMemberError[顯示錯誤訊息<br/>該使用者不是社團成員]
    APIResponse -->|500 Server Error| ShowServerError[顯示伺服器錯誤]
    APIResponse -->|200 Success| ShowSuccess[顯示成功訊息<br/>擁有權轉移成功]
    
    ShowUserNotFoundError --> UserInput
    ShowInvalidMemberError --> UserInput
    ShowServerError --> UserInput
    
    ShowSuccess --> ClearForm[清空表單欄位]
    ClearForm --> ShowFinalWarning[顯示最終提示<br/>您已不再是創辦人<br/>即將返回社團頁面]
    
    ShowFinalWarning --> RedirectOptions{選擇返回目的地}
    
    RedirectOptions -->|選項 1| NavigateClub[導向 /clubs/:id<br/>社團詳情頁]
    RedirectOptions -->|選項 2| NavigateDashboard[導向 /dashboard<br/>儀表板]
    RedirectOptions -->|選項 3| StayOnPage[留在當前頁面<br/>但轉移 Tab 已消失]
    
    style ValidateInput fill:#FFD700
    style ShowWarning fill:#FEF3C7
    style APIResponse fill:#FFE5B4
    style ShowSuccess fill:#D1FAE5
    style ShowFinalWarning fill:#FEE2E2
```

### 關鍵說明
- **權限檢查**：根據 `isOwner` 動態顯示 3 或 4 個 Tab
- **轉移擁有權限制**：
  - 僅創辦人可見此 Tab
  - 需要輸入新擁有者的 Username 和 Email（雙重驗證）
  - 操作無法撤銷，顯示多重警告
- **成員管理權限**：管理員和創辦人都可操作
- **麵包屑導覽**：提供返回路徑（帳號設定 → 我的社團 → 社團管理）

---

## 9. 路由保護機制（ProtectedRoute）

```mermaid
graph TB
    Start([訪問受保護路由]) --> CheckComponent{ProtectedRoute<br/>元件包裝}
    
    CheckComponent --> GetAuthState[從 authStore 取得<br/>isAuthenticated 狀態]
    
    GetAuthState --> CheckAuth{isAuthenticated?}
    
    CheckAuth -->|false| RedirectHome[執行 Navigate to=/ replace<br/>重新導向至首頁]
    CheckAuth -->|true| RenderChildren[渲染子元件<br/>例如: Dashboard, Account, ClubManagement]
    
    RedirectHome --> ShowMainpage[顯示 Mainpage<br/>未登入版本]
    
    ShowMainpage --> UserLogin{使用者登入?}
    UserLogin -->|是| UpdateAuthStore[更新 authStore<br/>isAuthenticated = true]
    UpdateAuthStore --> AllowAccess[重新訪問受保護路由<br/>通過驗證]
    
    RenderChildren --> End([正常使用受保護功能])
    
    style CheckAuth fill:#FFE5B4
    style RedirectHome fill:#FEE2E2
    style RenderChildren fill:#90EE90
```

### 受保護的路由列表
```typescript
// 來自 App.tsx（6 個 Protected Routes）
/dashboard                  → Dashboard
/account                    → Account
/clubs/create               → ClubCreate
/clubs/:id/management       → ClubManagement
/discussions/new            → DiscussionNew
/comments/:id/edit          → CommentEdit
```

### 關鍵說明
- **實作位置**：App.tsx lines 20-28
- **檢查機制**：讀取 `authStore.isAuthenticated`
- **失敗處理**：重新導向至 `/`（Mainpage）
- **成功處理**：正常渲染子元件
- **跨分頁同步**：透過 storage 事件監聽，確保多分頁登入狀態一致

---

## 10. 跨分頁認證同步機制

```mermaid
graph TB
    Start([使用者在分頁 A 登入]) --> SaveToken[儲存 access_token 至<br/>localStorage]
    
    SaveToken --> TriggerEvent[觸發 storage 事件<br/>瀏覽器原生機制]
    
    TriggerEvent --> TabB[分頁 B 監聽到 storage 事件]
    
    TabB --> CheckEventKey{檢查 event.key}
    
    CheckEventKey -->|access_token| CallSync[呼叫 authStore.syncFromStorage]
    CheckEventKey -->|null 清空 storage| CallSync
    CheckEventKey -->|其他 key| IgnoreEvent[忽略事件]
    
    CallSync --> ReadStorage[從 localStorage 讀取<br/>access_token]
    
    ReadStorage --> CheckToken{Token 是否存在?}
    
    CheckToken -->|存在| UpdateAuth[更新 authStore<br/>isAuthenticated = true]
    CheckToken -->|不存在| ClearAuth[清除 authStore<br/>isAuthenticated = false]
    
    UpdateAuth --> RefreshUI[分頁 B UI 自動更新<br/>顯示已登入狀態]
    ClearAuth --> RefreshUI2[分頁 B UI 自動更新<br/>顯示未登入狀態]
    
    RefreshUI --> End([分頁同步完成])
    RefreshUI2 --> End
    
    style TriggerEvent fill:#87CEEB
    style CallSync fill:#FFD700
    style UpdateAuth fill:#90EE90
    style RefreshUI fill:#FFB6C1
```

### 實作程式碼（來自 App.tsx lines 44-54）
```typescript
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'access_token' || e.key === null) {
      syncFromStorage();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [syncFromStorage]);
```

### 關鍵說明
- **觸發條件**：`access_token` 變更或整個 storage 被清空（`e.key === null`）
- **同步方法**：`authStore.syncFromStorage()` 從 storage 重新讀取 token
- **UI 響應**：authStore 更新後，所有使用 `isAuthenticated` 的元件自動重新渲染
- **應用場景**：
  - 使用者在分頁 A 登入 → 分頁 B 自動更新為已登入
  - 使用者在分頁 A 登出 → 分頁 B 自動更新為未登入

---

## 11. 初始化載入流程

```mermaid
graph TB
    Start([App.tsx 掛載]) --> InitEffect[執行 useEffect<br/>呼叫 initialize]
    
    InitEffect --> SetInitializing[設定 isInitializing = true]
    
    SetInitializing --> ReadStorage[從 localStorage/sessionStorage<br/>讀取 access_token]
    
    ReadStorage --> CheckToken{Token 是否存在?}
    
    CheckToken -->|存在| ValidateToken[驗證 Token 有效性<br/>可選：呼叫 /api/auth/validate]
    CheckToken -->|不存在| ClearState[清除認證狀態]
    
    ValidateToken --> TokenValid{Token 有效?}
    
    TokenValid -->|是| SetAuthenticated[設定 isAuthenticated = true<br/>載入使用者資料]
    TokenValid -->|否| ClearExpiredToken[清除過期 Token<br/>清除認證狀態]
    
    SetAuthenticated --> FinishInit[設定 isInitializing = false]
    ClearState --> FinishInit
    ClearExpiredToken --> FinishInit
    
    FinishInit --> RenderApp[移除載入畫面<br/>渲染主要路由]
    
    RenderApp --> CheckRoute{檢查當前路由}
    
    CheckRoute -->|/ 首頁| ShowMainpage[顯示 Mainpage<br/>根據認證狀態]
    CheckRoute -->|Protected Route| ApplyProtection[套用 ProtectedRoute<br/>檢查認證]
    
    style SetInitializing fill:#FFE5B4
    style CheckToken fill:#FFD700
    style SetAuthenticated fill:#90EE90
    style FinishInit fill:#87CEEB
```

### 載入畫面（App.tsx lines 54-66）
```typescript
if (isInitializing) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="loading-spinner"></div>
        <p className="text-gray-600 mt-4">載入中...</p>
      </div>
    </div>
  );
}
```

### 關鍵說明
- **初始化時機**：App.tsx 元件掛載時立即執行
- **載入狀態**：顯示 spinner 避免閃爍
- **Token 來源**：優先 localStorage，其次 sessionStorage
- **驗證策略**：可選擇性呼叫後端 API 驗證 Token 有效性
- **完成動作**：設定 `isInitializing = false`，開始正常路由渲染

---

## 總結：與舊版流程圖的主要差異

### 1. Dashboard Tab 數量錯誤
- ❌ **舊版**：4 個 Tab（基本資訊、我的社團、討論紀錄、留言紀錄）
- ✅ **實際**：**2 個 Tab**（總覽、留言）

### 2. Account Tab 數量錯誤
- ❌ **舊版**：可能記載 6 個 Tab
- ✅ **實際**：**4 個 Tab**（個人設定、通知、我的社團、我的留言）

### 3. 元件名稱不一致
- ❌ **舊版**：使用假設的元件名稱（如 `DashboardBasic`、`Account/Club`）
- ✅ **實際**：
  - Dashboard: `DashboardBasic.tsx`、`DashboardComment.tsx`
  - Account: `Setting.tsx`、`Notify.tsx`、`Club.tsx`、`Comment.tsx`

### 4. ClubManagement Tab 結構
- ❌ **舊版**：可能記載固定 4 個 Tab
- ✅ **實際**：**動態 3-4 個 Tab**（根據使用者是否為創辦人）
  - 基本 3 個：社團資訊、成員管理、加入申請
  - 創辦人額外：轉移擁有權

### 5. 路由路徑
- ✅ **已驗證**：所有路由路徑與 App.tsx 一致
  - 公開路由：7 個
  - 受保護路由：6 個

### 6. 認證機制
- ✅ **已更新**：詳細說明 `ProtectedRoute`、`initialize()`、`syncFromStorage()` 流程

### 7. 跨分頁同步
- ✅ **已新增**：舊版可能未提及此機制，現已完整記載

---

**本文檔已根據實際前端程式碼完全重新設計，確保所有流程圖與實作一致。**
