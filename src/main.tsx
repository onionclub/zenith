import { createRoot } from 'react-dom/client'
import './fonts.css'
import './index.css'
import App from './App.tsx'
import { preloadVoices } from './lib/tts'

// Preload TTS voices so they're ready when user clicks Read Aloud
preloadVoices()

// Theme: check stored preference, fall back to system preference
function applyTheme() {
  const stored = localStorage.getItem('zenith_theme')
  const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', dark)
}
applyTheme()
// Listen for system theme changes (only relevant when no stored preference is set)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (!localStorage.getItem('zenith_theme')) applyTheme()
})

// Global error handler — renders error directly to DOM if React crashes
window.addEventListener('error', (event) => {
  const el = document.getElementById('error-root')
  if (el) {
    el.innerHTML = `<div style="padding:2rem;font-family:monospace;background:#fff;color:#c00"><h2>Global Error</h2><pre style="white-space:pre-wrap">${event.message}\n\n${event.error?.stack || ''}</pre></div>`
  }
})

window.addEventListener('unhandledrejection', (event) => {
  const el = document.getElementById('error-root')
  if (el) {
    el.innerHTML = `<div style="padding:2rem;font-family:monospace;background:#fff;color:#c00"><h2>Unhandled Promise Rejection</h2><pre style="white-space:pre-wrap">${String(event.reason?.message || event.reason)}\n\n${event.reason?.stack || ''}</pre></div>`
  }
})

createRoot(document.getElementById('root')!).render(
  <App />,
)
