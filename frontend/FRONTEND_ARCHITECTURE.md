# Frontend 架構說明文件

## 目錄
1. [技術棧概述](#技術棧概述)
2. [專案結構](#專案結構)
3. [設計系統與樣式](#設計系統與樣式)
4. [狀態管理](#狀態管理)
5. [路由架構](#路由架構)
6. [組件設計](#組件設計)
7. [服務層設計](#服務層設計)
8. [UI/UX 設計原則](#uiux-設計原則)
9. [測試策略](#測試策略)
10. [建置與部署](#建置與部署)

---

## 技術棧概述

### 核心技術
- **React 19.1.1** - 前端框架，使用最新特性
- **TypeScript 5.9.3** - 類型安全的開發體驗
- **Vite 7.1.7** - 快速的建置工具與開發伺服器
- **React Router DOM 7.9.4** - 客戶端路由管理

### 狀態管理
- **Zustand 5.0.8** - 輕量級狀態管理，比 Redux 更簡潔

### UI 與樣式
- **Tailwind CSS 4.1.14** - Utility-first CSS 框架
- **PostCSS 8.5.6** - CSS 處理器
- **@heroicons/react 2.2.0** - 高品質 SVG 圖標庫
- **clsx 2.1.1** + **tailwind-merge 2.5.3** - 條件式類名管理

### 表單處理
- **React Hook Form 7.53.0** - 高效能表單管理
- **Zod 4.1.12** - TypeScript-first 的 schema 驗證
- **@hookform/resolvers 5.2.2** - 表單驗證整合

### HTTP 請求
- **Axios 1.12.2** - Promise-based HTTP 客戶端

### 其他工具
- **date-fns 4.1.0** - 日期格式化與處理
- **react-hot-toast 2.6.0** - 優雅的通知提示

### 開發工具
- **Vitest 4.0.1** - 單元測試框架
- **@testing-library/react 16.3.0** - React 組件測試
- **ESLint 9.36.0** - 程式碼檢查工具
- **TypeScript ESLint 8.45.0** - TypeScript 專用 ESLint 規則

---

## 專案結構

```
frontend/
├── public/                      # 靜態資源
├── src/
│   ├── assets/                  # 圖片、字體等資源
│   ├── components/              # 可重用組件
│   │   ├── clubs/              # 讀書會相關組件
│   │   ├── common/             # 通用組件（Header, Footer, Layout）
│   │   ├── dashboard/          # 儀表板組件
│   │   ├── events/             # 活動組件
│   │   ├── forms/              # 表單組件
│   │   ├── legal/              # 法律文件組件
│   │   ├── profile/            # 個人檔案組件
│   │   └── ui/                 # 基礎 UI 組件（Button, Input 等）
│   ├── hooks/                   # 自定義 React Hooks
│   ├── pages/                   # 頁面組件
│   │   ├── clubs/              # 讀書會相關頁面
│   │   ├── activities/         # 活動頁面
│   │   ├── legal/              # 法律文件頁面
│   │   └── profile/            # 個人檔案頁面
│   ├── services/                # API 服務層
│   ├── store/                   # Zustand 狀態管理
│   ├── types/                   # TypeScript 型別定義
│   ├── utils/                   # 工具函數
│   ├── test/                    # 測試設定
│   ├── App.tsx                  # 應用程式根組件
│   ├── main.tsx                 # 應用程式入口
│   └── index.css                # 全局樣式
├── .env                         # 環境變數
├── .env.example                 # 環境變數範例
├── package.json                 # 專案依賴
├── tsconfig.json                # TypeScript 設定
├── vite.config.ts               # Vite 建置設定
├── tailwind.config.js           # Tailwind 設定
└── eslint.config.js             # ESLint 設定
```

### 目錄職責說明

#### `/components` - 組件層
- **clubs/** - 讀書會業務組件
  - `ClubCard.tsx` - 讀書會卡片
  - `SearchBar.tsx` - 搜尋列
  - `TagFilter.tsx` - 標籤篩選器
  - `JoinRequestList.tsx` - 加入請求列表
  - `MemberManagement.tsx` - 成員管理
  
- **common/** - 通用布局組件
  - `Header.tsx` - 全局導航列
  - `Footer.tsx` - 全局頁尾
  - `Layout.tsx` - 頁面布局容器
  - `PrivateRoute.tsx` - 路由守衛
  - `Pagination.tsx` - 分頁組件
  
- **dashboard/** - 儀表板組件
  - `UserInfoCard.tsx` - 用戶資訊卡片
  - `MyClubsList.tsx` - 我的讀書會列表
  - `QuickActions.tsx` - 快速操作按鈕
  - `StatsCard.tsx` - 統計卡片

- **ui/** - 基礎 UI 組件（可重用）
  - 按鈕、輸入框、模態框等

#### `/pages` - 頁面層
- **clubs/** - 讀書會功能頁面
  - `ClubExplore.tsx` - 探索讀書會
  - `ClubDetail.tsx` - 讀書會詳情
  - `ClubCreate.tsx` - 創建讀書會
  - `ClubSettings.tsx` - 讀書會設定
  - `MyClubs.tsx` - 我的讀書會
  - `Discussions.tsx` - 討論區列表
  - `DiscussionDetail.tsx` - 討論詳情

- **根目錄** - 認證與基礎頁面
  - `Register.tsx` - 註冊頁面
  - `Login.tsx` - 登入頁面
  - `Dashboard.tsx` - 個人儀表板
  - `Profile.tsx` - 個人檔案

#### `/services` - 服務層
API 請求的抽象層，每個服務對應一個業務領域：
- `authService.ts` - 認證服務
- `bookClubService.ts` - 讀書會服務
- `profileService.ts` - 個人檔案服務
- `eventService.ts` - 活動服務
- `apiClient.ts` - Axios 實例配置

#### `/store` - 狀態管理
使用 Zustand 管理全局狀態：
- `authStore.ts` - 認證狀態
- `bookClubStore.ts` - 讀書會狀態
- `clubManagementStore.ts` - 讀書會管理狀態

#### `/types` - 型別定義
- `auth.ts` - 認證相關型別
- `bookClub.ts` - 讀書會相關型別
- `user.ts` - 用戶相關型別

---

## 設計系統與樣式

### Tailwind CSS 配置

#### 品牌色系統
```javascript
// tailwind.config.js
colors: {
  brand: {
    primary: '#04c0f4',   // 主品牌色 - 天空藍
    light: '#cfecf4',     // 淺色變體
    dark: '#0398c4',      // 深色變體
    // 完整色階 50-900
    50: '#e6f9ff',
    100: '#ccf3ff',
    200: '#99e7ff',
    300: '#66dbff',
    400: '#33cfff',
    500: '#04c0f4',       // 主色
    600: '#0398c4',       // 深色
    700: '#027399',
    800: '#014d66',
    900: '#012633',
  }
}
```

#### 設計原則
1. **Mobile-First** - 從小螢幕開始設計，逐步增強
2. **一致性** - 統一的間距、圓角、陰影系統
3. **品牌識別** - 使用品牌色系統保持視覺一致
4. **可訪問性** - 確保良好的對比度和鍵盤導航

### 樣式架構

#### 1. 全局樣式 (`index.css`)
```css
@import "tailwindcss";

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

#### 2. 組件樣式模式
使用 Tailwind 的 utility classes + 條件式類名：

```tsx
// 使用 clsx 和 tailwind-merge
import { cn } from '@/utils/cn';

<button
  className={cn(
    'rounded-lg px-4 py-2 font-medium transition-all duration-200',
    'bg-brand-primary text-white hover:bg-brand-dark',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variant === 'outline' && 'bg-transparent border-2 border-brand-primary text-brand-primary',
    className
  )}
>
  {children}
</button>
```

### 常用設計 Token

#### 間距系統
- `space-y-2` (0.5rem / 8px)
- `space-y-4` (1rem / 16px)
- `space-y-6` (1.5rem / 24px)
- `gap-2, gap-4, gap-6, gap-8`

#### 圓角系統
- `rounded-lg` (0.5rem) - 標準卡片
- `rounded-xl` (0.75rem) - 大型卡片
- `rounded-full` - 圓形按鈕、頭像

#### 陰影系統
- `shadow-sm` - 輕微陰影
- `shadow-md` - 中等陰影（卡片預設）
- `shadow-lg` - 大陰影（hover 狀態）
- `shadow-2xl` - 超大陰影（浮動效果）

#### 動畫與過渡
- `transition-all duration-200` - 標準過渡
- `hover:scale-105` - hover 放大效果
- `hover:shadow-lg` - hover 陰影增強

---

## 狀態管理

### Zustand 架構

使用 Zustand 實現簡潔的狀態管理，比 Redux 更輕量：

#### 1. 認證狀態 (`authStore.ts`)
```typescript
interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

interface AuthActions {
  login: (tokens: TokenResponse, rememberMe?: boolean) => void;
  logout: () => void;
  initialize: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // state
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  
  // actions
  login: async (tokens, rememberMe) => {
    // 儲存 token
    // 獲取用戶資料
    // 更新狀態
  },
  logout: () => {
    // 清除 token
    // 重置狀態
  },
  initialize: async () => {
    // 應用啟動時初始化認證狀態
  }
}));
```

#### 2. 讀書會狀態 (`bookClubStore.ts`)
```typescript
interface BookClubState {
  clubs: BookClub[];
  detailClub: BookClub | null;
  loading: boolean;
  error: string | null;
}

interface BookClubActions {
  fetchClubs: (params?: SearchParams) => Promise<void>;
  fetchClubDetail: (id: number) => Promise<void>;
  joinClub: (id: number) => Promise<void>;
  leaveClub: (id: number) => Promise<void>;
}
```

### 狀態管理最佳實踐

1. **分離關注點** - 每個 store 對應一個業務領域
2. **異步操作** - 在 actions 中處理 API 請求
3. **錯誤處理** - 統一的錯誤狀態管理
4. **選擇性訂閱** - 只訂閱需要的狀態片段

```tsx
// ✅ 好的做法 - 只訂閱需要的狀態
const user = useAuthStore((state) => state.user);
const login = useAuthStore((state) => state.login);

// ❌ 避免 - 訂閱整個 store
const authStore = useAuthStore();
```

---

## 路由架構

### React Router 配置

#### 路由結構
```tsx
// App.tsx
<Routes>
  {/* 公開路由 */}
  <Route path="/" element={<Navigate to="/clubs" replace />} />
  <Route path="/login" element={<Layout><Login /></Layout>} />
  <Route path="/register" element={<Layout><Register /></Layout>} />
  
  {/* 受保護路由 */}
  <Route 
    path="/dashboard" 
    element={
      <PrivateRoute>
        <Layout><Dashboard /></Layout>
      </PrivateRoute>
    } 
  />
  
  {/* 讀書會路由 */}
  <Route path="/clubs" element={<Layout><ClubExplore /></Layout>} />
  <Route path="/clubs/:clubId" element={<Layout><ClubDetail /></Layout>} />
  <Route path="/clubs/:clubId/settings" element={<PrivateRoute><Layout><ClubSettings /></Layout></PrivateRoute>} />
  
  {/* ... 其他路由 */}
</Routes>
```

### 路由守衛 (`PrivateRoute.tsx`)
```tsx
export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return <LoadingFallback />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
```

### 路由分類

#### 1. 公開路由（無需認證）
- `/` - 首頁（重定向到 `/clubs`）
- `/login` - 登入
- `/register` - 註冊
- `/clubs` - 探索讀書會
- `/clubs/:clubId` - 讀書會詳情
- `/terms` - 服務條款
- `/privacy` - 隱私政策

#### 2. 受保護路由（需要認證）
- `/dashboard` - 個人儀表板
- `/profile` - 個人檔案
- `/clubs/create` - 創建讀書會
- `/clubs/:clubId/settings` - 讀書會設定
- `/clubs/:clubId/discussions` - 討論區
- `/clubs/:clubId/events` - 活動列表

#### 3. 角色保護路由（需要特定權限）
- `/clubs/:clubId/settings` - 需要 owner/admin 權限

### Lazy Loading
使用 React.lazy 進行程式碼分割：

```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClubDetail = lazy(() => import('./pages/clubs/ClubDetail'));

<Suspense fallback={<LoadingFallback />}>
  <Routes>
    {/* routes */}
  </Routes>
</Suspense>
```

---

## 組件設計

### 組件分類

#### 1. Layout 組件
**用途**：定義頁面結構

```tsx
// Layout.tsx
interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}
```

**特點**：
- 靈活的寬度控制
- 可選的 Header/Footer
- 統一的間距系統

#### 2. 業務組件
**用途**：封裝特定業務邏輯

##### ClubCard - 讀書會卡片
```tsx
interface ClubCardProps {
  club: BookClub;
  showJoinButton?: boolean;
  onJoinClick?: () => void;
}
```

**設計要點**：
- 懸停效果（scale + shadow）
- 封面圖片縮放動畫
- 浮動成員徽章
- 標籤漸變背景

##### SearchBar - 搜尋列
```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}
```

**功能**：
- 實時搜尋
- Enter 鍵觸發
- 清除按鈕
- 品牌色 focus ring

#### 3. UI 基礎組件
**用途**：可重用的基礎元素

##### Button 組件
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
```

**變體**：
- `primary` - 主要操作（品牌色）
- `secondary` - 次要操作（灰色）
- `outline` - 輪廓按鈕
- `danger` - 危險操作（紅色）

#### 4. 功能組件
**用途**：提供特定功能

##### Pagination - 分頁
```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

##### ConfirmationModal - 確認對話框
```tsx
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

### 組件設計原則

#### 1. 單一職責
每個組件只負責一個功能

```tsx
// ✅ 好的做法
<SearchBar onSearch={handleSearch} />
<ClubList clubs={clubs} />

// ❌ 避免
<SearchableClubList /> // 混合了搜尋和列表邏輯
```

#### 2. Props 設計
- 必需 props 放前面
- 可選 props 有預設值
- 使用 TypeScript interface 定義

```tsx
interface ComponentProps {
  // 必需
  id: number;
  name: string;
  
  // 可選
  className?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact';
}
```

#### 3. 組合優於繼承
使用 children 和組合模式

```tsx
<Card>
  <CardHeader>標題</CardHeader>
  <CardBody>內容</CardBody>
  <CardFooter>動作按鈕</CardFooter>
</Card>
```

#### 4. 條件式渲染
```tsx
// 使用 && 進行簡單條件
{isLoading && <Spinner />}

// 使用三元運算符處理兩種情況
{error ? <ErrorMessage /> : <Content />}

// 複雜邏輯提取到函數
const renderStatus = () => {
  if (isPending) return <Badge color="yellow">待審核</Badge>;
  if (isApproved) return <Badge color="green">已通過</Badge>;
  return <Badge color="red">已拒絕</Badge>;
};
```

---

## 服務層設計

### API Client 配置

#### Axios 實例 (`apiClient.ts`)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加 token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || 
                sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 響應攔截器 - 處理 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除 token 並重定向到登入頁
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 服務模組設計

#### 1. 認證服務 (`authService.ts`)
```typescript
export const authService = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/v1/auth/login', {
      username: email,
      password,
    });
    return response.data;
  },
  
  logout: async () => {
    await apiClient.post('/api/v1/auth/logout');
  },
};
```

#### 2. 讀書會服務 (`bookClubService.ts`)
```typescript
export const bookClubService = {
  // 獲取讀書會列表
  getClubs: async (params?: SearchParams) => {
    const response = await apiClient.get('/api/v1/clubs', { params });
    return response.data;
  },
  
  // 獲取讀書會詳情
  getClubDetail: async (id: number) => {
    const response = await apiClient.get(`/api/v1/clubs/${id}`);
    return response.data;
  },
  
  // 加入讀書會
  joinClub: async (id: number) => {
    const response = await apiClient.post(`/api/v1/clubs/${id}/join`);
    return response.data;
  },
  
  // 上傳封面
  uploadCover: async (clubId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.put(
      `/api/v1/clubs/${clubId}/cover`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },
};
```

### 錯誤處理策略

#### 1. Service 層
```typescript
export const getClubDetail = async (id: number): Promise<BookClub> => {
  try {
    const response = await apiClient.get(`/api/v1/clubs/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || '獲取讀書會詳情失敗');
    }
    throw error;
  }
};
```

#### 2. Store 層
```typescript
fetchClubDetail: async (id: number) => {
  set({ loading: true, error: null });
  try {
    const club = await bookClubService.getClubDetail(id);
    set({ detailClub: club, loading: false });
  } catch (error) {
    set({ 
      error: error instanceof Error ? error.message : '未知錯誤',
      loading: false 
    });
  }
}
```

#### 3. 組件層
```typescript
useEffect(() => {
  if (error) {
    toast.error(error);
    clearError();
  }
}, [error, clearError]);
```

---

## UI/UX 設計原則

### 視覺設計

#### 1. 色彩使用
- **主色（品牌色）**：`#04c0f4`
  - 主要操作按鈕
  - 連結
  - 重要圖標
  
- **中性色**：灰階系統
  - 文字：`text-gray-900`（標題）、`text-gray-700`（正文）、`text-gray-500`（次要）
  - 背景：`bg-gray-50`（頁面背景）、`bg-white`（卡片）
  
- **狀態色**：
  - 成功：`green-500`
  - 錯誤：`red-500`
  - 警告：`yellow-500`
  - 資訊：`blue-500`

#### 2. 排版系統
```css
/* 標題 */
h1: text-3xl font-bold (30px)
h2: text-2xl font-bold (24px)
h3: text-xl font-semibold (20px)

/* 正文 */
body: text-base (16px)
small: text-sm (14px)
tiny: text-xs (12px)
```

#### 3. 間距系統
- 組件內間距：`p-4`（16px）或 `p-6`（24px）
- 組件間間距：`space-y-6`（24px）
- 按鈕間距：`gap-2`（8px）或 `gap-4`（16px）

### 互動設計

#### 1. 懸停效果
```tsx
// 按鈕
className="transition-all duration-200 hover:scale-105 hover:shadow-lg"

// 卡片
className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1"

// 連結
className="transition-colors duration-200 hover:text-brand-primary"
```

#### 2. 載入狀態
```tsx
// 骨架屏
{loading && <SkeletonCard />}

// 載入指示器
<button disabled={loading}>
  {loading ? <Spinner /> : '提交'}
</button>
```

#### 3. 空狀態
```tsx
{clubs.length === 0 && (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📚</div>
    <p className="text-gray-500">還沒有加入任何讀書會</p>
    <Button onClick={goToExplore}>探索讀書會</Button>
  </div>
)}
```

#### 4. 錯誤狀態
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-700">❌ {error}</p>
  </div>
)}
```

### 回應式設計

#### 斷點系統（Tailwind 預設）
```
sm: 640px   // 手機橫向
md: 768px   // 平板直向
lg: 1024px  // 平板橫向、小筆電
xl: 1280px  // 桌面
2xl: 1536px // 大桌面
```

#### 回應式模式
```tsx
// 網格佈局
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Flexbox
className="flex flex-col lg:flex-row gap-8"

// 文字大小
className="text-xl lg:text-2xl"

// 間距
className="p-4 md:p-6 lg:p-8"
```

### 可訪問性（A11y）

#### 1. 語義化 HTML
```tsx
<nav aria-label="主導航">
  <ul>
    <li><a href="/dashboard">儀表板</a></li>
  </ul>
</nav>
```

#### 2. ARIA 屬性
```tsx
<button 
  aria-label="關閉對話框"
  aria-pressed={isOpen}
>
  <XIcon />
</button>
```

#### 3. 鍵盤導航
```tsx
<input
  onKeyDown={(e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') handleClear();
  }}
/>
```

#### 4. Focus 狀態
```tsx
className="focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
```

---

## 測試策略

### 測試框架設置

#### Vitest 配置 (`vite.config.ts`)
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

#### 測試設置 (`test/setup.ts`)
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### 測試類型

#### 1. 單元測試
測試單個函數或組件的行為

```typescript
// utils/dateFormatter.test.ts
import { formatDate } from './dateFormatter';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01');
    expect(formatDate(date)).toBe('2024年1月1日');
  });
});
```

#### 2. 組件測試
測試組件渲染和互動

```typescript
// components/clubs/ClubCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ClubCard } from './ClubCard';

