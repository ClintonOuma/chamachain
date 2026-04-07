import axios from 'axios' 
 
 const baseURL = import.meta.env.VITE_API_URL 
   ? `${import.meta.env.VITE_API_URL}/api/v1` 
   : '/api/v1' 
 
 const api = axios.create({ 
   baseURL, 
   headers: { 'Content-Type': 'application/json' }, 
   timeout: 30000 
 }) 
 
 api.interceptors.request.use((config) => { 
   const token = localStorage.getItem('accessToken') 
   if (token) config.headers.Authorization = `Bearer ${token}` 
   return config 
 }, (error) => Promise.reject(error)) 
 
 api.interceptors.response.use( 
   (response) => response, 
   async (error) => { 
     if (error.code === 'ECONNABORTED') { 
       error.message = 'Request timed out. Please check your connection.' 
     } 
     if (!error.response) { 
       error.message = 'Network error. Please check your internet connection.' 
     } 
     if (error.response?.status === 401) { 
       localStorage.removeItem('accessToken') 
       localStorage.removeItem('refreshToken') 
       localStorage.removeItem('user') 
       window.location.href = '/login' 
     } 
     return Promise.reject(error) 
   } 
 ) 
 
 export default api
