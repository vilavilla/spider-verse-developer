export function createSoundSystem() {
  let context;
  let enabled = false;

  const ensureContext = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context ??= new AudioContextClass();
    if (context.state === "suspended") context.resume();
    return context;
  };

  function tone({ frequency = 220, endFrequency = frequency, duration = .08, volume = .035, type = "sine" }) {
    if (!enabled) return;
    const audio = ensureContext();
    if (!audio) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), audio.currentTime + duration);
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  }

  return {
    get enabled() { return enabled; },
    async toggle() {
      enabled = !enabled;
      if (enabled) {
        if (!ensureContext()) {
          enabled = false;
          return enabled;
        }
        tone({ frequency: 440, endFrequency: 720, duration: .12, volume: .025 });
      }
      return enabled;
    },
    play(name) {
      if (name === "web") tone({ frequency: 520, endFrequency: 1180, duration: .09, volume: .025, type: "triangle" });
      if (name === "impact") tone({ frequency: 130, endFrequency: 65, duration: .12, volume: .04, type: "sine" });
      if (name === "sense") {
        tone({ frequency: 180, endFrequency: 780, duration: .38, volume: .04, type: "sawtooth" });
        window.setTimeout(() => tone({ frequency: 860, endFrequency: 430, duration: .22, volume: .02 }), 90);
      }
      if (name === "panel") tone({ frequency: 280, endFrequency: 420, duration: .1, volume: .025, type: "triangle" });
    },
  };
}
