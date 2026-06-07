'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { AgentEvent } from '@/lib/agent-types'

const eventIcons: Record<string, string> = {
  thinking: '💭',
  action: '⚡',
  log: '📝',
  result: '✅',
  error: '❌',
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

interface Props {
  events: AgentEvent[]
}

export default function AgentTimeline({ events }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll to new events unless user scrolled up
  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [events.length, autoScroll])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setAutoScroll(atBottom)
  }

  return (
    <div
      className="flex max-h-96 flex-col gap-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs"
      onScroll={handleScroll}
    >
      {events.length === 0 && (
        <p className="py-6 text-center text-zinc-600">
          Sin actividad aún. Ejecuta el agente para ver su timeline.
        </p>
      )}

      {events.map((evt, i) => (
        <motion.div
          key={evt.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className={`flex items-start gap-2 rounded-lg px-2 py-1.5 ${
            evt.type === 'error'
              ? 'bg-red-950/40 text-red-300'
              : evt.type === 'result'
                ? 'bg-emerald-950/30 text-emerald-300'
                : 'text-zinc-400'
          }`}
        >
          <span className="shrink-0 w-4 text-center">
            {eventIcons[evt.type] ?? '•'}
          </span>
          <span className="shrink-0 text-zinc-600">
            {formatTime(evt.timestamp)}
          </span>
          <span className="break-words">{evt.message}</span>
        </motion.div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
