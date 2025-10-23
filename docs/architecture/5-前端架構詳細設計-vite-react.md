# 5. 前端架構詳細設計 (Vite + React)

前端將採用基於元件的現代化架構，以 Vite 作為建置工具，搭配 React 18 框架和 TypeScript。

## a. 前端專案結構 (`/frontend/src/`)
```
/frontend/
├── src/
│   ├── assets/         # 靜態資源，如圖片、字體
│   ├── components/     # 可重用的 UI 元件 (e.g., Button, Input, Card)
│   │   └── ui/         # 基礎 UI 元件 (Shadcn/UI 風格)
│   ├── pages/          # 頁面級元件 (e.g., HomePage, LoginPage, ProfilePage)
│   ├── services/       # API 請求層 (e.g., authService.ts, userService.ts)
│   ├── store/          # 狀態管理 (Redux Toolkit)
│   │   ├── slices/     # 各個功能的 slice (e.g., authSlice.ts)
│   │   └── store.ts    # Redux store 設定
│   ├── types/          # 全域 TypeScript 型別定義
│   ├── utils/          # 共用工具函式
│   ├── App.tsx         # 應用程式主元件，包含路由設定
│   ├── main.tsx        # 應用程式進入點
│   └── index.css       # 全域樣式
├── public/             # 公開靜態檔案
├── package.json        # 專案依賴與腳本
├── vite.config.ts      # Vite 設定檔
└── tsconfig.json       # TypeScript 設定檔
```

## b. 關鍵技術選擇與實踐

- 狀態管理 (State Management)
  - 選擇: Redux Toolkit
  - 理由: 簡化 Redux 樣板程式碼，`createSlice`/`configureStore` 提升可維護性，適合管理認證與讀書會等複雜狀態。

- 路由 (Routing)
  - 選擇: React Router DOM (v6)
  - 理由: 宣告式路由、巢狀與動態路由支援，最貼近 React 的 SPA 導航解決方案。

- API 通訊 (API Communication)
  - 選擇: Axios
  - 實踐: 在 `src/services` 建立客戶端實例與攔截器，集中處理 `Authorization`、錯誤、回應轉換。

- 樣式 (Styling)
  - 選擇: Tailwind CSS
  - 理由: Utility-first 提升開發效率；搭配 PostCSS/Autoprefixer 與 `clsx`/`tailwind-merge` 管理動態 class。

- 表單處理 (Form Handling)
  - 選擇: React Hook Form
  - 理由: 非受控元件效能佳，`useForm` 易於整合驗證（建議配 Zod）。

- 開發與建置工具 (Dev & Build Tool)
  - 選擇: Vite
  - 理由: 開發啟動與 HMR 十分快速，生產使用 Rollup 打包，輸出優化良好。

## c. 頁面路由規劃（對照 PRD v2.1）

對應 PRD 中的完整頁面架構與路由：

- Epic 1: 用戶系統頁面
  - /register, /login, /dashboard, /profile, /settings
- Epic 2: 讀書會管理頁面
  - /clubs, /clubs/create, /clubs/:clubId, /clubs/:clubId/settings
- Epic 3: 學習協作頁面
  - /clubs/:clubId/discussions, /clubs/:clubId/discussions/new, /clubs/:clubId/discussions/:topicId
  - /clubs/:clubId/resources, /clubs/:clubId/progress
- Epic 4 與共用頁面
  - /notifications, /search, /users/:userId

## d. React Router 程式碼樣板

以下樣板示範以 React Router v6 建立核心路由結構，並示意保護路由（需登入）與 Lazy Loading：

```tsx
// src/App.tsx
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Lazy-loaded pages
const Register = lazy(() => import('./pages/Register'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Clubs = lazy(() => import('./pages/clubs/Clubs'))
const ClubCreate = lazy(() => import('./pages/clubs/ClubCreate'))
const ClubDetail = lazy(() => import('./pages/clubs/ClubDetail'))
const ClubSettings = lazy(() => import('./pages/clubs/ClubSettings'))
const Discussions = lazy(() => import('./pages/clubs/Discussions'))
const DiscussionNew = lazy(() => import('./pages/clubs/DiscussionNew'))
const DiscussionDetail = lazy(() => import('./pages/clubs/DiscussionDetail'))
const Resources = lazy(() => import('./pages/clubs/Resources'))
const Progress = lazy(() => import('./pages/clubs/Progress'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Search = lazy(() => import('./pages/Search'))
const PublicProfile = lazy(() => import('./pages/PublicProfile'))

// Example auth guard (replace with real selector)
const isAuthed = () => !!localStorage.getItem('access_token')
const PrivateRoute = ({ children }: { children: JSX.Element }) => (
  isAuthed() ? children : <Navigate to="/login" replace />
)

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <Routes>
          {/* Public */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

          {/* Clubs */}
          <Route path="/clubs" element={<PrivateRoute><Clubs /></PrivateRoute>} />
          <Route path="/clubs/create" element={<PrivateRoute><ClubCreate /></PrivateRoute>} />
          <Route path="/clubs/:clubId" element={<PrivateRoute><ClubDetail /></PrivateRoute>} />
          <Route path="/clubs/:clubId/settings" element={<PrivateRoute><ClubSettings /></PrivateRoute>} />
          <Route path="/clubs/:clubId/discussions" element={<PrivateRoute><Discussions /></PrivateRoute>} />
          <Route path="/clubs/:clubId/discussions/new" element={<PrivateRoute><DiscussionNew /></PrivateRoute>} />
          <Route path="/clubs/:clubId/discussions/:topicId" element={<PrivateRoute><DiscussionDetail /></PrivateRoute>} />
          <Route path="/clubs/:clubId/resources" element={<PrivateRoute><Resources /></PrivateRoute>} />
          <Route path="/clubs/:clubId/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />

          {/* Others */}
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
          <Route path="/users/:userId" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```