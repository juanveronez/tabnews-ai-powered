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
