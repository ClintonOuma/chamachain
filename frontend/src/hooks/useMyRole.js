import { useState, useEffect } from 'react'
import api from '../services/api'

export default function useMyRole(chamaId) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!chamaId) return 
    api.get(`/chamas/${chamaId}/my-role`)
      .then(res => setRole(res.data.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false))
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