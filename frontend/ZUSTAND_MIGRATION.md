# Zustand 狀態管理遷移

## 概要
已將前端狀態管理從 Redux Toolkit 完全遷移至 Zustand。

## 變更清單

### 刪除的檔案
- ❌ `src/store/store.ts` (Redux store 配置)
- ❌ `src/store/slices/authSlice.ts` (Redux auth slice)

### 移除的依賴
- ❌ `@reduxjs/toolkit`
- ❌ `react-redux`

### 保留的檔案
- ✅ `src/store/authStore.ts` (Zustand auth store)

### 更新的檔案

#### 1. `src/main.tsx`
**變更前:**
```tsx
import { Provider } from 'react-redux'
import { store } from './store/store'

<Provider store={store}>
  <App />
</Provider>
```

**變更後:**
```tsx
// 移除 Redux Provider，直接使用 App
<StrictMode>
  <App />
</StrictMode>
```

#### 2. `src/components/common/Header.tsx`
**變更前:**
```tsx
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser, logout } from '@/store/slices/authSlice'

const isAuthenticated = useSelector(selectIsAuthenticated)
const user = useSelector(selectCurrentUser)
const dispatch = useDispatch()

const handleLogout = async () => {
  await dispatch(logout())
  // ...
}
```

**變更後:**
```tsx
import { useAuthStore } from '../../store/authStore'

const { isAuthenticated, user, logout } = useAuthStore()

const handleLogout = () => {
  logout()
  // ...
}
```

#### 3. `src/components/common/Layout.tsx`
- 修正 import path: `@/utils/cn` → `../../utils/cn`
- 修正 type import: `import type { ReactNode }`

#### 4. `src/types/auth.ts`
新增遺失的 type definitions:
- `RegisterRequest`
- `LoginRequest`
- `TokenResponse`
- `RegisterFormData`
- `LoginFormData`

## 狀態管理架構

### Zustand Store (`src/store/authStore.ts`)
```tsx
interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (tokens: TokenResponse, rememberMe?: boolean) => void
  logout: () => void
  initialize: () => void
}
```

### 使用方式
```tsx
// 在任何元件中使用
import { useAuthStore } from '@/store/authStore'

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuthStore()
  
  // 使用狀態和 actions
  if (isAuthenticated) {
    console.log(user?.display_name)
  }
}
```

## 優勢

### Zustand vs Redux
✅ **更簡潔**: 不需要 Provider wrapper  
✅ **更少樣板代碼**: 不需要 actions, reducers, selectors  
✅ **更小的 bundle**: 移除 6 個 Redux 相關套件  
✅ **更直觀的 API**: 直接從 hook 解構出 state 和 actions  
✅ **TypeScript 友善**: 自動型別推導，不需要額外的 type definitions  

## 測試狀態
- ✅ Header 元件使用 Zustand
- ✅ App.tsx 維持原有的 Zustand 使用
- ✅ Layout 元件整合完成
- ✅ 所有 TypeScript 型別檢查通過
- ✅ 移除所有 Redux 依賴

## 後續工作
- 🔄 執行完整的端對端測試
- 🔄 確認所有頁面的認證狀態正常運作
- 🔄 測試登入/登出流程

---
**遷移日期**: 2025-10-23  
**執行者**: GitHub Copilot (Scrum Master Agent)
