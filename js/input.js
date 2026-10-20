const Input = {
  keys: Object.create(null),
  canvas: null,
  dragging: false,
  pointerId: null,

  init(canvas) {
    this.canvas = canvas;
    window.addEventListener('keydown', (event) => {
      const key = event.key;
      if (['ArrowLeft', 'ArrowRight', ' ', 'Escape', 'a', 'A', 'd', 'D'].includes(key)) {
        if (!event.repeat && [' ', 'Escape'].includes(key)) {
          if (Game.state === 'PLAYING' || Game.state === 'COUNTDOWN') UI.togglePause();
          else if (Game.state === 'PAUSED') UI.resumeGame();
        }
        if (['ArrowLeft', 'ArrowRight', ' '].includes(key)) event.preventDefault();
      }
      this.keys[key] = true;
    }, { passive: false });
    window.addEventListener('keyup', (event) => { this.keys[event.key] = false; });
    window.addEventListener('blur', () => { this.keys = Object.create(null); this.stopDragging(); });

    // Board clicks reposition the basket; pointer-dragging works with mouse, touch, and pen.
    canvas.addEventListener('pointerdown', (event) => {
      if (Game.state !== 'PLAYING') return;
      event.preventDefault();
      this.dragging = true;
      this.pointerId = event.pointerId;
      try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
      this.movePlayerToEvent(event);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (this.dragging && (this.pointerId === null || event.pointerId === this.pointerId)) {
        event.preventDefault();
        this.movePlayerToEvent(event);
      }
    });
    canvas.addEventListener('pointerup', () => this.stopDragging());
    canvas.addEventListener('pointercancel', () => this.stopDragging());
    canvas.addEventListener('lostpointercapture', () => this.stopDragging());
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  },

  movePlayerToEvent(event) {
    if (!this.canvas || Game.state !== 'PLAYING') return;
    const rect = this.canvas.getBoundingClientRect();
    Game.player.x = event.clientX - rect.left - Game.player.width / 2;
    Game.clampPlayer();
  },
  stopDragging() { this.dragging = false; this.pointerId = null; },
  isLeft() { return Boolean(this.keys.ArrowLeft || this.keys.a || this.keys.A); },
  isRight() { return Boolean(this.keys.ArrowRight || this.keys.d || this.keys.D); }
};
