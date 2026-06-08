type WaveType = OscillatorType;
type PageSong = "home" | "create" | "play" | "profile" | "leaderboard" | "auth";

const noteFrequencies: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196,
  A3: 220,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
};

const pageSongs: Record<PageSong, string[]> = {
  home: ["C4", "E4", "G4", "C5", "G4", "E4", "D4", "G4"],
  create: ["A3", "C4", "E4", "A4", "G4", "E4", "C4", "E4"],
  play: ["E4", "G4", "A4", "B4", "A4", "G4", "E4", "D4"],
  profile: ["D4", "F4", "A4", "D5", "A4", "F4", "E4", "A4"],
  leaderboard: ["G3", "B3", "D4", "G4", "B4", "G4", "D4", "B3"],
  auth: ["F3", "A3", "C4", "F4", "E4", "C4", "A3", "C4"],
};

class RetroAudio {
  private context: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private musicStarted = false;
  private noteIndex = 0;
  private activeSong: PageSong = "home";

  unlock() {
    // Browsers require a user gesture before audio playback. All callers route
    // through unlock so music and SFX start from the same resumed context.
    const context = this.getContext();

    void context.resume();

    if (!this.musicStarted) {
      this.startMusic(this.activeSong);
    }
  }

  setPageSong(song: PageSong) {
    if (this.activeSong === song) {
      return;
    }

    this.activeSong = song;

    if (this.context) {
      this.startMusic(song);
    }
  }

  playButton() {
    this.playTone(620, 0.06, "square", 0.1, 0.02);
    this.playTone(930, 0.05, "square", 0.07, 0.04);
  }

  playMove() {
    this.playTone(190, 0.055, "square", 0.08, 0);
    this.playTone(255, 0.06, "square", 0.05, 0.035);
  }

  playBlocked() {
    this.playTone(95, 0.16, "sawtooth", 0.14, 0);
  }

  playCoin() {
    this.playTone(740, 0.07, "square", 0.1, 0);
    this.playTone(1180, 0.11, "square", 0.09, 0.07);
  }

  playDeath() {
    [260, 196, 130, 82].forEach((frequency, index) => {
      this.playTone(frequency, 0.14, "sawtooth", 0.16, index * 0.09);
    });
  }

  playWin() {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      this.playTone(frequency, 0.16, "square", 0.13, index * 0.11);
    });
  }

  private getContext() {
    if (this.context) {
      return this.context;
    }

    const AudioContextClass = window.AudioContext;
    const context = new AudioContextClass();
    const masterGain = context.createGain();
    const musicGain = context.createGain();
    const sfxGain = context.createGain();

    // Use separate gain nodes so looping music can stay quiet while button and
    // gameplay effects remain punchy.
    masterGain.gain.value = 0.45;
    musicGain.gain.value = 0.14;
    sfxGain.gain.value = 0.6;

    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(context.destination);

    this.context = context;
    this.musicGain = musicGain;
    this.sfxGain = sfxGain;

    return context;
  }

  private startMusic(song: PageSong) {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
    }

    this.noteIndex = 0;
    this.activeSong = song;
    this.musicStarted = true;
    this.playMusicStep();
    this.musicTimer = window.setInterval(() => this.playMusicStep(), 220);
  }

  private playMusicStep() {
    const melody = pageSongs[this.activeSong];
    const note = melody[this.noteIndex % melody.length];
    const bassNote = melody[(this.noteIndex + 4) % melody.length].replace("4", "3").replace("5", "3");

    this.playTone(noteFrequencies[note], 0.13, "square", 0.08, 0, this.musicGain);

    if (this.noteIndex % 2 === 0) {
      this.playTone(noteFrequencies[bassNote] ?? 98, 0.12, "triangle", 0.07, 0, this.musicGain);
    }

    this.noteIndex += 1;
  }

  private playTone(
    frequency: number,
    duration: number,
    wave: WaveType,
    volume: number,
    delay = 0,
    output?: GainNode | null,
  ) {
    const context = this.getContext();
    const destination = output ?? this.sfxGain;

    if (!destination) {
      return;
    }

    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const startAt = context.currentTime + delay;
    const stopAt = startAt + duration;

    // A tiny exponential envelope removes clicks at note start/stop while still
    // keeping the sound intentionally crisp and retro.
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    oscillator.connect(envelope);
    envelope.connect(destination);
    oscillator.start(startAt);
    oscillator.stop(stopAt + 0.02);
  }
}

export const retroAudio = new RetroAudio();

/**
 * Maps routes to short looping melodies.
 * Keeping this outside React lets the audio service stay framework-agnostic.
 */
export const getPageSong = (pathname: string): PageSong => {
  if (pathname.startsWith("/create")) return "create";
  if (pathname.startsWith("/play")) return "play";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/global-leaderboard")) return "leaderboard";
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return "auth";
  return "home";
};
