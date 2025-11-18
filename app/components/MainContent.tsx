'use client'

import { useSidebar } from '@/app/providers/SidebarProvider'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <main
      className="transition-all duration-300"
      style={{ marginLeft: isCollapsed ? '4rem' : '16rem' }}
    >
      {children}
    </main>
  )
}

