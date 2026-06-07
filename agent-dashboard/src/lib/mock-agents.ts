import type { AgentInstance } from './agent-types'

// Generate a deterministic seed event history just for the demo.
function eventHistory(msg: string, ts: number) {
  return { id: `e-${ts}`, timestamp: ts, type: 'log' as const, message: msg }
}

export const DEFAULT_AGENTS: AgentInstance[] = [
  {
    config: {
      id: 'clever',
      name: 'Clever',
      description: 'Asistente agéntico — piensa, coordina y ejecuta tareas.',
      icon: '🧠',
      color: '#a78bfa',
      category: 'ai',
      enabled: true,
    },
    status: 'idle',
    events: [
      eventHistory('🧠 Clever despierto — esperando instrucciones.', Date.now() - 300_000),
    ],
    lastRun: Date.now() - 300_000,
    uptime: 300_000,
  },
  {
    config: {
      id: 'trader',
      name: 'Trader',
      description: 'Bot de trading algorítmico — analiza mercados 24/7.',
      icon: '📈',
      color: '#34d399',
      category: 'trading',
      enabled: true,
    },
    status: 'idle',
    events: [
      eventHistory('📊 Análisis de BTC/USDT completado. Sin señal.', Date.now() - 120_000),
      eventHistory('🔄 Iteración #142 — RSI: 48.2, MACD: neutral.', Date.now() - 60_000),
    ],
    lastRun: Date.now() - 60_000,
    uptime: null,
  },
  {
    config: {
      id: 'instagram-mkt',
      name: 'Mkt IG',
      description: 'Agente de marketing para Instagram — contenido y engagement.',
      icon: '📱',
      color: '#f472b6',
      category: 'marketing',
      enabled: false,
    },
    status: 'idle',
    events: [],
    lastRun: null,
    uptime: null,
  },
  {
    config: {
      id: 'tiktok-editor',
      name: 'TikTok',
      description: 'Agente de contenido para TikTok — edición y programación.',
      icon: '🎵',
      color: '#fb923c',
      category: 'social',
      enabled: false,
    },
    status: 'idle',
    events: [],
    lastRun: null,
    uptime: null,
  },
  {
    config: {
      id: 'whatsapp-bot',
      name: 'WhatsApp',
      description: 'Bot conversacional para WhatsApp Business API.',
      icon: '💬',
      color: '#22d3ee',
      category: 'ai',
      enabled: false,
    },
    status: 'idle',
    events: [],
    lastRun: null,
    uptime: null,
  },
  {
    config: {
      id: 'apexmont-crm',
      name: 'CRM',
      description: 'Sincronización y automatización del CRM interno.',
      icon: '🏗️',
      color: '#f87171',
      category: 'dev',
      enabled: false,
    },
    status: 'idle',
    events: [],
    lastRun: null,
    uptime: null,
  },
]
