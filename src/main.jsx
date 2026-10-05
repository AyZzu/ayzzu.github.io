import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '24px', textAlign: 'center', background: '#FDF8FB', color: '#0A0A0A' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#C800C8' }}>Terjadi Kesalahan Aplikasi</h1>
          <p style={{ color: '#6B6B78', maxWidth: '480px', marginBottom: '20px', fontSize: '14px' }}>
            {this.state.error?.message || 'Gagal memuat komponen.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ background: '#C800C8', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '9999px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
