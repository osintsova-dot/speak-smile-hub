#!/bin/bash
# Двойной клик → запускает локальный сервер и открывает приложение в браузере.
# Через сервер (а не файл) работает офлайн-кэш и кнопка «Установить» (PWA).
cd "$(dirname "$0")"
PORT=8765
if ! curl -s "http://localhost:$PORT/index.html" >/dev/null 2>&1; then
  nohup python3 -m http.server "$PORT" >/dev/null 2>&1 &
  sleep 1
fi
open "http://localhost:$PORT/index.html"
