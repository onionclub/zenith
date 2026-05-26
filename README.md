# Zenith

A premium, minimalist, iA Writer-style text editor. Built with Tauri v2, React 19, TipTap v3, and Tailwind v4.

## Features

- **Chromeless Writing** — No distractions. 680px centered reading column.
- **Rich Editing** — Headings, blockquotes, code blocks, tables, task lists, images.
- **Slash Commands** — Type `/` for a floating command menu.
- **Bubble Menu** — Select text for instant formatting (bold, italic, highlight, etc.).
- **Focus Mode** — Dim everything except the current block.
- **Typewriter Scrolling** — Cursor stays vertically centered as you type.
- **Local-First** — All documents saved as JSON in `app_data_dir/documents/`. Images in `app_data_dir/.zenith_assets/`.
- **Auto-Save** — 800ms debounced save. Status indicator in the titlebar.
- **Command Palette** — `Cmd/Ctrl + K` to search docs, create new, toggle modes, export.
- **Export** — Markdown (via Turndown) and PDF (via print CSS).
- **Window State** — Remembers size and position across sessions.

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS or latest)
- [Rust](https://rustup.rs/) (stable)

### Development
```bash
npm install
npm run tauri dev
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Command Palette |
| `Cmd/Ctrl + B` | Toggle Sidebar |
| `Cmd/Ctrl + S` | Force Save |
| `Cmd/Ctrl + P` | Export to PDF / Print |
| `Cmd/Ctrl + E` | Export to Markdown |
| `Cmd/Ctrl + Shift + F` | Toggle Focus Mode |
| `Cmd/Ctrl + Shift + T` | Toggle Typewriter Mode |
| `Escape` | Close Sidebar & Palette |
| `/` in editor | Slash Command Menu |
| `Ctrl + V` (image) | Paste image from clipboard |

---

## Local Windows Build (GNU Toolchain)

Run:
```bash
npm run build:win
```

This compiles a standalone `.exe` and `.msi` installer using your local Rust toolchain.

**Note:** This machine uses the MinGW/GNU toolchain. The compiled binaries are fully offline, no-server executables. Output will be in:
- `src-tauri/target/release/bundle/nsis/` — `.exe` installer
- `src-tauri/target/release/bundle/msi/` — `.msi` installer

---

## Cloud Build (Windows MSVC + macOS ARM64)

For the perfectly optimized Windows MSVC build and the macOS ARM (Apple Silicon) build, push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Zenith v1.0"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

Then tag and push the tag to trigger the release workflow:

```bash
git tag v1.0.0
git push origin v1.0.0
```

After ~15 minutes, go to the **Releases** tab on GitHub to download:
- **`Zenith_1.0.0_x64-setup.exe`** / **`Zenith_1.0.0_x64_en-US.msi`** (Windows x64, MSVC-optimized)
- **`Zenith_1.0.0_aarch64.dmg`** (macOS ARM64 / Apple Silicon)

The workflow can also be triggered manually from the **Actions** tab via `workflow_dispatch`.

---

## macOS Security Bypass

**Important:** Because the Mac app is not signed with an Apple Developer Certificate ($99/year), macOS will show a **"Zenith cannot be verified"** warning on first launch.

### Fix
1. Open **Finder** → **Applications**.
2. **Right-Click** (or **Control-Click**) the Zenith app.
3. Select **Open** from the context menu.
4. Click **Open** again on the prompt.

This permanently bypasses Gatekeeper for this app. You only need to do this once.

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full stack overview and design philosophy.

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for typography, colors, and UI rules.

## License

MIT
