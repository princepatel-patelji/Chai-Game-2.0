const UI = {
  overlay: null,
  currentMode: 'Classic',
  challengeTarget: 20,
  challengeCurrent: 0,
  challengeResult: null,

  init() { this.overlay = document.getElementById('ui-overlay'); },

  setPanel(html) {
    this.overlay.innerHTML = html;
    this.overlay.classList.remove('hidden');
  },

  showHome() {
    Game.state = 'HOME';
    Input.stopDragging();
    this.setPanel(`
      <section class="menu" role="region" aria-label="Main menu">
        <div class="logo-badge" aria-hidden="true">☕</div>
        <h1>CHAI CATCHER</h1>
        <p class="tagline">Catch the Chai. Dodge the Chaos!</p>
        <div class="button-row">
          <button id="playBtn">Play</button>
          <button id="modeBtn" class="secondary">Select Mode</button>
          <button id="historyBtn" class="secondary">Game History</button>
          <button id="settingsBtn" class="secondary">Settings</button>
          <button id="howtoBtn" class="secondary">How to Play</button>
        </div>
        <p class="best-score">Best Score: <span id="bestScore">${GameStorage.getBestScore()}</span></p>
        <div class="credit">Created by Prince Patel</div>
      </section>
    `);
    document.getElementById('playBtn').onclick = () => { GameAudio.playClick(); this.startSelectedGame(); };
    document.getElementById('modeBtn').onclick = () => { GameAudio.playClick(); this.showModeSelect(); };
    document.getElementById('historyBtn').onclick = () => { GameAudio.playClick(); this.showHistory(); };
    document.getElementById('settingsBtn').onclick = () => { GameAudio.playClick(); this.showSettings(); };
    document.getElementById('howtoBtn').onclick = () => { GameAudio.playClick(); this.showHowTo(); };
  },

  showModeSelect() {
    Game.state = 'MODE_SELECT';
    this.setPanel(`
      <section class="menu" role="region" aria-label="Select game mode">
        <h2>Select Game Mode</h2>
        <div class="button-row">
          <button class="mode-button" id="classicBtn">Classic Chai<small>${Settings.get('roundTime')} seconds · 3 lives</small></button>
          <button class="mode-button" id="endlessBtn">Endless Tapri<small>Survive as long as possible</small></button>
          <button class="mode-button" id="challengeBtn">Challenge Mode<small>Catch 20 good items in 45 seconds</small></button>
        </div>
        <div class="button-row"><button id="backBtn" class="secondary">Back to Home</button></div>
      </section>
    `);
    document.getElementById('classicBtn').onclick = () => { GameAudio.playClick(); this.currentMode = 'Classic'; this.challengeResult = null; this.beginGame(Settings.get('roundTime')); };
    document.getElementById('endlessBtn').onclick = () => { GameAudio.playClick(); this.currentMode = 'Endless'; this.challengeResult = null; this.beginGame(0); };
    document.getElementById('challengeBtn').onclick = () => {
      GameAudio.playClick(); this.currentMode = 'Challenge'; this.challengeTarget = 20; this.challengeCurrent = 0; this.challengeResult = null; this.beginGame(45);
    };
    document.getElementById('backBtn').onclick = () => this.showHome();
  },

  startSelectedGame() {
    this.currentMode = 'Classic';
    this.challengeCurrent = 0;
    this.challengeResult = null;
    this.beginGame(Settings.get('roundTime'));
  },

  beginGame(timeLimit) {
    Game.startRound(timeLimit);
    this.showHUD();
    const canvas = document.getElementById('gameCanvas');
    if (canvas) canvas.focus({ preventScroll: true });
  },

  showHUD() {
    this.setPanel(`
      <div id="hud" aria-label="Game status">
        <div class="hud-group">
          <span class="hud-pill">Score: <span id="scoreValue">0</span></span>
          <span class="hud-pill">Time: <span id="timerValue">3</span></span>
          <span class="hud-pill">Lives: <span id="livesValue">3</span> ❤️</span>
          <span class="hud-pill">Combo: <span id="comboValue">0</span></span>
          ${this.currentMode === 'Challenge' ? '<span class="hud-pill" id="challengeStat">Challenge: <span id="challengeValue">0/20</span></span>' : ''}
        </div>
        <div class="hud-actions"><button id="pauseBtn" aria-label="Pause game" title="Pause game">Ⅱ</button></div>
      </div>
    `);
    document.getElementById('pauseBtn').onclick = () => this.togglePause();
    this.refreshHUD();
  },

  formatTime(seconds, countUp = false) {
    if (countUp) {
      const total = Math.max(0, Math.floor(Number(seconds) || 0));
      return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    }
    return `${Math.max(0, Math.ceil(Number(seconds) || 0))}s`;
  },

  refreshHUD() {
    const score = document.getElementById('scoreValue');
    const timer = document.getElementById('timerValue');
    const lives = document.getElementById('livesValue');
    const combo = document.getElementById('comboValue');
    const challenge = document.getElementById('challengeValue');
    if (score) score.textContent = String(Game.score);
    if (timer) timer.textContent = Game.state === 'COUNTDOWN' ? `${Math.ceil(Game.countdownRemaining)}…` : (Game.roundTime === 0 ? this.formatTime(Game.timer, true) : this.formatTime(Game.timer));
    if (lives) lives.textContent = String(Game.lives);
    if (combo) combo.textContent = String(Game.combo);
    if (challenge) challenge.textContent = `${this.challengeCurrent}/${this.challengeTarget}`;
  },

  togglePause() {
    if (['PLAYING', 'COUNTDOWN'].includes(Game.state)) {
      Game.pause();
      this.showPauseMenu();
    } else if (Game.state === 'PAUSED') {
      this.resumeGame();
    }
  },

  showPauseMenu() {
    this.setPanel(`
      <section class="menu" role="dialog" aria-modal="true" aria-label="Game paused">
        <h2>Game Paused</h2>
        <p class="menu-copy">Take a breath, chai is safe. ☕</p>
        <div class="button-row">
          <button id="resumeBtn">Resume</button>
          <button id="restartBtn" class="secondary">Restart</button>
          <button id="menuBtn" class="secondary">Main Menu</button>
        </div>
      </section>
    `);
    document.getElementById('resumeBtn').onclick = () => this.resumeGame();
    document.getElementById('restartBtn').onclick = () => this.beginGame(Game.roundTime);
    document.getElementById('menuBtn').onclick = () => this.showHome();
  },

  resumeGame() {
    Game.resume();
    this.showHUD();
  },

  showGameOver(record) {
    this.challengeResult = this.currentMode === 'Challenge'
      ? (record.challengeResult === 'Success' ? 'Success' : 'Failed')
      : null;
    const isSuccess = this.currentMode === 'Challenge' && this.challengeResult === 'Success';
    this.setPanel(`
      <section class="menu" role="region" aria-label="Game results">
        <div class="logo-badge" aria-hidden="true" style="width:70px;height:70px;font-size:40px;margin-bottom:10px;">${isSuccess ? '🏆' : '☕'}</div>
        <h2>${isSuccess ? 'Challenge Complete!' : 'Game Over'}</h2>
        <p>${isSuccess ? 'Twenty tasty catches. Brilliant!' : 'Good run! Ready for another round?'}</p>
        <div class="stat-grid">
          <div class="stat">Final Score<strong>${Game.score}</strong></div>
          <div class="stat">Items Caught<strong>${Game.itemsCaught}</strong></div>
          <div class="stat">Best Combo<strong>${Game.bestCombo}</strong></div>
          <div class="stat">Bad Items<strong>${Game.negativesCaught}</strong></div>
        </div>
        ${this.currentMode === 'Challenge' ? `<p>Challenge: ${this.challengeCurrent}/${this.challengeTarget} · ${this.challengeResult}</p>` : ''}
        ${Game.score >= GameStorage.getBestScore() && Game.score > 0 ? '<p style="color:var(--gold);font-weight:800;">🏅 New personal best!</p>' : ''}
        <div class="button-row">
          <button id="playAgainBtn">Play Again</button>
          <button id="homeBtn" class="secondary">Home</button>
          <button id="historyBtn" class="secondary">View History</button>
        </div>
      </section>
    `);
    document.getElementById('playAgainBtn').onclick = () => this.showModeSelect();
    document.getElementById('homeBtn').onclick = () => this.showHome();
    document.getElementById('historyBtn').onclick = () => this.showHistory();
  },

  showHistory() {
    Game.state = 'HISTORY';
    const games = GameStorage.getAll().sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = games.length;
    const avg = total ? Math.round(games.reduce((sum, game) => sum + (Number(game.finalScore) || 0), 0) / total) : 0;
    const best = games.reduce((max, game) => Math.max(max, Number(game.finalScore) || 0), GameStorage.getBestScore());
    const rows = games.slice(0, 12).map((game) => `
      <tr><td>${this.escapeHTML(new Date(game.date).toLocaleDateString())}</td><td>${this.escapeHTML(game.mode || 'Classic')}</td><td>${Math.max(0, Number(game.finalScore) || 0)}</td><td>${Math.max(0, Number(game.itemsCaught) || 0)}</td></tr>
    `).join('');
    this.setPanel(`
      <section class="panel" role="region" aria-label="Game history">
        <h2>Game History</h2>
        <div class="stat-grid">
          <div class="stat">Total Games<strong>${total}</strong></div>
          <div class="stat">Average Score<strong>${avg}</strong></div>
          <div class="stat">Best Score<strong>${best}</strong></div>
          <div class="stat">Items Caught<strong>${games.reduce((sum, game) => sum + (Number(game.itemsCaught) || 0), 0)}</strong></div>
        </div>
        ${total ? `<div class="history-scroll"><table class="history-list"><thead><tr><th>Date</th><th>Mode</th><th>Score</th><th>Caught</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p class="empty-state">No games recorded yet. Play your first round!</p>'}
        <div class="button-row">
          <button id="exportHistoryBtn" class="secondary" ${total ? '' : 'disabled'}>Export JSON</button>
          <button id="clearHistoryBtn" class="danger" ${total ? '' : 'disabled'}>Clear History</button>
          <button id="backHomeBtn">Back</button>
        </div>
      </section>
    `);
    document.getElementById('backHomeBtn').onclick = () => this.showHome();
    document.getElementById('exportHistoryBtn').onclick = () => this.exportHistory(games);
    document.getElementById('clearHistoryBtn').onclick = () => {
      if (window.confirm('Clear all saved game history? This cannot be undone.')) {
        GameStorage.clear();
        this.showHistory();
      }
    };
  },

  showSettings() {
    Game.state = 'SETTINGS';
    const s = Settings.all();
    this.setPanel(`
      <section class="panel" role="region" aria-label="Settings">
        <h2>Settings</h2>
        <div class="form-grid">
          <div class="form-row"><label for="volumeSlider">Sound volume: <span id="volumeValue">${Math.round(s.volume * 100)}%</span></label><input id="volumeSlider" type="range" min="0" max="1" step="0.05" value="${s.volume}"></div>
          <div class="form-row"><label for="timeSlider">Classic round duration</label><select id="timeSlider"><option value="30" ${s.roundTime === 30 ? 'selected' : ''}>30 seconds</option><option value="60" ${s.roundTime === 60 ? 'selected' : ''}>60 seconds</option><option value="90" ${s.roundTime === 90 ? 'selected' : ''}>90 seconds</option><option value="120" ${s.roundTime === 120 ? 'selected' : ''}>120 seconds</option></select></div>
          <div class="form-row"><label for="difficultySelect">Difficulty</label><select id="difficultySelect"><option value="easy" ${s.difficulty === 'easy' ? 'selected' : ''}>Easy</option><option value="normal" ${s.difficulty === 'normal' ? 'selected' : ''}>Normal</option><option value="hard" ${s.difficulty === 'hard' ? 'selected' : ''}>Hard</option></select></div>
          <div class="form-row"><label for="themeSelect">Game theme</label><select id="themeSelect"><option value="sunset" ${s.theme === 'sunset' ? 'selected' : ''}>Sunset Chai Stall</option><option value="monsoon" ${s.theme === 'monsoon' ? 'selected' : ''}>Monsoon Evening</option><option value="neon" ${s.theme === 'neon' ? 'selected' : ''}>Neon Tapri</option><option value="winter" ${s.theme === 'winter' ? 'selected' : ''}>Winter Chai</option><option value="festival" ${s.theme === 'festival' ? 'selected' : ''}>Festival</option></select></div>
        </div>
        <div style="margin:16px auto;max-width:480px;text-align:left;">
          <label class="setting-check"><input id="soundToggle" type="checkbox" ${s.sound ? 'checked' : ''}> Sound effects</label>
          <label class="setting-check"><input id="musicToggle" type="checkbox" ${s.music ? 'checked' : ''}> Soft synthesized background music</label>
          <label class="setting-check"><input id="motionToggle" type="checkbox" ${s.reducedMotion ? 'checked' : ''}> Reduce motion effects</label>
        </div>
        <p class="panel-note">Settings save automatically on this device. Classic mode uses the selected duration; Challenge remains 45 seconds.</p>
        <div class="button-row"><button id="settingsBackBtn">Save &amp; Back</button><button id="resetSettingsBtn" class="secondary">Reset Defaults</button></div>
      </section>
    `);
    document.getElementById('volumeSlider').oninput = (event) => {
      const volume = Number(event.target.value);
      Settings.set('volume', volume);
      document.getElementById('volumeValue').textContent = `${Math.round(volume * 100)}%`;
      GameAudio.setVolume(volume);
    };
    document.getElementById('timeSlider').onchange = (event) => Settings.set('roundTime', Number(event.target.value));
    document.getElementById('difficultySelect').onchange = (event) => Settings.set('difficulty', event.target.value);
    document.getElementById('themeSelect').onchange = (event) => Settings.set('theme', event.target.value);
    document.getElementById('soundToggle').onchange = (event) => Settings.set('sound', event.target.checked);
    document.getElementById('musicToggle').onchange = (event) => {
      Settings.set('music', event.target.checked);
      GameAudio.setMusic(event.target.checked);
    };
    document.getElementById('motionToggle').onchange = (event) => Settings.set('reducedMotion', event.target.checked);
    document.getElementById('settingsBackBtn').onclick = () => this.showHome();
    document.getElementById('resetSettingsBtn').onclick = () => {
      Settings.reset();
      GameAudio.setVolume(Settings.get('volume'));
      GameAudio.setMusic(Settings.get('music'));
      this.showSettings();
    };
  },

  showHowTo() {
    Game.state = 'HOW_TO_PLAY';
    this.setPanel(`
      <section class="menu" role="region" aria-label="How to play">
        <h2>How to Play</h2>
        <div class="menu-copy">
          <p>🧺 Move your tray to catch tasty snacks and chai for points.</p>
          <p>☣️ Dodge the bad items. Each one you catch costs a life.</p>
          <p>⭐ Catch power-ups for shields, magnets, or double points.</p>
          <p><strong>Keyboard:</strong> <kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd>.</p>
          <p><strong>Mouse / touch:</strong> click or drag across the board to move the tray.</p>
          <p><strong>Pause:</strong> click Ⅱ or press <kbd>Space</kbd>/<kbd>Esc</kbd>.</p>
          <p>Classic: survive the selected round duration. Endless: survive as long as you can. Challenge: catch 20 good items in 45 seconds.</p>
        </div>
        <div class="button-row"><button id="howToBackBtn">Back to Home</button><button id="howToPlayBtn" class="secondary">Play Now</button></div>
      </section>
    `);
    document.getElementById('howToBackBtn').onclick = () => this.showHome();
    document.getElementById('howToPlayBtn').onclick = () => this.startSelectedGame();
  },

  exportHistory(games) {
    const blob = new Blob([JSON.stringify(games, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chai-catcher-history-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }
};
