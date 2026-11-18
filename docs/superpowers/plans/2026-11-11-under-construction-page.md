# Página inicial "em construção" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o "Hello, World!" por uma página "em construção" com a frase pedida, o Clawd cavando um buraco ao lado de uma placa de obras brasileira, e confetes caindo ao abrir a página.

**Architecture:** `app/page.tsx` continua Server Component e compõe dois componentes: `DiggingScene` (SVG em pixel art animado por CSS keyframes, sem JS) e `ConfettiOnLoad` (Client Component que envolve o `react-confetti`, renderiza só após o mount e se desmonta quando a queda termina). Estilos globais mínimos em `app/globals.css`, estilos da cena em um CSS Module.

**Tech Stack:** Next.js 16.2.12 (App Router), React 19.3.1, TypeScript, `react-confetti` 6.4.0, CSS puro.

**Spec:** `docs/superpowers/specs/2026-11-11-under-construction-page-design.md`

## Regras do projeto que alteram o fluxo padrão

- **Sem commits.** O `AGENTS.md` diz para só commitar quando o usuário pedir. Nenhuma tarefa abaixo commita. Trabalhe na branch `feat/under-construction-page` (já criada) e deixe as mudanças no working tree.
- **Sem testes automatizados.** O projeto não tem framework de testes e o spec decidiu não adicionar um (`AGENTS.md`: perguntar antes de adicionar ferramentas). A verificação é `npx tsc --noEmit`, `npm run build` e conferência visual no navegador, com relatório de performance no fim.
- **Só relate sucesso do que você executou** e mostrou a saída.
- Estilo: default exports, function components, 2 espaços, aspas duplas, ponto e vírgula, imports relativos. Texto de interface em pt-BR; código e identificadores em inglês.

## Estrutura de arquivos

| Arquivo | Ação | Responsabilidade |
| --- | --- | --- |
| `package.json`, `package-lock.json` | Modify | Nova dependência `react-confetti` |
| `app/components/confetti-on-load.tsx` | Create | Client Component: confete que cai uma vez e some |
| `app/components/digging-scene.module.css` | Create | Layout do SVG e keyframes da animação |
| `app/components/digging-scene.tsx` | Create | SVG da cena (chão, buraco, terra, Clawd, placa) |
| `app/globals.css` | Create | Reset mínimo, centralização, fundo, tipografia |
| `app/layout.tsx` | Modify | Importar `./globals.css` |
| `app/page.tsx` | Modify | Compor `<h1>`, `DiggingScene` e `ConfettiOnLoad` |

---

### Task 1: Instalar o `react-confetti`

**Files:**
- Modify: `package.json`, `package-lock.json`

O usuário pediu essa lib explicitamente, então a dependência nova está autorizada.

- [ ] **Step 1: Instalar**

Run: `npm install react-confetti`
Expected: termina sem erro, com uma linha como `added 2 packages` (`react-confetti` e a dependência `tween-functions`) e sem avisos de peer dependency (o peer da lib é `react ^16.3.0 || ^17.0.1 || ^18.0.0 || ^19.0.0`). O `npm audit` pode listar vulnerabilidades em `next`, `postcss` e `sharp`: elas já existiam e não vêm do `react-confetti`. **Não rode** `npm audit fix --force`, que subiria o Next para fora do escopo.

- [ ] **Step 2: Confirmar a versão registrada e que o lockfile ficou limpo**

Run: `grep -n "react-confetti" package.json && git diff --stat -- package-lock.json && grep '"resolved"' package-lock.json | grep -vc 'https://registry.npmjs.org/'`
Expected: `"react-confetti": "^6.4.0"` dentro de `dependencies`; o diff do `package-lock.json` só com adições (nenhuma linha removida); e a última contagem igual a `0`. Se o `npm install` gravou `resolved` com um mirror ou registry interna, ou removeu campos `libc` de entradas do `sharp`, restaure com `git checkout -- package-lock.json` e reaplique à mão só o `"react-confetti": "^6.4.0"` na raiz e as entradas `node_modules/react-confetti` e `node_modules/tween-functions`, com `resolved` em `https://registry.npmjs.org/...`. Valide com `npm ci --dry-run`.

- [ ] **Step 3: Confirmar que a prop usada na Task 2 existe nos tipos**

Run: `grep -n "onConfettiComplete" node_modules/react-confetti/dist/react-confetti.d.cts`
Expected: uma linha como `onConfettiComplete?: (confettiInstance?: Confetti) => void;`. O pacote entrega os tipos como `.d.cts`/`.d.mts`, então um grep com `--include=*.d.ts` dá falso negativo. Se não aparecer nada, **pare** e reporte: a Task 2 depende dessa prop.

