import { create } from 'zustand'
import type { AgentInstance, AgentEvent, AgentStatus } from './agent-types'

// Pre-generated IDs for stable references
function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

interface AgentStore {
  agents: AgentInstance[]
  // Ideally, both agents and developers can register agents
  registerAgent: (instance: AgentInstance) => void
  updateStatus: (id: string, status: AgentStatus) => void
  addEvent: (id: string, event: AgentEvent) => void
  setLastRun: (id: string) => void
  removeAgent: (id: string) => void
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],

  registerAgent: (instance) =>
    set((state) => ({
      agents: state.agents.some((a) => a.config.id === instance.config.id)
        ? state.agents
        : [...state.agents, instance],
    })),

  updateStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.config.id === id ? { ...a, status } : a
      ),
    })),

  addEvent: (id, event) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.config.id === id
          ? { ...a, events: [...a.events.slice(-100), event] }
          : a
      ),
    })),

  setLastRun: (id) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.config.id === id ? { ...a, lastRun: Date.now() } : a
      ),
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.config.id !== id),
    })),
}))
