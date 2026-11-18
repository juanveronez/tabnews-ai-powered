import styles from "./digging-scene.module.css";

const SOIL_DARK = "#7a4a21";
const SOIL_LIGHT = "#9a6a3a";
const CLAWD = "#D97757";
const INK = "#2b1a14";
const SIGN_INK = "#1a1a1a";
const CONSTRUCTION_ORANGE = "#FF8A00";

const DIRT_PARTICLES = [0, 1, 2, 3, 4];

export default function DiggingScene() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 240 120"
      role="img"
      aria-label="Animação do Clawd, mascote do Claude, usando um capacete de obra laranja e cavando um buraco no chão, ao lado de uma placa de obras."
    >
      <g shapeRendering="crispEdges">
        {/* Chão e buraco */}
        <rect x="0" y="88" width="240" height="32" fill={SOIL_DARK} />
        <rect x="0" y="88" width="240" height="3" fill="#6aa84f" />
        <rect x="76" y="88" width="40" height="18" fill="#1b0f06" />

        {/* Pilha de terra */}
        <rect x="124" y="80" width="40" height="8" fill="#8a5a2b" />
        <rect x="132" y="72" width="24" height="8" fill={SOIL_LIGHT} />
        <rect x="140" y="66" width="8" height="6" fill="#aa7a4a" />

        {/* Pernas do Clawd (fixas) */}
        <rect x="28" y="80" width="4" height="8" fill={CLAWD} />
        <rect x="36" y="80" width="4" height="8" fill={CLAWD} />
        <rect x="44" y="80" width="4" height="8" fill={CLAWD} />
        <rect x="52" y="80" width="4" height="8" fill={CLAWD} />

        {/* Parte de cima do Clawd: corpo, capacete e pá */}
        <g className={styles.worker}>
          <rect x="16" y="68" width="8" height="8" fill={CLAWD} />
          <rect x="56" y="68" width="8" height="8" fill={CLAWD} />
          <rect x="24" y="60" width="32" height="20" fill={CLAWD} />
          <rect x="32" y="66" width="4" height="8" fill={INK} />
          <rect x="44" y="66" width="4" height="8" fill={INK} />

          {/* Capacete de obra laranja */}
          <rect
            x="28"
            y="50"
            width="24"
            height="10"
            fill={CONSTRUCTION_ORANGE}
            stroke="#8a3f00"
            strokeWidth="1"
          />
          <rect x="38" y="50" width="4" height="10" fill="#FFC266" />
          <rect
            x="37"
            y="46"
            width="6"
            height="4"
            fill={CONSTRUCTION_ORANGE}
            stroke="#8a3f00"
            strokeWidth="1"
          />
          <rect
            x="22"
            y="58"
            width="36"
            height="4"
            fill="#E56F00"
            stroke="#8a3f00"
            strokeWidth="1"
          />

          {/* Pá, girando em torno do ombro */}
          <g className={styles.shovel}>
            <rect x="60" y="70" width="28" height="4" fill="#8b5a2b" />
            <polygon
              points="88,67 99,67 105,72 99,77 88,77"
              fill="#9aa3ad"
              stroke="#5c646d"
              strokeWidth="1"
            />
          </g>
        </g>

        {/* Terra voando da pá até a pilha */}
        <g className={styles.dirtGroup}>
          {DIRT_PARTICLES.map((i) => (
            <rect
              key={i}
              className={styles.dirt}
              x="89"
              y="48"
              width="4"
              height="4"
              fill={i % 2 === 0 ? SOIL_DARK : SOIL_LIGHT}
            />
          ))}
        </g>
      </g>

      {/* Placa de obras brasileira: losango laranja, borda preta, operário cavando */}
      <rect x="202" y="72" width="4" height="16" fill="#8b949e" />
      <polygon points="204,20 230,46 204,72 178,46" fill={SIGN_INK} />
      <polygon points="204,24 226,46 204,68 182,46" fill={CONSTRUCTION_ORANGE} />
      <g stroke={SIGN_INK} strokeLinecap="round" fill="none">
        <circle cx="203" cy="36" r="2.8" fill={SIGN_INK} stroke="none" />
        <line x1="196" y1="46" x2="200" y2="40" strokeWidth="3.6" />
        <line x1="196" y1="46" x2="194" y2="54" strokeWidth="2.8" />
        <line x1="196" y1="46" x2="198" y2="54" strokeWidth="2.8" />
        <line x1="200" y1="40" x2="205" y2="42" strokeWidth="2.2" />
        <line x1="203" y1="39" x2="210" y2="49" strokeWidth="1.8" />
        <polygon
          points="208,50.4 212,47.6 214,50.5 213.7,54.3 210,53.3"
          fill={SIGN_INK}
          stroke="none"
        />
      </g>
    </svg>
  );
}
