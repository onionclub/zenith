import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Zenith ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state || typeof this.state !== 'object') {
      return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Zenith encountered an error. Please restart.</div>
    }

    if (this.state.hasError) {
      const err = this.state.error
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#333', background: '#fff', maxHeight: '100vh', overflow: 'auto' }}>
          <h2 style={{ fontFamily: 'sans-serif' }}>Zenith Error</h2>
          <p style={{ fontFamily: 'sans-serif', fontSize: '1rem', color: '#c00' }}>
            {err?.message || 'Unknown error'}
          </p>
          {err?.stack && (
            <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto', fontSize: '11px', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {err.stack}
            </pre>
          )}
          <p style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', opacity: 0.7 }}>Try restarting the app.</p>
        </div>
      )
    }
    return this.props.children
  }
}
