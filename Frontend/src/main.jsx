import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google"
import "./index.css"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster toastOptions={{ duration: 2000 }} />
    <App />
  </StrictMode>,
)
