import type { Task, Column } from '../types'
import TaskCard from './TaskCard'
import TaskInput from './TaskInput'

interface BoardProps {
  columns: Column[]
  taskBoard: Record<string, Task[]>
  onAddTask: (text: string, columnId: string) => void
  onEditTask: (id: string, text: string) => void
  onDeleteTask: (id: string) => void
  onMoveTask: (taskId: string, targetColumnId: string) => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
  editingTaskId: string | null
  onStartEdit: (id: string) => void
  onCancelEdit: () => void
  onConfirmDelete: (id: string) => void
}

export default function Board({
  columns,
  taskBoard,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onDragStart,
  editingTaskId,
  onStartEdit,
  onCancelEdit,
  onConfirmDelete,
}: BoardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onMoveTask(taskId, columnId)
    }
  }

  return (
    <div
      role="main"
      aria-label="Kanban board"
      className="flex flex-1 flex-col overflow-hidden"
    >
      <div className="flex flex-1 gap-4 overflow-x-auto p-4" role="list" aria-label="Board columns">
        {columns.map((column) => {
          const tasks = taskBoard[column.id] || []
          return (
            <div
              key={column.id}
              role="region"
              aria-label={`${column.title} column, ${tasks.length} tasks`}
              className="flex min-w-[300px] flex-1 flex-col rounded-xl border border-purple-500/20 bg-black/40 p-4 backdrop-blur-sm transition-all duration-200 hover:border-purple-500/40"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between border-b border-purple-500/20 pb-3">
                <h2
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
                  style={{ color: column.color }}
                  id={`col-heading-${column.id}`}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: column.color, boxShadow: `0 0 8px ${column.color}80` }}
                    aria-hidden="true"
                  />
                  {column.title}
                </h2>
                <span className="rounded-md bg-purple-900/30 px-2 py-0.5 text-xs text-purple-300">
                  {tasks.length}
                </span>
              </div>

              {/* Task List */}
              <div className="mb-4 flex flex-col gap-2" role="list" aria-label={`${column.title} tasks`}>
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onDragStart={onDragStart}
                    isEditing={editingTaskId === task.id}
                    onStartEdit={onStartEdit}
                    onCancelEdit={onCancelEdit}
                    onConfirmDelete={onConfirmDelete}
                  />
                ))}
                {tasks.length === 0 && (
                  <div
                    className="rounded-lg border-2 border-dashed border-purple-500/20 p-4 text-center"
                    aria-label="No tasks in this column"
                  >
                    <p className="text-xs text-purple-400/50">Drop tasks here</p>
                  </div>
                )}
              </div>

              {/* Add Task Input */}
              <TaskInput
                onAdd={(text) => onAddTask(text, column.id)}
                ariaLabel={`Add task to ${column.title}`}
              />

              {/* Keyboard navigation hint */}
              <div className="mt-2 text-[10px] text-purple-500/40">
                <span className="hidden sm:inline">Use Tab to navigate, Space to open menu, Delete to remove</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
