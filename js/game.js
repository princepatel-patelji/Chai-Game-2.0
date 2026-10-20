const Game = {
  state: 'HOME', // HOME, MODE_SELECT, COUNTDOWN, PLAYING, PAUSED, GAME_OVER, SETTINGS, HISTORY, HOW_TO_PLAY
  stateBeforePause: 'PLAYING',
  canvas: null,
  player: { x: 0, y: 0, width: 88, height: 26, speed: 7 },
  items: [],
  particles: [],
  score: 0,
  lives: 3,
  combo: 0,
  bestCombo: 0,
  timer: 60,
  roundTime: 60, // 0 means endless
  countdownRemaining: 3,
  startTime: 0,
  pauseStartedAt: 0,
  difficulty: 0.1,
  powerUpsActive: Object.create(null),
  lastSpawn: 0,
  spawnRate: 900,
  itemsCaught: 0,
  negativesCaught: 0,
  lastFrame: 0,
  lastHudUpdate: 0,
  animationId: 0,
  ended: false,

  init(canvas) {
    this.canvas = canvas;
    Renderer.init(canvas);
    Input.init(canvas);
    this.resizePlayer();
    this.lastFrame = 0;
    this.animationId = requestAnimationFrame((time) => this.loop(time));
  },

  loop(timestamp) {
    if (!this.lastFrame) this.lastFrame = timestamp;
    const dt = Math.min(Math.max(timestamp - this.lastFrame, 0), 100);
    this.lastFrame = timestamp;

    if (this.state === 'COUNTDOWN') this.updateCountdown(dt);
    else if (this.state === 'PLAYING') this.updatePlaying(dt);

    Renderer.draw(this);
    if (timestamp - this.lastHudUpdate >= 100) {
      UI.refreshHUD();
      this.lastHudUpdate = timestamp;
    }
    this.animationId = requestAnimationFrame((time) => this.loop(time));
  },

  resizePlayer() {
    if (!this.canvas) return;
    this.player.width = Math.min(96, Math.max(70, Renderer.width * 0.12));
    this.player.height = Math.max(22, Math.min(30, Renderer.height * 0.035));
    this.player.x = Math.max(0, Math.min(Renderer.width - this.player.width, this.player.x || (Renderer.width - this.player.width) / 2));
    this.player.y = Math.max(0, Renderer.height - this.player.height - 28);
  },

  clampPlayer() {
    this.player.x = Math.max(0, Math.min(Math.max(0, Renderer.width - this.player.width), this.player.x));
  },

  startRound(timeLimit) {
    const requested = Number(timeLimit);
    this.roundTime = Number.isFinite(requested) && requested > 0 ? requested : 0;
    this.timer = this.roundTime;
    this.countdownRemaining = 3;
    this.startTime = 0;
    this.pauseStartedAt = 0;
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.items = [];
    this.particles = [];
    this.powerUpsActive = Object.create(null);
    this.itemsCaught = 0;
    this.negativesCaught = 0;
    this.difficulty = this.getDifficultyStart();
    this.lastSpawn = 0;
    this.ended = false;
    this.state = 'COUNTDOWN';
    this.resizePlayer();
    GameAudio.playStart();
    UI.refreshHUD();
  },

  getDifficultyStart() {
    const levels = { easy: 0.04, normal: 0.10, hard: 0.18 };
    return levels[Settings.get('difficulty')] || levels.normal;
  },

  updateCountdown(dt) {
    this.countdownRemaining = Math.max(0, this.countdownRemaining - dt / 1000);
    if (this.countdownRemaining <= 0) {
      this.state = 'PLAYING';
      this.startTime = performance.now();
      this.timer = this.roundTime > 0 ? this.roundTime : 0;
      this.lastSpawn = 0;
      this.lastFrame = performance.now();
      GameAudio.playStart();
      UI.refreshHUD();
    }
  },

  updatePlaying(dt) {
    const elapsedSeconds = Math.max(0, (performance.now() - this.startTime) / 1000);
    if (this.roundTime > 0) {
      this.timer = Math.max(0, this.roundTime - elapsedSeconds);
      if (this.timer <= 0) {
        this.endGame('time');
        return;
      }
    } else {
      // Endless mode is a survival timer, not a zero-second round.
      this.timer = elapsedSeconds;
    }

    this.updatePlayer(dt);
    this.updatePowerUps(dt);
    this.updateItems(dt);
    if (this.state !== 'PLAYING') return;
    this.updateParticles(dt);
    this.updateDifficulty(elapsedSeconds);
    this.spawnItems(dt);

    if (UI.currentMode === 'Challenge' && UI.challengeCurrent >= UI.challengeTarget) {
      this.endGame('challenge-success');
    }
  },

  updatePlayer(dt) {
    const direction = (Input.isRight() ? 1 : 0) - (Input.isLeft() ? 1 : 0);
    if (direction) this.player.x += direction * this.player.speed * (dt / 16.667);
    this.clampPlayer();
  },

  updateDifficulty(elapsedSeconds) {
    const base = this.getDifficultyStart();
    const ramp = Settings.get('difficulty') === 'easy' ? 0.004 : Settings.get('difficulty') === 'hard' ? 0.014 : 0.008;
    this.difficulty = Math.min(0.85, base + elapsedSeconds * ramp);
    this.spawnRate = Math.max(360, 1050 - this.difficulty * 620);
  },

  spawnItems(dt) {
    this.lastSpawn += dt;
    if (this.lastSpawn < this.spawnRate) return;
    this.lastSpawn = 0;

    const positive = Items.spawnPositive(this.difficulty);
    positive.x = positive.radius + Math.random() * Math.max(1, Renderer.width - positive.radius * 2);
    positive.y = -positive.radius - 3;
    this.items.push(positive);

    const badChance = Math.min(0.42, 0.18 + this.difficulty * 0.28);
    if (Math.random() < badChance) {
      const negative = Items.spawnNegative(this.difficulty);
      negative.x = negative.radius + Math.random() * Math.max(1, Renderer.width - negative.radius * 2);
      negative.y = -negative.radius - 3;
      this.items.push(negative);
    }
    if (Math.random() < 0.035) {
      const powerUp = Items.spawnPowerUp(this.difficulty);
      powerUp.x = powerUp.radius + Math.random() * Math.max(1, Renderer.width - powerUp.radius * 2);
      powerUp.y = -powerUp.radius - 3;
      this.items.push(powerUp);
    }
  },

  updateItems(dt) {
    const scale = dt / 16.667;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (this.powerUpsActive.magnet && item.kind === 'positive') {
        const targetX = this.player.x + this.player.width / 2;
        item.x += (targetX - item.x) * Math.min(0.09, 0.035 * scale);
      }
      item.y += item.speed * scale;

      if (this.checkCollision(item, this.player)) {
        this.handleCatch(item);
        this.items.splice(i, 1);
        if (this.state !== 'PLAYING') return;
        continue;
      }

      if (item.y - item.radius > Renderer.height + 10) {
        this.items.splice(i, 1);
        if (item.kind === 'positive') this.combo = 0;
      }
    }
  },

  checkCollision(item, player) {
    const closestX = Math.max(player.x, Math.min(item.x, player.x + player.width));
    const closestY = Math.max(player.y, Math.min(item.y, player.y + player.height));
    const dx = item.x - closestX;
    const dy = item.y - closestY;
    return dx * dx + dy * dy <= item.radius * item.radius;
  },

  handleCatch(item) {
    if (item.isPowerUp || item.kind === 'powerup') {
      this.powerUpsActive[item.type] = item.duration || 8000;
      this.addBurst(item.x, item.y, item.color, 14);
      GameAudio.playPowerUp();
      this.addFloatingScore(item.x, item.y, item.name, '#ffffff');
      return;
    }

    if (item.kind === 'negative' || item.score < 0) {
      if (this.powerUpsActive.shield) {
        delete this.powerUpsActive.shield;
        this.addBurst(item.x, item.y, '#75c9ff', 12);
        this.addFloatingScore(item.x, item.y, 'BLOCKED!', '#75c9ff');
        GameAudio.playPowerUp();
        return;
      }
      this.score = Math.max(0, this.score + item.score);
      this.lives -= 1;
      this.combo = 0;
      this.negativesCaught += 1;
      this.addBurst(item.x, item.y, '#ff6b75', 10);
      this.addFloatingScore(item.x, item.y, `${item.score}  ♥-1`, '#ff8a9d');
      GameAudio.playNegative();
      if (this.lives <= 0) this.endGame('lives');
      return;
    }

    let gained = item.score;
    if (this.powerUpsActive.doubleScore) gained *= 2;
    gained = Math.floor(gained * (1 + Math.floor(this.combo / 5) * 0.2));
    this.score += gained;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.itemsCaught += 1;
    this.addBurst(item.x, item.y, item.color, 5);
    this.addFloatingScore(item.x, item.y, `+${gained}`, '#fff0a7');
    GameAudio.playCatch();

    if (UI.currentMode === 'Challenge') {
      UI.challengeCurrent = Math.min(UI.challengeTarget, UI.challengeCurrent + 1);
      UI.refreshHUD();
    }
  },

  updatePowerUps(dt) {
    for (const [type, remaining] of Object.entries(this.powerUpsActive)) {
      const next = remaining - dt;
      if (next <= 0) delete this.powerUpsActive[type];
      else this.powerUpsActive[type] = next;
    }
  },

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * (dt / 16.667);
      p.y += p.vy * (dt / 16.667);
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  },

  addBurst(x, y, color, count) {
    if (Settings.get('reducedMotion')) count = Math.min(3, count);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y, color,
        life: 420 + Math.random() * 220,
        maxLife: 640,
        vx: (Math.random() - 0.5) * 4.5,
        vy: (Math.random() - 0.5) * 4.5,
        size: 2 + Math.random() * 3
      });
    }
  },

  addFloatingScore(x, y, text, color) {
    this.particles.push({ x, y, text, color, life: 750, maxLife: 750, vx: 0, vy: -1.1, size: 0 });
  },

  pause() {
    if (!['PLAYING', 'COUNTDOWN'].includes(this.state)) return;
    this.stateBeforePause = this.state;
    this.pauseStartedAt = performance.now();
    this.state = 'PAUSED';
  },

  resume() {
    if (this.state !== 'PAUSED') return;
    const now = performance.now();
    if (this.stateBeforePause === 'PLAYING' && this.startTime) this.startTime += now - this.pauseStartedAt;
    this.state = this.stateBeforePause || 'PLAYING';
    this.pauseStartedAt = 0;
    this.lastFrame = now;
  },

  endGame(reason = 'time') {
    if (this.ended) return;
    this.ended = true;
    this.state = 'GAME_OVER';
    const isEndless = this.roundTime === 0;
    const survived = isEndless ? this.timer : Math.max(0, this.roundTime - this.timer);
    const record = {
      date: new Date().toISOString(),
      mode: UI.currentMode,
      roundTime: this.roundTime,
      finalScore: this.score,
      bestCombo: this.bestCombo,
      itemsCaught: this.itemsCaught,
      negativesCaught: this.negativesCaught,
      survivalTime: Math.floor(survived),
      challengeResult: reason === 'challenge-success' ? 'Success' : (UI.currentMode === 'Challenge' ? 'Failed' : null),
      reason,
      version: '2.0-fixed'
    };
    GameStorage.add(record);
    GameAudio.playGameOver();
    UI.showGameOver(record);
  }
};
