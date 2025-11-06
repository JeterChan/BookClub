# 前端 UI/UX 增強指南

本指南提供了一系列針對 `bookclub` 前端專案的 UI 改進建議。目標是透過增強的色彩配置、元件互動性、以及流暢的動態效果，來提升整體的視覺精緻度與使用者體驗。

本指南基於專案現有的技術棧：React、Tailwind CSS 以及 `shadcn/ui` 風格的元件庫。

## 步驟 0：安裝依賴

為了實現流暢的頁面轉場和元件動畫，我們將使用 `framer-motion` 這個輕量且強大的動畫庫。

```bash
npm install framer-motion

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... (darkMode, content, etc.)
  theme: {
    container: {
      // ...
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          // 重新定義品牌色，提供從淺到深的色階
          DEFAULT: "hsl(var(--primary))",     // e.g., blue-600
          foreground: "hsl(var(--primary-foreground))",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          // ...
        },
        // 新增一個搶眼的 "accent" 顏色
        accent: {
          DEFAULT: "hsl(var(--accent))",      // e.g., orange-500
          foreground: "hsl(var(--accent-foreground))",
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        // ... (destructive, muted, popover, card)
      },
      borderRadius: {
        // ...
      },
      // ✅ 新增動畫效果
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // 用於 Modal 和卡片彈出
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // 用於 Modal 關閉
        "scale-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
        // 用於提示訊息滑入
        "slide-in-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
         // 覆蓋 Tailwind 預設的 pulse，使其更柔和
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".4" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-in",
        "slide-in-down": "slide-in-down 0.3s ease-out",
        // 速度放慢的 pulse
        pulse: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* ... (其他 :root 變數) */

  body {
    /* ✅ 增加細微的漸層背景 */
    @apply bg-background text-foreground;
    background-image: linear-gradient(
      180deg,
      hsl(var(--background)) 0%,
      #f8f9fa 100% /* 這裡使用一個微差的灰色 */
    );
    min-height: 100vh;
  }
}

// ... (imports)
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn"; // 假設您的路徑

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground " +
          "hover:bg-primary/90 " +
          /* ✅ 新增動態效果 */
          "transition-all duration-300 ease-in-out " +
          "hover:shadow-lg hover:shadow-primary/30 " +
          "hover:scale-[1.03] active:scale-[0.98]",
        
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 " +
          /* ✅ 也給它加上動態 */
          "transition-all duration-200 ease-in-out " +
          "hover:scale-[1.03] active:scale-[0.98]",
        
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // ... (size variants)
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ... (Button component 的 React.forwardRef... 等)

// ... (imports)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"; // 假設
import { cn } from "@/utils/cn"; // 假設您的路徑

// ... (ClubCard component)

<Card
  className={cn(
    "overflow-hidden",
    /* ✅ 新增動態效果 */
    "transition-all duration-300 ease-in-out",
    "hover:shadow-xl hover:-translate-y-1.5" 
  )}
>
  {/* ... CardHeader, CardContent ... */}
</Card>

// ...

import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { AnimatePresence, motion } from "framer-motion"; // ✅ 引入

const Layout = () => {
  const location = useLocation(); // ✅ 取得 location

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        {/* ✅ 使用 AnimatePresence 和 motion.div 包裹 Outlet */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname} // ✅ 必須
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

// ... (imports)
// 假設您使用的是 shadcn/ui 的 Dialog 元件

// 在 <DialogContent> 元件的 className 中加入：
className={cn(
  // ... (其他樣式)
  "data-[state=open]:animate-scale-in",
  "data-[state=closed]:animate-scale-out"
)}

// 在 <DialogOverlay> 元件的 className 中加入 (使其淡入淡出)：
className={cn(
  "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
  "data-[state=open]:animate-in data-[state=open]:fade-in-0",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
)}

// ... (imports)
import { motion } from "framer-motion"; // ✅ 引入

// ... (在表單欄位下方顯示錯誤訊息的地方)

{errors.email && (
  <motion.p
    /* ✅ 包裹錯誤訊息 */
    className="text-sm text-destructive"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {errors.email.message}
  </motion.p>
)}

// 您也可以不使用 framer-motion，改用 Tailwind class:
{errors.email && (
  <p className="text-sm text-destructive animate-slide-in-down">
    {errors.email.message}
  </p>
)}