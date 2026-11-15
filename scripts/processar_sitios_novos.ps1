# Baixa o DEM dos sitios que so existiam no demo, cadastra no sitios.json,
# roda o pipeline e recria o demo.
#
# Uso (a partir de qualquer pasta):
#   powershell -ExecutionPolicy Bypass -File scripts\processar_sitios_novos.ps1
#
# A API key do OpenTopography vem de $env:OPENTOPOGRAPHY_API_KEY; se nao estiver
# definida, o script pergunta (a digitacao nao aparece na tela e a chave nao e gravada).

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
$env:PYTHONUTF8 = "1"

if (-not $env:OPENTOPOGRAPHY_API_KEY) {
    # chave gravada com setx (nivel usuario) que este terminal ainda nao enxerga
    $env:OPENTOPOGRAPHY_API_KEY = [Environment]::GetEnvironmentVariable("OPENTOPOGRAPHY_API_KEY", "User")
}
if (-not $env:OPENTOPOGRAPHY_API_KEY) {
    $sec = Read-Host "API key do OpenTopography (nao aparece na tela)" -AsSecureString
    $env:OPENTOPOGRAPHY_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

# id, nome, lat, lon, tipo, argumentos extras de tamanho
#   dunas: janela de 10 km; crateras: janela = 3 x diametro (minimo 6 km)
# Ficam de fora: vredefort e chicxulub (diametro de 160-180 km: a janela passaria do limite
# de 400 km e a de Chicxulub nem aparece no relevo, esta soterrada) e morro_chapeu
# (agrupa dois sitios que o catalogo ja classifica como sem cratera).
$sitios = @(
    @("erg_chebbi",   "Erg Chebbi (Sahara)",        "31.150",  "-3.983",   "dunas",   @("--lado-km", "10")),
    @("sossusvlei",   "Sossusvlei (Namib)",         "-24.727", "15.340",   "dunas",   @("--lado-km", "10")),
    @("rub_al_khali", "Rub al Khali",               "20.000",  "50.000",   "dunas",   @("--lado-km", "10")),
    @("white_sands",  "White Sands",                "32.780",  "-106.320", "dunas",   @("--lado-km", "10")),
    @("barringer",    "Barringer Meteor Crater",    "35.0275", "-111.0228","cratera", @("--diametro-km", "1.186")),
    @("pingualuit",   "Pingualuit Crater",          "61.278",  "-73.667",  "cratera", @("--diametro-km", "3.44")),
    @("lonar",        "Lonar Crater",               "19.976",  "76.508",   "cratera", @("--diametro-km", "1.83"))
)

$falhas = @()
foreach ($s in $sitios) {
    $id, $nome, $lat, $lon, $tipo, $extra = $s
    Write-Host "`n=== $id ===" -ForegroundColor Cyan
    python -m src.ingestion.earth.opentopography $lat $lon --id $id --nome $nome --tipo $tipo @extra
    if ($LASTEXITCODE -ne 0) { $falhas += $id }
}

Write-Host "`n=== pipeline ===" -ForegroundColor Cyan
python -m src.application.pipeline --filename matching_report_v2.json
if ($LASTEXITCODE -ne 0) { throw "pipeline falhou" }

Write-Host "`n=== demo ===" -ForegroundColor Cyan
python scripts\build_world_demo.py
if ($LASTEXITCODE -ne 0) { throw "build do demo falhou" }

if ($falhas.Count) { Write-Host "`nDownloads que falharam: $($falhas -join ', ')" -ForegroundColor Yellow }
Write-Host "`nPronto. Abra deliverables\demo\index.html" -ForegroundColor Green
