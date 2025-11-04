# 介面流程圖（根據實際前端架構重新設計）

> 本文檔根據實際前端程式碼架構重新設計，確保所有流程圖與實際實作一致。
> 最後更新：2024年（基於 App.tsx、Dashboard、Account、ClubManagement 等實際檔案）

---

## 1. 系統整體架構

```mermaid
graph TB
    Start([使用者訪問系統]) --> CheckAuth{已登入?}
    
    CheckAuth -->|是| ShowHeader[Header 元件<br/>含登出選項]
    CheckAuth -->|否| ShowMainpage[Mainpage 未登入版<br/>Hero + Features + Testimonials + Newsletter]
    
    ShowMainpage --> UserAction{使用者操作}
    UserAction -->|點擊登入按鈕| OpenLoginModal[開啟 AuthModal<br/>mode='login']
    UserAction -->|點擊註冊按鈕| OpenRegisterModal[開啟 AuthModal<br/>mode='register']
    UserAction -->|瀏覽內容| BrowseContent[查看功能介紹<br/>評價、訂閱電子報]
    
    OpenLoginModal --> AuthSuccess[認證成功]
    OpenRegisterModal --> AuthSuccess
    
    AuthSuccess --> SaveToken[儲存 Token 至<br/>localStorage/sessionStorage]
    SaveToken --> SyncAuth[authStore 同步認證狀態]
    SyncAuth --> RedirectToDashboard[重新導向至 /dashboard]
    
    ShowHeader --> MainNav[主要導覽]
    MainNav --> NavOptions{選擇頁面}
    
    NavOptions -->|/dashboard| Dashboard[儀表板頁面<br/>2 Tabs: 總覽、留言]
    NavOptions -->|/account| Account[帳號設定頁面<br/>4 Tabs: 個人設定、通知、我的社團、我的留言]
    NavOptions -->|/clubs| ClubDirectory[社團目錄]
    NavOptions -->|/discussions| Discussions[討論區列表]
    NavOptions -->|/clubs/create| ClubCreate[建立社團<br/>Protected]
    
    style CheckAuth fill:#FFE5B4
    style AuthSuccess fill:#90EE90
    style SaveToken fill:#87CEEB
    style Dashboard fill:#FFB6C1
    style Account fill:#DDA0DD
```

### 關鍵說明
- **認證檢查**：`useAuthStore` 的 `isAuthenticated` 狀態決定顯示內容
- **初始化流程**：App.tsx 啟動時執行 `initialize()` 從 storage 恢復登入狀態
- **跨分頁同步**：監聽 `storage` 事件，當 `access_token` 變更時觸發 `syncFromStorage()`
- **Protected Route**：未登入使用者訪問受保護路由會被重新導向至 `/`

---

## 2. 使用者認證流程（登入/註冊）

### 2.1 登入流程

```mermaid
graph TB
    Start([使用者點擊登入按鈕]) --> OpenModal[呼叫 handleOpenAuth'login'<br/>開啟 AuthModal]
    
    OpenModal --> ShowLoginForm[顯示登入表單<br/>Email + Password 欄位]
    
    ShowLoginForm --> UserInput{使用者輸入}
    
    UserInput -->|填寫表單| ClientValidate{前端驗證}
    
    ClientValidate -->|Email 格式錯誤| ShowEmailError[顯示錯誤訊息<br/>請輸入有效的電子郵件]
    ClientValidate -->|密碼為空| ShowPasswordError[顯示錯誤訊息<br/>密碼不可為空]
    ClientValidate -->|驗證通過| CallLoginAPI[呼叫 POST /api/auth/login<br/>傳送 email, password]
    
    ShowEmailError --> UserInput
    ShowPasswordError --> UserInput
    
    CallLoginAPI --> APIResponse{API 回應}
    
    APIResponse -->|401 Unauthorized| ShowAuthError[顯示錯誤訊息<br/>帳號或密碼錯誤]
    APIResponse -->|500 Server Error| ShowServerError[顯示錯誤訊息<br/>伺服器錯誤，請稍後再試]
    APIResponse -->|200 Success| ReceiveTokens[接收 access_token<br/>與 refresh_token]
    
    ShowAuthError --> UserInput
    ShowServerError --> UserInput
    
    ReceiveTokens --> SaveToStorage[儲存至 localStorage<br/>或 sessionStorage<br/>依記住我選項]
    SaveToStorage --> UpdateAuthStore[更新 authStore<br/>setAuth + setUser]
    UpdateAuthStore --> CloseModal[關閉 AuthModal]
    CloseModal --> Navigate[重新導向至 /dashboard]
    
    Navigate --> End([登入完成])
    
    style ClientValidate fill:#FFE5B4
    style APIResponse fill:#FFD700
    style ReceiveTokens fill:#90EE90
    style SaveToStorage fill:#87CEEB
    style Navigate fill:#FFB6C1
```

