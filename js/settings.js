const Settings = (() => {
  const KEY = 'chaiCatcherSettings_v2';
  const defaults = Object.freeze({
    sound: true,
    music: false,
    volume: 0.55,
    roundTime: 60,
    difficulty: 'normal',
    theme: 'sunset',
    reducedMotion: false
  });
  let current = { ...defaults };

  try {
    const savedValue = JSON.parse(localStorage.getItem(KEY) || '{}');
    const saved = savedValue && typeof savedValue === 'object' ? savedValue : {};
    current = {
      ...defaults,
      ...saved,
      volume: Number.isFinite(Number(saved.volume)) ? Math.max(0, Math.min(1, Number(saved.volume))) : defaults.volume,
      roundTime: [30, 60, 90, 120].includes(Number(saved.roundTime)) ? Number(saved.roundTime) : defaults.roundTime,
      difficulty: ['easy', 'normal', 'hard'].includes(saved.difficulty) ? saved.difficulty : defaults.difficulty,
      theme: ['sunset', 'monsoon', 'neon', 'winter', 'festival'].includes(saved.theme) ? saved.theme : defaults.theme,
      sound: typeof saved.sound === 'boolean' ? saved.sound : defaults.sound,
      music: typeof saved.music === 'boolean' ? saved.music : defaults.music,
      reducedMotion: typeof saved.reducedMotion === 'boolean' ? saved.reducedMotion : defaults.reducedMotion
    };
  } catch (error) {
    console.warn('Settings could not be restored; using defaults.', error);
  }

  return {
    get(key) { return Object.prototype.hasOwnProperty.call(current, key) ? current[key] : undefined; },
    all() { return { ...current }; },
    set(key, value) {
      if (!Object.prototype.hasOwnProperty.call(defaults, key)) return false;
      if (key === 'volume') value = Math.max(0, Math.min(1, Number(value) || 0));
      if (key === 'roundTime') {
        value = Number(value);
        if (![30, 60, 90, 120].includes(value)) return false;
      }
      if (key === 'difficulty' && !['easy', 'normal', 'hard'].includes(value)) return false;
      if (key === 'theme' && !['sunset', 'monsoon', 'neon', 'winter', 'festival'].includes(value)) return false;
      if (['sound', 'music', 'reducedMotion'].includes(key)) value = Boolean(value);
      current[key] = value;
      try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (error) { console.warn('Settings could not be saved.', error); }
      return true;
    },
    reset() {
      current = { ...defaults };
      try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (error) { console.warn('Settings could not be reset.', error); }
    }
  };
})();
