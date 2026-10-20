import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import '../styles/Login.css'
import { useNavigate } from 'react-router-dom'

function Login() {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }    
    
   return (
    <div className="login-page">
            <div className="login-panel-left">
        <p className="login-eyebrow">Panel de acceso</p>
        <div>
          <h1 className="login-brand">
            Costos Rotondo
            <span className="login-brand-underline" aria-hidden="true"></span>
          </h1>
          <p className="login-welcome">
            Entrá a tu cuenta usando tu correo y contraseña.
          </p>
        </div>
        <p className="login-footer">© {new Date().getFullYear()}</p>
      </div>
 
      <div className="login-panel-right">
        <div className="login-card">
          <h2 className="login-title">Iniciar sesión</h2>
 
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                required
              />
            </div>
 
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
              />
            </div>
            
    
            {error && <p className="login-error">{error}</p>}
 
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
 

export default Login