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
