(() => {
  function initialize() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      document.body.innerHTML = '<p style="padding:2rem;color:white">Game could not start: canvas element is missing.</p>';
      return;
    }
    UI.init();
    try {
      Game.init(canvas);
      UI.showHome();
      if (Settings.get('music')) GameAudio.setMusic(true);
      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Offline support is unavailable:', error));
      }
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && ['PLAYING', 'COUNTDOWN'].includes(Game.state)) {
          Game.pause();
          UI.showPauseMenu();
        }
      });
      window.ChaiCatcher = { Game, UI, Settings, GameStorage, GameAudio, Input, Renderer, Items };
    } catch (error) {
      console.error('Chai Catcher failed to initialize:', error);
      UI.setPanel(`<section class="menu"><h2>Unable to start game</h2><p>${UI.escapeHTML(error.message || 'Unknown error')}</p><p>Reload the page. If it continues, open the browser Console and share the red error.</p></section>`);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
