'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { AgentInstance } from '@/lib/agent-types'
import { useAgentStore } from '@/lib/store'
import AgentTimeline from './AgentTimeline'
import AgentControls from './AgentControls'

interface Props {
  agent: AgentInstance | null
  onClose: () => void
}

export default function AgentDetailModal({ agent, onClose }: Props) {
  const updateStatus = useAgentStore((s) => s.updateStatus)
  const addEvent = useAgentStore((s) => s.addEvent)
  const setLastRun = useAgentStore((s) => s.setLastRun)

  const uid = () => Math.random().toString(36).slice(2, 9)

  const handleRun = useCallback(() => {
    if (!agent) return
    const id = agent.config.id

    updateStatus(id, 'thinking')
    addEvent(id, {
      id: uid(),
      timestamp: Date.now(),
      type: 'thinking',
      message: `${agent.config.icon} ${agent.config.name} iniciando ejecución…`,
    })

    // Simulate agent execution
    setTimeout(() => {
      updateStatus(id, 'working')
      addEvent(id, {
        id: uid(),
        timestamp: Date.now(),
        type: 'action',
        message: `🔍 Analizando contexto y dependencias…`,
      })
    }, 800)

    setTimeout(() => {
      addEvent(id, {
        id: uid(),
        timestamp: Date.now(),
        type: 'log',
        message: `📊 Datos cargados: 3 fuentes, 1.2KB procesados.`,
      })
    }, 1500)

    setTimeout(() => {
      updateStatus(id, 'done')
      addEvent(id, {
        id: uid(),
        timestamp: Date.now(),
        type: 'result',
        message: `✅ Ejecución completada — ${agent.config.name} terminó sin errores.`,
      })
      setLastRun(id)
    }, 2500)
  }, [agent, updateStatus, addEvent, setLastRun])

  const handleStop = useCallback(() => {
    if (!agent) return
    updateStatus(agent.config.id, 'idle')
    addEvent(agent.config.id, {
      id: uid(),
      timestamp: Date.now(),
      type: 'error',
      message: `⛔ Ejecución detenida por el usuario.`,
    })
  }, [agent, updateStatus, addEvent])

  const handleReset = useCallback(() => {
    if (!agent) return
    updateStatus(agent.config.id, 'idle')
    addEvent(agent.config.id, {
      id: uid(),
      timestamp: Date.now(),
      type: 'log',
      message: `🔄 Estado reiniciado.`,
    })
  }, [agent, updateStatus, addEvent])

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ y: 200, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 200, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-2xl flex-col gap-5 rounded-t-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:rounded-3xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                style={{
                  backgroundColor: `${agent.config.color}18`,
                }}
              >
                {agent.config.icon}
              </span>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">
                  {agent.config.name}
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {agent.config.description}
                </p>
              </div>
            </div>

            {/* Controls */}
            <AgentControls
              status={agent.status}
              onRun={handleRun}
              onStop={handleStop}
              onReset={handleReset}
            />

            {/* Metrics row */}
            <div className="flex gap-4 text-xs text-zinc-500">
              <span>Estado: <strong className="text-zinc-300">{agent.status}</strong></span>
              {agent.lastRun && (
                <span>
                  Última ejecución:{' '}
                  <strong className="text-zinc-300">
                    {new Date(agent.lastRun).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </strong>
                </span>
              )}
              <span>
                Eventos: <strong className="text-zinc-300">{agent.events.length}</strong>
              </span>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Timeline
              </h3>
              <AgentTimeline events={agent.events} />
            </div>

            {/* Bottom hint */}
            <p className="text-[10px] text-zinc-700">
              Los agentes se ejecutan localmente. Las integraciones en vivo se añadirán en la fase beta.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
