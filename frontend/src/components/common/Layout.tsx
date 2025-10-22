import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { cn } from '../../utils/cn'

interface LayoutProps {
  children: ReactNode
  showHeader?: boolean
  showFooter?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

export default function Layout({
  children,
  showHeader = true,
  showFooter = true,
  maxWidth = 'xl',
  className,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && <Header />}
      
      <main
        className={cn(
          'mx-auto w-full flex-1 px-4 py-6 sm:px-6 lg:px-8',
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  )
}
