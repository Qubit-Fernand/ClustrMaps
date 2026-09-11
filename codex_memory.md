---
banner: https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80
---

# Codex Memory

This repository is the tiny GitHub Pages target embedded by the personal website / Notion export visitor-map block.

## Visitor Map Setup

- The live embed is served from `https://qubit-fernand.github.io/ClustrMaps/` and should stay a small standalone HTML page.
- Do not restore the old ClustrMaps endpoint or its `map_v2.png`; the legacy service broke, and static `map.png` output from MapMyVisitors is only about `180x114`, which looks blurry when enlarged.
- Use the MapMyVisitors JavaScript widget directly in `index.html`.
- The important hidden MapMyVisitors parameter is `t=tt`: it displays `Total Pageviews`. `t=m` is the default monthly range and shows a date line like `Aug. 11th - Sep. 11th`.
- Current intended widget URL:
  `https://mapmyvisitors.com/map.js?d=jphtf95t_gxsh22CxBQ_2xtA8csQOD-jp3rF5A27jqE&cl=1565c0&w=a&t=tt&cmo=9db7d6&cmn=ff6b4a&ct=111827&co=ffffff`
- The Leo Li style reference (`https://leo-li.com/`) uses the same MapMyVisitors trick: blue land on a white background with `t=tt`.

## Layout Notes

- Keep the page chrome-free: body padding `0`, transparent background, and a single centered `.visitor-map-frame`.
- Current size target is `width: min(760px, 100vw)` and `min-height: 373px`, so it fills the Notion iframe block without the gray border look.
- The date line is also hidden with `.mapmyvisitors-date { display: none !important; }` as a belt-and-suspenders guard.

## Verification

- Local preview: run `python3 -m http.server 8068` from this repository and open `http://localhost:8068/`.
- GitHub Pages may lag by about a minute after `git push origin main`; if `curl https://qubit-fernand.github.io/ClustrMaps/` still shows old HTML immediately after a push, wait and retry before changing code.
- When using Playwright screenshots, trash temporary artifacts such as `.playwright-mcp/` and preview PNGs before finishing.

## Local Backups

- MapMyVisitors assets/data can be backed up with `scripts/backup-mapmyvisitors.sh`; it writes timestamped snapshots under `backups/mapmyvisitors/`.
- The first backup snapshot is `backups/mapmyvisitors/20260911-123622/`.
- Important backup files are `map.js`, `widget_call_home.js`, `ajax-map-global-*.jsonp`, `snapshot-summary.json`, `background-w760.png`, and `map-static.png`.
- `snapshot-summary.json` separates the public visible label from raw/internal ajax fields. Do not treat `globalTotal=true`'s raw `count = ...` assignment as the real public total without verifying it; in the first backup it looked non-human-scale.
- These backups preserve the currently accessible MapMyVisitors code and point data, but they do not recover the lost historical ClustrMaps visitor history.

## Repository Hygiene

- As of the visitor-map fix, unrelated local files may exist: `README.md`, `.DS_Store`, `cloudflare-worker.js`, and `visitors.json`. Do not fold them into visitor-map commits unless explicitly requested.
