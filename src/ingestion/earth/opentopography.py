"""
src/ingestion/earth/opentopography.py
=====================================
Baixa DEMs Copernicus GLO-30 (COP30) da API do OpenTopography e os salva
no formato esperado pelo restante do projeto:

    data/earth/dunes/<id>_dem.tif     (categoria campo_de_dunas)
    data/earth/craters/<id>_dem.tif   (demais categorias)

e mantém ``sitios.json`` em sincronia: todo local baixado fica cadastrado
lá (id, categoria, lat, lon, lado_km), que é o que os processadores usam
para ligar o raster ao sítio.

Chave da API: variável de ambiente OPENTOPOGRAPHY_API_KEY (ou pergunta no
terminal).

Uso (da raiz do projeto)
------------------------
    # Um local novo, só com as coordenadas (sul/oeste são negativos):
    python -m src.ingestion.earth.opentopography -19.1719 127.7956

    # Com mais controle:
    python -m src.ingestion.earth.opentopography -2.6 -43.0 --tipo dunas --id lencois --lado-km 10
    python -m src.ingestion.earth.opentopography 35.0275 -111.0228 --id barringer --diametro-km 1.186

    # Baixar o raster de todo sítio do sitios.json que ainda não tem um:
    python -m src.ingestion.earth.opentopography --todos
"""

from __future__ import annotations

import argparse
import getpass
import json
import logging
import math
import os
import re
import unicodedata
from datetime import datetime
from pathlib import Path

log = logging.getLogger(__name__)

URL_API = "https://portal.opentopography.org/API/globaldem"
TIPO_DEM = "COP30"

LADO_PADRAO_KM = 10
LADO_MAXIMO_KM = 400

# --tipo -> categoria gravada no sitios.json (as mesmas que os processadores leem)
TIPOS = {
    "dunas": "campo_de_dunas",
    "cratera": "crater",
    "afloramento": "afloramento",
    "vulcanico": "vulcanico",
}
TIPO_PADRAO = "cratera"

NOME_MANIFESTO = "manifesto_opentopography.json"


# ---------------------------------------------------------------------------
# Caminhos e catálogo
# ---------------------------------------------------------------------------

def raiz_do_projeto() -> Path:
    return Path(__file__).resolve().parents[3]


def pasta_destino(root: Path, categoria: str) -> Path:
    sub = "dunes" if categoria == "campo_de_dunas" else "craters"
    return root / "data" / "earth" / sub


def caminho_raster(root: Path, site: dict) -> Path:
    return pasta_destino(root, site["categoria"]) / f"{site['id']}_dem.tif"


def ler_catalogo(caminho: Path) -> dict:
    with open(caminho, encoding="utf-8") as fh:
        return json.load(fh)


def salvar_catalogo(caminho: Path, catalogo: dict) -> None:
    # CRLF e indent=2 preservam o formato original do arquivo.
    with open(caminho, "w", encoding="utf-8", newline="\r\n") as fh:
        json.dump(catalogo, fh, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Ids
# ---------------------------------------------------------------------------

def slug(texto: str) -> str:
    """'Lençóis Maranhenses' -> 'lencois_maranhenses'."""
    ascii_ = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "_", ascii_.lower()).strip("_")


def id_de_coordenadas(lat: float, lon: float) -> str:
    """(-19.1719, 127.7956) -> 'ponto_s19p1719_e127p7956'."""
    def parte(valor: float, pos: str, neg: str) -> str:
        return f"{neg if valor < 0 else pos}{abs(valor):.4f}".replace(".", "p")
    return f"ponto_{parte(lat, 'n', 's')}_{parte(lon, 'e', 'w')}"


# ---------------------------------------------------------------------------
# Geometria
# ---------------------------------------------------------------------------

def calcular_limites(lat: float, lon: float, lado_km: float) -> dict[str, float]:
    """Caixa quadrada (em km) de lado ``lado_km`` centrada em (lat, lon)."""
    validar_coordenadas(lat, lon, lado_km)
    meio = lado_km / 2
    meio_lat = meio / 111.32
    meio_lon = meio / (111.32 * math.cos(math.radians(lat)))
    limites = {
        "south": lat - meio_lat,
        "north": lat + meio_lat,
        "west": lon - meio_lon,
        "east": lon + meio_lon,
    }
    if limites['south'] < -90 or limites['north'] > 90 or limites['west'] < -180 or limites['east'] > 180:
        raise ValueError('a janela cruza um polo ou o antimeridiano; recorte em áreas separadas')
    return limites


# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------

