import ConfettiOnLoad from "./components/confetti-on-load";
import IsoScene from "./components/iso-scene/scene";

export default function Page() {
  return (
    <main>
      <h1>
        Estamos nesse exato momento criando um espaço na internet para aprender
        junto com a IA
      </h1>
      <IsoScene />
      <ConfettiOnLoad />
    </main>
  );
}
