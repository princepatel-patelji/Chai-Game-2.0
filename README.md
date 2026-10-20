# CHAI CATCHER: DESI DASH — Fixed Build

A dependency-free browser game made with HTML, CSS, canvas and vanilla JavaScript. It works as a GitHub Pages static site and can be installed as a PWA where supported.

## What was fixed after reviewing the recording and public repository

- The old `COUNTDOWN` logic used the entire 60/45-second game duration as the “Get Ready!” countdown. This build uses a 3-second start countdown; actual play starts immediately afterwards.
- Endless mode previously used `roundTime = 0`, then subtracted elapsed time from zero and ended instantly. It now counts survival time up and ends when the player loses all lives.
- Challenge mode now increments progress when a good item is caught and completes at 20 catches, or fails when its 45-second timer expires.
- Classic mode now respects the duration selected in Settings.
- The full-screen UI overlay previously intercepted pointer/mouse input on the game board. The overlay is pointer-transparent except for real menu/buttons, so board clicks and dragging move the tray.
- Game Over actions are now real HTML buttons, not just decorative text painted on the canvas.
- Canvas sizing uses `setTransform` on resize; the previous approach could scale inconsistently after repeated resizing.
- Valid PNG icons and a versioned service worker are included to avoid the old invalid icon payload/cache.

## Controls

- Move: Left/Right arrows or A/D.
- Mouse/touch: click or drag on the board to move the tray.
- Pause/resume: pause button or Space/Escape.
- Classic: selected duration and 3 lives.
- Endless: survive as long as possible.
- Challenge: catch 20 positive items in 45 seconds.

## Run locally

Use any static web server from this folder, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish to GitHub Pages

1. Download/unzip the fixed build.
2. In the GitHub repository, replace the corresponding files and folders with the contents of this folder. Keep `index.html` at the repository root.
3. Commit the changes to the branch configured in **Settings → Pages** (normally `main` and `/(root)`).
4. Wait for Pages to finish deployment, then open the game URL and hard refresh with `Ctrl + Shift + R`.
5. If an older service worker still appears: open browser DevTools → Application → Service Workers → Unregister, then Application → Storage → Clear site data, reload.

The ZIP does not modify your GitHub repository automatically; upload/commit its contents to publish it.
