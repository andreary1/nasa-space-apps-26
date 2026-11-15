# Relatórios com IA

Gera, para cada localidade de `deliverables/demo/js/data/sites.js`, uma análise com
resumo, semelhanças, diferenças, sugestões para a NASA, limitações e nível de confiança.
O resultado vai para `deliverables/demo/js/data/ai-reports.json`, que a página
**Relatórios** da demo lê. A chave de API fica só no `.env` local; o navegador nunca a vê.

## Configurar

1. Copie `.env.example` para `.env` na raiz do repositório.
2. Coloque sua chave em `AI_API_KEY`. Padrão: Gemini (`AI_PROVIDER=gemini`).
   Também funciona com `groq` e `openrouter` (formato OpenAI).

Requer Node 18 ou mais novo. Não há dependências para instalar.

## Gerar pelo botão da página (recomendado)

Dê duplo clique em **`iniciar-demo.bat`** na raiz do projeto (Windows). No Mac/Linux, use
`./iniciar-demo.sh`, ou `npm start` em qualquer sistema. O servidor sobe e o navegador abre
sozinho; para parar, feche a janela. Equivale a `node scripts/ai_reports/server.mjs --open`.

Na demo, vá em **Relatórios**, escolha a localidade e clique em
**Gerar relatório**. O servidor lê o `.env`, chama a IA, salva em `ai-reports.json` e
devolve o resultado para a página. Ele serve só a pasta da demo (nunca o `.env`) e
escuta apenas em `127.0.0.1`. Localidades cadastradas na sessão também podem ser
analisadas, mas o relatório delas não é salvo em arquivo.

Se a demo for aberta com `python -m http.server`, os relatórios salvos aparecem
normalmente, mas o botão fica desativado.

## Gerar em lote pela linha de comando (na raiz)

```bash
node scripts/ai_reports/generate_reports.mjs --dry-run --site lencois   # vê o que seria enviado
node scripts/ai_reports/generate_reports.mjs --site lencois             # gera uma localidade
node scripts/ai_reports/generate_reports.mjs                            # gera as que faltam
node scripts/ai_reports/generate_reports.mjs --force                    # refaz todas
node scripts/ai_reports/generate_reports.mjs --mock                     # exemplos sem IA, para testar o front
```

O arquivo é salvo a cada localidade, então uma falha no meio não perde o que já foi feito.
Depois, abra a demo (`python -m http.server 8000`) e vá em Relatórios.

## Como funciona

- Os dados enviados vêm do mesmo `buildComparison` da demo: melhor referência, score,
  cada métrica (Terra, referência original e escalada por Bagnold, diferença, peso),
  o contexto de `geographical-context.json` e as notas do catálogo, marcadas como não verificadas.
- `ai_client.mjs`: provedor, `.env`, chamada à API (limite de 90 s e `reasoning_effort=low`
  para o Gemini responder mais rápido). `reports_store.mjs`: geração e gravação do arquivo.
- `prompt.mjs` concentra o prompt, os tipos de sugestão permitidos e a validação.
  A validação remove métricas citadas que não existem e sugestões de tipos fora da lista.
- Se as métricas ou a melhor referência mudarem depois da geração, a página avisa que o
  relatório está desatualizado.

## Ao trocar os dados genéricos pelos completos

Atualize `sites.js` (e o contexto geográfico, se houver) e rode com `--force`.
Se surgirem métricas novas, inclua-as em `constants.js` (pesos e rótulos), e elas entram
no prompt automaticamente.