def obter_api_key() -> str:
    chave = os.getenv("OPENTOPOGRAPHY_API_KEY") or getpass.getpass(
        "Digite sua API Key do OpenTopography: "
    )
    if not chave.strip():
        raise ValueError("A API Key não foi informada.")
    return chave.strip()


def baixar_dem(site: dict, destino: Path, api_key: str) -> dict:
    """Baixa o DEM do sítio, valida o GeoTIFF e o salva em ``destino``."""
    import requests
    import rasterio

    limites = calcular_limites(site["lat"], site["lon"], site["lado_km"])
    try:
        resposta = requests.get(
            URL_API,
            params={"demtype": TIPO_DEM, **limites, "outputFormat": "GTiff", "API_Key": api_key},
            timeout=300,
        )
        resposta.raise_for_status()
    except requests.RequestException as error:
        status = getattr(getattr(error, 'response', None), 'status_code', None)
        raise ValueError(f'OpenTopography: falha HTTP/rede (status={status}, tipo={type(error).__name__})') from None

    destino.parent.mkdir(parents=True, exist_ok=True)
    temporario = destino.with_suffix(".tmp")
    temporario.write_bytes(resposta.content)
    try:
        with rasterio.open(temporario) as img:
            import numpy as np
            from rasterio.warp import transform_bounds
            valid = img.read(1, masked=True).compressed()
            if img.crs is None or min(img.width, img.height) < 2 or not np.isfinite(valid).any():
                raise ValueError('GeoTIFF sem CRS, dimensão utilizável ou pixels válidos')
            west, south, east, north = transform_bounds(img.crs, 'EPSG:4326', *img.bounds)
            if not (west <= site['lon'] <= east and south <= site['lat'] <= north):
                raise ValueError('GeoTIFF não cobre as coordenadas do sítio solicitado')
            info = {
                "id": site["id"],
                "arquivo": str(destino),
                "produto": TIPO_DEM,
                "fonte_elevacao": "OpenTopography",
                "resolucao_graus": [abs(img.res[0]), abs(img.res[1])] if img.crs.is_geographic else None,
                "resolucao_crs": [abs(img.res[0]), abs(img.res[1])],
                "crs": str(img.crs),
                "largura_pixels": img.width,
                "altura_pixels": img.height,
                "limites": limites,
                "data_download": datetime.now().astimezone().isoformat(timespec="seconds"),
            }
    except Exception as erro:
        temporario.unlink(missing_ok=True)
        raise ValueError(f"A resposta para '{site['id']}' não é um GeoTIFF válido.") from erro

    temporario.replace(destino)
    return info


def atualizar_manifesto(root: Path, downloads: list[dict]) -> None:
    if not downloads:
        return
    caminho = root / "data" / "earth" / NOME_MANIFESTO
    caminho.parent.mkdir(parents=True, exist_ok=True)
    manifesto = json.loads(caminho.read_text(encoding="utf-8")) if caminho.exists() else {}
    for d in downloads:
        previous = manifesto.get(d['id'], {})
        manifesto[d["id"]] = {**previous, **d}
    caminho.write_text(
        json.dumps(manifesto, indent=2, ensure_ascii=False), encoding="utf-8"
    )


# ---------------------------------------------------------------------------
# Cadastro de um local novo
# ---------------------------------------------------------------------------

def validar_coordenadas(lat: float, lon: float, lado_km: float) -> None:
    if not -89 <= lat <= 89:
        raise ValueError("A latitude deve estar entre -89 e 89.")
    if not -180 <= lon <= 180:
        raise ValueError("A longitude deve estar entre -180 e 180.")
    if not 1 <= lado_km <= LADO_MAXIMO_KM:
        raise ValueError(f"O lado deve estar entre 1 e {LADO_MAXIMO_KM} km.")


