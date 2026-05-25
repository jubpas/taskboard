import { useState, useEffect } from 'react'

interface TerminalHeaderProps {
  title: string
}

export default function TerminalHeader({ title }: TerminalHeaderProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index <= title.length) {
        setDisplayedText(title.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 80)

    return () => clearInterval(interval)
  }, [title])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className="border-b border-purple-500/30 bg-black/60 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1">
          <p className="font-mono text-sm text-purple-400">
            <span className="text-purple-600">$</span> {displayedText}
            <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} ml-0.5 text-purple-400`}>█</span>
          </p>
        </div>
        <p className="text-xs text-purple-500/60">
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
