#!/usr/bin/env python3
"""
⚡ CleverTrader 24/7 — Bot de trading agresivo para Alpaca Paper Trading.
Opera TODOS los días, TODO el día:
  - Regular hours (9:30-16:00 ET): Momentum Breakout con stops agresivos
  - Extended hours (pre 4:00-9:30 / post 16:00-20:00 ET): Momentum con stops más amplios
  - Crypto (24/7): Estrategia de tendencia en velas 15min

Uso:
    python bot.py --loop          # loop infinito cada 5 min
    python bot.py --status        # ver posiciones y cuenta
    python bot.py --crypto        # modo crypto 24/7 adicional
"""
import argparse
import logging
import math
import os
import time
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
import pytz

from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest, GetOrdersRequest
from alpaca.trading.enums import OrderSide, TimeInForce, OrderStatus
from alpaca.data.historical.stock import StockHistoricalDataClient
from alpaca.data.historical.crypto import CryptoHistoricalDataClient
from alpaca.data.requests import StockBarsRequest, CryptoBarsRequest
from alpaca.data.timeframe import TimeFrame

import config

# ── Logging ──────────────────────────────────────────────────────
log_dir = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, f"bot_{datetime.now().strftime('%Y%m%d')}.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── Clientes ─────────────────────────────────────────────────────
trade_client = TradingClient(config.API_KEY_ID, config.API_SECRET_KEY, paper=True)
stock_data = StockHistoricalDataClient(config.API_KEY_ID, config.API_SECRET_KEY)
crypto_data = CryptoHistoricalDataClient()  # no keys needed for crypto data

EASTERN = pytz.timezone("US/Eastern")

# ── Regímenes de mercado ─────────────────────────────────────────

def get_market_regime() -> str:
    """
    Retorna el régimen actual: "regular", "premarket", "afterhours", "crypto", "closed"
    """
    now = datetime.now(EASTERN)
    wd = now.weekday()
    hour = now.hour
    minute = now.minute
    total_min = hour * 60 + minute

    if wd >= 5:  # sábado/domingo
        return "crypto"  # solo crypto

    if 570 <= total_min < 960:  # 9:30 - 16:00
        return "regular"
    elif 240 <= total_min < 570:  # 4:00 - 9:30
        return "premarket"
    elif 960 <= total_min < 1200:  # 16:00 - 20:00
        return "afterhours"
    else:
        return "crypto"


def market_is_open() -> bool:
    """Si hay mercado de stocks (regular + extended)."""
    r = get_market_regime()
    return r in ("regular", "premarket", "afterhours")


# ── Parámetros por régimen ───────────────────────────────────────

# Watchlist de acciones (alta liquidez, alto beta)
STOCK_WATCHLIST = [
    "NVDA", "TSLA", "AMD", "META", "AAPL",
    "MSFT", "AMZN", "GOOGL", "QQQ", "SPY",
    "SMH", "SOXL", "TQQQ",
]

# Watchlist de crypto
CRYPTO_WATCHLIST = [
    "BTC/USD", "ETH/USD", "SOL/USD",
]

# Parámetros por régimen
PARAMS = {
    "regular": {
        "lookback": 25,
        "ema_fast": 9,
        "ema_slow": 20,
        "volume_mult": 1.3,
        "trailing_stop": 2.5,
        "take_profit": 5.0,
        "max_positions": 3,
        "alloc_per_trade": 0.30,
        "use_extended_hours": False,
        "tf": "5Min",
    },
    "premarket": {
        "lookback": 20,
        "ema_fast": 9,
        "ema_slow": 20,
        "volume_mult": 0.8,  # menos volumen
        "trailing_stop": 3.5,  # stops más amplios
        "take_profit": 4.0,
        "max_positions": 2,
        "alloc_per_trade": 0.15,  # posiciones más chicas
        "use_extended_hours": True,
        "tf": "15Min",  # timeframe más largo
    },
    "afterhours": {
        "lookback": 20,
        "ema_fast": 9,
        "ema_slow": 20,
        "volume_mult": 0.8,
        "trailing_stop": 3.5,
        "take_profit": 4.0,
        "max_positions": 2,
        "alloc_per_trade": 0.15,
        "use_extended_hours": True,
        "tf": "15Min",
    },
    "crypto": {
        "lookback": 30,
        "ema_fast": 12,
        "ema_slow": 26,
        "volume_mult": 1.0,
        "trailing_stop": 5.0,  # crypto es más volátil
        "take_profit": 8.0,
        "max_positions": 2,
        "alloc_per_trade": 0.15,
        "use_extended_hours": True,
        "tf": "15Min",
    },
}


