export interface Task {
  id: string
  text: string
  columnId: string
  createdAt: number
}

export interface Column {
  id: string
  title: string
  color: string
}

export type TaskBoard = Record<string, Task[]>
