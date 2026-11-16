@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale Node.js 20 ou superior e execute novamente.
  pause
  exit /b 1
)
echo Analise Inteligente usa o servidor local existente e Python com requirements.txt.
echo Configure ANALYSIS_PYTHON no .env se o comando py nao usar seu ambiente cientifico.
echo Fonte padrao: Copernicus GLO-30 publico, sem chave. IA: configuracao existente do .env.
echo Nenhum resultado ou percentual e simulado. Feche esta janela para parar.
node scripts\ai_reports\server.mjs --open
pause
