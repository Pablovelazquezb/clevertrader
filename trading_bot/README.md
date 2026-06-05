# ⚡ CleverTrader 24/7 — Bot de Trading Alpaca

Bot de trading **24/7** para Alpaca Paper Trading. Opera en todos los regímenes de mercado automáticamente.

## Estrategias por régimen

| Régimen | Horario (ET) | Estrategia | Timeframe | Stop | Take Profit |
|---------|-------------|------------|-----------|------|-------------|
| **Regular** | Lun-Vie 9:30-16:00 | Momentum Breakout (EMA9/20 + volumen) | 5 min | 2.5% trail | 5% |
| **Pre-market** | Lun-Vie 4:00-9:30 | Momentum extendido (parámetros suaves) | 15 min | 3.5% trail | 4% |
| **After-hours** | Lun-Vie 16:00-20:00 | Momentum extendido | 15 min | 3.5% trail | 4% |
| **Crypto 24/7** | Sáb/Dom + noche | Tendencia EMA12/26 | 15 min | 5% trail | 8% |

## Watchlists

**Stocks:** NVDA, TSLA, AMD, META, AAPL, MSFT, AMZN, GOOGL, QQQ, SPY, SMH, SOXL, TQQQ
**Crypto:** BTC/USD, ETH/USD, SOL/USD

## Uso

```bash
cd trading_bot
source venv/bin/activate

# Ver estado
python bot.py --status

# Ejecutar una iteración
python bot.py

# Loop continuo 24/7 (recomendado)
python bot.py --loop
```

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `bot.py` | Bot principal con lógica multi-régimen |
| `config.py` | Carga de API keys |
| `.env` | API keys (**no compartir**) |
| `logs/` | Logs diarios |

## Notas

- ✅ **Paper trading** — 100% simulado, sin riesgo
- ✅ **Opera solo** — no necesitas intervención
- ✅ **Trailing stop dinámico** — protege ganancias
- Los logs están en `logs/bot_YYYYMMDD.log`

## ⚠️ Disclaimer

Esto es paper trading. El trading real conlleva riesgo de pérdida de capital. Ninguna estrategia garantiza ganancias.