describe('ClubCard', () => {
  const mockClub = {
    id: 1,
    name: '測試讀書會',
    description: '這是一個測試',
  };

  it('renders club name', () => {
    render(<ClubCard club={mockClub} />);
    expect(screen.getByText('測試讀書會')).toBeInTheDocument();
  });
});
```

#### 3. 整合測試
測試多個組件或 store 的互動

```typescript
// store/authStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.login(mockTokens);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### 測試命令
```bash
# 執行測試
npm test

# 測試 UI 模式
npm run test:ui

# 測試覆蓋率
npm run test:coverage
```

---

## 建置與部署

### 開發環境

#### 環境變數 (`.env.local`)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

#### 啟動開發伺服器
```bash
npm run dev
```
- Port: 5173（預設）
- Hot Module Replacement (HMR)
- Fast Refresh for React

### 建置流程

#### 1. TypeScript 檢查 + 建置
```bash
npm run build:check
```

#### 2. 僅建置（跳過型別檢查）
```bash
npm run build
```

#### 3. 預覽建置結果
```bash
npm run preview
```

### 部署配置

#### Vercel 配置 (`vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
**用途**：處理 SPA 路由，確保重新整理頁面不會 404

#### 建置產物
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
```

### 環境配置

#### 開發環境
- `npm run dev`
- Hot reload
- Source maps
- 詳細錯誤訊息

#### 生產環境
- `npm run build`
- Code minification
- Tree shaking
- Asset optimization
- Hash-based cache busting

### 性能優化

#### 1. 程式碼分割
```tsx
// 使用 React.lazy 進行路由級別的分割
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

