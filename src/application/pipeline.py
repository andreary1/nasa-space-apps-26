"""
src/application/pipeline.py
=============================
Script de Execução End-to-End do Pipeline de Matching Planetário.

Uso
---
    python -m src.application.pipeline [--root PATH] [--output PATH]

ou importando:
    from src.application.pipeline import run_pipeline
    report = run_pipeline()

Fluxo completo
--------------
1. AUDITORIA: Lê todos os rasters .tif e .hgt disponíveis
2. PROCESSAMENTO DUNAS: extrai features morfométricas dos sítios de dunas
3. PROCESSAMENTO CRATERAS: extrai features dos afloramentos e vulcânicos
4. MATCHING DUNAS: compara contra referências marcianas (MARS_DUNE_REFERENCES)
5. MATCHING CRATERAS: compara contra referências lunares (MOON_CRATER_REFERENCES)
6. RANKING: agrega, ranqueia e gera relatório JSON em data/processed/
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Setup de logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("pipeline")


def build_data_quality(
    dune_fvs, crater_fvs, crater_excluded, dune_skipped, crater_skipped, physical_scaling,
) -> dict:
    """Tudo que o leitor do relatório precisa saber sobre dados ausentes ou suspeitos."""
    import math
    from src.shared.constants import (
        CRATER_FEATURE_WEIGHTS, DUNE_FEATURE_WEIGHTS, MARS,
    )

    def block(fvs, weights):
        return [
            {
                "site_id": fv.site_id,
                "source": fv.source,
                "provenance": fv.provenance,
                "features_missing": fv.missing(weights),
                "issues": fv.issues,
                **({"crater_class": fv.crater_class, "confidence": fv.confidence}
                   if hasattr(fv, "crater_class") else {}),
            }
            for fv in fvs
        ]

    beta = math.sqrt(MARS["gravity_ratio"]) / math.sqrt(MARS["atm_density_ratio"])
    notes = [
        "Atributos de origem 'catalogo' foram calculados fora deste repositório "
        "(o script gerador não está nele) e não são reproduzíveis aqui.",
        "O índice de aridez (P/ET0) não é calculável de um DEM: vem sempre do catálogo "
        "(NASA POWER) e, se ausente, o atributo fica indisponível.",
        "Referências de Marte usam aridity_index = 0.0 por convenção "
        "(P/ET0 não é definido para Marte; assume-se hiperárido).",
        "Métricas de dunas calculadas de raster (método novo) foram validadas apenas com "
        "DEM sintético; ainda não há raster de dunas no repositório.",
        "Crateras: a normalização das declividades pela gravidade lunar NÃO está "
        "implementada (o contrato não define a fórmula); a geometria é preservada.",
    ]
    if physical_scaling:
        notes.append(
            f"Escalonamento de Bagnold aplicado a Marte com β = {beta:.2f} "
            "(comprimentos ÷ β; densidade × β²). O contrato cita β ≈ 2,82, mas a fórmula "
            "do próprio contrato com as constantes do projeto resulta em ≈ 4,82."
        )
    else:
        notes.append("Escalonamento físico DESLIGADO (--no-scaling).")

    return {
        "dunes": block(dune_fvs, DUNE_FEATURE_WEIGHTS),
        "craters": block(crater_fvs, CRATER_FEATURE_WEIGHTS),
        "craters_excluded": crater_excluded,
        "matches_without_score": {"dunes": dune_skipped, "craters": crater_skipped},
        "notes": notes,
    }


def _run_pipeline(
    root: str | Path = ".",
    output_dir: str | Path = "data/processed/comparisons",
    report_filename: str = "matching_report.json",
    physical_scaling: bool = True,
    verbose: bool = True,
) -> dict:
    """
    Executa o pipeline completo e retorna o relatório como dict.

    Parâmetros
    ----------
    root            : diretório raiz do projeto (onde estão sitios.json, data/, src/)
    output_dir      : pasta de saída para o relatório JSON
    report_filename : nome do arquivo de relatório
    physical_scaling: aplica normalização física de Bagnold (recomendado: True)
    verbose         : imprime sumário no console

    Retorna
    -------
    dict com o relatório completo de matching
    """
    root = Path(root).resolve()
    log.info(f"Raiz do projeto: {root}")

    # ------------------------------------------------------------------
    # ETAPA 1: Auditoria de rasters
    # ------------------------------------------------------------------
    log.info("=" * 60)
    log.info("ETAPA 1: Auditoria de Rasters")
    log.info("=" * 60)

    from src.processing.dunes.dune_processor import DuneProcessor
    from src.processing.craters.crater_processor import CraterProcessor

    dune_proc = DuneProcessor(
        raster_dir=root / "data" / "earth" / "dunes",
        sitios_json=root / "sitios.json",
    )
    # sitios.json manda; o sites.json completa o que faltar (ex.: as crateras de
    # impacto e o bloco "craters" com as métricas de cada sítio).
    crater_proc = CraterProcessor(
        raster_dir=root / "data" / "earth" / "craters",
        sitios_json=[root / "sitios.json", root / "data" / "earth" / "sites.json"],
    )

    audit_dunes = dune_proc.audit_rasters()
    audit_craters = crater_proc.audit_rasters()
    all_audit = audit_dunes + audit_craters

    # Auditoria adicional: TIFs na raiz
    root_tifs = list(root.glob("*.tif")) + list(root.glob("*.hgt"))
    from src.processing.shared.raster_io import audit_raster
    for f in root_tifs:
        try:
            meta = audit_raster(f)
            all_audit.append(meta)
            log.info(
                f"  {f.name}: {meta['width']}×{meta['height']} px | "
                f"res={meta['resolution_m']} | CRS={meta['crs']}"
            )
        except Exception as e:
            log.warning(f"  Falha ao auditar {f.name}: {e}")

    if not all_audit:
        log.warning("  Nenhum raster encontrado. Usando apenas sitios.json.")

    # ------------------------------------------------------------------
    # ETAPA 2: Processamento de Dunas
    # ------------------------------------------------------------------
    log.info("=" * 60)
    log.info("ETAPA 2: Processamento de Dunas Terrestres")
    log.info("=" * 60)

    dune_fvs = dune_proc.process_all()
    log.info(f"  Sítios de dunas processados: {len(dune_fvs)}")
    for fv in dune_fvs:
        faltam = fv.missing()
        log.info(
            f"  [{fv.site_id}] source={fv.source}  λ={fv.wavelength}  "
            f"atributos ausentes: {faltam if faltam else 'nenhum'}"
        )

    # ------------------------------------------------------------------
    # ETAPA 3: Processamento de Crateras
    # ------------------------------------------------------------------
    log.info("=" * 60)
    log.info("ETAPA 3: Processamento de Análogos de Crateras")
    log.info("=" * 60)

    crater_fvs = crater_proc.process_all()
    log.info(f"  Sítios análogos de crateras: {len(crater_fvs)}")
    for fv in crater_fvs:
        faltam = fv.missing()
        log.info(
            f"  [{fv.site_id}] source={fv.source}  classe={fv.crater_class} "
            f"confiança={fv.confidence}  ausentes: {faltam if faltam else 'nenhum'}"
        )
    for ex in crater_proc.excluded:
        log.warning(f"  [{ex['site_id']}] EXCLUÍDO da comparação: {ex['reason']}")

    # ------------------------------------------------------------------
    # ETAPA 4: Matching Dunas ↔ Marte
    # ------------------------------------------------------------------
    log.info("=" * 60)
    log.info("ETAPA 4: Matching Dunas (Terra ↔ Marte)")
    log.info("=" * 60)

    from src.matching.dunes.dune_matcher import DuneMatcher
    dune_matcher = DuneMatcher(physical_scaling=physical_scaling)
    dune_results = dune_matcher.run(dune_fvs)

    top_dunes = dune_matcher.top_matches(dune_results, n=3)
    for site_id, tops in top_dunes.items():
        for mr in tops:
            log.info(
                f"  {site_id:22} → {mr.planetary_ref_id:25} "
                f"score={mr.similarity_score:.4f} (rank {mr.rank})"
            )

    # ------------------------------------------------------------------
    # ETAPA 5: Matching Crateras ↔ Lua
    # ------------------------------------------------------------------
    log.info("=" * 60)
    log.info("ETAPA 5: Matching Crateras (Terra ↔ Lua)")
    log.info("=" * 60)

    from src.matching.craters.crater_matcher import CraterMatcher
    crater_matcher = CraterMatcher(physical_scaling=physical_scaling)
    crater_results = crater_matcher.run(crater_fvs)

    top_craters = crater_matcher.top_matches(crater_results, n=3)
    for site_id, tops in top_craters.items():
        for mr in tops:
            log.info(
                f"  {site_id:22} → {mr.planetary_ref_id:25} "
                f"score={mr.similarity_score:.4f} (rank {mr.rank})"
            )

    # ------------------------------------------------------------------
    # ETAPA 6: Relatório e Ranking
    # ------------------------------------------------------------------
    log.info("=" * 60)
    log.info("ETAPA 6: Geração do Relatório JSON")
    log.info("=" * 60)

    from src.matching.ranking.ranker import MatchingRanker
    ranker = MatchingRanker(output_dir=root / output_dir)

    data_quality = build_data_quality(
        dune_fvs, crater_fvs, crater_proc.excluded,
        dune_matcher.skipped, crater_matcher.skipped, physical_scaling,
    )
    report = ranker.generate_report(
        dune_results=dune_results,
        crater_results=crater_results,
        audit_meta=all_audit,
        earth_features_dunes=[fv.to_dict() for fv in dune_fvs],
        earth_features_craters=[fv.to_dict() for fv in crater_fvs],
        data_quality=data_quality,
    )

    out_path = ranker.save_report(report, filename=report_filename)
    log.info(f"  Relatório salvo: {out_path}")

    if verbose:
        ranker.print_summary(report)
        ranker.print_data_quality(report)

    return report


def run_pipeline(
    root: str | Path = ".",
    output_dir: str | Path = "data/processed/comparisons",
    report_filename: str = "matching_report.json",
    physical_scaling: bool = True,
    verbose: bool = True,
    log_file: str | Path | None = "auto",
) -> dict:
    """
    Executa o pipeline e grava um arquivo de log ao lado do relatório.

    log_file: "auto" (padrão) = <output_dir>/<nome do relatório>.log;
              caminho = esse arquivo; None = não grava log em arquivo.
    O log tem tudo que o logging emitiu (avisos de dados ausentes, sítios
    excluídos, pares sem score) e um resumo da qualidade dos dados no fim.
    """
    handler = None
    if log_file is not None:
        if log_file == "auto":
            log_file = Path(root).resolve() / output_dir / (Path(report_filename).stem + ".log")
        log_file = Path(log_file)
        log_file.parent.mkdir(parents=True, exist_ok=True)
        handler = logging.FileHandler(log_file, mode="w", encoding="utf-8")
        handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s — %(message)s", "%H:%M:%S"))
        logging.getLogger().addHandler(handler)
        log.info(f"Log desta execução: {log_file}")

    try:
        report = _run_pipeline(root, output_dir, report_filename, physical_scaling, verbose)
        dq = report.get("data_quality") or {}
        log.info("=" * 60)
        log.info("RESUMO DA QUALIDADE DOS DADOS")
        log.info("=" * 60)
        for kind in ("dunes", "craters"):
            for site in dq.get(kind, []):
                faltam = site["features_missing"]
                log.info(f"  [{kind}:{site['site_id']}] origem={site['source']}  ausentes={faltam if faltam else 'nenhum'}  avisos={len(site['issues'])}")
        for ex in dq.get("craters_excluded", []):
            log.warning(f"  [craters:{ex['site_id']}] EXCLUÍDO — {ex['reason']}")
        for kind, lst in (dq.get("matches_without_score") or {}).items():
            for sk in lst:
                log.warning(f"  [{kind}] sem score: {sk['earth_site_id']} × {sk['planetary_ref_id']} — {sk['reason']}")
        for note in dq.get("notes", []):
            log.info(f"  NOTA: {note}")
        return report
    finally:
        if handler is not None:
            logging.getLogger().removeHandler(handler)
            handler.close()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Pipeline de Matching Planetário — NASA Space Apps 2026"
    )
    parser.add_argument(
        "--root",
        default=".",
        help="Diretório raiz do projeto (default: '.')",
    )
    parser.add_argument(
        "--output",
        default="data/processed/comparisons",
        help="Diretório de saída do relatório JSON",
    )
    parser.add_argument(
        "--filename",
        default="matching_report.json",
        help="Nome do arquivo de relatório (default: matching_report.json)",
    )
    parser.add_argument(
        "--log",
        default="auto",
        help="Arquivo de log (default: <output>/<filename>.log; 'none' desativa)",
    )
    parser.add_argument(
        "--no-scaling",
        action="store_true",
        help="Desativa normalização física de Bagnold",
    )
    args = parser.parse_args()

    report = run_pipeline(
        root=args.root,
        output_dir=args.output,
        report_filename=args.filename,
        physical_scaling=not args.no_scaling,
        verbose=True,
        log_file=None if args.log == "none" else args.log,
    )

    n_dune = len(report["results"]["dunes_mars"]["site_summaries"])
    n_crater = len(report["results"]["craters_moon"]["site_summaries"])
    top1 = report["global_ranking"][0] if report["global_ranking"] else {}

    print(f"\n✓ Pipeline concluído: {n_dune} sítios de dunas, {n_crater} análogos de crateras")
    if top1:
        print(
            f"✓ Melhor match global: {top1['earth_site_id']} ↔ {top1['target_body']} "
            f"({top1['best_planetary_ref']}) score={top1['similarity_score']}"
        )
