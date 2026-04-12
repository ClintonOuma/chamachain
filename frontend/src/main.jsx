import React from 'react'
 import ReactDOM from 'react-dom/client'
 import App from './App'
 import './styles/global.css'
 import ErrorBoundary from './components/ErrorBoundary'
 
 ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
     <ErrorBoundary>
       <App />
     </ErrorBoundary>
   </React.StrictMode>
 )

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered with scope:', registration.scope)
      })
      .catch(err => {
        console.log('SW registration failed:', err.message)
        // Don't block app loading if SW fails
      })
  })
}
