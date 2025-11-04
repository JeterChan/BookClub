# BookClub 前端 CSS 樣式指南

## 概述

BookClub 專案使用 **Tailwind CSS** 作為主要的 CSS 框架，並配合自定義主題配置來實現統一的視覺風格。

## 技術棧

- **Tailwind CSS**: Utility-first CSS 框架
- **PostCSS**: CSS 處理工具
- **Autoprefixer**: 自動添加瀏覽器前綴

---

## 文件結構

```
BookClub/frontend/
├── src/
│   └── index.css              # 全域 CSS 樣式
├── tailwind.config.js         # Tailwind 配置文件
└── postcss.config.js          # PostCSS 配置文件
```

---

## 1. 全域樣式 (`index.css`)

### 檔案位置
`BookClub/frontend/src/index.css`

### 內容說明

```css
@import "tailwindcss";

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  width: 100%;
  min-height: 100vh;
}
```

**功能說明:**
- 引入 Tailwind CSS
- 設置全域 box-sizing 為 border-box
- 重置 body 的 margin 和 padding
- 定義系統字體堆疊，優先使用本地系統字體
- 啟用字體平滑渲染（antialiased）
- 設置根元素 (#root) 為全螢幕高度

---

## 2. Tailwind 配置 (`tailwind.config.js`)

### 檔案位置
`BookClub/frontend/tailwind.config.js`

### 配置內容

#### 內容掃描
```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
]
```
- 掃描所有 HTML 和 React 組件文件，確保使用的類別被編譯

#### 自定義主題擴展

### 🎨 品牌色彩 (Brand Colors)

專案使用 **青藍色 (Cyan)** 作為主要品牌色：

```javascript
colors: {
  brand: {
    primary: '#04c0f4',    // 主要品牌色 - 明亮青藍色
    light: '#cfecf4',      // 淺色版本
    dark: '#0398c4',       // 深色版本
    50: '#e6f9fd',         // 最淺
    100: '#cfecf4',
    200: '#9fd9ea',
    300: '#6fc6df',
    400: '#3fb3d5',
    500: '#04c0f4',        // 標準亮度（與 primary 相同）
    600: '#0398c4',
    700: '#027293',
    800: '#024c62',
    900: '#012631',        // 最深
  }
}
```

#### 色彩使用指南

| 色彩變數 | Hex Code | 使用場景 | 範例 |
|---------|----------|---------|------|
| `brand-primary` / `brand-500` | #04c0f4 | 主要按鈕、連結、重點元素 | 加入社團按鈕、CTA 按鈕 |
| `brand-light` / `brand-100` | #cfecf4 | 背景色、淺色區塊 | 卡片背景、次要按鈕背景 |
| `brand-dark` / `brand-600` | #0398c4 | Hover 狀態、深色文字 | 按鈕懸停效果 |
| `brand-50` | #e6f9fd | 極淺背景 | 區塊背景、漸層起始 |
| `brand-700` - `brand-900` | 深色系列 | 深色模式、文字、邊框 | 標題文字、深色背景 |

### 📝 字體設定

```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
}
```

**字體堆疊:**
1. **Inter** - 主要字體（需另外載入 Google Fonts）
2. **system-ui** - 系統 UI 字體
3. **-apple-system** - Apple 系統字體
4. **sans-serif** - 後備無襯線字體

### 🌈 背景漸層

```javascript
backgroundImage: {
  'gradient-brand': 'linear-gradient(135deg, #04c0f4 0%, #7b2cbf 100%)',
  'gradient-brand-light': 'linear-gradient(135deg, #cfecf4 0%, #e0b3ff 100%)',
}
```

**使用方式:**
```html
<!-- 主要漸層 - 青藍到紫色 -->
<div className="bg-gradient-brand">

<!-- 淡色漸層 - 淺青到淺紫 -->
<div className="bg-gradient-brand-light">
```

---

## 3. PostCSS 配置 (`postcss.config.js`)

### 檔案位置
`BookClub/frontend/postcss.config.js`

### 配置內容

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**插件說明:**
- `@tailwindcss/postcss`: Tailwind CSS PostCSS 插件
- `autoprefixer`: 自動添加瀏覽器前綴，提升跨瀏覽器兼容性

---

## 4. 常用樣式模式

### 按鈕樣式

#### 主要按鈕（Primary Button）
```jsx
<button className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium">
  按鈕文字
</button>
```

**特性:**
- 背景色: `brand-primary` (#04c0f4)
- 文字: 白色
- 圓角: `rounded-lg` (8px)
- Hover: 90% 不透明度
- 過渡動畫: `transition-colors`
- 字重: medium (500)

#### 次要按鈕（Secondary Button）
```jsx
<button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
  次要按鈕
</button>
```

#### 危險按鈕（Danger Button）
```jsx
<button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
  離開社團
</button>
```

### 輸入框樣式

#### 標準文字輸入框
```jsx
<input 
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
  type="text"
/>
```

**特性:**
- 全寬: `w-full`
- 內距: `px-4 py-3`
- 邊框: 灰色 1px
- 圓角: `rounded-lg`
- Focus 狀態: 2px 青藍色 ring + 透明邊框

#### 搜尋輸入框
```jsx
<input 
  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
  placeholder="搜尋社團..."
/>
```
- 額外左內距 `pl-12` 用於放置搜尋圖示

#### 文字區域
```jsx
<textarea 
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
  rows="4"
/>
```
- 禁用調整大小: `resize-none`

### 卡片樣式

#### 標準卡片
```jsx
<div className="bg-white rounded-lg shadow-sm p-6">
  {/* 卡片內容 */}
</div>
```

#### 置頂/重點卡片
```jsx
<div className="bg-white rounded-lg border-2 border-brand-primary p-6">
  {/* 重點內容 */}
</div>
```

#### 互動卡片
```jsx
<div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
  {/* 可點擊內容 */}
</div>
```

### 標籤 (Badge/Tag) 樣式

#### 置頂標籤
```jsx
<span className="px-2 py-1 bg-brand-primary text-white text-xs font-medium rounded">
  置頂
</span>
```

#### 分類標籤
```jsx
<span className="px-2 py-1 bg-gray-100 text-sm rounded">
  文學
</span>
```

#### 角色標籤
```jsx
{/* 管理員 */}
<span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">
  管理員
</span>

{/* 版主 */}
<span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
  版主
</span>

{/* 一般成員 */}
<span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
  成員
</span>
```

### 漸層背景

#### 英雄區塊（Hero Section）
```jsx
<section className="relative overflow-hidden bg-gradient-to-br from-brand-light/30 via-white to-brand-primary/20 py-20 sm:py-32 lg:py-40">
  {/* Hero 內容 */}
</section>
```

#### Newsletter 區塊
```jsx
<section className="py-20 sm:py-24 bg-gradient-to-br from-brand-primary to-blue-600 text-white">
  {/* Newsletter 內容 */}
</section>
```

#### 漸層文字
```jsx
<span className="bg-gradient-to-r from-brand-primary to-blue-500 bg-clip-text text-transparent">
  BookClub
</span>
```

### 裝飾性元素

#### 模糊光暈效果
```jsx
<div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl" />
<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-light/30 rounded-full blur-3xl" />
```

---

## 5. 響應式設計

Tailwind CSS 使用移動優先（Mobile-first）的斷點系統：

| 斷點 | 最小寬度 | CSS |
|-----|---------|-----|
| `sm` | 640px | `@media (min-width: 640px)` |
| `md` | 768px | `@media (min-width: 768px)` |
| `lg` | 1024px | `@media (min-width: 1024px)` |
| `xl` | 1280px | `@media (min-width: 1280px)` |
| `2xl` | 1536px | `@media (min-width: 1536px)` |

### 使用範例

```jsx
{/* 手機: py-20, 小螢幕: py-24, 大螢幕: py-40 */}
<section className="py-20 sm:py-24 lg:py-40">

{/* 手機: 單欄, 中等螢幕: 雙欄, 大螢幕: 三欄 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* 手機: 垂直排列, 中等螢幕以上: 水平排列 */}
<div className="flex flex-col md:flex-row gap-6">
```

---

## 6. 設計系統色彩總覽

### 主色系 (Primary/Brand Colors)

| 用途 | 類別名稱 | Hex | 範例 |
|-----|---------|-----|------|
| 主要強調色 | `bg-brand-primary` | #04c0f4 | 按鈕、連結 |
| 淺色背景 | `bg-brand-light` | #cfecf4 | 卡片、區塊 |
| 深色文字/懸停 | `bg-brand-dark` | #0398c4 | Hover 狀態 |

### 中性色系 (Neutral Colors)

使用 Tailwind 預設的灰階：
- `gray-50` ~ `gray-900`: 文字、邊框、背景

### 語意色系 (Semantic Colors)

| 用途 | Tailwind 類別 | 使用場景 |
|-----|--------------|---------|
| 成功 | `green-*` | 成功訊息、完成狀態 |
| 警告 | `yellow-*` | 警告提示 |
| 錯誤/危險 | `red-*` | 錯誤訊息、刪除按鈕 |
| 資訊 | `blue-*` | 提示訊息 |

---

## 7. 動畫與過渡效果

### 常用過渡類別

```jsx
{/* 顏色過渡 */}
<div className="transition-colors duration-200">

{/* 陰影過渡 */}
<div className="transition-shadow duration-300">

{/* 所有屬性過渡 */}
<div className="transition-all duration-200">

{/* 透明度過渡 */}
<div className="transition-opacity duration-150">
```

### Hover 效果模式

```jsx
{/* 按鈕 hover 降低不透明度 */}
<button className="bg-brand-primary hover:bg-brand-primary/90">

{/* 文字 hover 改變顏色 */}
<a className="text-gray-600 hover:text-brand-primary">

{/* 卡片 hover 提升陰影 */}
<div className="shadow-sm hover:shadow-md">
```

---

## 8. 可訪問性 (Accessibility)

### Focus 狀態

所有互動元素都應包含明確的 focus 狀態：

```jsx
{/* 輸入框 */}
<input className="focus:ring-2 focus:ring-brand-primary focus:border-transparent">

{/* 按鈕 */}
<button className="focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2">
```

### 顏色對比

- 文字與背景的對比度應符合 WCAG AA 標準（至少 4.5:1）
- 主要品牌色 (#04c0f4) 在白色背景上的對比度: **3.2:1** ⚠️
  - 建議用於大型文字或非文字元素
  - 小文字應使用 `brand-700` 或更深的顏色

---

## 9. 最佳實踐

### ✅ 推薦做法

1. **使用 Tailwind 的 utility classes 而非自定義 CSS**
   ```jsx
   ✅ <div className="mt-4 mb-6 text-gray-700">
   ❌ <div style={{ marginTop: '1rem', marginBottom: '1.5rem', color: '#374151' }}>
   ```

2. **使用品牌色變數而非硬編碼顏色**
   ```jsx
   ✅ <div className="bg-brand-primary">
   ❌ <div className="bg-[#04c0f4]">
   ```

3. **保持一致的間距系統**
   - 使用 Tailwind 的間距 scale: `p-2`, `p-4`, `p-6`, `p-8` 等
   - 避免任意數值如 `p-[13px]`

4. **組件化重複的樣式模式**
   ```jsx
   // 建立可重用的按鈕組件
   const PrimaryButton = ({ children, ...props }) => (
     <button 
       className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium"
       {...props}
     >
       {children}
     </button>
   );
   ```

5. **響應式設計優先考慮**
   - 先設計手機版 (mobile-first)
   - 使用斷點逐步增強

### ❌ 避免做法

1. 避免使用 inline styles（除非動態數值）
2. 避免混用 CSS modules 和 Tailwind
3. 避免過度嵌套的 className（考慮使用 `clsx` 或 `classnames` 工具）
4. 避免在多處重複相同的長 className 字串

---

## 10. 開發工具推薦

### VS Code 擴充套件

1. **Tailwind CSS IntelliSense**
   - 自動完成 Tailwind 類別
   - Hover 預覽類別效果
   - Linting 支援

2. **PostCSS Language Support**
   - PostCSS 語法高亮

### 瀏覽器擴充套件

1. **Tailwind CSS DevTools**
   - 檢查元素的 Tailwind 類別
   - 即時調整樣式

---

## 11. 效能考量

### CSS 打包優化

Tailwind CSS 在生產環境會自動進行以下優化：

1. **PurgeCSS**: 移除未使用的 CSS 類別
2. **Minification**: 壓縮 CSS 檔案
3. **Tree-shaking**: 只包含使用到的樣式

### 注意事項

- 動態類別名稱不會被正確偵測：
  ```jsx
  ❌ <div className={`text-${color}-500`}>  // 不會被包含在最終 CSS
  ✅ <div className={color === 'red' ? 'text-red-500' : 'text-blue-500'}>
  ```

- 完整類別名稱應出現在程式碼中
- 使用 safelist 配置來保留動態生成的類別

---

## 12. 色彩使用場景對照表

| 頁面/組件 | 主要色彩使用 | 輔助色彩 |
|----------|------------|---------|
| **導航列** | 背景: white, 按鈕: brand-primary | 文字: gray-700 |
| **Hero 區塊** | 漸層背景: brand-light/30 to brand-primary/20 | 文字漸層: brand-primary to blue-500 |
| **社團卡片** | 背景: white, 懸停邊框: brand-primary | 標籤: brand-50, brand-100 |
| **按鈕** | Primary: brand-primary, Hover: brand-primary/90 | Secondary: gray-100 |
| **表單** | Focus ring: brand-primary | 邊框: gray-300 |
| **討論列表** | 置頂邊框: brand-primary | 背景: white, 懸停: gray-50 |
| **Newsletter** | 背景漸層: brand-primary to blue-600 | 文字: white |

---

## 13. 未來改進建議

### 可考慮的增強功能

1. **深色模式支援**
   ```javascript
   // tailwind.config.js
   darkMode: 'class', // 或 'media'
   ```

2. **自定義動畫**
   ```javascript
   theme: {
     extend: {
       animation: {
         'fade-in': 'fadeIn 0.3s ease-in',
       },
       keyframes: {
         fadeIn: {
           '0%': { opacity: '0' },
           '100%': { opacity: '1' },
         }
       }
     }
   }
   ```

3. **更多間距變數**
   - 針對設計系統定義特定間距值

4. **組件樣式提取**
   - 使用 `@layer components` 提取常用組件樣式

---

## 14. 相關資源

### 官方文件
- [Tailwind CSS 官方文件](https://tailwindcss.com/docs)
- [PostCSS 官方文件](https://postcss.org/)

### 設計參考
- [Tailwind UI](https://tailwindui.com/) - 付費組件庫
- [Headless UI](https://headlessui.com/) - 無樣式組件（可與 Tailwind 搭配）

### 顏色工具
- [Tailwind CSS Color Generator](https://uicolors.app/create)
- [Coolors](https://coolors.co/) - 調色盤生成器

---

## 總結

BookClub 專案的 CSS 架構基於 Tailwind CSS，具有以下特點：

- ✅ **統一的設計語言**: 品牌色彩、字體、間距系統
- ✅ **高度可維護**: Utility-first 方法論
- ✅ **響應式優先**: Mobile-first 設計
- ✅ **效能優化**: 自動 purge 未使用的 CSS
- ✅ **開發效率**: 快速原型開發，減少自定義 CSS

**主要品牌色**: #04c0f4 (青藍色) - 用於所有主要 CTA 和強調元素

---

**文件版本**: 1.0  
**最後更新**: 2025-10-29  
**維護者**: BookClub Development Team
