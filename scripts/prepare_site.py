from __future__ import annotations

import shutil
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
MAX_TOTAL_UNCOMPRESSED = 250 * 1024 * 1024
MAX_FILE_UNCOMPRESSED = 100 * 1024 * 1024


def safe_extract(archive_path: Path, destination: Path) -> None:
    if not archive_path.exists():
        return
    total_size = 0
    root = destination.resolve()
    with ZipFile(archive_path) as archive:
        for item in archive.infolist():
            relative = PurePosixPath(item.filename)
            if relative.is_absolute() or ".." in relative.parts or not relative.parts:
                raise ValueError(f"Unsafe archive path in {archive_path.name}: {item.filename}")
            if item.is_dir():
                continue
            if item.file_size > MAX_FILE_UNCOMPRESSED:
                raise ValueError(f"Archive member exceeds size limit: {item.filename}")
            total_size += item.file_size
            if total_size > MAX_TOTAL_UNCOMPRESSED:
                raise ValueError(f"Archive exceeds total extraction size limit: {archive_path.name}")
            mode = (item.external_attr >> 16) & 0o170000
            if mode == 0o120000:
                raise ValueError(f"Symbolic links are not allowed in site assets: {item.filename}")
            parts = tuple("assets" if part.lower() == "assests" else part for part in relative.parts)
            target = destination.joinpath(*parts).resolve()
            if not target.is_relative_to(root):
                raise ValueError(f"Archive path escapes output directory: {item.filename}")
            # Tracked files always take precedence over archive members.
            if target.exists():
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(item) as source, target.open("wb") as output:
                shutil.copyfileobj(source, output)


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    for name in ("index.html", "script.js", "styles.css"):
        source = ROOT / name
        if not source.is_file():
            raise FileNotFoundError(f"Required site file is missing: {name}")
        shutil.copy2(source, DIST / name)
    data_source = ROOT / "data" / "tracks.json"
    if not data_source.is_file():
        raise FileNotFoundError("Required content file is missing: data/tracks.json")
    (DIST / "data").mkdir(parents=True, exist_ok=True)
    shutil.copy2(data_source, DIST / "data" / "tracks.json")
    safe_extract(ROOT / "data.zip", DIST)
    safe_extract(ROOT / "assests.zip", DIST)
    # Older archive data is retained only as an archive; do not serve the stale .json.txt file.
    (DIST / "data" / "tracks.json.txt").unlink(missing_ok=True)
    print(f"Prepared static site in {DIST}")
    print("Checked tracked entry files and extracted only safe archive paths.")
    print("The cover image is optional; the page hides it if the image is unavailable.")


if __name__ == "__main__":
    main()
