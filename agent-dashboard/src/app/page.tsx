'use client'

import { useEffect, useState, useCallback } from 'react'
import { Activity, Cpu, Store, Users, Zap } from 'lucide-react'
import { useAgentStore } from '@/lib/store'
import { DEFAULT_AGENTS } from '@/lib/mock-agents'
import AgentGrid from '@/components/AgentGrid'
import AgentDetailModal from '@/components/AgentDetailModal'
import MarketplacePanel from '@/components/MarketplacePanel'
import type { AgentInstance } from '@/lib/agent-types'

export default function DashboardPage() {
  const agents = useAgentStore((s) => s.agents)
  const registerAgent = useAgentStore((s) => s.registerAgent)
  const [selected, setSelected] = useState<AgentInstance | null>(null)
  const [marketplaceOpen, setMarketplaceOpen] = useState(false)

  // Register default agents on mount
  useEffect(() => {
    DEFAULT_AGENTS.forEach((a) => registerAgent(a))
  }, [registerAgent])

  const handleAgentClick = useCallback(
    (id: string) => {
      const agent = agents.find((a) => a.config.id === id) ?? null
      setSelected(agent)
    },
    [agents]
  )

  const activeCount = agents.filter(
    (a) => a.config.enabled && a.status !== 'idle'
  ).length
  const enabledCount = agents.filter((a) => a.config.enabled).length
  const totalExecutions = agents.filter((a) => a.lastRun).length

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Agent Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Hogar visual para tus agentes — monitorea, controla y escala.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMarketplaceOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <Store className="h-3.5 w-3.5" />
            Marketplace
          </button>
        </div>
      </header>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Cpu} label="Agentes activos" value={activeCount} />
        <StatCard icon={Zap} label="Habilitados" value={enabledCount} />
        <StatCard icon={Activity} label="Ejecuciones" value={totalExecutions} />
        <StatCard icon={Users} label="Categorías" value="5" />
      </div>

      {/* ── Agent grid ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">
            Tus Agentes
          </h2>
          <span className="text-xs text-zinc-600">
            {enabledCount} activos
          </span>
        </div>
        <AgentGrid agents={agents} onAgentClick={handleAgentClick} onAddAgent={() => setMarketplaceOpen(true)} />
      </section>

      {/* ── Detail modal ── */}
      <AgentDetailModal
        agent={selected}
        onClose={() => setSelected(null)}
      />

      {/* ── Marketplace ── */}
      {marketplaceOpen && (
        <MarketplacePanel onClose={() => setMarketplaceOpen(false)} />
      )}

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-zinc-800 pt-6 text-center text-[10px] text-zinc-700">
        Agent Dashboard — MVP local · +10 agentes open-source en el marketplace
      </footer>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
        <Icon className="h-4 w-4 text-zinc-400" />
      </div>
      <div>
        <p className="text-lg font-bold text-zinc-100">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  )
}