---

### Task 2: Componente `ConfettiOnLoad`

**Files:**
- Create: `app/components/confetti-on-load.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

type Size = { width: number; height: number };

export default function ConfettiOnLoad() {
  const [size, setSize] = useState<Size | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    const updateSize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!size || done) {
    return null;
  }

  return (
    <Confetti
      width={size.width}
      height={size.height}
      numberOfPieces={300}
      recycle={false}
      onConfettiComplete={() => setDone(true)}
      style={{ position: "fixed", pointerEvents: "none" }}
    />
  );
}
```

Por que assim: `size` começa `null`, então o servidor e o primeiro render do cliente retornam `null` (sem diferença de hidratação). `recycle={false}` faz as peças caírem uma única vez, e `onConfettiComplete` desmonta o canvas ao terminar. Com `prefers-reduced-motion: reduce` o componente nunca renderiza o canvas.

- [ ] **Step 2: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem saída e exit code 0.

---

### Task 3: Componente `DiggingScene` (SVG + CSS Module)

**Files:**
- Create: `app/components/digging-scene.module.css`
- Create: `app/components/digging-scene.tsx`

Coordenadas do SVG (viewBox `0 0 240 120`, chão em `y=88`):

| Elemento | Posição |
| --- | --- |
| Clawd (corpo `24..56`, braços `16..64`, pés em `y=88`) | esquerda |
| Buraco | `x=76..116`, `y=88..106` |
| Pilha de terra | `x=124..164` |
| Placa de obras (poste em `x=202`, losango centrado em `(204,46)`) | direita |
| Ombro do Clawd (pivô da pá) | `(60,72)` |

- [ ] **Step 1: Criar o CSS Module**

```css
.scene {
  width: min(100%, 640px);
  height: auto;
}

/* Parte de cima do Clawd (corpo, chapéu e pá) agacha um pouco ao cavar. */
.worker {
  animation: lean 1.6s ease-in-out infinite;
}

/* A pá gira em torno do ombro do Clawd, em (60, 72) no viewBox. */
.shovel {
  transform-origin: 60px 72px;
  transform: rotate(20deg);
  animation: dig 1.6s ease-in-out infinite;
}

/* Torrões de terra: invisíveis por padrão, voam da pá até a pilha. */
.dirt {
  opacity: 0;
  animation: fling 1.6s ease-out infinite;
}

.dirtGroup > rect:nth-child(1) {
  --dx: 52px;
  --dy: 20px;
  animation-delay: 0s;
}

.dirtGroup > rect:nth-child(2) {
  --dx: 56px;
  --dy: 22px;
  animation-delay: 0.05s;
}

.dirtGroup > rect:nth-child(3) {
  --dx: 60px;
  --dy: 18px;
  animation-delay: 0.1s;
}

.dirtGroup > rect:nth-child(4) {
  --dx: 64px;
  --dy: 24px;
  animation-delay: 0.15s;
}

.dirtGroup > rect:nth-child(5) {
  --dx: 54px;
  --dy: 16px;
  animation-delay: 0.2s;
}

@keyframes lean {
  0%,
  100% {
    transform: translateY(0);
  }
  45%,
  60% {
    transform: translateY(2px);
  }
}

@keyframes dig {
  0%,
  100% {
    transform: rotate(-35deg);
  }
  45%,
  60% {
    transform: rotate(42deg);
  }
}

@keyframes fling {
  0% {
    opacity: 1;
    transform: translate(0, 0);
  }
  17% {
    transform: translate(
      calc(var(--dx) * 0.5),
      calc(var(--dy) * 0.5 - 18px)
    );
  }
  35% {
    opacity: 1;
    transform: translate(var(--dx), var(--dy));
  }
  36%,
  100% {
    opacity: 0;
    transform: translate(var(--dx), var(--dy));
  }
}

@media (prefers-reduced-motion: reduce) {
  .worker,
  .shovel,
  .dirt {
    animation: none;
  }
}
```

- [ ] **Step 2: Criar o componente**

