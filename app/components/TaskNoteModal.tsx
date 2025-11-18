'use client'

import { useState, useEffect } from 'react'
import { upsertTaskNote } from '@/app/actions/tasks'

interface TaskNoteModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskDescription: string
  isCompleted: boolean
  initialNoteContent: string | null
}

export function TaskNoteModal({
  isOpen,
  onClose,
  taskId,
  taskDescription,
  isCompleted,
  initialNoteContent,
}: TaskNoteModalProps) {
  const [noteContent, setNoteContent] = useState(initialNoteContent || '')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update note content when initialNoteContent changes
  useEffect(() => {
    setNoteContent(initialNoteContent || '')
  }, [initialNoteContent])

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setNoteContent(initialNoteContent || '')
    }
  }, [isOpen, initialNoteContent])

  const handleSaveNote = async () => {
    setIsSavingNote(true)
    setError(null)

    try {
      await upsertTaskNote(taskId, noteContent)
      onClose()
    } catch (err) {
      setError('Failed to save note. Please try again.')
      console.error(err)
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleClose = () => {
    setNoteContent(initialNoteContent || '')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            {taskDescription}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isCompleted && (
            <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400 italic">
              This note is read-only because the task is completed.
            </p>
          )}
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={isCompleted ? "No note available." : "Enter your note here..."}
            readOnly={isCompleted}
            disabled={isCompleted}
            className={`w-full h-64 p-4 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 resize-none ${
              isCompleted
                ? 'cursor-not-allowed opacity-75 bg-zinc-50 dark:bg-zinc-900'
                : 'focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400'
            }`}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isCompleted ? 'Close' : 'Cancel'}
          </button>
          {!isCompleted && (
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={isSavingNote}
              className="px-4 py-2 text-sm text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingNote ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