# ── Técnico ──────────────────────────────────────────────────────

def ema(series: pd.Series, period: int) -> pd.Series:
    return series.ewm(span=period, adjust=False).mean()


def get_bars(symbol: str, params: dict, is_crypto: bool = False) -> Optional[pd.DataFrame]:
    """Obtiene velas según el régimen actual, suficientes para EMAs y volumen."""
    try:
        limit = max(params["lookback"], 50)  # mínimo 50 velas para indicadores
        now = datetime.now(EASTERN)
        extra = limit * 5 + 120  # más holgado
        start = now - timedelta(minutes=extra)

        if is_crypto:
            req = CryptoBarsRequest(
                symbol_or_symbols=symbol,
                timeframe=TimeFrame.Minute,
                start=start.isoformat(),
                limit=limit * 4,
            )
            bars = crypto_data.get_crypto_bars(req)
        else:
            req = StockBarsRequest(
                symbol_or_symbols=symbol,
                timeframe=TimeFrame.Minute,
                start=start.isoformat(),
                limit=limit * 4,
                adjustment="raw",
                feed="iex" if not params["use_extended_hours"] else "sip",
            )
            bars = stock_data.get_stock_bars(req)

        if symbol not in bars.data:
            return None
        raw = bars.data[symbol]
        records = []
        for b in raw:
            records.append({
                "timestamp": b.timestamp,
                "open": b.open,
                "high": b.high,
                "low": b.low,
                "close": b.close,
                "volume": b.volume,
            })
        df = pd.DataFrame(records)
        rule = "5min" if params["tf"] == "5Min" else "15min"
        df = df.resample(rule, on="timestamp").agg({
            "open": "first", "high": "max", "low": "min",
            "close": "last", "volume": "sum",
        }).dropna().tail(limit)
        return df
    except Exception as e:
        log.warning(f"Error obteniendo datos de {symbol}: {e}")
        return None


# ── Señales ──────────────────────────────────────────────────────

def evaluate_buy_signal(df: pd.DataFrame, params: dict) -> bool:
    """Evalúa si hay señal de compra en la última vela."""
    if df is None or len(df) < params["ema_slow"] + 5:
        return False

    close = df["close"]
    vol = df["volume"]

    ema_fast = ema(close, params["ema_fast"])
    ema_slow = ema(close, params["ema_slow"])
    avg_vol = vol.rolling(20).mean()

    last = close.iloc[-1]
    last_vol = vol.iloc[-1]
    avg_vol_val = avg_vol.iloc[-1]

    # Precio > EMA lenta (tendencia alcista)
    if last <= ema_slow.iloc[-1]:
        return False

    # EMA rápida > EMA lenta (momentum)
    if ema_fast.iloc[-1] <= ema_slow.iloc[-1]:
        return False

    # Volumen suficiente (si hay datos de volumen para comparar; crypto free tier no da volumen real)
    if pd.notna(avg_vol_val) and avg_vol_val > 1 and last_vol < avg_vol_val * params["volume_mult"]:
        return False

    # Extra para regular hours: cerca del high del día
    if not params["use_extended_hours"] and "high" in df.columns:
        daily_high = df["high"].iloc[-1]
        if last < daily_high * 0.997:
            return False

    return True


def evaluate_sell_signal(df: pd.DataFrame, entry_price: float, current_price: float,
                         trailing_stop: float, params: dict) -> tuple:
    """Retorna (vender: bool, razón: str | None)."""
    # Take profit
    gain_pct = (current_price - entry_price) / entry_price * 100
    if gain_pct >= params["take_profit"]:
        return True, "take_profit"

    # Trailing stop
    if current_price <= trailing_stop:
        return True, "trailing_stop"

    # Señal contraria (EMA cruz)
    if df is not None and len(df) >= params["ema_slow"]:
        close = df["close"]
        ema_fast = ema(close, params["ema_fast"])
        ema_slow = ema(close, params["ema_slow"])
        if ema_fast.iloc[-1] < ema_slow.iloc[-1]:
            return True, "ema_cross"

    return False, None


# ── Cuenta y posiciones ──────────────────────────────────────────

