import type { AgentModule, AgentContext, AgentEvent, AgentResult } from '@/lib/agent-types'

/**
 * Trader — algorithmic trading bot agent.
 */
export const TraderAgentModule: AgentModule = {
  config: {
    id: 'trader',
    name: 'Trader',
    description: 'Bot de trading algorítmico — analiza mercados 24/7.',
    icon: '📈',
    color: '#34d399',
    category: 'trading',
    enabled: true,
  },

  async *execute(ctx: AgentContext): AsyncGenerator<AgentEvent, AgentResult> {
    yield {
      id: `trd-${Date.now()}`,
      timestamp: Date.now(),
      type: 'thinking',
      message: '📊 Iniciando análisis de mercado…',
    }

    if (ctx.signal.aborted) {
      return { success: false, summary: 'Ejecución cancelada.' }
    }

    yield {
      id: `trd-${Date.now() + 1}`,
      timestamp: Date.now(),
      type: 'action',
      message: '📡 Obteniendo datos OHLCV de Binance…',
    }

    // Simulate market data fetch
    const rsi = +(40 + Math.random() * 20).toFixed(1)
    const macdSignal = Math.random() > 0.5 ? 'alcista' : 'bajista'
    const price = +(65000 + Math.random() * 5000).toFixed(2)

    yield {
      id: `trd-${Date.now() + 2}`,
      timestamp: Date.now(),
      type: 'log',
      message: `💹 BTC/USDT: $${price.toLocaleString()} | RSI: ${rsi} | MACD: ${macdSignal}`,
    }

    yield {
      id: `trd-${Date.now() + 3}`,
      timestamp: Date.now(),
      type: 'log',
      message:
        rsi > 70 || rsi < 30
          ? '⚠️ Señal de sobrecompra/sobreventa detectada.'
          : '➡️ Sin señal clara. RSI en zona neutral.',
    }

    const hasSignal = Math.random() > 0.7
    if (hasSignal) {
      yield {
        id: `trd-${Date.now() + 4}`,
        timestamp: Date.now(),
        type: 'action',
        message: '🚀 Señal detectada — evaluando entrada en posición…',
      }
    }

    yield {
      id: `trd-${Date.now() + 5}`,
      timestamp: Date.now(),
      type: 'result',
      message: hasSignal
        ? '✅ Señal encontrada. Posición abierta.'
        : '✅ Iteración completada. Sin trades.',
    }

    return {
      success: true,
      summary: hasSignal ? 'Trade ejecutado.' : 'Sin señales.',
      data: { rsi, macdSignal, price },
    }
  },
}
