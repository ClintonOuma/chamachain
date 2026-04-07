import { useEffect } from 'react'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ChamaChain` : 'ChamaChain — AI Powered Chama Platform'
    return () => {
      document.title = 'ChamaChain — AI Powered Chama Platform'
    }
  }, [title])
} 