```tsx
import styles from "./digging-scene.module.css";

const SOIL_DARK = "#7a4a21";
const SOIL_LIGHT = "#9a6a3a";
const CLAWD = "#D97757";
const INK = "#2b1a14";
const SIGN_INK = "#1a1a1a";
const CONSTRUCTION_ORANGE = "#FF8A00";

const DIRT_PARTICLES = [0, 1, 2, 3, 4];

export default function DiggingScene() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 240 120"
      role="img"
      aria-label="Animação do Clawd, mascote do Claude, usando um capacete de obra laranja e cavando um buraco no chão, ao lado de uma placa de obras."
    >
      <g shapeRendering="crispEdges">
        {/* Chão e buraco */}
        <rect x="0" y="88" width="240" height="32" fill={SOIL_DARK} />
        <rect x="0" y="88" width="240" height="3" fill="#6aa84f" />
        <rect x="76" y="88" width="40" height="18" fill="#1b0f06" />

        {/* Pilha de terra */}
        <rect x="124" y="80" width="40" height="8" fill="#8a5a2b" />
        <rect x="132" y="72" width="24" height="8" fill={SOIL_LIGHT} />
        <rect x="140" y="66" width="8" height="6" fill="#aa7a4a" />

        {/* Pernas do Clawd (fixas) */}
        <rect x="28" y="80" width="4" height="8" fill={CLAWD} />
        <rect x="36" y="80" width="4" height="8" fill={CLAWD} />
        <rect x="44" y="80" width="4" height="8" fill={CLAWD} />
        <rect x="52" y="80" width="4" height="8" fill={CLAWD} />

        {/* Parte de cima do Clawd: corpo, capacete e pá */}
        <g className={styles.worker}>
          <rect x="16" y="68" width="8" height="8" fill={CLAWD} />
          <rect x="56" y="68" width="8" height="8" fill={CLAWD} />
          <rect x="24" y="60" width="32" height="20" fill={CLAWD} />
          <rect x="32" y="66" width="4" height="8" fill={INK} />
          <rect x="44" y="66" width="4" height="8" fill={INK} />

          {/* Capacete de obra laranja */}
          <rect
            x="28"
            y="50"
            width="24"
            height="10"
            fill={CONSTRUCTION_ORANGE}
            stroke="#8a3f00"
            strokeWidth="1"
          />
          <rect x="38" y="50" width="4" height="10" fill="#FFC266" />
          <rect
            x="37"
            y="46"
            width="6"
            height="4"
            fill={CONSTRUCTION_ORANGE}
            stroke="#8a3f00"
            strokeWidth="1"
          />
          <rect
            x="22"
            y="58"
            width="36"
            height="4"
            fill="#E56F00"
            stroke="#8a3f00"
            strokeWidth="1"
          />

          {/* Pá, girando em torno do ombro */}
          <g className={styles.shovel}>
            <rect x="60" y="70" width="28" height="4" fill="#8b5a2b" />
            <rect
              x="88"
              y="67"
              width="10"
              height="10"
              fill="#9aa3ad"
              stroke="#5c646d"
              strokeWidth="1"
            />
          </g>
        </g>

        {/* Terra voando da pá até a pilha */}
        <g className={styles.dirtGroup}>
          {DIRT_PARTICLES.map((i) => (
            <rect
              key={i}
              className={styles.dirt}
              x="89"
              y="48"
              width="4"
              height="4"
              fill={i % 2 === 0 ? SOIL_DARK : SOIL_LIGHT}
            />
          ))}
        </g>
      </g>

      {/* Placa de obras brasileira: losango laranja, borda preta, operário cavando */}
      <rect x="202" y="72" width="4" height="16" fill="#8b949e" />
      <polygon points="204,20 230,46 204,72 178,46" fill={SIGN_INK} />
      <polygon points="204,24 226,46 204,68 182,46" fill={CONSTRUCTION_ORANGE} />
      <g stroke={SIGN_INK} strokeLinecap="round" fill="none">
        <circle cx="199" cy="36" r="3" fill={SIGN_INK} stroke="none" />
        <line x1="199" y1="40" x2="204" y2="50" strokeWidth="4" />
        <line x1="204" y1="50" x2="200" y2="59" strokeWidth="3" />
        <line x1="204" y1="50" x2="209" y2="58" strokeWidth="3" />
        <line x1="200" y1="42" x2="212" y2="48" strokeWidth="2.5" />
        <polygon points="212,47 216,49 214,53" fill={SIGN_INK} stroke="none" />
      </g>
    </svg>
  );
}
```

Observação: as pernas ficam fora do grupo `.worker` de propósito. Quando o corpo desce 2px, ele sobrepõe o topo das pernas em vez de afundar os pés no chão.

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem saída e exit code 0. Se acusar que não encontra o módulo `./digging-scene.module.css`, confirme que `next-env.d.ts` existe na raiz e importa `next/types/global`; se faltar, rode `npm run build` uma vez para regenerá-lo e repita.

