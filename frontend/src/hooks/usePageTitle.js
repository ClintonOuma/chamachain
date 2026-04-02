import { useEffect } from 'react' 
 
export default function usePageTitle(title) { 
  useEffect(() => { 
    document.title = title ? `${title} — ChamaChain` : 'ChamaChain' 
    return () => { document.title = 'ChamaChain' } 
  }, [title]) 
} 
