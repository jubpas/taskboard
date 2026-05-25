import { useState, useEffect, useCallback, useRef } from 'react'
import type { Task, TaskBoard } from '../types'

const STORAGE_KEY = 'taskboard_tasks'
const STORAGE_VERSION = 'v1'

interface StoredTaskBoard {
  version: string
  data: TaskBoard
}

const defaultTaskBoard: TaskBoard = {
  todo: [],
  in_progress: [],
  done: [],
}

export function useTasks() {
  const [taskBoard, setTaskBoard] = useState<TaskBoard>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as StoredTaskBoard
        // Handle version migration
        if (parsed.version === STORAGE_VERSION && parsed.data) {
          return {
            todo: parsed.data.todo || [],
            in_progress: parsed.data.in_progress || [],
            done: parsed.data.done || [],
          }
        }
        // Fallback for old format
        return {
          todo: (parsed as any).todo || [],
          in_progress: (parsed as any).in_progress || [],
          done: (parsed as any).done || [],
        }
      }
    } catch {
      // Ignore parse errors — corrupted data
      console.warn('[useTasks] Failed to parse localStorage data, using defaults')
    }
    return defaultTaskBoard
  })

  // Undo stack for deleted tasks
  const deletedTasksRef = useRef<Map<string, Task>>(new Map())
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Auto-save to localStorage with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const stored: StoredTaskBoard = {
          version: STORAGE_VERSION,
          data: taskBoard,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
      } catch {
        // Storage full or unavailable (Safari private mode, quota exceeded)
        console.error('[useTasks] Failed to save to localStorage')
      }
    }, 300) // 300ms debounce
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [taskBoard])

  const addTask = useCallback((text: string, columnId: string = 'todo') => {
    const newTask: Task = {
      id: crypto.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      columnId,
      createdAt: Date.now(),
    }
    setTaskBoard((prev) => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), newTask],
    }))
    return newTask
  }, [])

  const updateTask = useCallback((taskId: string, newText: string) => {
    setTaskBoard((prev) => {
      const updated: TaskBoard = {}
      for (const columnId of Object.keys(prev)) {
        updated[columnId] = prev[columnId].map((task) =>
          task.id === taskId ? { ...task, text: newText } : task
        )
      }
      return updated
    })
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setTaskBoard((prev) => {
      const updated: TaskBoard = {}
      let deletedTask: Task | undefined
      for (const columnId of Object.keys(prev)) {
        updated[columnId] = prev[columnId].filter((task) => {
          if (task.id === taskId) {
            deletedTask = task
          }
          return task.id !== taskId
        })
      }
      if (deletedTask) {
        deletedTasksRef.current.set(deletedTask.id, deletedTask)
      }
      return updated
    })
  }, [])

  const moveTask = useCallback((taskId: string, targetColumnId: string) => {
    setTaskBoard((prev) => {
      let movedTask: Task | null = null
      const updated: TaskBoard = {}
      for (const columnId of Object.keys(prev)) {
        updated[columnId] = prev[columnId].map((task) => {
          if (task.id === taskId) {
            movedTask = { ...task, columnId: targetColumnId }
            return movedTask
          }
          return task
        })
      }
      // Remove from source column and add to target
      if (movedTask) {
        for (const columnId of Object.keys(updated)) {
          updated[columnId] = updated[columnId].filter((t) => t.id !== taskId)
        }
        updated[targetColumnId] = [...(updated[targetColumnId] || []), movedTask]
      }
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setTaskBoard({
      todo: [],
      in_progress: [],
      done: [],
    })
  }, [])

  const undoDelete = useCallback((taskId: string) => {
    const task = deletedTasksRef.current.get(taskId)
    if (task) {
      setTaskBoard((prev) => ({
        ...prev,
        [task.columnId]: [...(prev[task.columnId] || []), task],
      }))
      deletedTasksRef.current.delete(taskId)
    }
  }, [])

  return {
    taskBoard,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    clearAll,
    undoDelete,
  }
}