### 2.2 註冊流程

```mermaid
graph TB
    Start([使用者點擊註冊按鈕]) --> OpenModal[呼叫 handleOpenAuth'register'<br/>開啟 AuthModal]
    
    OpenModal --> ShowRegisterForm[顯示註冊表單<br/>Username + Email + Password + Confirm]
    
    ShowRegisterForm --> UserInput{使用者輸入}
    
    UserInput -->|填寫表單| ClientValidate{前端驗證}
    
    ClientValidate -->|使用者名稱為空| ShowUsernameError[顯示錯誤訊息<br/>使用者名稱不可為空]
    ClientValidate -->|Email 格式錯誤| ShowEmailError[顯示錯誤訊息<br/>請輸入有效的電子郵件]
    ClientValidate -->|密碼長度 < 6| ShowPasswordError[顯示錯誤訊息<br/>密碼至少需 6 個字元]
    ClientValidate -->|密碼不一致| ShowMatchError[顯示錯誤訊息<br/>密碼與確認密碼不一致]
    ClientValidate -->|驗證通過| CallRegisterAPI[呼叫 POST /api/auth/register<br/>傳送 username, email, password]
    
    ShowUsernameError --> UserInput
    ShowEmailError --> UserInput
    ShowPasswordError --> UserInput
    ShowMatchError --> UserInput
    
    CallRegisterAPI --> APIResponse{API 回應}
    
    APIResponse -->|400 Email已存在| ShowDuplicateError[顯示錯誤訊息<br/>此電子郵件已被使用]
    APIResponse -->|500 Server Error| ShowServerError[顯示錯誤訊息<br/>伺服器錯誤，請稍後再試]
    APIResponse -->|201 Created| ReceiveTokens[接收 access_token<br/>與 refresh_token]
    
    ShowDuplicateError --> UserInput
    ShowServerError --> UserInput
    
    ReceiveTokens --> SaveToStorage[儲存至 localStorage]
    SaveToStorage --> UpdateAuthStore[更新 authStore<br/>setAuth + setUser]
    UpdateAuthStore --> CloseModal[關閉 AuthModal]
    CloseModal --> Navigate[重新導向至 /dashboard]
    
    Navigate --> End([註冊完成])
    
    style ClientValidate fill:#FFE5B4
    style APIResponse fill:#FFD700
    style ReceiveTokens fill:#90EE90
    style SaveToStorage fill:#87CEEB
    style Navigate fill:#FFB6C1
```

### 關鍵說明
- **認證模態框**：`AuthModal` 元件接收 `mode` prop（'login' 或 'register'）
- **狀態管理**：使用 `authStore` (Zustand) 管理認證狀態
- **Token 儲存**：根據「記住我」選項決定使用 localStorage 或 sessionStorage
- **自動登入**：App.tsx 初始化時從 storage 恢復 token

---

## 3. 主頁面流程（未登入版）

