import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('LunaBase failed to render:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ maxWidth: 720, margin: '12vh auto', padding: 24, color: '#f1eee8', fontFamily: 'system-ui, sans-serif' }}>
          <h1>LunaBase could not load</h1>
          <p>A browser error stopped the game from rendering. The details below can help identify the cause:</p>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 16, background: '#242832', borderRadius: 8, color: '#ffb4ad' }}>
            {this.state.error.message}
          </pre>
          <p>After fixing the error, refresh this page.</p>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('The #root mount point is missing from index.html.');

createRoot(rootElement).render(
  <React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>,
);
