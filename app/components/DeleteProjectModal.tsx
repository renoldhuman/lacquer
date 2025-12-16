'use client'

import { useEffect } from 'react'

interface DeleteProjectModalProps {
  isOpen: boolean
  projectName: string
  isLoading?: boolean
  error?: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteProjectModal({
  isOpen,
  projectName,
  isLoading = false,
  error = null,
  onCancel,
  onConfirm,
}: DeleteProjectModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg p-6">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          Delete project
        </h2>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This will permanently delete <span className="font-medium text-black dark:text-zinc-50">{projectName}</span> and all tasks in it.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-red-600 dark:bg-red-700 text-white font-medium hover:bg-red-700 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Deleting…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}


