# Cena isométrica com Clawds 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a cena SVG 2D por um canteiro de obras isométrico em CSS 3D, em que os trabalhadores são Clawds 3D de capacete laranja, sem JavaScript novo e sem dependência.

**Architecture:** Server Components compõem a cena a partir de dois primitivos: `Box` (uma caixa com as 3 faces visíveis em 3 tons) e `Group` (um nó posicionado, usado para agrupar e para ser o pivô de animações). A posição de cada nó usa a propriedade individual `translate` e as animações CSS usam `transform`, então os dois não se sobrescrevem. A câmera é um único `rotateX(54.7356deg) rotateZ(45deg)` no container `world`, sem perspectiva.

**Tech Stack:** Next.js 16.2.12 (App Router), React 19.3.1, TypeScript, CSS Modules. Nenhuma dependência nova.

**Spec:** `docs/superpowers/specs/2026-11-11-isometric-clawd-scene-design.md`

## Regras do projeto que alteram o fluxo padrão

- **Sem commits.** O `AGENTS.md` diz para só commitar quando o usuário pedir. Nenhuma tarefa commita. A branch é `feat/under-construction-page`.
- **Sem framework de testes.** A verificação é `npx tsc --noEmit`, `npm run build`, conferência visual no Chrome e as medições do spec. Só relate sucesso do que você executou e mostrou.
- **Eu não consigo subir servidores** neste ambiente (`listen EPERM`). O usuário roda `npm run dev` / `npm run start` no terminal dele e avisa. Não proponha desligar o sandbox nem editar allowlists.
- **Navegador:** use o agente `chrome:browser`. Ele não tem shell, não grava em `/tmp`, e os screenshots ficam em `~/.claude/projects/.../tool-results/*.png` (abra com Read). `lighthouse_audit` está quebrado.
- **`curl`** só sem `--noproxy` (um hook bloqueia).
- **Código e identificadores em inglês; textos de interface em pt-BR.** Estilo: default exports (exceto componentes auxiliares nomeados abaixo), function components, 2 espaços, aspas duplas, ponto e vírgula, imports relativos.
- **Não apague** `app/components/digging-scene.*` até o usuário confirmar (a versão SVG nunca foi commitada). Deixe-os sem uso.
- **Não commite nem referencie** `construcao-animation-gif-download-8714874.mp4` (tem marca d'água de banco de imagens).

## Geometria (leia antes de codar)

Eixos do mundo, em "unidades" (`--u` px cada): **x** aponta para baixo-direita na tela, **y** para baixo-esquerda, **z** para cima. Objetos mais próximos da câmera têm x+y maior. Faces visíveis de uma caixa: **topo** (+z, mais clara), **left** = face +y (tom médio) e **right** = face +x (tom escuro).

Uma `Box` em `(x, y, z)` com tamanho `(w, d, h)` ocupa `x..x+w`, `y..y+d`, `z..z+h`.

Layout do chão 20×20 (superfície em z=0, espessura 3 abaixo):

| Elemento | Posição |
| --- | --- |
| Prédio | x 0,5..6,5, y 0,5..6,5, até z≈10,6 |
| Escavadeira (braço aponta para −x) | x 14..19, y 1,5..5,5 |
| Guindaste (mastro) | x 2,5..4,1, y 11,5..13,1; lança gira em torno de (3,3; 12,3) |
| Buraco | x 10..14, y 10..14, fundo em z=−2,5 |
| Clawd cavando (olha para +x) | x 6,6..9,5, y 5,9..13,1 |
| Pilha de terra | x 15,5..19,1, y 10,5..14,1 |
| Placa de obras | x 10,4..13,8, y 19..19,2 |
| Clawd com prancheta (olha para +y) | x 0,8..8,1, y 15,5..18,4 |
| Caixote + Clawd com notebook (sentado, olha para +y) | x 12,6..19,8, y 15..19,2 (caixote x 13,6..18,8, y 15..18,4) |

## Estrutura de arquivos

Todos em `app/components/iso-scene/`, exceto `page.tsx`.

| Arquivo | Ação | Responsabilidade |
| --- | --- | --- |
| `materials.ts` | Create | Paleta: cada material tem 3 tons (topo, left, right) |
| `box.tsx`, `box.module.css` | Create | `Box` e `Group`, as 3 faces e o posicionamento |
| `ground.tsx` | Create | Chão com buraco e pilha de terra |
| `flying-dirt.tsx`, `flying-dirt.module.css` | Create | 5 torrões que voam do buraco à pilha |
| `clawd.tsx`, `clawd.module.css` | Create | Clawd 3D com poses e ferramentas |
| `crane.tsx`, `crane.module.css` | Create | Guindaste com lança giratória e caçamba |
| `building.tsx` | Create | Prédio em estrutura de 2 andares |
| `excavator.tsx`, `excavator.module.css` | Create | Escavadeira com braço articulado |
| `construction-sign.tsx`, `construction-sign.module.css` | Create | Placa brasileira de obras |
| `scene.tsx`, `scene.module.css` | Create | Câmera, enquadramento e composição |
| `app/page.tsx` | Modify | Usar `IsoScene` no lugar de `DiggingScene` |

---

### Task 0: Pré-requisitos e linha de base

**Files:** nenhum

- [ ] **Step 1: Pedir ao usuário que troque o servidor de produção pelo de desenvolvimento**

Peça (e espere a confirmação): "Pare o servidor da porta 3000 (`Ctrl+C`) e rode `npm run dev` na pasta do projeto. Me avise quando estiver no ar." Durante as Tasks 1 a 9 o dev server dá recarga automática, então as edições aparecem sem rebuild.

- [ ] **Step 2: Confirmar que o servidor responde**

Run: `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/`
Expected: `200`. Se vier `502`, o servidor não está no ar: peça ao usuário de novo.

- [ ] **Step 3: Registrar a linha de base (já medida)**

Anote estes números, que as Tasks 4 e 10 vão comparar:

- HTML da versão SVG: 13.988 B, **3.206 B em gz** → limite do spec: ≤ ~18,5 kB gz (+15 kB).
- JS transferido na carga fria (produção, mobile): **150.843 B**; deve ficar inalterado.
- LCP mobile (CPU 4×, Slow 4G, 5 cargas frias): mediana **1.228 ms** → limite ≤ 1.350 ms. CLS 0.

---

### Task 1: Fundação (paleta, `Box` e `Group`)

**Files:**
- Create: `app/components/iso-scene/materials.ts`
- Create: `app/components/iso-scene/box.module.css`
- Create: `app/components/iso-scene/box.tsx`

- [ ] **Step 1: Criar a paleta**

`app/components/iso-scene/materials.ts`:

```ts
// One `background` per visible face (any CSS background, so patterns are
// allowed). Most materials are a single hue lit top > left (+y) > right (+x,
// the darkest); a few mix surfaces on purpose (GROUND, CLIPBOARD). The bottom
// tone is optional and falls back to the right tone.
export type Material = { top: string; left: string; right: string; bottom?: string };

const tone = (top: string, left: string, right: string): Material => ({
  top,
  left,
  right,
});

const lattice = (base: string) =>
  `repeating-linear-gradient(45deg, rgba(70, 52, 8, 0.55) 0 max(1px, calc(var(--u) * 0.08)), transparent max(1px, calc(var(--u) * 0.08)) calc(var(--u) * 0.6)), ${base}`;

const courses = (base: string) =>
  `repeating-linear-gradient(0deg, rgba(110, 112, 140, 0.5) 0 max(1px, calc(var(--u) * 0.05)), transparent max(1px, calc(var(--u) * 0.05)) calc(var(--u) * 0.35)), ${base}`;

export const CLAWD = tone("#E8906F", "#D97757", "#B85F42");

export const HAT = tone("#FFA733", "#FF8A00", "#D96E00");
export const HAT_BRIM = tone("#F08A12", "#E56F00", "#BF5A00");
export const HAT_STRIPE = tone("#FFD08A", "#FFC266", "#E0A24A");

export const GROUND = tone("#7CC15A", "#8A5A2B", "#6F4620");
export const PIT = tone("#2A170A", "#1B0F06", "#1B0F06");
export const SOIL = tone("#B0814B", "#9A6A3A", "#7A4A21");

export const CONCRETE = tone("#F1F2FA", "#DADBE9", "#C0C2D8");
export const CONCRETE_DARK = tone("#C9CBDD", "#B3B5CC", "#9A9CB6");
export const BRICK = tone(
  "#E6E7F2",
  courses("#D2D3E4"),
  courses("#B9BBD2"),
);

export const CRANE = tone("#FFD966", "#F5C23A", "#D9A21F");
export const CRANE_LATTICE = tone(
  lattice("#FFD966"),
  lattice("#F5C23A"),
  lattice("#D9A21F"),
);
export const MACHINE_ORANGE = tone("#FFB44D", "#F0952A", "#C77A1C");

export const DARK = tone("#55565E", "#3B3C42", "#2A2B30");
export const GLASS = tone("#B4E1F5", "#8CC4E0", "#6AA6C6");
export const STEEL = tone("#C7CDD5", "#9AA3AD", "#7C858F");
export const WOOD = tone("#B98A55", "#8B5A2B", "#6E451F");
export const CLIPBOARD = tone("#A47441", "#F4F1E8", "#8B5A2B");
export const POST = tone("#B4BBC4", "#9AA3AD", "#7C858F");
export const CLEAR = tone("transparent", "transparent", "transparent");
```

- [ ] **Step 2: Criar o CSS das caixas**

`app/components/iso-scene/box.module.css`:

```css
/* A positioned node. Its position uses the individual `translate` property so
   that animations can freely use `transform` (pivoting around the node). */
.node {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  translate: calc(var(--x) * var(--u)) calc(var(--y) * var(--u))
    calc(var(--z) * var(--u));
}

.top,
.left,
.right,
.bottom {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  transform-origin: 0 0;
}

/* Plane z = h. */
.top {
  width: calc(var(--w) * var(--u));
  height: calc(var(--d) * var(--u));
  transform: translateZ(calc(var(--h) * var(--u)));
}

/* Plane y = d, the face that looks toward +y. */
.left {
  width: calc(var(--w) * var(--u));
  height: calc(var(--h) * var(--u));
  transform: translate3d(0, calc(var(--d) * var(--u)), calc(var(--h) * var(--u)))
    rotateX(-90deg);
}

/* Plane x = w, the face that looks toward +x. Its u axis runs from y = d down
   to y = 0, so the front of the div faces +x and its content is not mirrored. */
.right {
  width: calc(var(--d) * var(--u));
  height: calc(var(--h) * var(--u));
  transform: translate3d(
      calc(var(--w) * var(--u)),
      calc(var(--d) * var(--u)),
      calc(var(--h) * var(--u))
    )
    rotateZ(-90deg) rotateX(-90deg);
}

/* Plane z = 0, the face that looks down. Only parts that tilt far enough for it
   to face the camera need it (more than 45 degrees about the y axis). */
.bottom {
  width: calc(var(--w) * var(--u));
  height: calc(var(--d) * var(--u));
  transform: translate3d(0, calc(var(--d) * var(--u)), 0) rotateX(180deg);
}
```

- [ ] **Step 3: Criar `Box` e `Group`**

`app/components/iso-scene/box.tsx`:

```tsx
import type { CSSProperties, ReactNode } from "react";
import type { Material } from "./materials";
import styles from "./box.module.css";

export type Face = "top" | "left" | "right" | "bottom";

const ALL_FACES: readonly Face[] = ["top", "left", "right"];

// Keeps the generated inline styles short and free of float noise.
export const round = (value: number) => Math.round(value * 1000) / 1000;

type NodeProps = {
  x?: number;
  y?: number;
  z?: number;
  className?: string;
  children?: ReactNode;
};

function nodeClass(className?: string) {
  return className ? `${styles.node} ${className}` : styles.node;
}

// An empty positioned node: groups parts, moves them together, or acts as the
// pivot of an animation (the node origin is the transform origin).
export function Group({ x = 0, y = 0, z = 0, className, children }: NodeProps) {
  const style = {
    "--x": round(x),
    "--y": round(y),
    "--z": round(z),
  } as CSSProperties;

  return (
    <div className={nodeClass(className)} style={style}>
      {children}
    </div>
  );
}

type BoxProps = NodeProps & {
  w: number; // size along x
  d: number; // size along y
  h: number; // size along z
  material: Material;
  faces?: readonly Face[];
  faceClassName?: Partial<Record<Face, string>>;
  faceChildren?: Partial<Record<Face, ReactNode>>;
};

// A box with its origin at the corner closest to the world origin. By default
// only the three faces that the isometric camera can see are rendered; parts
// that tilt far enough pass `faces` with "bottom" (it falls back to the right
// tone). Face backgrounds are inline styles, so they win over any
// `faceClassName`.
export default function Box({
  x = 0,
  y = 0,
  z = 0,
  w,
  d,
  h,
  material,
  faces = ALL_FACES,
  faceClassName,
  faceChildren,
  className,
  children,
}: BoxProps) {
  const style = {
    "--x": round(x),
    "--y": round(y),
    "--z": round(z),
    "--w": round(w),
    "--d": round(d),
    "--h": round(h),
  } as CSSProperties;

  return (
    <div className={nodeClass(className)} style={style}>
      {faces.map((face) => {
        const background =
          face === "bottom" ? (material.bottom ?? material.right) : material[face];

        return (
          <i
            key={face}
            className={
              faceClassName?.[face]
                ? `${styles[face]} ${faceClassName[face]}`
                : styles[face]
            }
            style={{ background }}
          >
            {faceChildren?.[face]}
          </i>
        );
      })}
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: sem erros e `exit: 0`.

---

### Task 2: Câmera, chão com buraco e pilha (primeiro teste visual)

**Files:**
- Create: `app/components/iso-scene/ground.tsx`
- Create: `app/components/iso-scene/scene.module.css`
- Create: `app/components/iso-scene/scene.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Criar o chão, o buraco e a pilha**

`app/components/iso-scene/ground.tsx`:

```tsx
import Box from "./box";
import { GROUND, PIT, SOIL } from "./materials";

// The ground is 20x20 and 3 thick (z from -3 to 0), with a 4x4 hole at x 10..14,
// y 10..14.
//
// - Four boxes around the hole draw the top surface and the hole's west wall.
//   The hole's north wall is its own narrow box that spans only the hole: a
//   hidden face edge that ends on an outer face of the slab shows up there as
//   a light line.
// - The side strips overlap the long strips by 0.2 (more than one screen
//   pixel), which hides the anti-aliasing seam between neighbouring coplanar
//   tops.
// - The two outer faces of the slab are drawn once by a single "skirt" box. It
//   comes first on purpose, and `Ground` should stay the first child of the
//   world: the browser's depth sorting can split a big face along the plane of
//   another face, which leaves a hairline seam, and drawing it first makes
//   that less likely.
export function Ground() {
  return (
    <>
      {/* skirt: the slab's outer faces */}
      <Box
        x={0}
        y={0}
        z={-3}
        w={20}
        d={20}
        h={3}
        material={GROUND}
        faces={["left", "right"]}
      />
      {/* north strip */}
      <Box
        x={0}
        y={0}
        z={-3}
        w={20}
        d={10}
        h={3}
        material={GROUND}
        faces={["top"]}
      />
      {/* south strip */}
      <Box
        x={0}
        y={14}
        z={-3}
        w={20}
        d={6}
        h={3}
        material={GROUND}
        faces={["top"]}
      />
      {/* west strip, also the hole's west wall */}
      <Box
        x={0}
        y={9.8}
        z={-3}
        w={10}
        d={4.4}
        h={3}
        material={GROUND}
        faces={["top", "right"]}
      />
      {/* east strip */}
      <Box
        x={14}
        y={9.8}
        z={-3}
        w={6}
        d={4.4}
        h={3}
        material={GROUND}
        faces={["top"]}
      />
      {/* the hole's north wall */}
      <Box
        x={10}
        y={9}
        z={-3}
        w={4}
        d={1}
        h={3}
        material={GROUND}
        faces={["left"]}
      />
      {/* hole floor */}
      <Box
        x={10}
        y={10}
        z={-3}
        w={4}
        d={4}
        h={0.5}
        material={PIT}
        faces={["top"]}
      />
    </>
  );
}

// Where the dug-out soil lands. Its peak is at z = 3.
export function DirtPile() {
  return (
    <>
      <Box x={15.5} y={10.5} z={0} w={3.6} d={3.6} h={1} material={SOIL} />
      <Box x={16.1} y={11.1} z={1} w={2.4} d={2.4} h={1} material={SOIL} />
      <Box x={16.7} y={11.7} z={2} w={1.2} d={1.2} h={1} material={SOIL} />
    </>
  );
}
```

- [ ] **Step 2: Criar o CSS da cena**

`app/components/iso-scene/scene.module.css`:

```css
.scene {
  container-type: inline-size;
  position: relative;
  width: min(100%, 760px);
  aspect-ratio: 40 / 33;
  pointer-events: none;
}

/* One unit is 1/40 of the scene width. */
.stage {
  position: absolute;
  inset: 0;
  --u: calc(min(100vw - 2.5rem, 760px) / 40);
}

@supports (width: 1cqw) {
  .stage {
    --u: calc(100cqw / 40);
  }
}

/* True isometric camera, no perspective: x runs to the lower right, y to the
   lower left and z up. The world origin is the back corner of the ground. */
.world {
  position: absolute;
  left: 50%;
  top: calc(var(--u) * 13);
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  transform: rotateX(54.7356deg) rotateZ(45deg);
}

@media (prefers-reduced-motion: reduce) {
  .scene *,
  .scene *::before,
  .scene *::after {
    animation: none !important;
  }
}
```

- [ ] **Step 3: Criar a cena (versão inicial)**

`app/components/iso-scene/scene.tsx`:

```tsx
import { DirtPile, Ground } from "./ground";
import styles from "./scene.module.css";

export default function IsoScene() {
  return (
    <div
      className={styles.scene}
      role="img"
      aria-label="Cena isométrica em 3D de um canteiro de obras."
    >
      <div className={styles.stage}>
        <div className={styles.world}>
          <Ground />
          <DirtPile />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Usar a nova cena na página**

Em `app/page.tsx`, substitua o conteúdo inteiro por:

```tsx
import ConfettiOnLoad from "./components/confetti-on-load";
import IsoScene from "./components/iso-scene/scene";

export default function Page() {
  return (
    <main>
      <h1>
        Estamos nesse exato momento criando um espaço na internet para aprender
        junto com a IA
      </h1>
      <IsoScene />
      <ConfettiOnLoad />
    </main>
  );
}
```

- [ ] **Step 5: Checar tipos**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: sem erros e `exit: 0`.

- [ ] **Step 6: Conferência visual 1 (agente `chrome:browser`)**

Peça ao agente (mesmas regras: sem modificar arquivos, sem processos, sem servidores) para abrir `http://localhost:3000` em 1440×900, tirar um screenshot e reportar com as próprias palavras. Depois abra o PNG com Read e confira você mesmo:

1. A laje é um losango com a ponta de trás para cima; a face de cima é verde, a face esquerda (de baixo-esquerda) é marrom média e a direita é marrom mais escura.
2. O buraco é um recorte escuro no centro, com as paredes internas visíveis (as duas do fundo, em marrom) e o fundo bem escuro.
3. A pilha de terra de 3 degraus fica à direita do buraco, sobre a grama.
4. A cena inteira cabe no enquadramento: nada cortado, e há espaço livre acima para o guindaste (que vem depois).
5. **Sem fios claros ou frestas** entre faces vizinhas nas arestas. Se houver, pare e mostre o screenshot ao usuário antes de seguir: a decisão sobre como tratar frestas é dele.
6. Console sem erros.

Se a cena estiver deslocada ou cortada, ajuste só `top: calc(var(--u) * 13)` (posição vertical) e o `aspect-ratio: 40 / 33` em `scene.module.css`, e confira de novo.

---

### Task 3: Clawd 3D estático (com a pá)

**Files:**
- Create: `app/components/iso-scene/clawd.module.css`
- Create: `app/components/iso-scene/clawd.tsx`
- Modify: `app/components/iso-scene/scene.tsx`

- [ ] **Step 1: Criar o CSS do Clawd (por enquanto, só os olhos e as poses estáticas)**

`app/components/iso-scene/clawd.module.css`:

```css
/* Eye decals live inside the body's front face, so they add no 3D layers. */
.eye {
  position: absolute;
  left: calc(var(--el) * var(--u));
  top: calc(var(--et) * var(--u));
  width: calc(var(--ew) * var(--u));
  height: calc(var(--eh) * var(--u));
  background: #2b1a14;
}

/* Resting poses; the animations are added in the next task. */
.torsoDig {
  transform: rotateY(4deg);
}

.shovelSwing {
  transform: rotateY(20deg);
}

.torsoClipboard {
  transform: rotateX(-1deg);
}
```

- [ ] **Step 2: Criar o componente `Clawd`**

`app/components/iso-scene/clawd.tsx`:

```tsx
import type { CSSProperties } from "react";
import Box, { Group, round } from "./box";
import {
  CLAWD,
  CLIPBOARD,
  DARK,
  HAT,
  HAT_BRIM,
  HAT_STRIPE,
  STEEL,
  WOOD,
} from "./materials";
import styles from "./clawd.module.css";

// Clawd is built from voxels. One voxel is 0.6 world units.
const S = 0.6;

type Pose = "stand" | "sit";
type Tool = "shovel" | "clipboard" | "laptop";

// The tool depends on the facing: the shovel swings along x; the clipboard and the laptop face +y.
type ClawdProps = {
  x: number;
  y: number;
  z?: number;
  pose?: Pose;
} & (
  | { facing: "x"; tool?: "shovel" }
  | { facing: "y"; tool?: "clipboard" | "laptop" }
);

// Hip pivot that the torso group moves around, in voxels (a: side to side,
// b: forward). The height of the pivot is `base`, the bottom of the body.
const PIVOT_A = 4;
const PIVOT_B = 2;

const LEG_A = [0.5, 2.5, 4.5, 6.5];

const TORSO_CLASS: Partial<Record<Tool, string>> = {
  shovel: styles.torsoDig,
  clipboard: styles.torsoClipboard,
};

export default function Clawd({
  x,
  y,
  z = 0,
  facing,
  pose = "stand",
  tool,
}: ClawdProps) {
  // Height of the bottom of the body, in voxels: standing legs are 3 tall; when
  // sitting, the body rests on the seat and only the thighs stick out in front.
  const base = pose === "sit" ? 0 : 3;

  // Clawd's own axes, in voxels: a is side to side, b is forward and c is up.
  // This maps a box in those axes to world axes for the facing direction.
  const part = (
    a0: number,
    a1: number,
    b0: number,
    b1: number,
    c0: number,
    c1: number,
  ) => {
    const side = (a1 - a0) * S;
    const depth = (b1 - b0) * S;
    const h = (c1 - c0) * S;

    return facing === "x"
      ? { x: b0 * S, y: a0 * S, z: c0 * S, w: depth, d: side, h }
      : { x: a0 * S, y: b0 * S, z: c0 * S, w: side, d: depth, h };
  };

  // Same, but relative to the hip pivot of the torso group.
  const torso = (
    a0: number,
    a1: number,
    b0: number,
    b1: number,
    c0: number,
    c1: number,
  ) =>
    part(
      a0 - PIVOT_A,
      a1 - PIVOT_A,
      b0 - PIVOT_B,
      b1 - PIVOT_B,
      c0 - base,
      c1 - base,
    );

  const pivot = part(PIVOT_A, PIVOT_A, PIVOT_B, PIVOT_B, base, base);
  const shoulder = torso(9, 9, PIVOT_B, PIVOT_B, base + 2, base + 2);

  // Decal positions are face-local: u runs to the viewer's right. On the front
  // face for facing "y" (the `left` face) u equals a, but on the `right` face
  // (facing "x") it runs the other way (u = 8 - a - width), so only decals that
  // are symmetric across the face are safe to place with plain `a` values.
  const eye = (u: number) =>
    ({
      "--el": round(u * S),
      "--et": round(1.5 * S),
      "--ew": round(S),
      "--eh": round(2 * S),
    }) as CSSProperties;

  const eyes = (
    <>
      <b className={styles.eye} style={eye(2)} />
      <b className={styles.eye} style={eye(5)} />
    </>
  );

  return (
    <Group x={x} y={y} z={z}>
      {/* standing legs hide their top under the body; seated legs start at the
          body front, where the thighs stick out */}
      {LEG_A.map((a) => (
        <Box
          key={a}
          {...(pose === "sit"
            ? part(a, a + 1, 4, 6, 0, 1)
            : part(a, a + 1, 1, 3, 0, 3))}
          material={CLAWD}
          faces={pose === "sit" ? undefined : ["left", "right"]}
        />
      ))}

      <Group
        x={pivot.x}
        y={pivot.y}
        z={pivot.z}
        className={tool ? TORSO_CLASS[tool] : undefined}
      >
        {/* arms; with the laptop they take turns lifting, as if typing */}
        <Box
          {...torso(-2, 0, 1, 3, base + 1, base + 3)}
          material={CLAWD}
          className={tool === "laptop" ? styles.typing : undefined}
        />
        <Box
          {...torso(8, 10, 1, 3, base + 1, base + 3)}
          material={CLAWD}
          className={tool === "laptop" ? `${styles.typing} ${styles.typingLate}` : undefined}
        />

        {/* body, with the eyes on its front face */}
        <Box
          {...torso(0, 8, 0, 4, base, base + 5)}
          material={CLAWD}
          faceChildren={facing === "x" ? { right: eyes } : { left: eyes }}
        />

        {/* orange hard hat: dome, light stripe across the top, front visor */}
        <Box
          {...torso(0.5, 7.5, 0.5, 3.5, base + 5, base + 7)}
          material={HAT}
        />
        <Box
          {...torso(3.5, 4.5, 0.4, 3.6, base + 5, base + 7.3)}
          material={HAT_STRIPE}
        />
        <Box
          {...torso(1.5, 6.5, 3.5, 4.8, base + 5, base + 5.7)}
          material={HAT_BRIM}
        />

        {tool === "shovel" && (
          <Group
            x={shoulder.x}
            y={shoulder.y}
            z={shoulder.z}
            className={styles.shovelSwing}
          >
            <Box
              x={0}
              y={-0.35 * S}
              z={-0.35 * S}
              w={7 * S}
              d={0.7 * S}
              h={0.7 * S}
              material={WOOD}
              faces={["top", "bottom", "left", "right"]}
            />
            <Box
              x={7 * S}
              y={-1.1 * S}
              z={-0.3 * S}
              w={2.5 * S}
              d={2.2 * S}
              h={0.6 * S}
              material={STEEL}
              faces={["top", "bottom", "left", "right"]}
            />
          </Group>
        )}

        {/* clipboard held in front of the right hand, beside the body so it does not cover the eyes */}
        {tool === "clipboard" && (
          <Box
            {...torso(8.2, 10.2, 3.2, 3.55, base + 0.5, base + 3.5)}
            material={CLIPBOARD}
          />
        )}

        {tool === "laptop" && (
          <>
            <Box
              {...torso(2, 6, 4.4, 6.4, base + 1, base + 1.4)}
              material={DARK}
            />
            <Box
              {...torso(2, 6, 6.2, 6.6, base + 1.4, base + 3.6)}
              material={DARK}
            />
          </>
        )}
      </Group>
    </Group>
  );
}
```

- [ ] **Step 3: Colocar o Clawd que cava na cena**

Em `app/components/iso-scene/scene.tsx`, substitua o conteúdo inteiro por:

```tsx
import Clawd from "./clawd";
import { DirtPile, Ground } from "./ground";
import styles from "./scene.module.css";

export default function IsoScene() {
  return (
    <div
      className={styles.scene}
      role="img"
      aria-label="Cena isométrica em 3D de um canteiro de obras."
    >
      <div className={styles.stage}>
        <div className={styles.world}>
          <Ground />
          <DirtPile />
          <Clawd x={6.6} y={7.1} facing="x" tool="shovel" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: sem erros e `exit: 0`.

- [ ] **Step 5: Conferência visual 2 (agente `chrome:browser`)**

Screenshot em 1440×900 e abra o PNG com Read. Confira:

1. O Clawd está à esquerda do buraco, olhando para o buraco (para baixo-direita), e se lê como o Clawd: corpo terracota largo (8×4×5 voxels de 0,6 unidade, mais largo que fundo), braços laterais, 4 perninhas de 3 voxels de altura bem visíveis, **dois olhos escuros verticais na face da frente (a da direita, escura)**.
2. O capacete laranja é mais vivo que o corpo: cúpula do tamanho do corpo, pala só na frente, faixa clara no topo.
3. A pá sai do braço do lado visível, aponta para frente e para baixo, em direção ao buraco, com lâmina cinza.
4. O Clawd não afunda no chão nem flutua: as pernas encostam na grama.
5. Sem peças na frente/atrás do lugar errado (por exemplo, o capacete atrás do corpo).

Se os olhos aparecerem na face errada (esquerda), troque `{ right: eyes }` por `{ left: eyes }` (e vice-versa) em `clawd.tsx` e confira de novo.

---

### Task 4: Animação do Clawd cavando e terra voando (protótipo e Gate 1)

**Files:**
- Modify: `app/components/iso-scene/clawd.module.css`
- Create: `app/components/iso-scene/flying-dirt.module.css`
- Create: `app/components/iso-scene/flying-dirt.tsx`
- Modify: `app/components/iso-scene/scene.tsx`

- [ ] **Step 1: Adicionar as animações do Clawd**

Em `app/components/iso-scene/clawd.module.css`, substitua o bloco `/* Resting poses; ... */` e as três regras depois dele (de `.torsoDig` até `.torsoClipboard`) por:

```css
/* Each class keeps its resting pose as the base `transform`, which is what
   remains when animations are turned off. */
.torsoDig {
  transform: rotateY(4deg);
  animation: lean 2.4s ease-in-out infinite;
}

.shovelSwing {
  transform: rotateY(20deg);
  animation: swing 2.4s ease-in-out infinite;
}

.torsoClipboard {
  transform: rotateX(-1deg);
  animation: sway 4s ease-in-out infinite;
}

/* The laptop Clawd types: his arms take turns lifting a little. */
.typing {
  animation: type 0.6s ease-in-out infinite;
}

.typingLate {
  animation-delay: -0.3s;
}

/* Leans forward about the hip as the shovel goes into the hole. */
@keyframes lean {
  0%,
  100% {
    transform: rotateY(0deg);
  }
  45%,
  60% {
    transform: rotateY(8deg);
  }
}

/* The shovel swings about the shoulder: raised (-55deg), then into the hole. */
@keyframes swing {
  0%,
  100% {
    transform: rotateY(-55deg);
  }
  45%,
  60% {
    transform: rotateY(42deg);
  }
}

@keyframes sway {
  0%,
  100% {
    transform: rotateX(1.5deg);
  }
  50% {
    transform: rotateX(-3deg);
  }
}

@keyframes type {
  0%,
  100% {
    transform: translateZ(0);
  }
  50% {
    transform: translateZ(calc(var(--u) * 0.12));
  }
}
```

(Deixe a regra `.eye` do início do arquivo como está.)

- [ ] **Step 2: Criar a terra voando**

`app/components/iso-scene/flying-dirt.module.css`:

```css
/* Five clods thrown from the raised shovel to the top step of the pile. They are
   hidden (scale 0) outside of their flight. The 2.4s period matches the dig
   cycle. The path is a parabola sampled in five points and played back with
   linear timing: easing would only change the speed along each straight piece. */
.dirt {
  --lift: 3.5;
  scale: 0;
  animation: throw 2.4s linear infinite;
}

.group > .dirt:nth-child(1) {
  --dx: 5.9;
  --dy: -0.5;
  --dz: -4.5;
  animation-delay: 0s;
}

.group > .dirt:nth-child(2) {
  --dx: 6.2;
  --dy: -0.3;
  --dz: -4.4;
  animation-delay: 0.05s;
}

.group > .dirt:nth-child(3) {
  --dx: 6.5;
  --dy: 0;
  --dz: -4.5;
  animation-delay: 0.1s;
}

.group > .dirt:nth-child(4) {
  --dx: 6;
  --dy: 0.1;
  --dz: -4.4;
  animation-delay: 0.15s;
}

.group > .dirt:nth-child(5) {
  --dx: 6.3;
  --dy: -0.35;
  --dz: -4.5;
  animation-delay: 0.2s;
}

/* Position at flight fraction t: (dx*t, dy*t, dz*t + 4*lift*t*(1-t)). The
   hide at 35% is a discrete step: `scale` also scales the offset in `transform`,
   so shrinking smoothly would slide the clod back toward the shovel. */
@keyframes throw {
  0% {
    scale: 1;
    transform: translate3d(0, 0, 0);
  }
  8.75% {
    transform: translate3d(
      calc(var(--dx) * var(--u) * 0.25),
      calc(var(--dy) * var(--u) * 0.25),
      calc((var(--dz) * 0.25 + var(--lift) * 0.75) * var(--u))
    );
  }
  17.5% {
    transform: translate3d(
      calc(var(--dx) * var(--u) * 0.5),
      calc(var(--dy) * var(--u) * 0.5),
      calc((var(--dz) * 0.5 + var(--lift)) * var(--u))
    );
  }
  26.25% {
    transform: translate3d(
      calc(var(--dx) * var(--u) * 0.75),
      calc(var(--dy) * var(--u) * 0.75),
      calc((var(--dz) * 0.75 + var(--lift) * 0.75) * var(--u))
    );
  }
  35% {
    scale: 1;
    transform: translate3d(
      calc(var(--dx) * var(--u)),
      calc(var(--dy) * var(--u)),
      calc(var(--dz) * var(--u))
    );
    animation-timing-function: step-end;
  }
  36%,
  100% {
    scale: 0;
    transform: translate3d(
      calc(var(--dx) * var(--u)),
      calc(var(--dy) * var(--u)),
      calc(var(--dz) * var(--u))
    );
  }
}
```

`app/components/iso-scene/flying-dirt.tsx`:

```tsx
import Box, { Group } from "./box";
import { SOIL } from "./materials";
import styles from "./flying-dirt.module.css";

const CLODS = [0, 1, 2, 3, 4];

// The clods start at the tip of the raised shovel: the shoulder (7.8, 12.5, 3.0)
// plus 5.7 along the handle at -55deg gives about (11.1, 12.5, 7.7). That depends
// on the Clawd position in scene.tsx, the voxel geometry in clawd.tsx and the
// `swing` 0% angle in clawd.module.css. They land on the top step of DirtPile
// (ground.tsx), and the five clods match the five nth-child rules in the CSS.
export default function FlyingDirt() {
  return (
    <Group className={styles.group}>
      {CLODS.map((i) => (
        <Box
          key={i}
          x={10.9}
          y={12.3}
          z={7.5}
          w={0.45}
          d={0.45}
          h={0.45}
          material={SOIL}
          className={styles.dirt}
        />
      ))}
    </Group>
  );
}
```

- [ ] **Step 3: Incluir a terra voando na cena**

Em `app/components/iso-scene/scene.tsx`, substitua o conteúdo inteiro por:

```tsx
import Clawd from "./clawd";
import FlyingDirt from "./flying-dirt";
import { DirtPile, Ground } from "./ground";
import styles from "./scene.module.css";

export default function IsoScene() {
  return (
    <div
      className={styles.scene}
      role="img"
      aria-label="Cena isométrica em 3D de um canteiro de obras."
    >
      <div className={styles.stage}>
        <div className={styles.world}>
          <Ground />
          <DirtPile />
          <Clawd x={6.6} y={7.1} facing="x" tool="shovel" />
          <FlyingDirt />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: sem erros e `exit: 0`.

- [ ] **Step 5: GATE 1, verificação do protótipo (agente `chrome:browser`)**

Peça ao agente (sem modificar arquivos nem processos), com `http://localhost:3000` em 1440×900:

1. Reportar `document.getAnimations()`: quantas, nomes, duração (esperado 2,4 s nas 7 animações: `lean`, `swing` e 5 `throw`), e se todas estão `running`.
2. Pausar todas as animações e tirar screenshots da cena em `currentTime` = 0 ms (pá levantada), 840 ms (terra no ar), 1.080 ms (pá no fundo do buraco) e 1.440 ms. Em T = 0 (pá erguida a -55°), conferir que o cabo e a lâmina não aparecem ocos por baixo.
3. Em 1.080 ms, reportar com as próprias palavras se a lâmina entra no buraco, se aparece **por cima ou por trás da parede do buraco do jeito certo**, e se o torso do Clawd inclina para frente sem separar das pernas.
4. Em 840 ms, se os torrões voam em arco do buraco até a pilha, sem atravessar o Clawd.
5. Contar elementos da cena: `document.querySelector('[role="img"]').querySelectorAll("*").length`.
6. Com viewport 390×844 e CPU 4× (emulate), **sem trace ativo**, medir 5 s de cadência com `requestAnimationFrame` (nº de frames, mediana e p95 do intervalo, máximo) e longtasks com `PerformanceObserver` instalado antes da janela. Depois restaurar a emulação.
7. Console e rede sem erros (o 404 de `/favicon.ico` já é conhecido).

Abra os PNGs com Read e julgue você mesmo.

- [ ] **Step 6: Decidir**

Com os números e as imagens, compare com o spec:

- **Cadência:** p95 do intervalo ≤ 17 ms.
- **Elementos:** extrapole para a cena completa (o protótipo tem 1 Clawd; a cena final terá 3 Clawds, guindaste, prédio, escavadeira e placa). Se o protótipo já passa de ~250 elementos, a meta de 800 está em risco: registre a conta.
- **Profundidade:** sem peças visivelmente atrás/na frente do lugar errado.

**Se passar:** mostre os screenshots ao usuário e siga para a Task 5.
**Se falhar** (cadência, artefatos de profundidade ou limitação visual que não dê para corrigir em CSS 3D): **pare**, relate com os dados e proponha subir para o degrau 2 (Canvas 2D). Não escale sem o usuário confirmar; cada degrau tem um spec curto próprio.

---

### Task 5: Guindaste

**Files:**
- Create: `app/components/iso-scene/crane.module.css`
- Create: `app/components/iso-scene/crane.tsx`
- Modify: `app/components/iso-scene/scene.tsx`

- [ ] **Step 1: Criar o CSS do guindaste**

`app/components/iso-scene/crane.module.css`:

```css
/* The jib turns about the mast axis. 12s is the base period of the scene. */
.slew {
  transform: rotateZ(-10deg);
  animation: slew 12s ease-in-out infinite;
}

/* The cable and bucket swing a little below the trolley. */
.sway {
  animation: sway 4s ease-in-out infinite;
}

@keyframes slew {
  0%,
  100% {
    transform: rotateZ(8deg);
  }
  40%,
  55% {
    transform: rotateZ(-34deg);
  }
}

@keyframes sway {
  0%,
  100% {
    transform: rotateY(3deg) rotateX(-2deg);
  }
  50% {
    transform: rotateY(-3deg) rotateX(2deg);
  }
}
```

- [ ] **Step 2: Criar o componente**

`app/components/iso-scene/crane.tsx`:

```tsx
import Box, { Group } from "./box";
import {
  CONCRETE_DARK,
  CRANE,
  CRANE_LATTICE,
  DARK,
  GLASS,
  MACHINE_ORANGE,
} from "./materials";
import styles from "./crane.module.css";

// Tower crane. The mast stands at x 2.5..4.1, y 11.5..13.1. Everything above it
// (cab, tower head, jib, counter-jib, and the cable with its bucket) turns as
// one piece about the mast axis at (3.3, 12.3); the group origin is 19.4 above
// the ground.
//
// Limits to keep in mind when editing the swing in crane.module.css:
// - The angle must stay inside (-45deg, 45deg): beyond that, a face that is not
//   drawn (the -x or -y side of a box) would turn toward the camera.
// - The end of the counter-jib is the highest point on screen when the jib
//   turns toward +8deg, and there is only a small margin to the top of the
//   scene frame.
// The bucket hangs 8 below the jib (its bottom is at z 11.4), which clears the
// flying clods (they peak near z 9.5) and the Clawd (about z 6.2).
export default function Crane() {
  return (
    <>
      <Box x={2.1} y={11.1} z={0} w={2.4} d={2.4} h={0.8} material={DARK} />
      <Box
        x={2.5}
        y={11.5}
        z={0.8}
        w={1.6}
        d={1.6}
        h={17.2}
        material={CRANE_LATTICE}
      />

      <Group x={3.3} y={12.3} z={19.4} className={styles.slew}>
        {/* cab, with a window on each visible side */}
        <Box x={-1} y={-1} z={-1.4} w={2} d={2} h={1.8} material={MACHINE_ORANGE} />
        <Box x={-0.8} y={1} z={-1.1} w={1.6} d={0.1} h={1} material={GLASS} faces={["left"]} />
        <Box x={1} y={-0.7} z={-1.1} w={0.1} d={1.4} h={1} material={GLASS} faces={["right"]} />

        {/* tower head */}
        <Box x={-0.6} y={-0.6} z={0.4} w={1.2} d={1.2} h={1.4} material={CRANE} />

        {/* jib and counter-jib in one piece, and the counterweight */}
        <Box x={-5} y={-0.45} z={0} w={18.5} d={0.9} h={0.9} material={CRANE_LATTICE} />
        <Box x={-5.4} y={-0.8} z={-1.4} w={1.6} d={1.6} h={1.8} material={DARK} />

        {/* trolley point, 9 along the jib: the cable and the concrete bucket */}
        <Group x={9} y={0} z={0} className={styles.sway}>
          <Box x={-0.08} y={-0.08} z={-6.4} w={0.16} d={0.16} h={6.4} material={DARK} />
          <Box x={-0.8} y={-0.8} z={-8} w={1.6} d={1.6} h={1.6} material={CONCRETE_DARK} />
        </Group>
      </Group>
    </>
  );
}
```

- [ ] **Step 3: Incluir na cena**

Em `app/components/iso-scene/scene.tsx`, adicione `import Crane from "./crane";` junto dos outros imports e `<Crane />` logo depois de `<DirtPile />`.

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: sem erros e `exit: 0`.

- [ ] **Step 5: Conferência visual 3 (agente `chrome:browser`)**

Screenshots em `currentTime` 0, 4.800 ms (lança no ponto mais girado, −34°) e 9.000 ms (animações pausadas, 1440×900), abra com Read e confira:

1. O mastro é amarelo com padrão de treliça, a cabine laranja com janelas, a lança longa para um lado e a contra-lança com contrapeso escuro para o outro. A cabine, a cabeça da torre e a lança giram juntas em torno do mastro (o mastro e a base ficam parados).
2. O cabo desce da lança e a caçamba cinza (fundo em z 11,4) fica **bem acima** do Clawd (até z≈6,2) e dos torrões (pico perto de z 9,5), sem atravessá-los.
3. Em 0 ms a caçamba está sobre a região do buraco; em 4.800 ms, deslocada para o lado do prédio (para cima-direita na tela).
4. O guindaste inteiro cabe no enquadramento (o topo não é cortado; a ponta da contra-lança, com a lança girada a +8°, é o ponto mais alto na tela e a margem é pequena). Se for cortado, aumente o valor `13` de `top: calc(var(--u) * 13)` em `scene.module.css` e a altura do `aspect-ratio` (por exemplo `40 / 35`).

---

### Task 6: Prédio em estrutura

**Files:**
- Create: `app/components/iso-scene/building.tsx`
- Modify: `app/components/iso-scene/scene.tsx`

- [ ] **Step 1: Criar o prédio**

`app/components/iso-scene/building.tsx`:

```tsx
import Box from "./box";
import { BRICK, CONCRETE } from "./materials";

// Two-storey concrete frame at x 0.5..6.5, y 0.5..6.5.
// - Columns are 0.7 square. They run 0.2 into the slabs above and below, which
//   hides the anti-aliasing seam where a column meets a slab on the outer faces
//   (the overlapping faces are coplanar and have the same material).
// - The brick walls are 0.3 thick, centred on the depth of the columns. On the
//   first floor they pass through the middle columns, which hide them there.
// - Only faces the camera can see are drawn. The back column (0.5, 0.5) is left
//   out on both floors because the slab above hides it completely.
const FIRST_FLOOR_COLUMNS = [
  [5.8, 0.5],
  [0.5, 5.8],
  [5.8, 5.8],
  [3.15, 5.8],
  [5.8, 3.15],
];

const SECOND_FLOOR_COLUMNS = [
  [5.8, 0.5],
  [0.5, 5.8],
  [5.8, 5.8],
];

export default function Building() {
  return (
    <>
      <Box x={0.5} y={0.5} z={0} w={6} d={6} h={0.5} material={CONCRETE} />

      {FIRST_FLOOR_COLUMNS.map(([x, y]) => (
        <Box key={`a-${x}-${y}`} x={x} y={y} z={0.3} w={0.7} d={0.7} h={4.9} material={CONCRETE} faces={["left", "right"]} />
      ))}
      <Box x={6} y={1.2} z={0.5} w={0.3} d={4.6} h={2.5} material={BRICK} faces={["top", "right"]} />
      <Box x={1.2} y={6} z={0.5} w={4.6} d={0.3} h={2.5} material={BRICK} faces={["top", "left"]} />

      <Box x={0.5} y={0.5} z={5} w={6} d={6} h={0.6} material={CONCRETE} />

      {SECOND_FLOOR_COLUMNS.map(([x, y]) => (
        <Box key={`b-${x}-${y}`} x={x} y={y} z={5.4} w={0.7} d={0.7} h={4.8} material={CONCRETE} faces={["left", "right"]} />
      ))}
      <Box x={6} y={1.2} z={5.6} w={0.3} d={4.6} h={2.5} material={BRICK} faces={["top", "right"]} />
      <Box x={1.2} y={6} z={5.6} w={4.6} d={0.3} h={2.5} material={BRICK} faces={["top", "left"]} />

      <Box x={0.5} y={0.5} z={10} w={6} d={6} h={0.6} material={CONCRETE} />
    </>
  );
}
```

- [ ] **Step 2: Incluir na cena**

Em `scene.tsx`, adicione `import Building from "./building";` e `<Building />` depois de `<DirtPile />`.

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: sem erros e `exit: 0`.

- [ ] **Step 4: Conferência visual 4**

Screenshot (1440×900), abra com Read. Confira: o prédio fica no fundo da cena, com 2 andares de lajes lavanda-acinzentadas, pilares (5 no primeiro andar e 3 no segundo; o pilar dos fundos não é desenhado), e paredes de "tijolinho" (linhas horizontais) nos dois lados visíveis; a laje do topo cobre o prédio; a lança do guindaste passa por cima do prédio sem atravessá-lo; sem peças do prédio atrás/na frente do lugar errado.

Conferir se aparece algum fio claro nas faces dos pilares do meio onde a parede de tijolinho os atravessa (x=6,3 / y=6,3); se aparecer, dividir cada parede em duas peças, antes e depois do pilar do meio.

---

### Task 7: Escavadeira

**Files:**
- Create: `app/components/iso-scene/excavator.module.css`
- Create: `app/components/iso-scene/excavator.tsx`
- Modify: `app/components/iso-scene/scene.tsx`

- [ ] **Step 1: Criar o CSS da escavadeira**

`app/components/iso-scene/excavator.module.css`:

```css
/* The arm of an excavator that faces -x: each segment points along local -x,
   and a positive `rotateY` raises it. The period is 6s (half the base). */
.boom {
  transform: rotateY(38deg);
  animation: boom 6s ease-in-out infinite;
}

.stick {
  transform: rotateY(-75deg);
  animation: stick 6s ease-in-out infinite;
}

.bucket {
  transform: rotateY(-45deg);
  animation: bucket 6s ease-in-out infinite;
}

@keyframes boom {
  0%,
  100% {
    transform: rotateY(46deg);
  }
  50% {
    transform: rotateY(26deg);
  }
}

@keyframes stick {
  0%,
  100% {
    transform: rotateY(-62deg);
  }
  50% {
    transform: rotateY(-95deg);
  }
}

@keyframes bucket {
  0%,
  100% {
    transform: rotateY(-30deg);
  }
  50% {
    transform: rotateY(-65deg);
  }
}
```

- [ ] **Step 2: Criar o componente**

`app/components/iso-scene/excavator.tsx`:

```tsx
import Box, { Group } from "./box";
import { CRANE, DARK, GLASS, MACHINE_ORANGE } from "./materials";
import styles from "./excavator.module.css";

// Excavator at x 14..19, y 1.5..5.5, facing -x (toward the building).
export default function Excavator() {
  return (
    <>
      {/* tracks and deck */}
      <Box x={14} y={1.5} z={0} w={5} d={1.3} h={1.1} material={DARK} />
      <Box x={14} y={4.2} z={0} w={5} d={1.3} h={1.1} material={DARK} />
      <Box x={14.4} y={1.9} z={1.1} w={4.2} d={3.2} h={0.6} material={DARK} />

      {/* body, engine hood and cab */}
      <Box x={14.8} y={2} z={1.7} w={3.4} d={3} h={1.4} material={CRANE} />
      <Box x={17} y={2.2} z={3.1} w={1} d={2.6} h={0.8} material={CRANE} />
      <Box x={14.8} y={2} z={3.1} w={1.7} d={1.7} h={1.5} material={MACHINE_ORANGE} />
      <Box x={15} y={3.7} z={3.4} w={1.3} d={0.08} h={0.9} material={GLASS} faces={["left"]} />

      {/* Articulated arm: each part pivots on the previous one, so the angles add up
          (the bucket's total goes from about -46 to -134 degrees). A box only draws the
          faces the camera sees while it is upright, so the stick also draws its bottom
          face and the bucket skips its top and draws its bottom instead. The lowest
          point of the arm is about 0.3 above the grass. */}
      <Group x={14.9} y={3.5} z={2.5}>
        <Group className={styles.boom}>
          <Box
            x={-4}
            y={-0.4}
            z={-0.4}
            w={4}
            d={0.8}
            h={0.8}
            material={MACHINE_ORANGE}
            faces={["top", "left"]}
          />
          <Group x={-4} className={styles.stick}>
            <Box
              x={-3}
              y={-0.35}
              z={-0.35}
              w={3}
              d={0.7}
              h={0.7}
              material={MACHINE_ORANGE}
              faces={["top", "bottom", "left", "right"]}
            />
            <Group x={-3} className={styles.bucket}>
              <Box
                x={-1.2}
                y={-0.65}
                z={-0.5}
                w={1.2}
                d={1.3}
                h={0.9}
                material={DARK}
                faces={["bottom", "left", "right"]}
              />
            </Group>
          </Group>
        </Group>
      </Group>
    </>
  );
}
```

- [ ] **Step 3: Incluir na cena**

Em `scene.tsx`, adicione `import Excavator from "./excavator";` e `<Excavator />` depois de `<Building />`.

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: sem erros e `exit: 0`.

- [ ] **Step 5: Conferência visual 5**

Screenshots com animações pausadas em `currentTime` 0 e 3.000 ms (o braço no ponto mais baixo). Abra com Read e confira: a escavadeira amarela tem esteiras escuras, corpo, cabine laranja com janela e um braço de 3 segmentos que aponta para a esquerda-cima da tela, em direção ao prédio; em 3.000 ms a caçamba chega perto do chão **sem atravessá-lo** (se atravessar a grama, diminua a amplitude: troque `-95deg` por `-85deg` no keyframe `stick`). Conferir que nenhuma peça do braço aparece oca (grama visível por dentro da vara ou da caçamba) em T = 0, 1500, 3000 e 4500 ms.

---

### Task 8: Placa brasileira de obras e os outros dois Clawds

**Files:**
- Create: `app/components/iso-scene/construction-sign.module.css`
- Create: `app/components/iso-scene/construction-sign.tsx`
- Modify: `app/components/iso-scene/scene.tsx`

- [ ] **Step 1: Criar o CSS da placa**

`app/components/iso-scene/construction-sign.module.css`:

```css
.panel {
  display: block;
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 2: Criar a placa**

`app/components/iso-scene/construction-sign.tsx`:

```tsx
import Box from "./box";
import { CLEAR, POST } from "./materials";
import styles from "./construction-sign.module.css";

const INK = "#1a1a1a";
const ORANGE = "#ff8a00";

// The whole panel is one SVG drawn on the face: a black diamond with a smaller
// orange one on top, and a worker digging with a shovel. The pictogram is drawn
// around (0, 0) and scaled down to fit inside the orange diamond.
function Panel() {
  return (
    <svg className={styles.panel} viewBox="-22 -22 44 44" aria-hidden="true">
      <polygon points="0,-22 22,0 0,22 -22,0" fill={INK} />
      <polygon points="0,-16.7 16.7,0 0,16.7 -16.7,0" fill={ORANGE} />
      <g transform="scale(0.76)">
        <circle cx="-1" cy="-10" r="2.8" fill={INK} />
        <g stroke={INK} strokeLinecap="round" fill="none">
          <line x1="-8" y1="0" x2="-4" y2="-6" strokeWidth="3.6" />
          <line x1="-8" y1="0" x2="-10" y2="8" strokeWidth="2.8" />
          <line x1="-8" y1="0" x2="-6" y2="8" strokeWidth="2.8" />
          <line x1="-4" y1="-6" x2="1" y2="-4" strokeWidth="2.2" />
          <line x1="-1" y1="-7" x2="6" y2="3" strokeWidth="1.8" />
        </g>
        <polygon points="4,4.4 8,1.6 10,4.5 9.7,8.3 6,7.3" fill={INK} />
      </g>
    </svg>
  );
}

// Brazilian roadworks sign on a post, at x 10.4..13.8, y 19..19.2, near the
// front edge of the slab. Only the face that looks toward +y is drawn (the SVG
// above). The post stands behind the panel and meets its bottom tip.
export default function ConstructionSign() {
  return (
    <>
      <Box x={11.975} y={18.75} z={0} w={0.25} d={0.25} h={2.4} material={POST} />
      <Box
        x={10.4}
        y={19}
        z={2.2}
        w={3.4}
        d={0.2}
        h={3.4}
        material={CLEAR}
        faces={["left"]}
        faceChildren={{ left: <Panel /> }}
      />
    </>
  );
}
```

- [ ] **Step 3: Compor a cena final**

Em `app/components/iso-scene/scene.tsx`, substitua o conteúdo inteiro por:

```tsx
import Box from "./box";
import Building from "./building";
import Clawd from "./clawd";
import ConstructionSign from "./construction-sign";
import Crane from "./crane";
import Excavator from "./excavator";
import FlyingDirt from "./flying-dirt";
import { DirtPile, Ground } from "./ground";
import { WOOD } from "./materials";
import styles from "./scene.module.css";

export default function IsoScene() {
  return (
    <div
      className={styles.scene}
      role="img"
      aria-label="Cena isométrica em 3D de um canteiro de obras: Clawds de capacete laranja trabalham, um deles cavando um buraco, ao lado de um guindaste, de um prédio em construção, de uma escavadeira e de uma placa de obras."
    >
      <div className={styles.stage}>
        <div className={styles.world}>
          <Ground />
          <DirtPile />
          <Building />
          <Crane />
          <Excavator />
          <ConstructionSign />

          <Clawd x={6.6} y={7.1} facing="x" tool="shovel" />
          <FlyingDirt />

          <Clawd x={2} y={15.5} facing="y" tool="clipboard" />

          <Box x={13.6} y={15} z={0} w={5.2} d={3.4} h={1} material={WOOD} />
          <Clawd x={13.8} y={15.2} z={1} facing="y" pose="sit" tool="laptop" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: sem erros e `exit: 0`.

- [ ] **Step 5: Conferência visual 6**

Screenshot (1440×900), abra com Read. Confira:

1. A placa fica perto da borda da frente da laje, entre os dois Clawds e à frente deles (x 10,4..13,8): é um losango laranja com borda preta, o poste cinza aparece atrás do painel, e o pictograma se lê como um operário curvado cavando com pá (não como pedestre). Se o pictograma sair cortado ou fora do losango laranja, ajuste só as coordenadas e o `scale` dentro do `viewBox` em `Panel`.
2. O Clawd da prancheta olha para a esquerda-baixo da tela, com a prancheta clara na mão direita, ao lado do corpo (sem cobrir os olhos).
3. O Clawd sentado está sobre o caixote, com as pernas esticadas para a frente (começando na frente do corpo, sem atravessá-lo) e o notebook escuro à frente do corpo, com a tampa de pé. Os braços dele se revezam subindo e descendo um pouco, como quem digita.
4. Os 3 Clawds têm capacete laranja e olhos nas faces certas.
5. Nenhuma peça atravessa outra (o Clawd do notebook não entra no caixote nem na placa; a placa não encosta em nenhum dos dois Clawds).

---

### Task 9: Acessibilidade, movimento reduzido e build

**Files:** nenhum (só verificação; `scene.module.css` já desliga as animações em `prefers-reduced-motion`)

- [ ] **Step 1: Checar tipos e build**

Run: `npx tsc --noEmit; echo "tsc exit: $?"; npm run build 2>&1 | tail -14; echo "build exit: ${pipestatus[1]}"`
Expected: `tsc exit: 0`, build com sucesso e rota `/` estática (`○`). **Atenção:** o `next build` escreve em `.next` e atrapalha o `next dev` rodando. Peça antes ao usuário para pausar o dev server, ou rode esta etapa junto da Task 10 (quando o servidor de produção será iniciado de qualquer forma).

- [ ] **Step 2: Conferir o HTML pré-renderizado**

Run: `f=.next/server/app/index.html; echo "raw: $(wc -c < $f) B"; echo "gz: $(gzip -c $f | wc -c | tr -d ' ') B"; echo "canvas in html: $(grep -c '<canvas' $f)"; echo "aria-label present: $(grep -c 'Cena isométrica em 3D' $f)"; echo "use client in scene files: $(grep -rl 'use client' app/components/iso-scene | wc -l | tr -d ' ')"`
Expected: gz ≤ ~18.500 B (linha de base 3.206 B + 15 kB), `canvas in html: 0`, `aria-label present: 1` e `use client in scene files: 0` (a cena inteira é Server Component).

- [ ] **Step 3: Movimento reduzido (agente `chrome:browser`)**

Emular `prefers-reduced-motion: reduce`, recarregar e reportar: `document.getAnimations().length` (esperado 0), screenshot da cena parada (o Clawd que cava deve estar numa pose intermediária com a pá apontando para frente e para baixo, os torrões invisíveis, a lança do guindaste girada uns −10°). Depois restaurar a emulação.

---

### Task 10: Verificação final em produção e decisão

**Files:** nenhum

- [ ] **Step 1: Pedir o servidor de produção**

Peça ao usuário: "Pare o `npm run dev` e rode `npm run build && npm run start` (porta 3000). Me avise." Confirme com `curl -s http://localhost:3000/ | grep -c 'Cena isométrica em 3D'` → esperado `1` (HTML novo) e um chunk do HTML com `200`.

- [ ] **Step 2: Medições do spec (agente `chrome:browser`, mesmas regras de rigor da análise anterior)**

1. **Cargas frias mobile**, 5 vezes (390×844, CPU 4×, Slow 4G, cache desabilitado), **sem trace**, com `PerformanceObserver` `buffered` para `longtask`, `largest-contentful-paint`, `layout-shift` e `paint` registrados antes da carga. Reportar por rodada: FCP, LCP (elemento), CLS, longtasks e a soma aproximada de `max(0, duração − 50)` após o FCP (rotular como aproximação, não TBT). Critérios: **mediana de LCP ≤ 1.350 ms**, **CLS 0**.
2. **Bytes** da carga fria: JS, CSS e HTML transferidos, e quando termina o último chunk de JS em relação ao LCP. Critério: **JS = 150.843 B (inalterado)**; HTML ≤ ~18,5 kB gz.
3. **Elementos:** `document.querySelector('[role="img"]').querySelectorAll("*").length`. Critério: **≤ 800**. Conferir também `document.documentElement.scrollWidth <= window.innerWidth` em 320×640 e em 390×844: a cena não pode gerar scroll horizontal.
4. **Cadência com a cena completa:** viewport 390×844, CPU 4×, 5 s sem trace, após o confete acabar: frames, mediana, p95 e máximo do intervalo, longtasks. Critério: **p95 ≤ 17 ms**. Repetir no desktop (1440×900, sem throttling).
5. **A/B opcional do custo do loop** (só se a cadência ficar perto do limite): 2 janelas de 5 s com animações rodando e 2 pausadas, em ordem alternada, sem chamadas à página durante a janela.
6. **Visual:** screenshots com animações pausadas em 0, 3, 6 e 9 s, desktop e mobile, abertos por você com Read.
7. Restaurar emulação e viewport. Relatar só o que foi medido; o que não der (camadas de composição, Lighthouse) vai como "NÃO MEDIDO".

- [ ] **Step 3: Conferir o working tree**

Run: `rm -f tsconfig.tsbuildinfo; git status --short`
Expected: apenas `M app/layout.tsx`, `M app/page.tsx`, `M package-lock.json`, `M package.json`, `?? app/components/`, `?? app/globals.css`, `?? docs/` e o `.mp4` não rastreado. Nenhum arquivo novo inesperado.

- [ ] **Step 4: Relatório e decisão (na conversa, em pt-BR)**

Entregue uma tabela "critério × resultado × limite" com os números medidos, os screenshots avaliados por você, e o que ficou NÃO MEDIDO (incluindo Safari e celular real, que são do usuário). Diga claramente:

- **Tudo dentro dos limites:** a abordagem 1 passou nas medições do ambiente; peça ao usuário para olhar no Safari e num celular real, que é o critério decisivo.
- **Algum limite estourado:** diga qual e por quanto, proponha a correção dentro da abordagem 1 se houver uma óbvia, ou a subida para o degrau 2 (Canvas 2D) com um spec curto. Não implemente o degrau 2 sem o usuário aprovar.

- [ ] **Step 5: Fechamento**

Ofereça: criar o commit (mensagem sugerida `feat: add isometric 3D construction scene with Clawd workers`, **sem** o `.mp4`), apagar `app/components/digging-scene.*` (a versão SVG, sem uso) ou guardá-la, e atualizar as notas de memória do projeto.

---

## Self-review

**Cobertura do spec**

- Projeção isométrica verdadeira, `preserve-3d`, `aspect-ratio`, `--u`: Task 2 (`scene.module.css`).
- `Box` com 3 faces, materiais de 3 tons, `Group`: Task 1.
- Clawd 3D com capacete laranja, olhos, poses e ferramentas: Task 3.
- Cena enxuta: laje com buraco e pilha (Task 2), Clawd cavando com terra voando (Tasks 3 e 4), guindaste (Task 5), prédio (Task 6), escavadeira (Task 7), placa brasileira e os 2 Clawds extras (Task 8).
- Animações só com `transform`/`scale`, períodos que dividem 12 s (12, 6, 4, 2,4 e 0,6 s): Tasks 4, 5 e 7.
- `prefers-reduced-motion`: `scene.module.css` (Task 2), verificado na Task 9.
- `role="img"` e `aria-label`: Tasks 2 e 8, verificado na Task 9.
- Critérios de aceite (cadência, profundidade, elementos, HTML gz, JS, LCP/CLS): Task 4 (Gate 1) e Task 10.
- Escada de abordagens e decisão de escalar: Task 4, Step 6 e Task 10, Step 4.
- Sem JS novo / Server Components: Task 9, Step 2.
- Sem commit e `.mp4` fora do repositório: regras do cabeçalho e Task 10.

**Consistência de nomes:** `Box`, `Group`, `Face`, `Material`; exports nomeados `Ground`, `DirtPile`; `IsoScene`, `Clawd`, `FlyingDirt`, `Crane`, `Building`, `Excavator`, `ConstructionSign`. As classes `styles.torsoDig`, `shovelSwing`, `torsoClipboard`, `eye`, `typing`, `typingLate` (clawd), `slew`, `sway` (crane), `boom`, `stick`, `bucket` (excavator), `group`, `dirt` (flying-dirt), `panel` (sign) e `scene`, `stage`, `world` (scene) aparecem com os mesmos nomes no CSS e no TSX. Os keyframes `lean`, `swing`, `sway`, `type`, `throw`, `slew`, `boom`, `stick`, `bucket` existem nos CSS correspondentes. O pivô do ombro (`torso(9, 9, PIVOT_B, PIVOT_B, base + 2, base + 2)`) e a posição do Clawd (6,6; 7,1) levam, com a inclinação de 8° do torso e a pá a 42° (embaixo) ou a −55° (em cima), o centro da ponta da pá a ≈(11,6; 12,5; −1,4) no ponto mais baixo (dentro do buraco, x 10..14, e acima do fundo, z −2,5) e a ≈(11,1; 12,5; 7,7) no ponto mais alto, onde a terra começa (10,9; 12,3; 7,5).

**Riscos conhecidos, que não dá para validar sem renderizar:** ordenação de profundidade do CSS 3D (principalmente Safari), frestas entre faces vizinhas, e o número de camadas de composição em celulares fracos. Todos têm checagem explícita nas Tasks 2, 4 e 10.
