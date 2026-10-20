# Manual smoke test

1. Open the project over HTTP (not by double-clicking `index.html`).
2. Confirm home menu buttons work with mouse and keyboard.
3. Select Classic: after a 3-second countdown, food items should start falling without waiting 60 seconds.
4. Move the tray using arrows, A/D, click, and drag.
5. Pause/resume, restart, and return home.
6. Complete the 30/60/90/120-second Classic timer or lose all 3 lives; the DOM Game Over buttons must work.
7. Select Endless: it must not end immediately; timer counts up and game ends at 0 lives.
8. Select Challenge: catching good food increments the target; success at 20 catches, failure at 45 seconds.
9. Change theme, volume, difficulty, and round duration in Settings and reload; settings persist.
10. Open History, export JSON, clear history, then test the responsive layout at mobile width.
11. Check Console for uncaught errors and Network for 404s.