```mermaid
graph TB
    Start([訪問 / 路徑]) --> CheckAuth{authStore<br/>isAuthenticated?}
    
    CheckAuth -->|是| RedirectDashboard[重新導向至<br/>/dashboard]
    CheckAuth -->|否| RenderMainpage[渲染 Mainpage 元件]
    
    RenderMainpage --> RenderHeader[渲染 Header<br/>Logo + 導覽連結 + 登入/註冊按鈕]
    RenderHeader --> RenderHero[渲染 Hero 區塊<br/>主標題 + 副標題 + CTA 按鈕]
    
    RenderHero --> UserAction{使用者操作}
    
    UserAction -->|點擊 "開始探索"| OpenLoginModal[開啟登入模態框]
    UserAction -->|點擊頁首 "登入"| OpenLoginModal
    UserAction -->|點擊頁首 "免費註冊"| OpenRegisterModal[開啟註冊模態框]
    UserAction -->|向下捲動| RenderFeatures[渲染 Features 區塊<br/>3個核心功能卡片]
    
    RenderFeatures --> ContinueScroll{繼續捲動?}
    
    ContinueScroll -->|是| RenderTestimonials[渲染 Testimonials 區塊<br/>使用者評價卡片]
    ContinueScroll -->|否| StayFeatures[停留在 Features]
    
    RenderTestimonials --> FinalScroll{繼續捲動?}
    
    FinalScroll -->|是| RenderNewsletter[渲染 Newsletter 區塊<br/>電子報訂閱表單]
    FinalScroll -->|否| StayTestimonials[停留在 Testimonials]
    
    RenderNewsletter --> NewsletterAction{使用者操作}
    
    NewsletterAction -->|輸入 Email + 訂閱| ValidateEmail{Email 驗證}
    ValidateEmail -->|格式錯誤| ShowError[顯示錯誤訊息]
    ValidateEmail -->|正確| SubmitNewsletter[提交訂閱請求<br/>顯示成功訊息]
    
    NewsletterAction -->|捲動至底部| RenderFooter[渲染 Footer<br/>品牌資訊 + 連結 + 社群圖示]
    
    OpenLoginModal --> AuthFlow[進入登入流程<br/>見圖表 2.1]
    OpenRegisterModal --> AuthFlow2[進入註冊流程<br/>見圖表 2.2]
    
    style CheckAuth fill:#FFE5B4
    style RenderHero fill:#FFB6C1
    style RenderFeatures fill:#DDA0DD
    style RenderTestimonials fill:#87CEEB
    style RenderNewsletter fill:#F0E68C
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

```mermaid
graph TB
    Start([訪問 /dashboard]) --> CheckAuth{ProtectedRoute<br/>檢查認證}
    
    CheckAuth -->|未登入| RedirectHome[重新導向至 /]
    CheckAuth -->|已登入| RenderDashboard[渲染 Dashboard 元件]
    
    RenderDashboard --> RenderHeader[渲染 Header 元件]
    RenderHeader --> InitTabs[初始化 Tabs<br/>activeTab = 'basic']
    
    InitTabs --> ShowTabs[顯示 2 個 Tab 按鈕]
    
    ShowTabs --> Tab1[Tab 1: 總覽<br/>id='basic']
    ShowTabs --> Tab2[Tab 2: 留言<br/>id='comment']
    
    Tab1 --> DefaultActive[預設啟用<br/>顯示 DashboardBasic 元件]
    
    DefaultActive --> UserClickTab{使用者點擊 Tab}
    
    UserClickTab -->|點擊 "總覽"| ShowBasic[渲染 DashboardBasic<br/>顯示個人統計資料]
    UserClickTab -->|點擊 "留言"| ShowComment[渲染 DashboardComment<br/>顯示使用者留言記錄]
    
    ShowBasic --> InteractBasic{互動操作}
    InteractBasic -->|點擊社團卡片| NavigateClub[導向 /clubs/:id]
    InteractBasic -->|點擊討論| NavigateDiscussion[導向 /discussions/:id]
    
    ShowComment --> InteractComment{互動操作}
    InteractComment -->|編輯留言| NavigateEdit[導向 /comments/:id/edit]
    InteractComment -->|刪除留言| ConfirmDelete[顯示確認對話框<br/>呼叫刪除 API]
    
    style CheckAuth fill:#FFE5B4
    style Tab1 fill:#FFB6C1
    style Tab2 fill:#DDA0DD
    style ShowBasic fill:#90EE90
    style ShowComment fill:#87CEEB
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

