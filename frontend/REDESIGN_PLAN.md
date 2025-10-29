# BookClub 前端完全重設計計劃

## 📋 總覽

基於 `docs/design/` 中的 SVG 設計稿,完全重新設計所有前端頁面。

## 🗑️ 階段 0: 清除舊文件

### 需要刪除的頁面文件:
- [x] `src/pages/Login.tsx` 
- [x] `src/pages/Register.tsx`
- [ ] `src/pages/Dashboard.tsx`
- [ ] `src/pages/Dashboard.test.tsx`
- [ ] `src/pages/Profile.tsx`
- [ ] `src/pages/VerifyEmail.tsx`
- [ ] `src/pages/clubs/ClubCreate.tsx`
- [ ] `src/pages/clubs/ClubDetail.tsx`
- [ ] `src/pages/clubs/ClubExplore.tsx`
- [ ] `src/pages/clubs/ClubSettings.tsx`

## 🎨 階段 1: 認證模組 (Auth Module)

**設計稿位置**: `docs/design/auth/`

### 1.1 AuthModal 組件
- **SVG**: `login_register_modal.svg` + `register_modal.svg`
- **新文件**: `src/components/auth/AuthModal.tsx`
- **功能**:
  - Modal 遮罩層 (黑色半透明 50%)
  - 白色卡片帶藍色邊框 (#04C0F4)
  - BookClub Logo 區域 (#CFECF4 背景)
  - Login/Register 標籤切換
  - Login 表單 (Email + Password + Remember Me)
  - Register 表單 (Username + Email + Password + Confirm Password)
  - Google 登入按鈕

## 🏠 階段 2: 主頁模組 (Main Page Module)

**設計稿位置**: `docs/design/mainpage/`

### 2.1 MainPage 組件
- **SVG**: 
  - `mainpage_layout.svg` (未登入狀態)
  - `mainpage_layout_login.svg` (已登入狀態)
- **新文件**: `src/pages/MainPage.tsx`
- **功能**:
  - 響應式導航欄
  - Hero Section
  - 特色社團展示
  - CTA 按鈕
  - Footer

## 📊 階段 3: 儀表板模組 (Dashboard Module)

**設計稿位置**: `docs/design/dashboard/`

### 3.1 Dashboard 主頁
- **SVG**: `dashboard_basic.svg`
- **新文件**: `src/pages/dashboard/Dashboard.tsx`
- **功能**:
  - 64px 高度導航欄
  - 側邊欄導航
  - 標籤切換 (基本/社團/評論)
  - 內容區域

### 3.2 Dashboard Club Tab
- **SVG**: `dashboard_club.svg`
- **新文件**: `src/pages/dashboard/DashboardClubTab.tsx`

### 3.3 Dashboard Comment Tab
- **SVG**: `dashboard_comment.svg`
- **新文件**: `src/pages/dashboard/DashboardCommentTab.tsx`

## 📚 階段 4: 社團模組 (Club Module)

**設計稿位置**: `docs/design/club/`

### 4.1 社團目錄
- **SVG**: `club_directory.svg`
- **新文件**: `src/pages/club/ClubDirectory.tsx`
- **功能**:
  - 篩選面板 (`club_filter_modal.svg`)
  - 排序面板 (`club_sort_panel.svg`)
  - 社團卡片列表

### 4.2 社團詳情
- **SVG**: `club_detail.svg`
- **新文件**: `src/pages/club/ClubDetail.tsx`

### 4.3 創建社團
- **SVG**: `create_club.svg`
- **新文件**: `src/pages/club/CreateClub.tsx`

### 4.4 社團設置
- **SVG**: `club_setting.svg`
- **新文件**: `src/pages/club/ClubSettings.tsx`

### 4.5 社團相關 Modal
- **SVG**: `club_modals.svg`, `club_basic_edit_modal.svg`, `club_member_add_modal.svg`
- **新文件**: 
  - `src/components/club/EditClubModal.tsx`
  - `src/components/club/AddMemberModal.tsx`
  - `src/components/club/FilterModal.tsx`

### 4.6 公告功能
- **SVG**: `club_announcement_list.svg`, `club_announcement_publish.svg`
- **新文件**:
  - `src/pages/club/AnnouncementList.tsx`
  - `src/components/club/PublishAnnouncementModal.tsx`

### 4.7 成員列表
- **SVG**: `club_member_list.svg`
- **新文件**: `src/pages/club/MemberList.tsx`

### 4.8 偏好設置
- **SVG**: `club_prefer_setting.svg`
- **新文件**: `src/pages/club/PreferenceSettings.tsx`

## 👤 階段 5: 帳戶模組 (Account Module)

**設計稿位置**: `docs/design/account/`

### 5.1 帳戶設置
- **SVG**: `account_setting.svg`
- **新文件**: `src/pages/account/AccountSettings.tsx`

### 5.2 通知
- **SVG**: `account_notify.svg`
- **新文件**: `src/pages/account/Notifications.tsx`

### 5.3 我的社團
- **SVG**: `account_club.svg`
- **新文件**: `src/pages/account/MyClubs.tsx`

### 5.4 我的評論
- **SVG**: `account_comment.svg`
- **新文件**: `src/pages/account/MyComments.tsx`

### 5.5 帳戶 Modal
- **SVG**: `account_modal_edit.svg`, `account_modal_preference.svg`, `account_modal_upload.svg`
- **新文件**:
  - `src/components/account/EditProfileModal.tsx`
  - `src/components/account/PreferenceModal.tsx`
  - `src/components/account/UploadAvatarModal.tsx`

## 💬 階段 6: 討論模組 (Discussions Module)

**設計稿位置**: `docs/design/discussions/`

### 6.1 討論列表
- **SVG**: `club_discussions_list.svg`
- **新文件**: `src/pages/discussions/DiscussionsList.tsx`

### 6.2 討論詳情
- **SVG**: `club_discussion_detail.svg`
- **新文件**: `src/pages/discussions/DiscussionDetail.tsx`

### 6.3 新建討論
- **SVG**: `club_discussion_new.svg`
- **新文件**: `src/pages/discussions/NewDiscussion.tsx`

## 🛠️ 實施順序建議

1. ✅ **階段 1**: 認證模組 (已部分完成 - 需整合為 Modal)
2. **階段 2**: 主頁模組
3. **階段 3**: 儀表板模組
4. **階段 4**: 社團模組
5. **階段 5**: 帳戶模組
6. **階段 6**: 討論模組

## 📝 設計規範

### 顏色系統
- **主色**: `#04C0F4` (品牌藍)
- **淺藍**: `#CFECF4` (背景/標籤)
- **灰色背景**: `#F3F3F3` (輸入框)
- **黑色遮罩**: `rgba(0, 0, 0, 0.5)`

### 佈局規範
- **Modal 尺寸**: 基於 1440×1024 設計稿
- **導航欄高度**: 64px
- **圓角**: 
  - Modal: `rounded-lg`
  - 輸入框: `rounded-full`
  - 按鈕: `rounded-full`

### 字體
- **主字體**: Inter (已配置在 Tailwind)
- **標題**: font-semibold, font-bold
- **正文**: font-medium, font-normal

## 🔄 路由結構 (需要更新)

```typescript
/                     -> MainPage (未登入/已登入)
/auth                 -> AuthModal
/dashboard            -> Dashboard
  /dashboard/basic    -> 基本視圖
  /dashboard/clubs    -> 社團標籤
  /dashboard/comments -> 評論標籤
/club                 -> ClubDirectory
/club/:id             -> ClubDetail
/club/:id/settings    -> ClubSettings
/club/:id/discussions -> DiscussionsList
/club/:id/discussions/:discussionId -> DiscussionDetail
/account              -> AccountSettings
/account/notifications -> Notifications
/account/clubs        -> MyClubs
/account/comments     -> MyComments
```

## ✅ 當前進度

- [x] 階段 0: 刪除 Login.tsx, Register.tsx
- [ ] 階段 1: 創建 AuthModal 組件
- [ ] 階段 2-6: 待實施

---

**最後更新**: 2025-10-29
**負責人**: AI Assistant (James - Dev Agent)
