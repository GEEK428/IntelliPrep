import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { EmailIcon, LockIcon, SparkIcon } from '../components/AuthIcons'
import Loader from '../../../components/Loader'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const Login = () => {
    const { loading, handleLogin, handleGoogleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const googleBtnRef = useRef(null)

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (!clientId) {
            return
        }

        const initializeGoogle = () => {
            if (!window.google?.accounts?.id) {
                return
            }

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response) => {
                    setError("")
                    const result = await handleGoogleLogin({ credential: response.credential })
                    if (result?.ok) {
                        navigate("/dashboard")
                        return
                    }
                    setError(result?.message || "Unable to login with Google.")
                }
            })

            if (googleBtnRef.current) {
                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "pill",
                    width: "260"
                })
            }
        }

        if (window.google?.accounts?.id) {
            initializeGoogle()
            return
        }

        const script = document.createElement("script")
        script.src = "https://accounts.google.com/gsi/client"
        script.async = true
        script.defer = true
        script.onload = initializeGoogle
        document.body.appendChild(script)
    }, [handleGoogleLogin, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        const normalizedEmail = email.trim().toLowerCase()
        if (!emailRegex.test(normalizedEmail)) {
            setError("Enter a valid email address in this format: name@example.com")
            return
        }

        const result = await handleLogin({ email: normalizedEmail, password })
        if (result?.ok) {
            navigate('/dashboard')
            return
        }
        setError(result?.message || "Login failed.")
    }

    if (loading) {
        return (<main className="auth-page"><Loader message="Logging you in..." /></main>)
    }

    return (
        <main className='auth-page auth-page--login'>
            <div className="auth-shell">
                <section className="auth-hero">
                    <div className='brand-row'>
                        <img className='brand-mark' src='/mind-icon.svg' alt='IntelliPrep logo' />
                        <h2>IntelliPrep</h2>
                    </div>

                    <div className="hero-content">
                        <p className="kicker">THE DIGITAL CURATOR</p>
                        <h1>Crack Interviews <br/><span className='highlight'>with Precision</span></h1>
                        <p className="hero-desc">Unlock your career potential with our curated resume intelligence and real-time interview simulations.</p>
                        
                        <div className="hero-feature-cards">
                            <div className="feature-card">
                                <div className="icon-box"><span className="material-symbols-outlined">bar_chart</span></div>
                                <div className="card-text">
                                    <h3>Resume Analysis</h3>
                                    <p>Deep-scan your professional profile against industry benchmarks in seconds.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="auth-panel">
                    <h2 className='panel-title'>Welcome Back</h2>
                    <p className='auth-subtitle'>Sign in to continue your preparation journey.</p>
                    
                    <div className='google-login-wrap' ref={googleBtnRef}></div>
                    <div className='oauth-divider'><span>OR WITH EMAIL</span></div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">
                                EMAIL ADDRESS
                            </label>
                            <div className="input-wrapper">
                                <span className="material-symbols-outlined input-icon">mail</span>
                                <input
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    type="email"
                                    id="email"
                                    name='email'
                                    placeholder='name@company.com'
                                    pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                                    title="Use a valid email address like name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label htmlFor="password">PASSWORD</label>
                                <Link to='/forgot-password' tabIndex="-1">Forgot Password?</Link>
                            </div>
                            <div className='password-field input-wrapper'>
                                <span className="material-symbols-outlined input-icon">lock</span>
                                <input
                                    onChange={(e) => { setPassword(e.target.value) }}
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name='password'
                                    placeholder='••••••••'
                                    required
                                />
                                <button
                                    type='button'
                                    className='eye-btn'
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button className='button primary-button login-btn'>Sign In</button>

                        <p className='auth-footer-text' style={{ textAlign: 'center', marginTop: '1rem' }}>
                            Don't have an account? <Link to={'/register'}>Create an account</Link>
                        </p>
                    </form>

                    {error && <p className='auth-error' style={{marginTop: '1rem', textAlign: 'center'}}>{error}</p>}

                    <footer className="auth-footer-links">
                        <Link to="#">PRIVACY POLICY</Link>
                        <Link to="#">TERMS OF SERVICE</Link>
                        <Link to="#">HELP CENTER</Link>
                    </footer>
                </section>
            </div>
        </main>
    )
}

export default Login
