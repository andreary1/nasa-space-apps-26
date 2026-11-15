#!/usr/bin/env sh
# Mac/Linux: inicia a demo com geração de relatórios e abre o navegador.
cd "$(dirname "$0")" || exit 1
command -v node >/dev/null 2>&1 || { echo "Node.js não encontrado. Instale em https://nodejs.org"; exit 1; }
[ -f .env ] || echo "Aviso: .env não encontrado; o botão Gerar relatório fica desativado."
exec node scripts/ai_reports/server.mjs --open