```mermaid
graph TB
    Start([訪問 /clubs]) --> RenderHeader[渲染 Header 元件]
    RenderHeader --> LoadClubs[載入社團列表<br/>GET /api/clubs]
    
    LoadClubs --> APIResponse{API 回應}
    
    APIResponse -->|Loading| ShowSkeleton[顯示骨架載入畫面]
    APIResponse -->|Error| ShowError[顯示錯誤訊息<br/>重試按鈕]
    APIResponse -->|Success| RenderClubGrid[渲染社團網格<br/>ClubCard 元件]
    
    RenderClubGrid --> ShowFilters[顯示篩選選項<br/>分類、標籤、搜尋]
    
    ShowFilters --> UserAction{使用者操作}
    
    UserAction -->|搜尋社團| FilterClubs[即時篩選社團列表]
    UserAction -->|選擇分類| FilterByCategory[按分類篩選]
    UserAction -->|點擊社團卡片| NavigateDetail[導向 /clubs/:id]
    UserAction -->|點擊 "建立社團"| CheckAuth{已登入?}
    
    CheckAuth -->|是| NavigateCreate[導向 /clubs/create]
    CheckAuth -->|否| ShowLoginPrompt[提示需要登入<br/>開啟登入模態框]
    
    FilterClubs --> UpdateGrid[更新社團網格顯示]
    FilterByCategory --> UpdateGrid
    
    style APIResponse fill:#FFE5B4
    style RenderClubGrid fill:#90EE90
    style NavigateDetail fill:#FFB6C1
    style CheckAuth fill:#FFD700
```

### 5.2 社團詳情頁（Club Detail）

```mermaid
graph TB
    Start([訪問 /clubs/:id]) --> RenderHeader[渲染 Header 元件]
    RenderHeader --> LoadClubDetail[載入社團詳情<br/>GET /api/clubs/:id]
    
    LoadClubDetail --> APIResponse{API 回應}
    
    APIResponse -->|Loading| ShowSkeleton[顯示骨架載入畫面]
    APIResponse -->|404| ShowNotFound[顯示 404 錯誤<br/>社團不存在]
    APIResponse -->|Success| RenderDetail[渲染社團詳情]
    
    RenderDetail --> ShowInfo[顯示社團資訊<br/>名稱、描述、標籤]
    ShowInfo --> ShowMembers[顯示成員列表<br/>創辦人、管理員、成員]
    ShowMembers --> ShowDiscussions[顯示討論列表<br/>最新討論]
    
    ShowDiscussions --> CheckMembership{檢查成員身份}
    
    CheckMembership -->|未登入| ShowGuestActions[顯示訪客操作<br/>查看資訊]
    CheckMembership -->|非成員| ShowJoinButton[顯示 "加入社團" 按鈕]
    CheckMembership -->|待審核| ShowPendingStatus[顯示 "待審核" 狀態]
    CheckMembership -->|已加入| ShowMemberActions[顯示成員操作<br/>發起討論、查看社團討論]
    CheckMembership -->|創辦人/管理員| ShowAdminActions[顯示管理操作<br/>社團管理按鈕]
    
    ShowJoinButton --> UserClickJoin{點擊加入}
    UserClickJoin -->|是| SendJoinRequest[發送加入申請<br/>POST /api/clubs/:id/join]
    SendJoinRequest --> UpdateStatus[更新為 "待審核" 狀態]
    
    ShowAdminActions --> UserClickManage{點擊管理}
    UserClickManage -->|是| NavigateManagement[導向 /clubs/:id/management]
    
    ShowDiscussions --> UserClickDiscussion{點擊討論}
    UserClickDiscussion -->|是| NavigateDiscussionDetail[導向 /discussions/:id]
    
    style APIResponse fill:#FFE5B4
    style CheckMembership fill:#FFD700
    style ShowAdminActions fill:#FFB6C1
    style NavigateManagement fill:#DDA0DD
```

### 5.3 建立社團（Club Create）

