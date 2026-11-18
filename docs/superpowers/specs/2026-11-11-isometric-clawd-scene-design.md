# Cena isométrica com Clawds 3D — Design

Substitui a seção "Cena" e os arquivos `digging-scene.*` de `2026-11-11-under-construction-page-design.md`. O restante daquele spec (frase no `<h1>`, confete, estilos globais, verificação, git) continua valendo.

## Objetivo

Trocar a cena SVG 2D por um canteiro de obras **isométrico em 3D**, no estilo do vídeo de referência, em que os trabalhadores são versões 3D do Clawd. Deve ser performático, renderizado pelo navegador em tempo real e **não pode ser vídeo**.

## Referência de estilo

O vídeo `construcao-animation-gif-download-8714874.mp4` (14,4 s, 1500×1500) mostra um canteiro isométrico em ilustração vetorial chapada: guindaste-torre com lança que gira e caçamba pendurada, prédio em estrutura, escavadeira com braço articulado, trator, operários e fundo branco, com 2 ou 3 tons por objeto.

- O vídeo tem marca d'água da Iconscout, ou seja, é prévia de asset de banco de imagens. Serve **só como referência de estilo**: tudo é desenhado do zero, nada é copiado nem decalcado, e o `.mp4` não entra no repositório.
- A paleta da cena é própria, inspirada no vídeo (amarelo/laranja de obra, lavanda-cinza para concreto) e **não** amostrada dele.

## Escopo: cena enxuta

Dentro da cena:

- Laje de terra com faixa de grama e um **buraco**.
- **Clawd cavando** o buraco com uma pá; a terra voa em arco até uma pilha.
- **Placa brasileira de obras**: losango laranja com borda preta e o operário cavando (mesmo pictograma do SVG atual), num poste.
- **Guindaste**: mastro, cabine, lança, contra-lança, cabo e caçamba.
- **Prédio em estrutura** de 2 andares (lajes, pilares e paredes parciais).
- **Escavadeira** com esteiras, cabine, braço de 2 segmentos e caçamba.
- Mais 2 Clawds: um em pé com prancheta e outro sentado com notebook na laje, como no vídeo.
- Todos os Clawds usam **capacete de obra laranja**.

Fora da cena: trator, fumaça, cerca, mesa de projeto, luz e sombras reais, interatividade.

O `<h1>`, o confete, o fundo e os estilos globais não mudam.

## Abordagem: CSS 3D com caixas de DOM

Escolhida por não adicionar JavaScript nem dependência, vir no HTML inicial (sem hidratação) e animar via `transform` no compositor. O visual chapado em tons fixos dispensa luz real.

- **Projeção:** isométrica verdadeira, `transform: rotateX(54.7356deg) rotateZ(45deg)` com `transform-style: preserve-3d` num container com `aspect-ratio` fixo (sem layout shift). Com isso, o eixo x aponta para baixo-direita, o y para baixo-esquerda e o z para cima; as faces visíveis são topo, `+y` (esquerda) e `+x` (direita). Uma unidade CSS `--u` escala toda a cena de forma responsiva.
- **`Box`:** componente de servidor que recebe posição, tamanho e material e renderiza as **3 faces visíveis** (topo, esquerda, direita). Peças que giram além de ±45° em torno do eixo vertical ganham as outras faces.
- **Materiais:** cada material tem **3 tons explícitos** (topo, lado claro, lado escuro) numa paleta em TypeScript. Não há `color-mix` nem luz calculada.
- **`Clawd`:** componente com poses, em voxels de 0,6 unidade: corpo 8×4×5, braços 2×2 nas laterais, 4 pernas 1×3 centradas, olhos 1×2 escuros na face da frente e um boné de obra laranja (cúpula do tamanho do corpo, faixa clara no topo e pala só na frente), cor base `#D97757`.
- Tudo é Server Component: nenhum `"use client"`, nenhum JS novo para a cena.
- **Arquivos:** novos em `app/components/iso-scene/` (`box`, `clawd`, `crane`, `excavator`, `building`, `construction-sign`, `scene` e o CSS Module). O `page.tsx` passa a usar a nova cena. Os arquivos `digging-scene.*` são removidos quando a nova cena entrar. A versão SVG não foi commitada, então a remoção a apaga do working tree; se o usuário quiser guardá-la, salvamos uma cópia antes.

