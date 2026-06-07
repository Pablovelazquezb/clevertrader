// === Core Types for the Agent Dashboard ===

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'done' | 'error'

export interface AgentEvent {
  id: string
  timestamp: number
  type: 'thinking' | 'action' | 'log' | 'result' | 'error'
  message: string
  meta?: Record<string, unknown>
}

export interface AgentConfig {
  id: string
  name: string
  description: string
  icon: string
  color: string       // accent color hex
  category: string     // 'ai' | 'trading' | 'marketing' | 'social' | 'dev'
  enabled: boolean
}

export interface AgentInstance {
  config: AgentConfig
  status: AgentStatus
  events: AgentEvent[]
  lastRun: number | null
  uptime: number | null
}

// Interface every agent module must implement
export interface AgentModule {
  config: AgentConfig
  execute(ctx: AgentContext): AsyncGenerator<AgentEvent, AgentResult>
}

export interface AgentContext {
  agentId: string
  signal: AbortSignal
}

export interface AgentResult {
  success: boolean
  summary: string
  data?: Record<string, unknown>
}

// SSE event sent to frontend
export interface SSEMessage {
  type: 'status' | 'event' | 'result'
  agentId: string
  payload: unknown
}
