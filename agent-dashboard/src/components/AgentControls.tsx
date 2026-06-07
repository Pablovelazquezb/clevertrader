'use client'

import { useState } from 'react'
import { Play, Square, RotateCcw, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  status: string
  onRun: () => void
  onStop: () => void
  onReset: () => void
}

export default function AgentControls({
  status,
  onRun,
  onStop,
  onReset,
}: Props) {
  const isRunning = status === 'thinking' || status === 'working'

  return (
    <div className="flex items-center gap-2">
      {!isRunning ? (
        <ControlButton
          icon={Play}
          label="Ejecutar"
          onClick={onRun}
          color="emerald"
        />
      ) : (
        <ControlButton
          icon={Square}
          label="Detener"
          onClick={onStop}
          color="red"
        />
      )}

      {!isRunning && status !== 'idle' && (
        <ControlButton
          icon={RotateCcw}
          label="Reiniciar"
          onClick={onReset}
          color="zinc"
        />
      )}

      {isRunning && (
        <motion.div
          className="flex items-center gap-2 text-xs text-zinc-500"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Ejecutando…
        </motion.div>
      )}
    </div>
  )
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  color: 'emerald' | 'red' | 'zinc'
}) {
  const colorMap = {
    emerald:
      'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border-emerald-700/40',
    red: 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-700/40',
    zinc:
      'bg-zinc-700/30 text-zinc-400 hover:bg-zinc-700/50 border-zinc-700/40',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${colorMap[color]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </motion.button>
  )
}