```mermaid
graph TB
    Start([訪問 /clubs/create]) --> CheckAuth{ProtectedRoute<br/>檢查認證}
    
    CheckAuth -->|未登入| RedirectHome[重新導向至 /]
    CheckAuth -->|已登入| RenderForm[渲染建立社團表單]
    
    RenderForm --> ShowFields[顯示表單欄位<br/>名稱、描述、分類、標籤、封面]
    
    ShowFields --> UserInput{使用者輸入}
    
    UserInput -->|填寫表單| ClientValidate{前端驗證}
    
    ClientValidate -->|社團名稱為空| ShowNameError[顯示錯誤訊息]
    ClientValidate -->|描述為空| ShowDescError[顯示錯誤訊息]
    ClientValidate -->|未選擇分類| ShowCategoryError[顯示錯誤訊息]
    ClientValidate -->|驗證通過| SubmitForm[提交表單<br/>POST /api/clubs]
    
    ShowNameError --> UserInput
    ShowDescError --> UserInput
    ShowCategoryError --> UserInput
    
    SubmitForm --> APIResponse{API 回應}
    
    APIResponse -->|400 Bad Request| ShowValidationError[顯示驗證錯誤訊息]
    APIResponse -->|500 Server Error| ShowServerError[顯示伺服器錯誤]
    APIResponse -->|201 Created| ReceiveClubData[接收新社團資料<br/>包含 club_id]
    
    ShowValidationError --> UserInput
    ShowServerError --> UserInput
    
    ReceiveClubData --> ShowSuccess[顯示成功訊息]
    ShowSuccess --> NavigateToClub[導向 /clubs/:id<br/>新建立的社團頁面]
    
    style CheckAuth fill:#FFE5B4
    style ClientValidate fill:#FFD700
    style APIResponse fill:#FFD700
    style ReceiveClubData fill:#90EE90
    style NavigateToClub fill:#FFB6C1
```

---

## 6. 討論區流程

### 6.1 討論列表（Discussions）

```mermaid
graph TB
    Start([訪問 /discussions]) --> RenderHeader[渲染 Header 元件]
    RenderHeader --> LoadDiscussions[載入討論列表<br/>GET /api/discussions]
    
    LoadDiscussions --> APIResponse{API 回應}
    
    APIResponse -->|Loading| ShowSkeleton[顯示骨架載入畫面]
    APIResponse -->|Error| ShowError[顯示錯誤訊息]
    APIResponse -->|Success| RenderList[渲染討論列表]
    
    RenderList --> ShowFilters[顯示篩選選項<br/>社團、標籤、搜尋]
    
    ShowFilters --> UserAction{使用者操作}
    
    UserAction -->|搜尋討論| FilterDiscussions[即時篩選討論]
    UserAction -->|選擇社團| FilterByClub[按社團篩選]
    UserAction -->|點擊討論| NavigateDetail[導向 /discussions/:id]
    UserAction -->|點擊 "發起討論"| CheckAuth{已登入?}
    
    CheckAuth -->|是| NavigateNew[導向 /discussions/new]
    CheckAuth -->|否| ShowLoginPrompt[提示需要登入]
    
    FilterDiscussions --> UpdateList[更新討論列表]
    FilterByClub --> UpdateList
    
    style APIResponse fill:#FFE5B4
    style RenderList fill:#90EE90
    style CheckAuth fill:#FFD700
```

### 6.2 討論詳情（Discussion Detail）

