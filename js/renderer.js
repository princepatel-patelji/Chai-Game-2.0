const Renderer = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  dpr: 1,
  decorations: [],

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) throw new Error('Your browser does not support the canvas required by this game.');
    this.resize();
    this.makeDecorations();
    window.addEventListener('resize', () => { this.resize(); this.makeDecorations(); Game.resizePlayer(); });
  },
  resize() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },
  makeDecorations() {
    this.decorations = Array.from({ length: 9 }, (_, i) => ({
      x: (0.08 + Math.random() * 0.84) * this.width,
      y: (0.05 + Math.random() * 0.72) * this.height,
      r: 12 + Math.random() * Math.min(35, this.width * 0.035),
      alpha: 0.08 + Math.random() * 0.07,
      phase: i * 0.8
    }));
  },
  clear() { this.ctx.clearRect(0, 0, this.width, this.height); },
  drawBackground(theme) {
    const palettes = {
      sunset: ['#ff9f1c', '#ff6b75', '#c95545'],
      monsoon: ['#2f6f70', '#274e66', '#1d2c4b'],
      neon: ['#5d2594', '#3b1c66', '#1a0b2e'],
      winter: ['#9dc5e8', '#657fa6', '#303e67'],
      festival: ['#ff5c5c', '#e63d78', '#9e245d']
    };
    const colors = palettes[theme] || palettes.sunset;
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.56, colors[1]);
    gradient.addColorStop(1, colors[2]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    const time = performance.now() / 1000;
    this.ctx.save();
    for (const item of this.decorations) {
      const drift = Settings.get('reducedMotion') ? 0 : Math.sin(time * 0.35 + item.phase) * 8;
      this.ctx.globalAlpha = item.alpha;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(item.x + drift, item.y, item.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
    this.drawGroundGlow();
  },
  drawGroundGlow() {
    const gradient = this.ctx.createLinearGradient(0, this.height * 0.82, 0, this.height);
    gradient.addColorStop(0, 'rgba(36,20,61,0)');
    gradient.addColorStop(1, 'rgba(36,20,61,.12)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, this.height * 0.82, this.width, this.height * 0.18);
  },
  drawItem(item) {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = 'rgba(30, 10, 30, .30)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    ctx.fillStyle = item.color || '#ffd166';
    ctx.globalAlpha = 0.65;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(item.radius * 1.5)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.fillText(item.emoji, item.x, item.y + 1);
    ctx.restore();
  },
  drawPlayer(player) {
    const ctx = this.ctx;
    const x = player.x, y = player.y, w = player.width, h = player.height;
    ctx.save();
    ctx.shadowColor = 'rgba(30,10,30,.32)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, [4, 4, 12, 12]);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x + 7, y + 5, w - 14, 3);
    ctx.fillStyle = 'rgba(255,244,214,.5)';
    ctx.fillRect(x + 10, y + h - 6, w - 20, 2);
    ctx.restore();
  },
  drawParticles(particles) {
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      if (p.text) {
        ctx.fillStyle = p.color;
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },
  drawCountdown(seconds) {
    const ctx = this.ctx;
    const text = seconds > 0 ? `Get Ready! ${Math.ceil(seconds)}` : 'GO!';
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${Math.min(46, Math.max(28, this.width * 0.045))}px Arial, sans-serif`;
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(36,20,61,.45)';
    ctx.strokeText(text, this.width / 2, this.height * 0.44);
    ctx.fillStyle = '#ffd166';
    ctx.fillText(text, this.width / 2, this.height * 0.44);
    ctx.restore();
  },
  draw(game) {
    this.clear();
    this.drawBackground(Settings.get('theme'));
    if (['COUNTDOWN', 'PLAYING', 'PAUSED'].includes(game.state)) {
      game.items.forEach(item => this.drawItem(item));
      this.drawPlayer(game.player);
      this.drawParticles(game.particles);
      if (game.state === 'COUNTDOWN') this.drawCountdown(game.countdownRemaining);
    }
  }
};
