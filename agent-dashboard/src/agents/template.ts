import type { AgentModule, AgentContext, AgentEvent, AgentResult } from '@/lib/agent-types'

/**
 * Base template for creating new agent modules.
 * Copy this file, rename the class, implement execute(), and register it.
 */
export const TemplateAgentModule: AgentModule = {
  config: {
    id: 'template',
    name: 'Template',
    description: 'Plantilla para nuevos agentes — copia y personaliza.',
    icon: '🛠️',
    color: '#a1a1aa',
    category: 'dev',
    enabled: false,
  },

  async *execute(ctx: AgentContext): AsyncGenerator<AgentEvent, AgentResult> {
    yield {
      id: `tmpl-${Date.now()}`,
      timestamp: Date.now(),
      type: 'thinking',
      message: '🔧 Template agent ejecutándose…',
    }

    // --- Your logic here ---
    yield {
      id: `tmpl-${Date.now() + 1}`,
      timestamp: Date.now(),
      type: 'log',
      message: '📝 Plantilla base — reemplaza esto con lógica real.',
    }

    // Check for cancellation
    if (ctx.signal.aborted) {
      return { success: false, summary: 'Ejecución cancelada.' }
    }

    yield {
      id: `tmpl-${Date.now() + 2}`,
      timestamp: Date.now(),
      type: 'result',
      message: '✅ Template completado.',
    }

    return { success: true, summary: 'Template ejecutado sin errores.' }
  },
}
