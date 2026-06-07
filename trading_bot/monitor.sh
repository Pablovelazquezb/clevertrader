#!/bin/bash
# Monitor de CleverTrader — detecta trades nuevos y envía notificación
# Optimizado: solo lee el log, sin ejecutar el bot

LOG_DIR="/home/pablo/.openclaw/workspace/trading_bot/logs"
STATE_FILE="/tmp/clevertrader_last_trade"

LATEST_LOG=$(ls -t "$LOG_DIR"/bot_*.log 2>/dev/null | head -1)
[ -z "$LATEST_LOG" ] && exit 0

NOW=$(date +%s)

# Buscar COMPRA o VENTA en el log de hoy (solo las últimas 100 líneas)
NEW_TRADES=$(tail -100 "$LATEST_LOG" | grep -E "🟢 COMPRA|🔴 VENTA" | tail -5)

if [ -n "$NEW_TRADES" ]; then
    echo "$NOW" > "$STATE_FILE"
    echo "$NEW_TRADES"
    exit 0
fi

echo "$NOW" > "$STATE_FILE"
exit 0
