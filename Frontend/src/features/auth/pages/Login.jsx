import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useGoogleLogin } from '@react-oauth/google'

const Login = () => {

    const { loading, handleLogin, handleGoogleAuth, handleVerifyOtp, handleResendOtp, handleForgotPasswordOtp, handleVerifyResetOtp, handleResetPassword } = useAuth()
    const navigate = useNavigate()

    const [mode, setMode] = useState('login') // 'login' | 'verify' | 'forgot' | 'reset'

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [showPasswordFields, setShowPasswordFields] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [resending, setResending] = useState(false)

    const handleSubmitLogin = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")
        setSubmitting(true)
        const result = await handleLogin({ email, password })
        setSubmitting(false)

        if (!result.success) {
            if (result.status === 'unverified') {
                setMessage(result.message || "Please verify your email. An OTP has been sent.")
                setMode('verify')
            } else {
                setError(result.message)
            }
            return
        }

        navigate('/home', { replace: true })
    }

    const handleSubmitVerify = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")
        setSubmitting(true)
        const result = await handleVerifyOtp({ email, otp })
        setSubmitting(false)

        if (!result.success) {
            setError(result.message)
            return
        }

        navigate('/home', { replace: true })
    }

    const handleResend = async () => {
        setError("")
        setMessage("")
        setResending(true)
        const result = await handleResendOtp({ email })
        setResending(false)

        if (!result.success) {
            setError(result.message)
            return
        }
        setMessage(result.message || "OTP resent successfully.")
    }

    const handleSubmitForgot = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")
        setSubmitting(true)
        const result = await handleForgotPasswordOtp({ email })
        setSubmitting(false)

        if (!result.success) {
            setError(result.message)
            return
        }
        
        setMessage(result.message || "OTP sent to your email.")
        setMode('reset')
        setShowPasswordFields(false)
    }

    const handleVerifyResetOtpSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")
        setSubmitting(true)
        const result = await handleVerifyResetOtp({ email, otp })
        setSubmitting(false)

        if (!result.success) {
            setError(result.message)
            return
        }

        setMessage(result.message || "OTP verified. You can now reset your password.")
        setShowPasswordFields(true)
    }

    const handleSubmitReset = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setSubmitting(true)
        const result = await handleResetPassword({ email, otp, newPassword })
        setSubmitting(false)

        if (!result.success) {
            setError(result.message)
            return
        }
        
        navigate('/home', { replace: true })
    }

    const googleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            setError("")
            setMessage("")
            setSubmitting(true)
            const result = await handleGoogleAuth({ code: codeResponse.code })
            setSubmitting(false)

            if (!result.success) {
                setError(result.message)
                return
            }

            navigate('/home', { replace: true })
        },
        onError: () => {
            setError("Google Sign-In was cancelled or failed")
        }
    })

    const resetState = () => {
        setError("")
        setMessage("")
        setPassword("")
        setOtp("")
        setNewPassword("")
        setConfirmPassword("")
        setShowPasswordFields(false)
        setShowPassword(false)
    }

    // Shared Tailwind classes for this component
    const inputClasses = "bg-input border border-border text-primary outline-none px-4 py-3 rounded-xl text-base focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
    const buttonClasses = "relative flex items-center justify-center min-h-[2.75rem] font-semibold cursor-pointer border-none rounded-xl bg-accent text-white transition-transform active:scale-95 px-6 py-3"
    const buttonLoadingClasses = "text-transparent pointer-events-none cursor-not-allowed after:content-[''] after:absolute after:w-[1.1rem] after:h-[1.1rem] after:border-[2.5px] after:border-white/35 after:border-t-white after:rounded-full after:animate-spin"
    const linkClasses = "text-accent no-underline hover:underline font-semibold"
    const labelClasses = "font-medium text-secondary"
    
    return (
        <main className="min-h-screen w-full flex justify-center items-center p-6 bg-page">
            <div className="w-full max-w-[400px] flex flex-col gap-4">
                {mode === 'login' && (
                    <>
                        <h1 className="text-2xl font-bold text-primary">Login</h1>
                        {error && <p className="text-[0.875rem] text-[#e1034d] bg-[#e1034d]/10 border border-[#e1034d]/25 rounded-lg px-3 py-2 m-0 animate-fadeIn">{error}</p>}
                        {message && <p className="text-[0.875rem] text-severity-low bg-severity-low/10 border border-severity-low/25 rounded-lg px-3 py-2 m-0 animate-fadeIn mb-4">{message}</p>}
                        
                        <form onSubmit={handleSubmitLogin} className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className={labelClasses}>Email</label>
                                <input
                                    className={inputClasses}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email" id="email" required placeholder='Enter email address' autoComplete="username" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="password" className={labelClasses}>Password</label>
                                <input
                                    className={inputClasses}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password" id="password" required placeholder='Enter password' autoComplete="current-password" />
                            </div>
                            
                            <div className="text-left mb-4">
                                <button type="button" onClick={() => { resetState(); setMode('forgot'); }} className="bg-transparent border-none text-secondary cursor-pointer text-sm p-0 hover:text-primary transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            <button className={`${buttonClasses} ${submitting ? buttonLoadingClasses : ''}`} disabled={submitting}>
                                Login
                            </button>
                        </form>

                        <div className="flex items-center gap-3 m-0 before:content-[''] before:flex-1 before:h-[1px] before:bg-white/10 after:content-[''] after:flex-1 after:h-[1px] after:bg-white/10">
                            <span className="text-[0.8rem] text-muted uppercase tracking-[1px] font-medium">OR</span>
                        </div>
                        
                        <button type="button" className="flex items-center justify-center gap-2.5 w-full min-h-[2.75rem] px-4 py-2.5 border border-white/15 rounded-xl bg-white/5 text-[#ddd] text-[0.95rem] font-medium cursor-pointer transition-all hover:bg-white/10 hover:border-white/25 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => googleLogin()} disabled={submitting}>
                            <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Sign in with Google
                        </button>
                        
                        <p className="text-secondary text-sm text-center">Don't have an account? <Link to={"/register"} className={linkClasses}>Register</Link></p>
                    </>
                )}

                {mode === 'verify' && (
                    <>
                        <h1 className="text-2xl font-bold text-primary">Verify Email</h1>
                        <p className="text-secondary mb-6 text-left">Enter the OTP sent to {email}</p>
                        {error && <p className="text-[0.875rem] text-[#e1034d] bg-[#e1034d]/10 border border-[#e1034d]/25 rounded-lg px-3 py-2 m-0 animate-fadeIn">{error}</p>}
                        {message && <p className="text-[0.875rem] text-severity-low bg-severity-low/10 border border-severity-low/25 rounded-lg px-3 py-2 m-0 animate-fadeIn mb-4">{message}</p>}
                        
                        <form onSubmit={handleSubmitVerify} className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="otp" className={labelClasses}>OTP</label>
                                <input className={inputClasses} value={otp} onChange={(e) => setOtp(e.target.value)} type="text" id="otp" required placeholder='Enter OTP' />
                            </div>
                            <button className={`${buttonClasses} ${submitting ? buttonLoadingClasses : ''}`} disabled={submitting}>
                                Verify
                            </button>
                        </form>
                        <button className="relative flex items-center justify-center min-h-[2.75rem] font-semibold cursor-pointer border border-border rounded-xl bg-transparent text-secondary transition-all active:scale-95 px-6 py-3 mt-4 w-full hover:border-primary hover:text-primary disabled:opacity-50" onClick={handleResend} disabled={resending}>
                            {resending ? "Resending..." : "Resend OTP"}
                        </button>
                        <p className="text-center mt-6">
                            <button type="button" onClick={() => { resetState(); setMode('login'); }} className="bg-transparent border-none text-accent cursor-pointer font-bold hover:underline">
                                Back to Login
                            </button>
                        </p>
                    </>
                )}

                {mode === 'forgot' && (
                    <>
                        <h1 className="text-2xl font-bold text-primary">Forgot Password</h1>
                        <p className="text-secondary mb-6 text-left">Enter your email to receive an OTP</p>
                        {error && <p className="text-[0.875rem] text-[#e1034d] bg-[#e1034d]/10 border border-[#e1034d]/25 rounded-lg px-3 py-2 m-0 animate-fadeIn">{error}</p>}
                        
                        <form onSubmit={handleSubmitForgot} className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="forgot-email" className={labelClasses}>Email</label>
                                <input className={inputClasses} value={email} onChange={(e) => setEmail(e.target.value)} type="email" id="forgot-email" required placeholder='Enter email address' />
                            </div>
                            <button className={`${buttonClasses} ${submitting ? buttonLoadingClasses : ''}`} disabled={submitting}>
                                Send OTP
                            </button>
                        </form>
                        <p className="text-center mt-6">
                            <button type="button" onClick={() => { resetState(); setMode('login'); }} className="bg-transparent border-none text-accent cursor-pointer font-bold hover:underline">
                                Back to Login
                            </button>
                        </p>
                    </>
                )}

                {mode === 'reset' && (
                    <>
                        <h1 className="text-2xl font-bold text-primary">Reset Password</h1>
                        <p className="text-secondary mb-6 text-left">
                            {!showPasswordFields ? "Enter the OTP sent to your email." : "Enter your new password."}
                        </p>
                        {error && <p className="text-[0.875rem] text-[#e1034d] bg-[#e1034d]/10 border border-[#e1034d]/25 rounded-lg px-3 py-2 m-0 animate-fadeIn">{error}</p>}
                        {message && <p className="text-[0.875rem] text-severity-low bg-severity-low/10 border border-severity-low/25 rounded-lg px-3 py-2 m-0 animate-fadeIn mb-4">{message}</p>}
                        
                        {!showPasswordFields ? (
                            <form onSubmit={handleVerifyResetOtpSubmit} className="flex flex-col gap-3">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="reset-otp" className={labelClasses}>OTP</label>
                                    <input className={inputClasses} value={otp} onChange={(e) => setOtp(e.target.value)} type="text" id="reset-otp" required placeholder='Enter OTP from email' />
                                </div>
                                <button className={`${buttonClasses} ${submitting ? buttonLoadingClasses : ''}`} disabled={submitting}>
                                    Verify OTP
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmitReset} className="flex flex-col gap-3">
                                <div className="flex flex-col gap-2 relative">
                                    <label htmlFor="new-password" className={labelClasses}>New Password</label>
                                    <input 
                                        className={`${inputClasses} pr-10`}
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        type={showPassword ? "text" : "password"} 
                                        id="new-password" 
                                        required 
                                        placeholder='Enter new password' 
                                        autoComplete="new-password"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-[38px] bg-transparent border-none text-secondary cursor-pointer p-1 hover:text-primary"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        )}
                                    </button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="confirm-password" className={labelClasses}>Confirm Password</label>
                                    <input className={inputClasses} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" id="confirm-password" required placeholder='Confirm new password' autoComplete="new-password" />
                                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                        <span className="text-accent text-[0.85rem] mt-2 block">Passwords do not match</span>
                                    )}
                                </div>
                                <button 
                                    className={`${buttonClasses} ${submitting ? buttonLoadingClasses : ''}`} 
                                    disabled={submitting || !newPassword || newPassword !== confirmPassword}
                                >
                                    Reset Password
                                </button>
                            </form>
                        )}
                        
                        <p className="text-center mt-6">
                            <button type="button" onClick={() => { resetState(); setMode('login'); }} className="bg-transparent border-none text-accent cursor-pointer font-bold hover:underline">
                                Back to Login
                            </button>
                        </p>
                    </>
                )}
            </div>
        </main>
    )
}

export default Login