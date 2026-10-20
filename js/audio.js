const GameAudio = (() => {
  let context = null;
  let masterGain = null;
  let musicTimer = null;
  let musicIndex = 0;
  const musicNotes = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];

  function getContext(force = false) {
    if (!force && !Settings.get('sound')) return null;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!context) {
        context = new AudioContextClass();
        masterGain = context.createGain();
        masterGain.gain.value = 1;
        masterGain.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume().catch(() => {});
      return context;
    } catch (error) {
      console.warn('Audio is unavailable in this browser.', error);
      return null;
    }
  }

  function tone(frequency, duration = 0.08, type = 'sine', volume = 0.16, endFrequency = null, force = false) {
    const ctx = getContext(force);
    if (!ctx || !masterGain) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(30, frequency), now);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endFrequency), now + duration);
    gain.gain.setValueAtTime(volume * Settings.get('volume'), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  return {
    setVolume(_value) { if (masterGain) masterGain.gain.value = 1; },
    setMusic(enabled) {
      if (!enabled) { if (musicTimer) clearInterval(musicTimer); musicTimer = null; return; }
      if (musicTimer) return;
      const ctx = getContext(true);
      if (!ctx) return;
      musicTimer = setInterval(() => {
        if (!Settings.get('music')) { clearInterval(musicTimer); musicTimer = null; return; }
        const note = musicNotes[musicIndex % musicNotes.length];
        musicIndex += 1;
        tone(note, 0.28, 'sine', 0.025, note * 1.005, true);
        if (musicIndex % 4 === 0) tone(note / 2, 0.34, 'triangle', 0.012, null, true);
      }, 360);
    },
    playClick() { tone(520, 0.045, 'sine', 0.09); },
    playCatch() { tone(720, 0.07, 'triangle', 0.12, 980); },
    playNegative() { tone(190, 0.18, 'sawtooth', 0.12, 90); },
    playPowerUp() { tone(520, 0.12, 'sine', 0.11, 1040); setTimeout(() => tone(780, 0.1, 'sine', 0.09, 1320), 70); },
    playGameOver() { tone(320, 0.16, 'triangle', 0.12, 220); setTimeout(() => tone(220, 0.24, 'triangle', 0.1, 130), 100); },
    playStart() { tone(440, 0.08, 'triangle', 0.1); setTimeout(() => tone(660, 0.1, 'triangle', 0.1), 80); }
  };
})();
