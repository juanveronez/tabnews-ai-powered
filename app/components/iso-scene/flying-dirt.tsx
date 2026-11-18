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