---

### Task 4: Estilos globais, layout e página

**Files:**
- Create: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Criar `app/globals.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
}

body {
  background: #fdf6ec;
  color: #2b1a14;
  font-family:
    system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
    sans-serif;
}

main {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 2rem 1.25rem;
  text-align: center;
}

h1 {
  margin: 0;
  max-width: 28ch;
  font-size: clamp(1.5rem, 4.5vw, 2.5rem);
  line-height: 1.2;
}
```

Fonte do sistema de propósito: nenhum download de fonte, então não há troca de fonte que gere layout shift nem atrase o LCP (o `<h1>` é o candidato a LCP).

- [ ] **Step 2: Importar o CSS no layout**

Em `app/layout.tsx`, substitua o conteúdo inteiro por:

```tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Compor a página**

Em `app/page.tsx`, substitua o conteúdo inteiro por:

```tsx
import ConfettiOnLoad from "./components/confetti-on-load";
import DiggingScene from "./components/digging-scene";

export default function Page() {
  return (
    <main>
      <h1>
        Estamos nesse exato momento criando um espaço na internet para aprender
        junto com a IA
      </h1>
      <DiggingScene />
      <ConfettiOnLoad />
    </main>
  );
}
```

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem saída e exit code 0.

---

### Task 5: Build e conferência visual

**Files:** nenhum (só verificação)

- [ ] **Step 1: Build de produção**

Run: `npm run build`
Expected: termina com sucesso. A rota `/` aparece como estática (`○`) na tabela de rotas. Se o build falhar, leia o erro completo antes de mexer em qualquer coisa.

- [ ] **Step 2: Subir o servidor de desenvolvimento em background**

Run: `npm run dev` (em background)
Expected: log com `Local: http://localhost:3000` e sem erros.

- [ ] **Step 3: Abrir a página no Chrome e conferir (agente `chrome:browser`)**

Abra `http://localhost:3000` (viewport ~1440×900) e confirme cada item, com screenshots:

1. A frase aparece exatamente como: "Estamos nesse exato momento criando um espaço na internet para aprender junto com a IA".
2. Abaixo da frase há a cena: chão com buraco escuro, pilha de terra, Clawd laranja com capacete laranja mais vivo que o corpo, olhos escuros e pá.
3. A placa de obras (losango laranja com borda preta e operário cavando) está no poste à direita, e o pictograma é reconhecível. Se o pictograma ficar ilegível ou fora do losango, ajuste só as coordenadas das `line`/`circle`/`polygon` do pictograma em `digging-scene.tsx` até ficar legível.
4. A animação roda em loop: a pá desce no buraco, sobe e a terra voa em arco até a pilha, sem salto visível na emenda do loop.
5. O confete cai assim que a página abre, uma única vez, e o canvas some ao terminar. Confirme com `document.querySelector("canvas")`: deve ser `null` alguns segundos depois da queda.
6. O console não tem erros nem avisos de hidratação.
7. Redimensione para ~390×844 (mobile): o texto quebra bem, a cena não estoura a largura e o confete cobre a tela.
8. Emule `prefers-reduced-motion: reduce` e recarregue: a cena fica parada (pá em pose intermediária, sem terra voando) e não há canvas de confete.

- [ ] **Step 4: Encerrar o servidor de desenvolvimento**

Pare o processo em background iniciado no Step 2.

---

### Task 6: Análise de performance (visão de usuário real)

**Files:** nenhum (só medição; correções só se a medição justificar)

Medir **sempre contra o build de produção**, nunca contra o `next dev`. Ferramentas: Chrome DevTools (Lighthouse e performance trace) via o agente `chrome:browser`.

- [ ] **Step 1: Subir o build de produção em background**

Run: `npm run build && npm run start` (em background)
Expected: `Local: http://localhost:3000`.

- [ ] **Step 2: Cenário A, mobile de entrada (referência)**

No Chrome: viewport 390×844, CPU com throttling 4× e rede Slow 4G, cache desabilitado.

1. Rode um audit do Lighthouse em modo mobile e anote Performance, Accessibility, Best Practices, FCP, LCP, CLS e TBT.
2. Grave um performance trace de uma carga fria (com reload) e anote: LCP e seu elemento (esperado: o `<h1>`), layout shifts, long tasks, bytes de JS transferidos e quando o chunk do `react-confetti` chega em relação ao LCP.
3. Durante a queda do confete, anote o FPS e o uso da main thread. Depois que o confete termina, grave alguns segundos com só o loop do Clawd rodando e anote o custo contínuo de style e paint na main thread.
4. Repita a carga com cache habilitado e anote FCP e LCP.

