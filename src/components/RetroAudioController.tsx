import { useRetroAudio } from "../audio/useRetroAudio";

/**
 * Headless component that mounts global audio listeners once from the app root.
 */
export function RetroAudioController() {
  useRetroAudio();

  return null;
}
