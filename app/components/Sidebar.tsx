'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/app/providers/SidebarProvider'

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const pathname = usePathname()

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-4 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 transition-transform ${
            isCollapsed ? '' : 'rotate-180'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Navigation Links */}
      <nav className="mt-4">
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
            pathname === '/'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          <span className="text-xl flex-shrink-0">🏠</span>
          {!isCollapsed && <span className="font-medium">Home</span>}
        </Link>

        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
            pathname === '/settings'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          <span className="text-xl flex-shrink-0">⚙️</span>
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </Link>
      </nav>
    </div>
  )
}

