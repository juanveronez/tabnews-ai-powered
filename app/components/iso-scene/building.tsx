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
