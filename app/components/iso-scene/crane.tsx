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
