import { useState, useEffect, useCallback, useRef } from 'react'
import type { Column } from './types'
import { useTasks } from './hooks/useTasks'
import Board from './components/Board'
import TerminalHeader from './components/TerminalHeader'

interface ToastMessage {
  id: string
  text: string
  type: 'success' | 'error' | 'info'
  undoId?: string
}

const defaultColumns: Column[] = [
  {
    id: 'todo',
    title: 'TODO',
    color: '#A855F7',
  },
  {
    id: 'in_progress',
    title: 'IN PROGRESS',
    color: '#C084FC',
  },
  {
    id: 'done',
    title: 'DONE',
    color: '#22C55E',
  },
]

function App() {
  const { taskBoard, addTask, updateTask, deleteTask, moveTask, undoDelete } = useTasks()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const toastIdRef = useRef(0)

  // Toast notification helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success', undoId?: string) => {
    const id = `toast-${++toastIdRef.current}`
    setToasts(prev => [...prev, { id, text, type, undoId }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const handleAddTask = useCallback((text: string, columnId: string) => {
    addTask(text, columnId)
    showToast('Task added', 'success')
  }, [addTask, showToast])

  const handleEditTask = useCallback((id: string, text: string) => {
    updateTask(id, text)
    showToast('Task updated', 'success')
    setEditingTaskId(null)
  }, [updateTask, showToast])

  const handleDeleteTask = useCallback((id: string) => {
    deleteTask(id)
    showToast('Task deleted', 'info', id)
  }, [deleteTask, showToast])

  const handleConfirmDelete = useCallback((id: string) => {
    deleteTask(id)
    showToast('Task deleted', 'info', id)
  }, [deleteTask, showToast])

  const handleUndoDelete = useCallback((id: string) => {
    undoDelete(id)
    showToast('Task restored', 'success')
  }, [undoDelete, showToast])

  const handleStartEdit = useCallback((id: string) => {
    setEditingTaskId(id)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingTaskId(null)
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: Focus first task input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const firstInput = document.querySelector<HTMLInputElement>('input[placeholder="New task..."]')
        firstInput?.focus()
      }
      // Escape to close menus
      if (e.key === 'Escape') {
        setEditingTaskId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const totalTasks = Object.values(taskBoard).flat().length

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <TerminalHeader title="taskboard — productivity terminal" />

      {/* Main Content */}
      <div className="flex flex-1 flex-col" id="main-content">
        <Board
          columns={defaultColumns}
          taskBoard={taskBoard}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={moveTask}
          onDragStart={handleDragStart}
          editingTaskId={editingTaskId}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-purple-500/20 bg-black/60 px-6 py-2 text-xs text-purple-500/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <span>Tasks: {totalTasks}</span>
            <span>•</span>
            <span>Drag & Drop</span>
            <span>•</span>
            <span>Enter to Save</span>
            <span>•</span>
            <span>Esc to Cancel</span>
          </div>
          <span>localStorage Active</span>
        </div>
      </div>

      {/* Toast Notifications */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm shadow-lg transition-all duration-200 ${
              toast.type === 'success'
                ? 'border-green-500/30 bg-green-900/80 text-green-200'
                : toast.type === 'error'
                ? 'border-red-500/30 bg-red-900/80 text-red-200'
                : 'border-purple-500/30 bg-purple-900/80 text-purple-200'
            }`}
            role="status"
            aria-live="polite"
          >
            <span>{toast.text}</span>
            {toast.undoId && (
              <button
                onClick={() => handleUndoDelete(toast.undoId!)}
                className="ml-2 font-semibold underline hover:no-underline"
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Screen Reader Announcements */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {totalTasks} tasks on board
      </div>
    </div>
  )
}

export default App
