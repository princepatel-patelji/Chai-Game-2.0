const GameStorage = (() => {
  const HISTORY_KEY = 'chaiCatcherHistory_v2';
  const BEST_KEY = 'chaiCatcherBestScore_v2';

  function readHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.warn('History could not be read.', error);
      return [];
    }
  }

  return {
    add(record) {
      const history = readHistory();
      history.unshift({ ...record, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100))); }
      catch (error) { console.warn('History could not be saved.', error); }
      const best = this.getBestScore();
      if (Number(record.finalScore) > best) this.setBestScore(Number(record.finalScore));
      return true;
    },
    getAll() { return readHistory(); },
    clear() {
      try { localStorage.removeItem(HISTORY_KEY); return true; }
      catch (error) { console.warn('History could not be cleared.', error); return false; }
    },
    getBestScore() {
      try { return Math.max(0, Number(localStorage.getItem(BEST_KEY)) || 0); }
      catch { return 0; }
    },
    setBestScore(score) {
      try { localStorage.setItem(BEST_KEY, String(Math.max(0, Math.floor(Number(score) || 0)))); }
      catch (error) { console.warn('Best score could not be saved.', error); }
    },
    resetBestScore() {
      try { localStorage.removeItem(BEST_KEY); } catch (error) { console.warn(error); }
    }
  };
})();