#### 2. 圖片優化
- 使用 Cloudinary 進行圖片處理
- 響應式圖片（不同螢幕大小載入不同尺寸）
- Lazy loading

#### 3. Bundle 大小優化
- Tree shaking（Vite 自動處理）
- 動態導入
- 移除未使用的依賴

---

## 開發工作流程

### 1. 新功能開發

#### 步驟
1. **創建功能分支**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **開發組件**
   - 創建 TypeScript 型別定義
   - 實作組件邏輯
   - 添加樣式

3. **撰寫測試**
   ```bash
   npm test
   ```

4. **程式碼檢查**
   ```bash
   npm run lint
   ```

5. **本地測試**
   ```bash
   npm run dev
   ```

6. **提交代碼**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

### 2. 除錯流程

#### 開發工具
1. **React Developer Tools**
   - 檢查組件樹
   - 查看 props 和 state

2. **Redux DevTools**（用於 Zustand）
   - 時間旅行除錯
   - State 快照

3. **Vite Dev Server**
   - 即時錯誤提示
   - HMR 快速反饋

4. **Console Logging**
   ```typescript
   console.log('Current state:', state);
   console.table(clubs);
   ```

### 3. 程式碼審查清單

#### 檢查項目
- [ ] TypeScript 沒有型別錯誤
- [ ] ESLint 沒有警告
- [ ] 組件有適當的 prop types
- [ ] 錯誤處理完善
- [ ] 載入狀態處理
- [ ] 空狀態處理
- [ ] 回應式設計測試
- [ ] 可訪問性檢查
- [ ] 測試覆蓋率達標

