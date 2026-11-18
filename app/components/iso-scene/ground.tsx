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
