# planetary-analog-finder

Projeto para comparar dunas marcianas e crateras lunares com localidades terrestres.

## Organização

- `docs/`: desafio, pesquisa, metodologia e arquitetura.
- `data/earth/`: dados terrestres de dunas e crateras.
- `data/mars/dunes/`: dados de dunas marcianas.
- `data/moon/craters/`: dados de crateras lunares.
- `data/processed/`: dados processados e comparações.
- `src/ingestion/`: ingestão por corpo celeste.
- `src/processing/`: processamento de dunas, crateras e rotinas compartilhadas.
- `src/matching/`: comparação de feições e ordenação de resultados.
- `src/application/`: exploração, comparação e visualização.
- `src/shared/`: componentes compartilhados.
- `tests/`: testes de processamento, comparação e integração.
- `assets/`: imagens, mapas e identidade visual.
- `deliverables/`: apresentação, demonstração e submissão.

## Próximos passos

1. Documentar o desafio e as fontes de dados.
2. Definir o contrato de dados em `docs/methodology/data-contract.md`.
3. Implementar a ingestão, o processamento e os critérios de comparação.

O pipeline científico executável, seus contratos, testes e limitações estão
documentados em [Integração do pipeline Felipe](docs/methodology/pipeline-integration-felipe.md).
Use um Python compatível com as dependências de `requirements.txt` (validação em
Python 3.12). O frontend em `deliverables/demo/` permanece independente e não é
recriado pelo pipeline.

```powershell
python -m pip install -r requirements.txt
python -m src.application.pipeline --filename matching_report_v2.json
```
