'use client'

import { motion } from 'framer-motion'
import type { AgentInstance } from '@/lib/agent-types'

const statusColors: Record<string, string> = {
  idle: 'bg-zinc-500',
  thinking: 'bg-yellow-400',
  working: 'bg-blue-400',
  done: 'bg-emerald-400',
  error: 'bg-red-400',
}

const statusLabels: Record<string, string> = {
  idle: 'Inactivo',
  thinking: 'Pensando…',
  working: 'Trabajando',
  done: 'Completado',
  error: 'Error',
}

// Slight pulsing for non-idle states
function pulseAnimation(status: string) {
  if (status === 'idle') return false
  return {
    scale: [1, 1.03, 1],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' as const },
  }
}

interface Props {
  agent: AgentInstance
  onClick: () => void
}

export default function AgentCard({ agent, onClick }: Props) {
  const { config, status } = agent
  const lastEvent = agent.events.at(-1)
  const isActive = status !== 'idle'

  return (
    <motion.button
      onClick={onClick}
      className="relative flex flex-col items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-left backdrop-blur-sm transition-colors hover:border-zinc-700 hover:bg-zinc-900/90"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      animate={isActive ? pulseAnimation(status) : {}}
      layout
    >
      {/* Status dot */}
      <span
        className={`absolute right-4 top-4 h-2.5 w-2.5 rounded-full shadow-sm ${statusColors[status]}`}
        style={
          isActive
            ? { boxShadow: `0 0 8px 2px ${config.color}` }
            : undefined
        }
      />

      {/* Icon */}
      <motion.span
        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `${config.color}18` }}
        animate={
          status === 'thinking'
            ? { rotate: [0, -5, 5, -5, 0] }
            : status === 'working'
              ? { scale: [1, 1.1, 1] }
              : {}
        }
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {config.icon}
      </motion.span>

      {/* Name + status */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-zinc-100">{config.name}</h3>
        <p className="mt-0.5 text-xs text-zinc-500">{statusLabels[status]}</p>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed text-zinc-500 line-clamp-1">
        {config.description}
      </p>

      {/* Last activity */}
      {lastEvent && (
        <p className="w-full truncate text-[10px] text-zinc-600">
          {lastEvent.message}
        </p>
      )}
    </motion.button>
  )
}
