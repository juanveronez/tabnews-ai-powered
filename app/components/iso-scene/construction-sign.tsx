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
