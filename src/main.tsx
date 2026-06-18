import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { CompareProvider } from './context/CompareContext'
import './index.css'

// HashRouter is required for GitHub Pages deep links (no server rewrite needed).
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <CompareProvider>
        <App />
      </CompareProvider>
    </HashRouter>
  </React.StrictMode>,
)