def cadastrar_local(
    catalogo: dict,
    lat: float,
    lon: float,
    tipo: str = TIPO_PADRAO,
    id_: str | None = None,
    nome: str | None = None,
    lado_km: float | None = None,
    diametro_km: float | None = None,
) -> tuple[dict, bool]:
    """
    Garante que o local exista no catálogo. Retorna (sítio, criado_agora).
    Se o id já existe com as mesmas coordenadas, reaproveita a entrada;
    se existe com coordenadas diferentes, recusa (evita sobrescrever).
    """
    if lado_km is None:
        # Cratera: a caixa cobre 3 diâmetros (borda + entorno), no mínimo 6 km.
        lado_km = max(3 * diametro_km, 6) if diametro_km else LADO_PADRAO_KM
    if diametro_km is not None and (not math.isfinite(diametro_km) or diametro_km <= 0):
        raise ValueError('diâmetro deve ser positivo e finito')
    validar_coordenadas(lat, lon, lado_km)

    id_ = slug(id_) if id_ else id_de_coordenadas(lat, lon)
    if not id_:
        raise ValueError("O --id informado não tem nenhum caractere válido.")

    sitios = catalogo.setdefault("sitios", [])
    existente = next((s for s in sitios if s["id"] == id_), None)
    if existente:
        if abs(existente["lat"] - lat) > 1e-4 or abs(existente["lon"] - lon) > 1e-4:
            raise ValueError(
                f"O id '{id_}' já existe no sitios.json com outras coordenadas "
                f"({existente['lat']}, {existente['lon']}). Use outro --id."
            )
        return existente, False

    site = {
        "id": id_,
        "nome": nome or id_,
        "categoria": TIPOS[tipo],
        "lat": lat,
        "lon": lon,
        "lado_km": lado_km,
        "fonte_coord": "Coordenadas informadas pelo usuário (opentopography.py).",
        "precisao_coord": "informada_pelo_usuario",
    }
    if diametro_km:
        site["craters"] = {"diameter_m": round(diametro_km * 1000, 1)}
    sitios.append(site)
    return site, True


# ---------------------------------------------------------------------------
# Execução
# ---------------------------------------------------------------------------

def baixar_pendentes(root: Path, sites: list[dict], api_key: str) -> list[dict]:
    """Baixa o raster de cada sítio que ainda não o tem. Retorna os downloads feitos."""
    feitos = []
    for site in sites:
        destino = caminho_raster(root, site)
        if destino.exists():
            log.info(f"[JÁ EXISTE] {site['id']}")
            continue
        log.info(f"Baixando {site['id']} ({site['lado_km']} km)...")
        try:
            feitos.append(baixar_dem(site, destino, api_key))
            log.info(f"[SUCESSO] {destino}")
        except Exception as erro:
            log.error(f"[ERRO] {site['id']}: {erro}")
    return feitos


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Baixa DEMs COP30 (OpenTopography) para data/earth/ e cadastra no sitios.json."
    )
    parser.add_argument("latitude", nargs="?", type=float, help="graus decimais (sul é negativo)")
    parser.add_argument("longitude", nargs="?", type=float, help="graus decimais (oeste é negativo)")
    parser.add_argument("--todos", action="store_true",
                        help="baixa o raster de todo sítio do sitios.json que ainda não tem um")
    parser.add_argument("--tipo", choices=list(TIPOS), default=TIPO_PADRAO,
                        help=f"tipo do local (padrão: {TIPO_PADRAO})")
    parser.add_argument("--id", help="id do sítio (padrão: gerado das coordenadas)")
    parser.add_argument("--nome", help="nome legível (padrão: o id)")
    parser.add_argument("--lado-km", type=float,
                        help=f"lado da área em km (padrão: {LADO_PADRAO_KM}, ou 3x o diâmetro)")
    parser.add_argument("--diametro-km", type=float, help="diâmetro da cratera, em km")
    parser.add_argument("--root", default=None, help="raiz do projeto (padrão: detectada)")
    args = parser.parse_args(argv)

    if args.todos == (args.latitude is not None):
        parser.error("use --todos OU informe latitude e longitude.")
    if (args.latitude is None) != (args.longitude is None):
        parser.error("informe latitude e longitude juntas.")

    logging.basicConfig(level=logging.INFO, format="%(message)s")
    root = Path(args.root).resolve() if args.root else raiz_do_projeto()
    caminho_catalogo = root / "sitios.json"
    catalogo = ler_catalogo(caminho_catalogo)

    if args.todos:
        sites = catalogo.get("sitios", [])
        criado = False
    else:
        try:
            site, criado = cadastrar_local(
                catalogo, args.latitude, args.longitude, args.tipo, args.id,
                args.nome, args.lado_km, args.diametro_km,
            )
        except ValueError as erro:
            parser.error(str(erro))
        sites = [site]
        log.info(
            f"Local '{site['id']}' — tipo: {site['categoria']}, lado: {site['lado_km']} km"
            + ("" if criado else " (já cadastrado)")
        )

    api_key = obter_api_key()
    feitos = baixar_pendentes(root, sites, api_key)
    atualizar_manifesto(root, feitos)

    # Só grava o catálogo se o download deu certo para o local novo.
    if criado and any(d["id"] == sites[0]["id"] for d in feitos):
        salvar_catalogo(caminho_catalogo, catalogo)
        log.info("sitios.json atualizado.")
    elif criado:
        log.warning("Download falhou: o local NÃO foi adicionado ao sitios.json.")
        return 1
    return 0 if all(caminho_raster(root, site).exists() for site in sites) else 1


if __name__ == "__main__":
    raise SystemExit(main())