def get_account():
    return trade_client.get_account()


def get_positions():
    return trade_client.get_all_positions()


def get_open_orders():
    req = GetOrdersRequest(status=OrderStatus.OPEN)
    return trade_client.get_orders(req)


def current_positions_dict() -> dict:
    pos = get_positions()
    result = {}
    for p in pos:
        result[p.symbol] = {
            "qty": float(p.qty),
            "avg_entry": float(p.avg_entry_price),
            "market_value": float(p.market_value),
            "current_price": float(p.current_price),
        }
    return result


# ── Órdenes ──────────────────────────────────────────────────────

def place_buy(symbol: str, notional: float, extended: bool = False):
    try:
        req = MarketOrderRequest(
            symbol=symbol,
            notional=notional,
            side=OrderSide.BUY,
            time_in_force=TimeInForce.DAY,
            extended_hours=extended,
        )
        order = trade_client.submit_order(req)
        log.info(f"🟢 COMPRA {symbol} por ${notional:.2f} {'[EXT]' if extended else ''} → orden {order.id}")
        return order
    except Exception as e:
        log.error(f"❌ Error comprando {symbol}: {e}")
        return None


def place_sell_all(symbol: str, qty: float, extended: bool = False):
    try:
        qty = math.floor(qty) if qty >= 1 else round(qty, 4)
        if qty <= 0:
            log.warning(f"⚠️ Cantidad inválida para vender {symbol}: {qty}")
            return None
        req = MarketOrderRequest(
            symbol=symbol,
            qty=qty,
            side=OrderSide.SELL,
            time_in_force=TimeInForce.DAY,
            extended_hours=extended,
        )
        order = trade_client.submit_order(req)
        log.info(f"🔴 VENTA {symbol} ({qty} accs) {'[EXT]' if extended else ''} → orden {order.id}")
        return order
    except Exception as e:
        log.error(f"❌ Error vendiendo {symbol}: {e}")
        return None


# ── Ciclo principal ──────────────────────────────────────────────

trailing_stops = {}  # {symbol: highest_price_since_entry}


def run_once():
    """Una iteración del bot — se adapta al régimen actual."""
    regime = get_market_regime()
    params = PARAMS[regime]
    extended = params["use_extended_hours"]

    acc = get_account()
    bp = float(acc.buying_power)
    portfolio_value = float(acc.portfolio_value)
    positions = current_positions_dict()
    open_symbols = set(positions.keys())

    log.info(f"═" * 55)
    log.info(f"🌓 Régimen: {regime.upper()} | Portfolio: ${portfolio_value:.2f} | BP: ${bp:.2f}")
    log.info(f"📊 Posiciones activas: {len(positions)}")
    for sym, p in positions.items():
        gain = (p["current_price"] - p["avg_entry"]) / p["avg_entry"] * 100
        log.info(f"   {sym}: {p['qty']} accs @ ${p['avg_entry']:.2f} → ${p['current_price']:.2f} ({gain:+.2f}%)")

    # ── VENTAS ──
    for sym, p in positions.items():
        df = get_bars(sym, params)
        if df is None:
            continue

        entry_price = p["avg_entry"]
        current_price = p["current_price"]

        # Trailing stop dinámico: actualiza el trailing stop sobre el HIGH
        if sym not in trailing_stops:
            trailing_stops[sym] = entry_price
        if current_price > trailing_stops[sym]:
            trailing_stops[sym] = current_price  # sube el trailing
        stop_price = trailing_stops[sym] * (1 - params["trailing_stop"] / 100)

        sell, reason = evaluate_sell_signal(df, entry_price, current_price, stop_price, params)
        if sell:
            log.info(f"⚡ VENTA {sym}: {reason} (gain: {(current_price-entry_price)/entry_price*100:+.2f}%)")
            place_sell_all(sym, p["qty"], extended=extended)
            trailing_stops.pop(sym, None)

    # ── COMPRAS (stocks) ──
    if regime in ("regular", "premarket", "afterhours"):
        if len(positions) < params["max_positions"]:
            alloc = min(bp * params["alloc_per_trade"],
                        bp / (params["max_positions"] - len(positions)))
            alloc = max(alloc, 1.0)

            for sym in STOCK_WATCHLIST:
                if sym in open_symbols:
                    continue
                if len(positions) >= params["max_positions"]:
                    break

                df = get_bars(sym, params)
                if df is None or len(df) < params["ema_slow"]:
                    continue

                if evaluate_buy_signal(df, params):
                    log.info(f"🚀 COMPRA {sym} ({regime}) — ${alloc:.2f}")
                    order = place_buy(sym, alloc, extended=extended)
                    if order:
                        time.sleep(1)
                        positions = current_positions_dict()
                        open_symbols = set(positions.keys())
                        trailing_stops[sym] = float(order.filled_avg_price or 0)

    # ── COMPRAS (crypto, cualquier régimen no-stock) ──
    if regime == "crypto":
        log.info("🌙 Modo crypto 24/7 activo — buscando entradas en crypto...")
        if len(positions) < params["max_positions"]:
            alloc = min(bp * params["alloc_per_trade"],
                        bp / (params["max_positions"] - len(positions)))
            alloc = max(alloc, 5.0)  # mínimo $5 para crypto
            for sym in CRYPTO_WATCHLIST:
                if sym in open_symbols:
                    continue
                if len(positions) >= params["max_positions"]:
                    break
                df = get_bars(sym, params, is_crypto=True)
                if df is None or len(df) < params["ema_slow"]:
                    continue
                if evaluate_buy_signal(df, params):
                    log.info(f"🚀 COMPRA {sym} (crypto) — ${alloc:.2f}")
                    order = place_buy(sym, alloc, extended=False)
                    if order:
                        time.sleep(1)
                        positions = current_positions_dict()
                        open_symbols = set(positions.keys())
                        trailing_stops[sym] = float(order.filled_avg_price or 0)

    log.info(f"✅ Iteración {regime} completada.\n")


