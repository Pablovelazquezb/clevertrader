import { NextResponse } from 'next/server'
import type { AgentInstance } from '@/lib/agent-types'
import { DEFAULT_AGENTS } from '@/lib/mock-agents'

// In-memory store for server-side agent state (simple for MVP)
let agents: AgentInstance[] = [...DEFAULT_AGENTS]

export async function GET() {
  return NextResponse.json({ agents })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { agentId, action } = body

  if (!agentId || !action) {
    return NextResponse.json(
      { error: 'agentId and action are required' },
      { status: 400 }
    )
  }

  const idx = agents.findIndex((a) => a.config.id === agentId)
  if (idx === -1) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  switch (action) {
    case 'run':
      agents[idx].status = 'thinking'
      agents[idx].events.push({
        id: `evt-${Date.now()}`,
        timestamp: Date.now(),
        type: 'thinking',
        message: `${agents[idx].config.icon} ${agents[idx].config.name} iniciando…`,
      })
      break
    case 'stop':
      agents[idx].status = 'idle'
      agents[idx].events.push({
        id: `evt-${Date.now()}`,
        timestamp: Date.now(),
        type: 'error',
        message: '⛔ Ejecución detenida por el usuario.',
      })
      break
    case 'reset':
      agents[idx].status = 'idle'
      agents[idx].events.push({
        id: `evt-${Date.now()}`,
        timestamp: Date.now(),
        type: 'log',
        message: '🔄 Estado reiniciado.',
      })
      break
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  return NextResponse.json({ agent: agents[idx] })
}
