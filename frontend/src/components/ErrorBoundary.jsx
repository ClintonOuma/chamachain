import { Component } from 'react' 
 
 export default class ErrorBoundary extends Component { 
   constructor(props) { 
     super(props) 
     this.state = { hasError: false, error: null } 
   } 
 
   static getDerivedStateFromError(error) { 
     console.log('ErrorBoundary: getDerivedStateFromError', error)
     return { hasError: true, error } 
   } 
 
   componentDidCatch(error, info) { 
     console.log('ErrorBoundary: componentDidCatch', error, info)
     console.error('ErrorBoundary caught:', error, info) 
   } 
 
   render() { 
     if (this.state.hasError) { 
       return ( 
         <div style={{ minHeight: '100vh', background: '#0D0B1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}> 
           <div style={{ fontSize: '48px' }}>⚠️</div> 
           <h2 style={{ fontFamily: 'Syne', color: '#F8FAFC', margin: 0 }}>Something went wrong</h2> 
           <p style={{ fontFamily: 'DM Sans', color: '#64748B', maxWidth: '400px', textAlign: 'center' }}> 
             {this.state.error?.message || 'An unexpected error occurred'} 
           </p> 
           <button 
             className="btn-primary" 
             onClick={() => { this.setState({ hasError: false }); window.location.reload() }} 
           > 
             Refresh Page 
           </button> 
         </div> 
       ) 
     } 
     return this.props.children 
   } 
 } 
