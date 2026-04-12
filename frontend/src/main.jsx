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
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(() => console.log('SW registration failed'))
  })
}