## Animação

- Só `transform` e `opacity`, sem JS. Ciclo-base de **12 s**; os demais períodos dividem 12 s para o loop fechar sem emenda.
- **Guindaste (12 s):** a lança gira cerca de ±30° em torno do mastro; o cabo e a caçamba acompanham e balançam levemente.
- **Escavadeira (6 s):** o braço oscila entre estendido e recolhido, com a caçamba articulada.
- **Clawd cavando (2,4 s):** tronco inclina, a pá desce ao buraco e sobe; 5 torrões (cubinhos) voam em arco até a pilha.
- **Clawd com prancheta (4 s):** balanço lento do corpo e do braço.
- **Clawd com notebook (ciclo de 0,6 s):** pequeno movimento dos braços digitando.
- Sem `will-change`: cada face já é uma camada composta numa subárvore `preserve-3d`; reavaliar só se a medição pedir.
- Com `prefers-reduced-motion: reduce`, todas as animações ficam desligadas e a cena fica numa pose estática.

## Acessibilidade

`role="img"` e `aria-label` em pt-BR descrevendo a cena (Clawds de capacete laranja trabalhando num canteiro, escavando um buraco, com guindaste e placa de obras).

## Critérios de aceite e escada de abordagens

Começamos pela abordagem 1. Sobe-se um degrau **se algum critério abaixo falhar** e não houver correção razoável dentro da abordagem:

| Critério | Como medir | Limite inicial (ajustável) |
| --- | --- | --- |
| Qualidade visual | Screenshots em vários instantes do ciclo e avaliação do usuário | O usuário aprova o resultado |
| Fluidez | Cadência de frames (rAF, sem trace) com CPU 4× no viewport mobile | p95 do intervalo ≤ 17 ms |
| Sem artefatos de profundidade | Inspeção visual em várias poses; teste do usuário no Safari e em celular real | Nenhuma peça visivelmente atrás/na frente do lugar errado |
| Peso | `document.querySelectorAll("*").length`, tamanho do HTML em gz | ≤ 800 elementos na cena; HTML +≤ 15 kB gz |
| JS | Bytes de JS transferidos na carga fria | Inalterado (150,8 kB na medição atual) |
| LCP e CLS | Cargas frias mobile (CPU 4×, Slow 4G), 5 execuções, com observers `buffered` | Mediana de LCP ≤ 1,35 s (atual: 1,23 s) e CLS 0 |

**Teste em celular real e no Safari é do usuário** e é o critério decisivo; o ambiente de medição só cobre Chrome emulado.

**Escada:**

1. **CSS 3D** (este spec).
2. **Canvas 2D com mini-engine isométrico próprio**, sem dependência, se houver travamento, artefatos de profundidade ou limitação visual do CSS.
3. **three.js + `@react-three/fiber`**, se o resultado exigir luz/sombra reais ou a 2 também falhar. **Exige aprovação explícita do usuário** para a dependência (regra do `AGENTS.md`) e carregamento tardio com pôster para não atrasar o LCP.

Cada degrau terá seu próprio spec curto antes de ser implementado.

## Verificação

- `npx tsc --noEmit` e `npm run build`.
- Conferência visual no Chrome com animações pausadas em vários instantes do ciclo (0, 3, 6 e 9 s), desktop e mobile, e com `prefers-reduced-motion`.
- Medições da tabela acima, com a mesma metodologia da análise anterior: build de produção, `PerformanceObserver` com `buffered`, e A/B com animações pausadas para qualquer número de trace. Relatar só o que foi medido; o que não der para medir (por exemplo, contagem de camadas de composição) é declarado como não medido.
- Servidores são iniciados pelo usuário no terminal dele (o ambiente não permite que eu abra portas).

## Git

Mesma branch `feat/under-construction-page`. Sem commit até o usuário pedir. O `.mp4` de referência não deve ser commitado.
