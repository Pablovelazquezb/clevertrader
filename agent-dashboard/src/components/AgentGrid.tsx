'use client'

import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import type { AgentInstance } from '@/lib/agent-types'
import AgentCard from './AgentCard'

interface Props {
  agents: AgentInstance[]
  onAgentClick: (id: string) => void
  onAddAgent: () => void
}

export default function AgentGrid({ agents, onAgentClick, onAddAgent }: Props) {
  const enabledAgents = agents.filter((a) => a.config.enabled)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence>
        {enabledAgents.map((agent, i) => (
          <motion.div
            key={agent.config.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <AgentCard
              agent={agent}
              onClick={() => onAgentClick(agent.config.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* "+ Nuevo Agente" → opens marketplace */}
      <motion.button
        onClick={onAddAgent}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-800 p-8 text-zinc-600 transition-colors hover:border-zinc-600 hover:text-zinc-400"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="text-3xl">+</span>
        <span className="text-xs font-medium">Nuevo Agente</span>
      </motion.button>
    </div>
  )
}
