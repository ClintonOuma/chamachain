import { create } from 'zustand'

const useAuthStore = create((set) => {
  const userData = localStorage.getItem('user')
  const user = userData ? JSON.parse(userData) : null
  const token = localStorage.getItem('accessToken') || null

  console.log('AuthStore init:', { user, hasToken: !!token, isSuperAdmin: user?.isSuperAdmin })

  return {
    user,
    token,
    isAuthenticated: !!token,

    setAuth: (user, token, refreshToken) => {
      console.log('setAuth called:', { user, hasToken: !!token, isSuperAdmin: user?.isSuperAdmin })
      localStorage.setItem('accessToken', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, token, isAuthenticated: true })
    },

    logout: () => {
      console.log('logout called')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      set({ user: null, token: null, isAuthenticated: false })
    },

    updateUser: (updatedUser) => {
      console.log('updateUser called:', updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    }
  }
})

export default useAuthStore