---

## 最佳實踐總結

### 1. TypeScript
- ✅ 定義完整的型別
- ✅ 使用 interface 而非 type（組件 props）
- ✅ 避免使用 `any`
- ✅ 使用泛型提高重用性

### 2. React
- ✅ 使用函數組件和 Hooks
- ✅ 保持組件小而專注
- ✅ 使用 memo 優化性能（需要時）
- ✅ 正確處理副作用（useEffect）

### 3. 狀態管理
- ✅ 本地狀態優先（useState）
- ✅ 全局狀態用 Zustand
- ✅ 避免過度使用全局狀態
- ✅ 選擇性訂閱 store

### 4. 樣式
- ✅ 使用 Tailwind utility classes
- ✅ 保持類名可讀性
- ✅ 使用 cn() 進行條件式類名
- ✅ 遵循品牌設計系統

### 5. 性能
- ✅ Lazy loading 路由
- ✅ 優化圖片載入
- ✅ 使用 React.memo（謹慎）
- ✅ 避免不必要的重新渲染

### 6. 可訪問性
- ✅ 語義化 HTML
- ✅ ARIA 屬性
- ✅ 鍵盤導航
- ✅ Focus 狀態

---

## 常見問題與解決方案

### 1. 認證失效處理
**問題**：Token 過期導致 API 請求失敗

