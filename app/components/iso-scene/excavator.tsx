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