- [ ] **Step 3: Cenário B, desktop (comparação)**

Viewport 1440×900, sem throttling. Repita os itens 1 a 4 do Step 2 em modo desktop.

- [ ] **Step 4: Comparar com as metas**

Metas "boas": LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms. O INP não é medido: a página não tem interação, e o TBT faz o papel de proxy.

- [ ] **Step 5: Corrigir só o que a medição justificar**

Aplique uma correção apenas se uma meta falhar ou se o trace mostrar um problema claro, e meça de novo depois. Opções, na ordem em que valem tentar:

1. O chunk do `react-confetti` atrasa o LCP ou pesa no JS inicial: carregá-lo por import dinâmico dentro de `ConfettiOnLoad` (por exemplo `const { default: Confetti } = await import("react-confetti")` em um estado, ou `React.lazy` com `Suspense`).
2. FPS baixo no mobile com throttling durante a queda: reduzir `numberOfPieces` (por exemplo, de 300 para 150).
3. Custo contínuo de paint do loop do Clawd alto: adicionar `will-change: transform` às classes `.worker`, `.shovel` e `.dirt`, e medir de novo.

Se nenhuma meta falhar, não altere código.

- [ ] **Step 6: Encerrar o servidor**

Pare o processo em background do Step 1.

- [ ] **Step 7: Escrever o relatório (na conversa, em pt-BR)**

Formato:

```
Performance, build de produção (dados de laboratório)

| Métrica | Mobile (4× CPU, Slow 4G) | Desktop |
| FCP | … | … |
| LCP (elemento) | … | … |
| CLS | … | … |
| TBT | … | … |
| JS transferido | … | … |
| Lighthouse (Perf / A11y / Best Practices) | … | … |

Confete: FPS e custo na main thread durante a queda: …
Loop do Clawd: custo contínuo de style/paint depois do confete: …
Fora da meta e por quê: …
Correções aplicadas (e medição depois): …
Limitação: dados de laboratório (dispositivo emulado), não dados de campo de usuários reais (RUM).
```

Preencha com os números realmente medidos. Se algum item não puder ser medido, diga qual e por quê, em vez de estimar.

---

### Task 7: Fechamento

**Files:** nenhum

- [ ] **Step 1: Conferir o working tree**

Run: `git status --short`
Expected: apenas estes itens, todos sem commit:

```
 M app/layout.tsx
 M app/page.tsx
 M package-lock.json
 M package.json
?? app/components/
?? app/globals.css
?? docs/
```

Se aparecer qualquer outro arquivo (por exemplo `.next`, `node_modules` ou `next-env.d.ts`), investigue o `.gitignore` antes de seguir.

- [ ] **Step 2: Reportar ao usuário**

Informe o que foi feito, o resultado da Task 5 (itens conferidos) e o relatório da Task 6. **Não commite.** Ofereça criar o commit quando o usuário pedir, sugerindo a mensagem:

```
feat: add under construction home page with digging Clawd and confetti
```

---

## Self-review

**Cobertura do spec**

- Frase exata no `<h1>`: Task 4, Step 3.
- Cena com Clawd, buraco, terra, capacete laranja e placa brasileira: Task 3.
- Animação em loop apenas com `transform`/`opacity`: Task 3, Step 1.
- Confete com `react-confetti`, uma queda, mount tardio, resize, canvas fixo sem interceptar cliques: Task 2.
- `prefers-reduced-motion` em cena e confete: Task 2 (JS) e Task 3 (CSS); conferido na Task 5, item 8.
- `aria-label` e `role="img"`: Task 3, Step 2.
- Verificação (`tsc`, `build`, navegador): Tasks 3 a 5.
- Análise de performance em build de produção, dois cenários, métricas, relatório e limitação: Task 6.
- Branch sem commit: cabeçalho do plano e Task 7.

**Consistência de nomes**: `ConfettiOnLoad`, `DiggingScene`, `styles.scene`, `styles.worker`, `styles.shovel`, `styles.dirt`, `styles.dirtGroup`, `lean`, `dig` e `fling` aparecem com os mesmos nomes no CSS e no TSX. O pivô `60px 72px` do CSS coincide com o ombro do SVG (braço direito em `x=56..64`, `y=68..76`).
