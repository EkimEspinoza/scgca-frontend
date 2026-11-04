import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'

import { AuthProvider } from './context/AuthContext.jsx'
import { EmpresaProvider } from './context/EmpresaContext.jsx'
import { AppThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppThemeProvider>
        <BrowserRouter>
          <EmpresaProvider>
            <App />
          </EmpresaProvider>
        </BrowserRouter>
      </AppThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
