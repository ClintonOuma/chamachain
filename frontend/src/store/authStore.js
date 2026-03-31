import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    set({ user: updatedUser })
  }
}))

export default useAuthStore
