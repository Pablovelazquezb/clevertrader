import type { AgentModule, AgentEvent, AgentResult, AgentContext } from './agent-types'
import { CleverAgentModule } from '@/agents/clever'
import { TraderAgentModule } from '@/agents/trader'
import { TemplateAgentModule } from '@/agents/template'

/**
 * Central registry of all agent modules.
 * To add a new agent type, import its module and add it to the `registry` array.
 */
const registry: AgentModule[] = [
  CleverAgentModule,
  TraderAgentModule,
  // Enable template once you customize it:
  // TemplateAgentModule,
]

/** Map id -> module for fast lookup */
const moduleMap = new Map<string, AgentModule>()
registry.forEach((m) => moduleMap.set(m.config.id, m))

/** Get all registered agent configs */
export function getRegisteredAgents() {
  return registry.map((m) => m.config)
}

/** Find a module by id */
export function getAgentModule(id: string): AgentModule | undefined {
  return moduleMap.get(id)
}

/**
 * Execute an agent module by id.
 * Returns an async generator that yields events in real-time.
 */
export async function* runAgent(
  id: string,
  signal?: AbortSignal
): AsyncGenerator<AgentEvent, AgentResult> {
  const module = moduleMap.get(id)
  if (!module) {
    throw new Error(`Agent module "${id}" not found in registry.`)
  }

  const ctx: AgentContext = {
    agentId: id,
    signal: signal ?? new AbortController().signal,
  }

  const result = yield* module.execute(ctx)
  return result
}

/** Alias: list all registered agent configs */
export const listAgents = getRegisteredAgents
