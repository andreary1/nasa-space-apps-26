# Contrato de Dados — Planetary Analog Finder

**Versão:** 1.0.0  
**Desafio:** NASA Space Apps Challenge 2026  
**Finalidade:** Padronização dos atributos morfométricos para cruzamento estatístico entre análogos terrestres e feições planetárias (Dunas em Marte e Crateras na Lua).

---

## 1. Esquema de Métricas para Crateras de Impacto (Terra ↔ Lua)

As métricas abaixo são extraídas de Modelos Digitais de Elevação (DEM) e catálogos altimétricos (LOLA/LROC para a Lua, Copernicus GLO-30 / SRTM para a Terra).

| Campo (JSON / Código) | Tipo | Unidade | Descrição Científica |
|---|---|---|---|
| `diametro_m` (`diameter_m`) | `float` | metros (m) | Diâmetro do círculo ajustado aos pontos de crista da borda da cratera. |
| `profundidade_m` (`depth_m`) | `float` | metros (m) | Diferença entre a elevação mediana da borda e o percentil 5 da elevação interna (piso). |
| `razao_dD` (`depth_diameter_ratio`) | `float` | adimensional | Razão profundidade/diâmetro ($d/D$). Indica o estágio de degradação e transição morfológica (simples vs. complexa). |
| `altura_borda_m` (`rim_height_m`) | `float` | metros (m) | Altura média da borda em relação ao terreno circundante a uma distância de $1.5$ a $2.0 \times R$. |
| `razao_borda_D` (`rim_height_diameter_ratio`) | `float` | adimensional | Altura da borda dividida pelo diâmetro ($h_{\text{rim}} / D$). |
| `borda_variacao_m` (`rim_variation_m`) | `float` | metros (m) | Desvio padrão da elevação da borda nas 72 direções radiais de amostragem. |
| `borda_raio_cv` (`rim_radius_cv`) | `float` | adimensional | Coeficiente de variação do raio da borda ($\sigma_R / \bar{R}$), medindo a assimetria ou irregularidade radial. |
| `declividade_parede_media` (`mean_wall_slope`) | `float` | graus (°) | Inclinação média da parede interna da cratera (medida entre $0.6$ e $0.95 \times R$). |
| `declividade_parede_p90` (`wall_slope_p90`) | `float` | graus (°) | Percentil 90 da inclinação da parede interna. |
| `circularidade` (`circularity`) | `float` | adimensional | Regularidade circular calculada por $4\pi A / P^2$ ($1.0$ = círculo geométrico perfeito). |
| `coerencia_borda` (`rim_coherence`) | `float` | $0.0 \dots 1.0$ | Fração das 72 direções radiais em que a borda observada se encontra topograficamente acima do piso e do entorno. |

---

## 2. Esquema de Métricas para Campos de Dunas (Terra ↔ Marte)

Métricas eólicas fundamentais baseadas em Bagnold (1941) e sensoriamento orbital HiRISE/CTX/Copernicus:

| Campo | Tipo | Unidade | Descrição |
|---|---|---|---|
| `altura_media` (`mean_height`) | `float` | metros (m) | Proeminência média das cristas em relação às depressões interdunares. |
| `altura_p90` (`height_p90`) | `float` | metros (m) | Percentil 90 das alturas das dunas. |
| `comprimento_onda` (`wavelength`) | `float` | metros (m) | Espaçamento dominante ($\lambda$) entre cristas vizinhas determinado por pico na FFT 2D. |
| `orientacao_azimute` (`crest_azimuth`) | `float` | graus ($0\dots 180^\circ$) | Azimute da orientação das cristas de duna. |
| `sentido_vento_provavel` | `float` | graus ($0\dots 360^\circ$) | Azimute médio para onde sopra o vento moldador. |
| `densidade_dunas` (`dune_density`) | `float` | cristas/$\text{km}^2$ | Número médio de cristas por quilômetro quadrado. |
| `espacamento_medio` (`mean_spacing`) | `float` | metros (m) | Distância média entre cristas consecutivas no sentido transversal ao vento. |
| `indice_aridez` (`aridity_index`) | `float` | adimensional | Razão $P/\text{ET}_0$ (climatologia NASA POWER / MERRA-2). |

---

## 3. Normalização e Escalonamento Físico de Bagnold

Para cruzar dados da Terra com Marte, o algoritmo compensa a menor gravidade marciana ($0.38g$) e a menor densidade atmosférica ($\approx 0.02\,\text{kg/m}^3$) através da relação de Bagnold para transporte eólico:

$$\beta = \sqrt{\frac{g_{\text{Marte}}}{g_{\text{Terra}}}} \cdot \sqrt{\frac{\rho_{\text{atm, Terra}}}{\rho_{\text{atm, Marte}}}} \approx 2.82$$

Para crateras na Lua, as feições geométricas são preservadas enquanto a inclinação de estabilidade é normalizada pelo ângulo de repouso gravitacional lunar ($0.165g$).

### Errata operacional — integração seletiva Felipe

O valor `2.82` na aproximação acima é inconsistente com as constantes do código:
`sqrt((3.721 / 9.807) / (0.020 / 1.225)) = 4.820752041935113`. O backend preserva
essa expressão, sem ajustar constantes para forçar 2,82. É uma hipótese herdada,
sem calibração empírica local, e pode ser desativada por `--no-scaling`.
Comprimentos marcianos são divididos por β; densidades areais compatíveis são
multiplicadas por β². Nenhuma correção de declividade lunar foi implementada:
o texto anterior é uma intenção metodológica, mas não fornece uma fórmula.

Ausências não equivalem a zero. Só atributos válidos dos dois lados entram no
par, com pesos renormalizados e cobertura mínima de 60% do peso total original.
Azimutes de cristas usam distância circular axial de período 180°. Aridez marciana
igual a zero é uma convenção preservada no catálogo bruto, excluída do score.
`densidade_dunas` exige definição/unidade comprovada de cristas/km² antes de ser
mapeada; tipo e padrão de distribuição são categóricos e não entram no vetor.

Essas regras se aplicam ao pipeline Python. A interface e seus serviços JS foram
preservados sem alterações nesta tarefa. Detalhes, fórmulas, proveniência,
diferenças numéricas e limitações em
[pipeline-integration-felipe.md](pipeline-integration-felipe.md).
