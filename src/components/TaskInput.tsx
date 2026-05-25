import { useState, useRef } from 'react'

interface TaskInputProps {
  onAdd: (text: string) => void
  ariaLabel?: string
}

export default function TaskInput({ onAdd, ariaLabel = 'Add task' }: TaskInputProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!text.trim()) {
      setError('Task cannot be empty')
      inputRef.current?.focus()
      return
    }
    if (text.trim().length < 2) {
      setError('Task must be at least 2 characters')
      inputRef.current?.focus()
      return
    }
    if (text.trim().length > 200) {
      setError('Task must be 200 characters or less')
      inputRef.current?.focus()
      return
    }
    onAdd(text.trim())
    setText('')
    setError('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setText('')
      setError('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    if (error) setError('')
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="New task..."
          aria-label={ariaLabel}
          aria-invalid={!!error}
          aria-describedby={error ? 'task-input-error' : undefined}
          maxLength={200}
          className="flex-1 rounded-md border border-purple-500/20 bg-black/60 px-3 py-2 text-sm text-gray-200 placeholder-purple-400/40 outline-none transition-colors focus:border-purple-500/50"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          aria-label={ariaLabel}
          className="rounded-md bg-purple-600 px-3 py-2 text-sm text-white transition-colors hover:bg-purple-500 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          +
        </button>
      </div>
      {error && (
        <p
          id="task-input-error"
          role="alert"
          className="mt-1 text-xs text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  )
}
