# Smalls AI — Pac-Control Nightmare

Static music, video, and gallery page for Smalls AI.

## Build and run locally (Windows PowerShell)

Requires Python 3.10+.

```powershell
python .\scripts\prepare_site.py
python -m http.server 8000 --directory dist
```

Open http://127.0.0.1:8000.

The preparation script copies the tracked page files, safely extracts `data.zip` and `assests.zip` into `dist`, normalizes the legacy `assests` directory typo, rejects path traversal/symlinks, and keeps tracked files authoritative. The website's data registry is tracked at `data/tracks.json`; it no longer depends on the archived `data/tracks.json.txt`.

## Content notes

Only the YouTube and ReverbNation links already present in the archive are enabled. Placeholder social handles and the placeholder YouTube video ID were removed rather than guessed. Audio and gallery assets are optional; missing images are hidden and missing data produces a visible status message.

GitHub Actions builds the static output on pull requests and deploys only after changes reach `main`. The deployment workflow has not yet been run in this review environment.
