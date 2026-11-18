"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

type Size = { width: number; height: number };

export default function ConfettiOnLoad() {
  const [size, setSize] = useState<Size | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    const updateSize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!size || done) {
    return null;
  }

  return (
    <Confetti
      width={size.width}
      height={size.height}
      numberOfPieces={300}
      recycle={false}
      onConfettiComplete={() => setDone(true)}
      style={{ position: "fixed", pointerEvents: "none" }}
    />
  );
}
