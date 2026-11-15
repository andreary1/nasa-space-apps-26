@echo off
title Planetary Analog Finder - demo
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado. Instale em https://nodejs.org e tente de novo.
  pause
  exit /b 1
)

if not exist ".env" (
  echo Aviso: arquivo .env nao encontrado. A demo abre, mas o botao Gerar relatorio fica desativado.
  echo Copie .env.example para .env e coloque sua chave de API.
  echo.
)

echo Iniciando a demo... Feche esta janela para parar o servidor.
echo.
node scripts\ai_reports\server.mjs --open

echo.
echo O servidor parou.
pause