def status_report():
    """Reporte completo de estado."""
    acc = get_account()
    positions = get_positions()
    regime = get_market_regime()

    print(f"\n{'═' * 55}")
    print(f"  ⚡  CLEVERTRADER 24/7")
    print(f"  {'═' * 37}")
    print(f"  Régimen:      {regime.upper()}")
    print(f"  Cuenta:       {acc.id}")
    print(f"  Efectivo:     ${float(acc.cash):,.2f}")
    print(f"  Portfolio:    ${float(acc.portfolio_value):,.2f}")
    print(f"  Buying Power: ${float(acc.buying_power):,.2f}")
    print(f"{'─' * 55}")
    if positions:
        print(f"  Posiciones ({len(positions)}):")
        for p in positions:
            gain = (float(p.current_price) - float(p.avg_entry_price)) / float(p.avg_entry_price) * 100
            print(f"    {p.symbol:8s}  {float(p.qty):>6.2f}  "
                  f"${float(p.avg_entry_price):>8.2f} → ${float(p.current_price):>8.2f}  "
                  f"({gain:+.2f}%)")
    else:
        print(f"  Sin posiciones activas.")
    print(f"{'─' * 55}")
    print(f"  Parámetros activos:")
    p = PARAMS[regime]
    print(f"    Timeframe:     {p['tf']}")
    print(f"    Stop loss:     {p['trailing_stop']}% trailing")
    print(f"    Take profit:   {p['take_profit']}%")
    print(f"    Máx posiciones:{p['max_positions']}")
    print(f"    Asignación:    {p['alloc_per_trade']*100:.0f}% por trade")
    print(f"{'═' * 55}\n")


# ── Entry ────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CleverTrader 24/7 — Bot Alpaca")
    parser.add_argument("--loop", action="store_true", help="Loop infinito cada 5 min")
    parser.add_argument("--status", action="store_true", help="Mostrar estado de la cuenta")
    args = parser.parse_args()

    if args.status:
        status_report()
    elif args.loop:
        log.info("🔄 CleverTrader 24/7 iniciado — operando TODO el día, TODOS los días")
        log.info(f"   Hora actual ET: {datetime.now(EASTERN).strftime('%H:%M:%S')}")
        log.info(f"   Régimen: {get_market_regime().upper()}")
        while True:
            run_once()
            next_run = datetime.now(EASTERN) + timedelta(minutes=5)
            next_run = next_run.replace(second=0, microsecond=0)
            sleep_sec = max(1, (next_run - datetime.now(EASTERN)).total_seconds())
            log.info(f"💤 Próxima ejecución en {int(sleep_sec)}s ({next_run.strftime('%H:%M:%S')} ET)")
            time.sleep(sleep_sec)
    else:
        run_once()
