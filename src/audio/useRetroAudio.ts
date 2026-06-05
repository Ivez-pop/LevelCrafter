import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageSong, retroAudio } from "./retroAudio";

const interactiveSelector = [
  "button",
  "a",
  "label.arcade-button-violet",
  ".arcade-button",
  ".arcade-button-yellow",
  ".arcade-button-lime",
  ".arcade-button-cyan",
  ".arcade-button-rose",
  ".arcade-button-violet",
  ".arcade-button-orange",
].join(",");

export function useRetroAudio() {
  const location = useLocation();

  useEffect(() => {
    retroAudio.setPageSong(getPageSong(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const unlockAudio = () => retroAudio.unlock();
    const playButtonSound = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactiveElement = target.closest(interactiveSelector);

      if (!interactiveElement || interactiveElement.hasAttribute("disabled")) {
        return;
      }

      retroAudio.unlock();
      retroAudio.playButton();
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    document.addEventListener("pointerdown", playButtonSound, true);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      document.removeEventListener("pointerdown", playButtonSound, true);
    };
  }, []);
}