**解決**：
- Axios interceptor 自動處理 401
- 清除 token 並重定向到登入頁

### 2. 圖片無法顯示
**問題**：Cloudinary 圖片載入失敗

**解決**：
```tsx
<img
  src={getImageUrl(club.cover_image_url)}
  onError={(e) => {
    e.currentTarget.src = '/placeholder.jpg';
  }}
/>
```

### 3. 狀態不更新
**問題**：Zustand store 狀態沒有觸發重新渲染

**解決**：
- 確保使用 `set` 更新狀態
- 避免直接修改狀態對象

```typescript
// ❌ 錯誤
state.clubs.push(newClub);

// ✅ 正確
set({ clubs: [...state.clubs, newClub] });
```

### 4. 路由重新整理 404
**問題**：SPA 路由在重新整理時返回 404

**解決**：
- 配置 Vercel rewrites
- 所有路徑重寫到 index.html

---

## 維護與更新

### 依賴更新
```bash
# 檢查過時的依賴
npm outdated

# 更新依賴
npm update

# 更新主要版本（謹慎）
npm install react@latest
```

### 程式碼清理
```bash
# 移除未使用的依賴
npm prune

# 清理建置快取
rm -rf dist .vite
```

### 文檔維護
- 保持 README 更新
- 記錄重要的架構決策
- 更新 API 文檔

---

## 參考資源

### 官方文檔
- [React 文檔](https://react.dev/)
- [TypeScript 文檔](https://www.typescriptlang.org/)
- [Vite 文檔](https://vitejs.dev/)
- [Tailwind CSS 文檔](https://tailwindcss.com/)
- [Zustand 文檔](https://zustand-demo.pmnd.rs/)

### 內部文檔
- `/docs/prd.md` - 產品需求文檔
- `/docs/architecture.md` - 系統架構
- `/docs/contracts/` - API 合約文檔

---

**最後更新**：2024年11月5日  
**維護者**：Development Team  
**版本**：1.0.0
