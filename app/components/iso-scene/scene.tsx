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
