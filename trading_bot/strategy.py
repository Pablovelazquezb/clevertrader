"""
Estrategia: Momentum Breakout Agresivo

Lógica:
  1. Escanea un watchlist de activos líquidos cada 5 minutos.
  2. Compra cuando:
     - Precio > EMA 20 (tendencia alcista)
     - EMA 9 > EMA 20 (momentum positivo)
     - Volumen > 1.3× promedio 20 velas
     - Precio cerca del máximo de la sesión (> 0.3% del high del día)
  3. Vende cuando:
     - Stop loss trailing al 2.5%
     - Take profit fijo al 5%
     - Señal contraria (EMA 9 cruza debajo de EMA 20)
     - Si es fin de sesión (15:45 ET)
  4. Máximo 3 posiciones simultáneas.
  5. Asigna 30% del buying power por trade.

Autor: Clever
"""
import math
from datetime import datetime, timezone
import pytz
import pandas as pd
import numpy as np

# ── Watchlist (líquidos, alta beta) ──────────────────────────────
WATCHLIST = [
    "NVDA", "TSLA", "AMD", "META", "AAPL",
    "MSFT", "AMZN", "GOOGL", "QQQ", "SPY",
    "SMH", "SOXL", "TQQQ", "BITO",
]

# ── Parámetros (🔥 agresivos) ────────────────────────────────────
TIMEFRAME = "5Min"
LOOKBACK = 25
EMA_FAST = 9
EMA_SLOW = 20
VOLUME_MULT = 1.0         # volumen ≥ promedio (era 1.3)
TRAILING_STOP_PCT = 3.5   # stop más amplio (era 2.5)
TAKE_PROFIT_PCT = 3.5     # take profit más rápido (era 5.0)
MAX_POSITIONS = 5          # hasta 5 posiciones (era 3)
ALLOC_PER_TRADE = 0.40    # 40% del buying power (era 30%)

EASTERN = pytz.timezone("US/Eastern")

# ── Utilidades técnicas ──────────────────────────────────────────

def ema(series: pd.Series, period: int) -> pd.Series:
    return series.ewm(span=period, adjust=False).mean()

def is_market_open() -> bool:
    """Checa si el mercado está abierto (ET, 9:30-16:00, lun-vie)."""
    now = datetime.now(EASTERN)
    if now.weekday() >= 5:
        return False
    if now.hour < 9 or (now.hour == 9 and now.minute < 30):
        return False
    if now.hour >= 16:
        return False
    return True

def minutes_to_close() -> int:
    """Minutos para el cierre (16:00 ET)."""
    now = datetime.now(EASTERN)
    close = now.replace(hour=16, minute=0, second=0, microsecond=0)
    return max(0, int((close - now).total_seconds() / 60))

# ── Señal principal ──────────────────────────────────────────────

def evaluate_buy_signal(df: pd.DataFrame) -> bool:
    """
    Retorna True si se cumplen las condiciones de compra en la última vela.
    df debe tener columnas: close, volume (y opcional high del día).
    """
    if df is None or len(df) < EMA_SLOW + 5:
        return False

    close = df["close"]
    vol = df["volume"]

    ema_fast = ema(close, EMA_FAST)
    ema_slow = ema(close, EMA_SLOW)
    avg_vol = vol.rolling(20).mean()

    last = close.iloc[-1]
    last_vol = vol.iloc[-1]
    avg_vol_val = avg_vol.iloc[-1]

    # 1. Precio > EMA lenta
    if last <= ema_slow.iloc[-1]:
        return False

    # 2. EMA rápida > EMA lenta (momentum alcista)
    if ema_fast.iloc[-1] <= ema_slow.iloc[-1]:
        return False

    # 3. Volumen superior al promedio
    if avg_vol_val > 0 and last_vol < avg_vol_val * VOLUME_MULT:
        return False

    # 4. Precio cerca del High del día (si lo tenemos)
    if "high" in df.columns:
        daily_high = df["high"].iloc[-1]
        if last < daily_high * 0.997:  # dentro del 0.3% del high
            return False

    return True


def evaluate_sell_signal(df: pd.DataFrame, entry_price: float, current_price: float,
                        trailing_stop: float) -> tuple:
    """
    Retorna (vender: bool, razón: str | None).
    """
    # Take profit
    gain_pct = (current_price - entry_price) / entry_price * 100
    if gain_pct >= TAKE_PROFIT_PCT:
        return True, "take_profit"

    # Trailing stop
    if current_price <= trailing_stop:
        return True, "trailing_stop"

    # Señal contraria (EMA cruz)
    if df is not None and len(df) >= EMA_SLOW:
        close = df["close"]
        ema_fast = ema(close, EMA_FAST)
        ema_slow = ema(close, EMA_SLOW)
        if ema_fast.iloc[-1] < ema_slow.iloc[-1]:
            return True, "ema_cross"

    return False, None
