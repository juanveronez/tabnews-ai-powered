# Página inicial "em construção" — Design

> **Atualização:** a seção "Cena" e os arquivos `digging-scene.*` foram substituídos pelo design em `2026-11-11-isometric-clawd-scene-design.md` (cena isométrica com Clawds 3D). O restante deste spec continua valendo.

## Objetivo

Substituir o "Hello, World!" de `app/page.tsx` por uma página "em construção" que:

1. Mostra a frase: "Estamos nesse exato momento criando um espaço na internet para aprender junto com a IA".
2. Abaixo da frase, exibe uma animação do Clawd (mascote do Claude Code) cavando um buraco no chão, com uma placa de obras brasileira ao lado e um capacete de obra laranja.
3. Dispara uma animação de confetes caindo ao abrir a página, usando `react-confetti`.

## Fora de escopo

- Metadata/título da página, rotas novas, Tailwind ou qualquer outra ferramenta nova.
- Framework de testes (o projeto não tem e não vamos adicionar).
- Monitoramento de performance em produção (RUM); a análise é de laboratório.

## Abordagem

SVG inline em pixel art animado com CSS keyframes. O confete usa `react-confetti` (6.4.0, peer `react ^19`, compatível com o React 19.3.1 do projeto).

Descartadas: canvas com `requestAnimationFrame` (muito código para o mesmo resultado) e GIF/Lottie/vídeo (exigiria asset externo ou dependência nova).

## Arquivos

| Arquivo | Tipo | Responsabilidade |
| --- | --- | --- |
| `app/page.tsx` | Server Component | `<main>` com `<h1>` (frase exata), `<DiggingScene />` e `<ConfettiOnLoad />` |
| `app/layout.tsx` | Server Component | Passa a importar `./globals.css` |
| `app/globals.css` | CSS global | Reset mínimo, centralização, fundo |
| `app/components/confetti-on-load.tsx` | Client Component | Envolve o `react-confetti` |
| `app/components/digging-scene.tsx` | Componente | SVG da cena (Clawd, buraco, terra, placa) |
| `app/components/digging-scene.module.css` | CSS Module | Estilos da cena e keyframes |
| `package.json` / `package-lock.json` | Config | Nova dependência `react-confetti` |

Convenções do projeto: default exports, function components, 2 espaços, aspas duplas, ponto e vírgula, imports relativos.

## Confete (`ConfettiOnLoad`)

- Marcado com `"use client"`.
- Só renderiza depois do mount (estado `mounted` via `useEffect`), para evitar diferença de hidratação.
- Cerca de 300 peças com `recycle={false}`: caem uma única vez e o componente se desmonta em `onConfettiComplete`.
- Largura e altura acompanham a janela por um listener de `resize`.
- Canvas fixo cobrindo a viewport, com `pointer-events: none`.
- Com `prefers-reduced-motion: reduce`, não renderiza nada.

## Cena (`DiggingScene`)

SVG em pixel art (retângulos), com `role="img"` e `aria-label` descrevendo a cena em pt-BR.

- **Chão:** faixa de terra com um buraco escuro e uma pilha de terra ao lado.
- **Clawd:** corpo laranja, olhos quadrados, bracinhos e perninhas, segurando uma pá.
- **Capacete:** laranja mais saturado que o corpo, com faixa e contorno mais escuro, para não se confundir com o corpo.
- **Placa de obras brasileira:** losango laranja com borda preta e pictograma preto de operário cavando, num poste cinza ao lado do buraco.
- **Animação (loop infinito, ~1,6 s):** o Clawd abaixa e ergue a pá, a terra voa em arco do buraco para a pilha e o corpo balança levemente. O buraco não cresce, para o loop não ter reset visível.
- Os keyframes animam apenas `transform` e `opacity`, o que evita layout. Elementos filhos de SVG nem sempre são compostados pelo navegador, então o custo de paint por frame é checado no trace de performance.
- Com `prefers-reduced-motion: reduce`, a cena fica estática (animações desligadas via media query no CSS).

## Texto

Idioma pt-BR. A frase fica num `<h1>`, centralizada, com a cena logo abaixo.

## Verificação

Só reportar sucesso do que for de fato executado.

### Correção

- `npx tsc --noEmit`
- `npm run build`
- Abrir no navegador e conferir: frase, cena animada, confete caindo uma vez e sumindo.

### Performance (visão de um usuário real)

Medir sempre contra o build de produção (`npm run build && npm run start`), nunca contra o `next dev`: o dev é bem mais lento e não representa o que o visitante recebe. Ferramentas: Chrome DevTools (Lighthouse e performance trace) via o agente `chrome:browser`, sem dependências novas.

**Cenários**

1. **Mobile de entrada (referência):** viewport ~390×844, CPU 4× mais lenta e rede Slow 4G (perfil padrão do Lighthouse mobile). A página é a porta de entrada do site, então o pior caso realista pesa mais que o melhor.
2. **Desktop (comparação):** viewport ~1440×900, sem throttling.

Em ambos: carga fria (cache desabilitado) e uma segunda carga com cache.

**O que medir**

- **Web Vitals de laboratório:** FCP, LCP (esperado: o `<h1>`), CLS e TBT. A página não tem interação, então o TBT é o proxy do INP. Metas "boas": LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms.
- **Peso de JS:** bytes transferidos no carregamento inicial (runtime do Next + `react-confetti`) e em que momento o chunk do confete chega em relação ao LCP.
- **Custo da animação:** no trace com CPU 4× mais lenta, verificar FPS, long tasks e uso da main thread durante a queda do confete e depois dela. O loop do Clawd é infinito, então registrar o custo contínuo dele na main thread (style e paint) depois que o confete termina.
- **Estabilidade de layout:** o confete monta tarde (canvas fixo), então confirmar no trace que não gera layout shift.
- **Lighthouse:** reportar Performance, Accessibility (`aria-label`, contraste do `<h1>`) e Best Practices.

**Entrega:** relatório curto com os números de cada cenário, o que ficou fora da meta e por quê, e as correções aplicadas dentro do escopo. Exemplos de correção, só se a medição justificar: carregar o `react-confetti` por import dinâmico se ele pesar no carregamento inicial, ou reduzir `numberOfPieces` se o FPS cair no mobile com throttling.

**Limitação a declarar no relatório:** são dados de laboratório (dispositivo emulado), não dados de campo de usuários reais (RUM).

## Git

Branch `feat/under-construction-page`. Sem commit até o usuário pedir (regra do `AGENTS.md`), incluindo este spec.
