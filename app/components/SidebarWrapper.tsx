'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't show sidebar on auth page
  if (pathname === '/auth') {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </>
  )
}

