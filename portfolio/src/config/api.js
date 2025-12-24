// API Configuration
// Uses Vite's built-in MODE or custom VITE_MODE env variable

const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_MODE === 'development'

export const API_URL = isDevelopment
    ? 'http://localhost:3001'
    : 'https://aryandoes.tech'

export default API_URL
