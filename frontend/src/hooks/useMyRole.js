import { useState, useEffect } from 'react'
import api from '../services/api'

export default function useMyRole(chamaId) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!chamaId) {
      setLoading(false)
      return 
    }
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('useMyRole timeout - setting role to null')
        setRole(null)
        setLoading(false)
      }
    }, 3000)
    
    api.get(`/chamas/${chamaId}/my-role`)
      .then(res => setRole(res.data.role))
      .catch(err => {
        console.log('User is not a member or role fetch failed:', err.response?.status)
        setRole(null)
      })
      .finally(() => {
        setLoading(false)
        clearTimeout(timeout)
      })
      
    return () => clearTimeout(timeout)
  }, [chamaId])

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isTreasurer: role === 'treasurer',
    isMember: role === 'member',
    isObserver: role === 'observer',
    canManage: role === 'admin',
    canViewFinances: role === 'admin' || role === 'treasurer',
    canContribute: role === 'admin' || role === 'treasurer' || role === 'member',
    canRequestLoan: role === 'admin' || role === 'treasurer' || role === 'member',
    canApproveLoan: role === 'admin',
    canVote: role === 'admin' || role === 'treasurer' || role === 'member',
  }
}