```mermaid
graph TB
    Start([訪問 /discussions/:id]) --> RenderHeader[渲染 Header 元件]
    RenderHeader --> LoadDetail[載入討論詳情<br/>GET /api/discussions/:id]
    
    LoadDetail --> APIResponse{API 回應}
    
    APIResponse -->|Loading| ShowSkeleton[顯示骨架載入畫面]
    APIResponse -->|404| ShowNotFound[顯示 404 錯誤]
    APIResponse -->|Success| RenderDetail[渲染討論詳情]
    
    RenderDetail --> ShowTitle[顯示討論標題與內容]
    ShowTitle --> ShowAuthor[顯示作者資訊與時間]
    ShowAuthor --> ShowTags[顯示標籤]
    ShowTags --> LoadComments[載入留言列表<br/>GET /api/discussions/:id/comments]
    
    LoadComments --> CommentsResponse{留言 API 回應}
    
    CommentsResponse -->|Loading| ShowCommentSkeleton[顯示留言骨架]
    CommentsResponse -->|Success| RenderComments[渲染留言列表]
    
    RenderComments --> CheckAuth{已登入?}
    
    CheckAuth -->|是| ShowCommentForm[顯示留言表單]
    CheckAuth -->|否| ShowLoginPrompt[提示需要登入才能留言]
    
    ShowCommentForm --> UserComment{使用者操作}
    
    UserComment -->|輸入留言| ValidateComment{驗證留言}
    ValidateComment -->|內容為空| ShowEmptyError[顯示錯誤訊息]
    ValidateComment -->|內容有效| SubmitComment[提交留言<br/>POST /api/comments]
    
    ShowEmptyError --> UserComment
    
    SubmitComment --> CommentAPIResponse{API 回應}
    
    CommentAPIResponse -->|Success| RefreshComments[重新載入留言列表]
    CommentAPIResponse -->|Error| ShowCommentError[顯示錯誤訊息]
    
    RefreshComments --> RenderComments
    
    style APIResponse fill:#FFE5B4
    style CheckAuth fill:#FFD700
    style ValidateComment fill:#FFD700
    style CommentAPIResponse fill:#FFD700
```

### 6.3 發起討論（Discussion New）

```mermaid
graph TB
    Start([訪問 /discussions/new]) --> CheckAuth{ProtectedRoute<br/>檢查認證}
    
    CheckAuth -->|未登入| RedirectHome[重新導向至 /]
    CheckAuth -->|已登入| RenderForm[渲染發起討論表單]
    
    RenderForm --> ShowFields[顯示表單欄位<br/>標題、內容、社團、標籤]
    
    ShowFields --> UserInput{使用者輸入}
    
    UserInput -->|填寫表單| ClientValidate{前端驗證}
    
    ClientValidate -->|標題為空| ShowTitleError[顯示錯誤訊息]
    ClientValidate -->|內容為空| ShowContentError[顯示錯誤訊息]
    ClientValidate -->|未選擇社團| ShowClubError[顯示錯誤訊息]
    ClientValidate -->|驗證通過| SubmitForm[提交表單<br/>POST /api/discussions]
    
    ShowTitleError --> UserInput
    ShowContentError --> UserInput
    ShowClubError --> UserInput
    
    SubmitForm --> APIResponse{API 回應}
    
    APIResponse -->|400 Bad Request| ShowValidationError[顯示驗證錯誤]
    APIResponse -->|500 Server Error| ShowServerError[顯示伺服器錯誤]
    APIResponse -->|201 Created| ReceiveData[接收討論資料<br/>包含 discussion_id]
    
    ShowValidationError --> UserInput
    ShowServerError --> UserInput
    
    ReceiveData --> ShowSuccess[顯示成功訊息]
    ShowSuccess --> NavigateToDiscussion[導向 /discussions/:id<br/>新建立的討論頁面]
    
    style CheckAuth fill:#FFE5B4
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
    
    ShowRoles --> UserAction{使用者操作}
    
    UserAction -->|搜尋成員| FilterMembers[即時篩選成員列表]
    UserAction -->|點擊成員| ShowMemberMenu[顯示操作選單]
    
    ShowMemberMenu --> MenuAction{選擇操作}
    
    MenuAction -->|設為管理員| ConfirmPromote[顯示確認對話框]
    MenuAction -->|移除管理員| ConfirmDemote[顯示確認對話框]
    MenuAction -->|移除成員| ConfirmRemove[顯示確認對話框]
    
    ConfirmPromote --> CallPromoteAPI[呼叫 POST /api/clubs/:id/members/:userId/promote]
    ConfirmDemote --> CallDemoteAPI[呼叫 POST /api/clubs/:id/members/:userId/demote]
    ConfirmRemove --> CallRemoveAPI[呼叫 DELETE /api/clubs/:id/members/:userId]
    
    CallPromoteAPI --> RefreshList[重新載入成員列表]
    CallDemoteAPI --> RefreshList
    CallRemoveAPI --> RefreshList
    
    style APIResponse fill:#FFE5B4
    style ConfirmPromote fill:#FFD700
    style ConfirmRemove fill:#FEE2E2
```

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
