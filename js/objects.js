const Items = (() => {
  const positive = [
    { emoji: '🥟', name: 'Samosa', score: 10, color: '#f4c46a', radius: 22 },
    { emoji: '🍵', name: 'Chai', score: 15, color: '#bc7c3d', radius: 20 },
    { emoji: '🍩', name: 'Jalebi', score: 12, color: '#ff9f1c', radius: 21 },
    { emoji: '🍪', name: 'Biscuit', score: 8, color: '#d2a16a', radius: 18 },
    { emoji: '🍕', name: 'Pizza', score: 10, color: '#ffb347', radius: 22 },
    { emoji: '🍬', name: 'Mithai', score: 12, color: '#ff78a8', radius: 18 },
    { emoji: '🥨', name: 'Namkeen', score: 9, color: '#e6b75f', radius: 19 },
    { emoji: '🍦', name: 'Kulfi', score: 14, color: '#fff4d6', radius: 20 }
  ];
  const negative = [
    { emoji: '🧪', name: 'Bad Mix', score: -5, color: '#72e0a2', radius: 21 },
    { emoji: '💣', name: 'Chaos Bomb', score: -8, color: '#5b5367', radius: 20 },
    { emoji: '🦠', name: 'Germ', score: -6, color: '#70c978', radius: 19 }
  ];
  const powerUps = [
    { emoji: '🛡️', name: 'Shield', type: 'shield', score: 0, color: '#75c9ff', radius: 22, duration: 8000 },
    { emoji: '🧲', name: 'Magnet', type: 'magnet', score: 0, color: '#e9a3ff', radius: 22, duration: 8000 },
    { emoji: '⭐', name: 'Double Score', type: 'doubleScore', score: 0, color: '#ffd166', radius: 22, duration: 8000 }
  ];

  function choose(list) { return { ...list[Math.floor(Math.random() * list.length)] }; }
  return {
    spawnPositive(difficulty) { const item = choose(positive); item.speed = 2.1 + difficulty * 1.65 + Math.random() * 1.2; item.kind = 'positive'; return item; },
    spawnNegative(difficulty) { const item = choose(negative); item.speed = 2.25 + difficulty * 1.8 + Math.random() * 1.3; item.kind = 'negative'; return item; },
    spawnPowerUp(difficulty) { const item = choose(powerUps); item.speed = 1.9 + difficulty * 1.3; item.kind = 'powerup'; item.isPowerUp = true; return item; }
  };
})();
