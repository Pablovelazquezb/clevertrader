#!/bin/bash
# CleverTrader wrapper — ejecuta el bot y solo alerta si hay actividad real
LOG_DIR="/home/pablo/.openclaw/workspace/trading_bot/logs"
BOT="/home/pablo/.openclaw/workspace/trading_bot/venv/bin/python"
BOT_SCRIPT="/home/pablo/.openclaw/workspace/trading_bot/bot.py"
LOCKFILE="/tmp/clevertrader.lock"

# Evitar ejecuciones concurrentes
if [ -f "$LOCKFILE" ]; then
    exit 0
fi
touch "$LOCKFILE"

cd /home/pablo/.openclaw/workspace/trading_bot
OUTPUT=$($BOT $BOT_SCRIPT 2>&1)
EXIT=$?

# Loguear siempre
echo "[$(date '+%Y-%m-%d %H:%M:%S')]" >> "$LOG_DIR/cron.log"
echo "$OUTPUT" >> "$LOG_DIR/cron.log"
echo "" >> "$LOG_DIR/cron.log"

# Solo imprimir si hay trades (para notificaciones)
echo "$OUTPUT" | grep -E "(COMPRA|VENTA|Error)" && echo "---" && echo "$OUTPUT"

rm -f "$LOCKFILE"
exit $EXIT
