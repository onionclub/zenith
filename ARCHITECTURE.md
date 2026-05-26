# Zenith Architecture
- Stack: Tauri v2, React 19, Vite, Tailwind v4, Zustand, cmdk, Turndown.
- Editor Engine: TipTap v3 (ProseMirror) — integrated, styled via custom ProseMirror CSS in index.css. Slash Command menu (/) and Bubble Menu (text selection) active. Table engine with Notion-style ghost borders. Local-first image pipeline (paste/dialog → Tauri save_image → asset protocol).
- File System: Local-first, Tauri FS plugin. Documents saved as JSON in app_data_dir/documents/. Images saved to app_data_dir/.zenith_assets/. Auto-save with 800ms debounce. Export to Markdown via Turndown + save dialog. Export to PDF via window.print() + print CSS.
- Navigation: Sidebar (Cmd/Ctrl+B) with document list, Command Palette (Cmd/Ctrl+K) for search/switch, new document creation, focus/typewriter toggles, export actions.
- Modes: Focus Mode (dims non-active blocks), Typewriter Scrolling (keeps cursor vertically centered), Status Bar (word count + reading time, fades in when idle).
- Polish: Window state remembered (size/position) via tauri-plugin-window-state. Right-click disabled. Global shortcuts: Cmd+S (force save), Cmd+P (export PDF), Cmd+E (export Markdown), Cmd+Shift+F/T (Focus/Typewriter toggle).
- Design Philosophy: Progressive disclosure. Chromeless. 680px max-width reading column. Beautiful print/PDF output with 2cm margins, 11pt type.
