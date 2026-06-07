'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Plus, Search, X, Check } from 'lucide-react'
import {
  MARKETPLACE_AGENTS,
  MARKETPLACE_CATEGORIES,
  type MarketplaceAgent,
} from '@/lib/marketplace-agents'
import { useAgentStore } from '@/lib/store'
import type { AgentInstance } from '@/lib/agent-types'

interface Props {
  onClose: () => void
}

export default function MarketplacePanel({ onClose }: Props) {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const registerAgent = useAgentStore((s) => s.registerAgent)
  const existingAgents = useAgentStore((s) => s.agents)

  // IDs already in the dashboard
  const existingIds = new Set(existingAgents.map((a) => a.config.id))

  const filtered = MARKETPLACE_AGENTS.filter((a) => {
    const matchCategory =
      category === 'all' || a.config.category === category
    const matchSearch =
      !search ||
      a.config.name.toLowerCase().includes(search.toLowerCase()) ||
      a.config.description.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const handleAdd = (agent: MarketplaceAgent) => {
    if (existingIds.has(agent.config.id)) return

    const instance: AgentInstance = {
      config: { ...agent.config, enabled: true },
      status: 'idle',
      events: [
        {
          id: `init-${Date.now()}`,
          timestamp: Date.now(),
          type: 'log',
          message: `📦 ${agent.config.name} agregado desde el marketplace.`,
        },
      ],
      lastRun: null,
      uptime: null,
    }

    registerAgent(instance)

    // Toast feedback
    setToast(`${agent.config.icon} ${agent.config.name} agregado ✓`)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">
              🛒 Marketplace de Agentes
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Agentes open-source listos para agregar a tu dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Search + Filters ── */}
        <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar agentes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === cat.key
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Agent grid ── */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-600">
              No se encontraron agentes con ese filtro.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filtered.map((agent) => {
                  const alreadyAdded = existingIds.has(agent.config.id)
                  return (
                    <MarketplaceCard
                      key={agent.config.id}
                      agent={agent}
                      added={alreadyAdded}
                      onAdd={() => handleAdd(agent)}
                    />
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
          <span className="text-[10px] text-zinc-700">
            {MARKETPLACE_AGENTS.length} agentes disponibles •{' '}
            {existingIds.size} en tu dashboard
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      </motion.div>

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-emerald-800 bg-emerald-900/90 px-5 py-3 text-sm font-medium text-emerald-200 shadow-lg backdrop-blur-sm"
          >
            <Check className="mr-2 inline h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MarketplaceCard({
  agent,
  added,
  onAdd,
}: {
  agent: MarketplaceAgent
  added: boolean
  onAdd: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-700"
    >
      {/* Icon + name */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
          style={{ backgroundColor: `${agent.config.color}18` }}
        >
          {agent.config.icon}
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-zinc-100">
            {agent.config.name}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            <span>⭐ {agent.githubStars}</span>
            <span>•</span>
            <span>{agent.license}</span>
            <span>•</span>
            <span>{agent.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed text-zinc-500">
        {agent.config.description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!added) onAdd()
          }}
          disabled={added}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            added
              ? 'bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-700/40'
              : 'bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 active:bg-violet-600/40'
          }`}
        >
          {added ? (
            <>
              <Check className="h-3 w-3" /> En dashboard ✓
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" /> Agregar
            </>
          )}
        </button>

        <a
          href={`https://github.com/${agent.repo}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        >
          <ExternalLink className="h-3 w-3" />
          GitHub
        </a>
      </div>
    </motion.div>
  )
}
