import { useState, useRef, useCallback } from 'react'
import type { Task } from '../types'

interface TaskCardProps {
  task: Task
  onEdit: (id: string, text: string) => void
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
  isEditing: boolean
  onStartEdit: (id: string) => void
  onCancelEdit: () => void
  onConfirmDelete: (id: string) => void
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onDragStart,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onConfirmDelete,
}: TaskCardProps) {
  const [editText, setEditText] = useState(task.text)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleEditSubmit = () => {
    if (editText.trim()) {
      onEdit(task.id, editText.trim())
      onCancelEdit()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSubmit()
    if (e.key === 'Escape') onCancelEdit()
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(task.id)
      setShowDeleteConfirm(false)
      setShowMenu(false)
      // Move focus to the card after deletion
      cardRef.current?.focus()
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    // Space or Enter to open menu
    if ((e.key === ' ' || e.key === 'Enter') && !isEditing) {
      e.preventDefault()
      setShowMenu(prev => !prev)
    }
    // Delete key to trigger delete
    if (e.key === 'Delete' && !isEditing && !showMenu) {
      e.preventDefault()
      setShowDeleteConfirm(true)
    }
    // Escape to close menu
    if (e.key === 'Escape' && showMenu) {
      setShowMenu(false)
    }
  }

  // Close menu when clicking outside
  const handleMenuClickOutside = useCallback(() => {
    setShowMenu(false)
    setShowDeleteConfirm(false)
  }, [])

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="listitem"
      aria-label={`Task: ${task.text}${isEditing ? ', editing' : ''}`}
      aria-grabbed="true"
      aria-describedby={`task-desc-${task.id}`}
      className={`group relative rounded-lg border border-purple-500/20 bg-black/60 p-3 text-sm transition-all duration-200 hover:border-purple-400/50 hover:bg-purple-900/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] ${
        isEditing ? 'ring-2 ring-purple-500/50' : 'cursor-grab active:cursor-grabbing'
      }`}
      onMouseDown={handleMenuClickOutside}
    >
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleKeyDown}
          autoFocus
          aria-label="Edit task text"
          className="w-full bg-transparent text-gray-200 outline-none"
          maxLength={200}
        />
      ) : (
        <>
          <div className="pr-6" id={`task-desc-${task.id}`}>
            {task.text}
          </div>
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              aria-label={`Task options for "${task.text}"`}
              aria-expanded={showMenu}
              aria-haspopup="true"
              className="rounded p-1 text-purple-400/60 hover:text-purple-300 hover:bg-purple-900/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <circle cx="2" cy="6" r="1.5" />
                <circle cx="6" cy="6" r="1.5" />
                <circle cx="10" cy="6" r="1.5" />
              </svg>
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-6 z-10 min-w-[120px] rounded-lg border border-purple-500/30 bg-black/95 py-1 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                role="menu"
              >
                <button
                  onClick={() => {
                    onStartEdit(task.id)
                    setShowMenu(false)
                  }}
                  role="menuitem"
                  className="w-full px-3 py-1.5 text-left text-xs text-purple-300 hover:bg-purple-900/30 focus:outline-none focus:bg-purple-900/30"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  role="menuitem"
                  className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-900/20 focus:outline-none focus:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          {showDeleteConfirm && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-black/80"
              role="alertdialog"
              aria-labelledby="delete-confirm-title"
            >
              <div className="p-3 text-center">
                <p id="delete-confirm-title" className="mb-2 text-xs font-semibold text-red-400">
                  Delete task?
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      onConfirmDelete(task.id)
                      setShowDeleteConfirm(false)
                    }}
                    className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
