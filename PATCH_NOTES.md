# Video-based diagnosis

The recording shows that selecting a mode does trigger a transition from the mode menu into the game screen, so the first demonstrated failure is not a dead menu click. The screen remains on “Get Ready!” with no falling snacks because the existing game decrements `this.timer` (60 seconds for Classic or 45 seconds for Challenge) inside `updateCountdown()`. It only enters `PLAYING` once that entire value reaches zero.

Source-level issues found in the public repository:

1. `js/game.js`: the `COUNTDOWN` state uses the whole round duration, producing a 60-second pre-game wait.
2. `js/game.js`: Endless mode sets the round duration to zero; `updatePlaying()` computes `0 - elapsed`, immediately ending the round.
3. `js/game.js` and `js/ui.js`: no code increments `UI.challengeCurrent`, so Challenge cannot reach its target.
4. `js/ui.js`: Classic mode always starts at 60 seconds, ignoring the duration stored by Settings.
5. `styles.css`: the full-screen overlay had `pointer-events: auto`; this can intercept mouse/pointer interaction over the playfield. The corrected build lets unoccupied overlay space pass input through while preserving clicks on menu buttons.
6. `js/renderer.js`: Game Over actions were also drawn on the canvas, which is decorative/non-interactive; this build uses accessible DOM buttons for actions.
7. Icon paths/data and the service-worker cache were normalized in the fixed build.
