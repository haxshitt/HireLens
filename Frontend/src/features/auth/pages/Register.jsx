import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useGoogleLogin } from '@react-oauth/google'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60

const Register = () => {

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    // OTP step state
    const [step, setStep] = useState("register") // "register" | "otp"
    const [registeredEmail, setRegisteredEmail] = useState("")
    const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""))
    const [resendCooldown, setResendCooldown] = useState(0)
    const [successMsg, setSuccessMsg] = useState("")
    const inputRefs = useRef([])

    const { handleRegister, handleVerifyOtp, handleResendOtp, handleGoogleAuth } = useAuth()

    const googleSignup = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            setError("")
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
            setError("Google Sign-Up was cancelled or failed")
        }
    })

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000)
        return () => clearTimeout(timer)
    }, [resendCooldown])

    // Auto-focus first OTP input when entering OTP step
    useEffect(() => {
        if (step === "otp") {
            inputRefs.current[0]?.focus()
        }
    }, [step])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)
        const result = await handleRegister({ username, email, password })
        setSubmitting(false)

        if (!result.success) {
            const isDuplicate =
                result.message?.toLowerCase().includes("already") ||
                result.message?.toLowerCase().includes("exists") ||
                result.message?.toLowerCase().includes("duplicate")

            if (isDuplicate) {
                setError(
                    <>
                        A user with this email already exists.{" "}
                        <Link to="/login" className="text-accent no-underline hover:underline font-semibold">Login instead?</Link>
                    </>
                )
            } else {
                setError(result.message)
            }
            return
        }

        // Move to OTP step
        setRegisteredEmail(result.email || email)
        setStep("otp")
        setError("")
        setSuccessMsg("OTP sent to your email")
        setResendCooldown(RESEND_COOLDOWN)
    }

    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return

        const newDigits = [...otpDigits]
        newDigits[index] = value
        setOtpDigits(newDigits)

        // Auto-focus next input
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index, e) => {
        // On backspace, clear current and move to previous
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
        if (!pasted) return

        const newDigits = [...otpDigits]
        for (let i = 0; i < OTP_LENGTH; i++) {
            newDigits[i] = pasted[i] || ""
        }
        setOtpDigits(newDigits)

        // Focus the next empty input or last one
        const nextEmpty = newDigits.findIndex(d => !d)
        inputRefs.current[nextEmpty >= 0 ? nextEmpty : OTP_LENGTH - 1]?.focus()
    }

    const handleVerify = async (e) => {
        e.preventDefault()
        setError("")
        setSuccessMsg("")

        const otp = otpDigits.join("")
        if (otp.length !== OTP_LENGTH) {
            setError("Please enter the complete 6-digit OTP")
            return
        }

        setSubmitting(true)
        const result = await handleVerifyOtp({ email: registeredEmail, otp })
        setSubmitting(false)

        if (!result.success) {
            setError(result.message)
            return
        }

        navigate("/home", { replace: true })
    }

    const handleResend = async () => {
        if (resendCooldown > 0) return
        setError("")
        setSuccessMsg("")
        setSubmitting(true)
        const result = await handleResendOtp({ email: registeredEmail })
        setSubmitting(false)

        if (!result.success) {
            setError(result.message)
            return
        }

        setOtpDigits(Array(OTP_LENGTH).fill(""))
        inputRefs.current[0]?.focus()
        setSuccessMsg("OTP resent to your email")
        setResendCooldown(RESEND_COOLDOWN)
    }

    // Shared Tailwind classes for this component
    const inputClasses = "bg-input border border-border text-primary outline-none px-4 py-3 rounded-xl text-base focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
    const buttonClasses = "relative flex items-center justify-center min-h-[2.75rem] font-semibold cursor-pointer border-none rounded-xl bg-accent text-white transition-transform active:scale-95 px-6 py-3"
    const buttonLoadingClasses = "text-transparent pointer-events-none cursor-not-allowed after:content-[''] after:absolute after:w-[1.1rem] after:h-[1.1rem] after:border-[2.5px] after:border-white/35 after:border-t-white after:rounded-full after:animate-spin"
    const linkClasses = "text-accent no-underline hover:underline font-semibold"
    const labelClasses = "font-medium text-secondary"

    // ── OTP STEP ──
    if (step === "otp") {
        return (
            <main className="min-h-screen w-full flex justify-center items-center p-6 bg-page">
                <div className="w-full max-w-[400px] flex flex-col gap-4">
                    <h1 className="text-2xl font-bold text-primary">Verify Email</h1>
                    <p className="text-[0.9rem] text-[#aaa] m-0">
                        Enter the 6-digit code sent to <strong className="text-white">{registeredEmail}</strong>
                    </p>

                    {successMsg && <p className="text-[0.875rem] text-severity-low bg-severity-low/10 border border-severity-low/25 rounded-lg px-3 py-2 m-0 animate-fadeIn">{successMsg}</p>}
                    {error && <p className="text-[0.875rem] text-[#e1034d] bg-[#e1034d]/10 border border-[#e1034d]/25 rounded-lg px-3 py-2 m-0 animate-fadeIn">{error}</p>}

                    <form onSubmit={handleVerify} className="flex flex-col gap-3">
                        <div className="flex gap-2 justify-center my-2" onPaste={handleOtpPaste}>
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    className="w-12 h-[3.25rem] text-center text-[1.35rem] font-bold border-2 border-white/12 rounded-xl bg-white/5 text-white outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(225,3,77,0.15)] caret-accent"
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        <button
                            className={`${buttonClasses} ${submitting ? buttonLoadingClasses : ''}`}
                            disabled={submitting}
                        >
                            Verify OTP
                        </button>
                    </form>

                    <p className="text-[0.85rem] text-[#888] text-center m-0">
                        Didn't receive the code?{" "}
                        {resendCooldown > 0 ? (
                            <span className="text-[#666]">Resend in {resendCooldown}s</span>
                        ) : (
                            <button
                                type="button"
                                className="bg-transparent border-none text-accent cursor-pointer text-[0.85rem] p-0 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleResend}
                                disabled={submitting}
                            >
                                Resend OTP
                            </button>
                        )}
                    </p>
                </div>
            </main>
        )
    }

    // ── REGISTER STEP ──
    return (
        <main className="min-h-screen w-full flex justify-center items-center p-6 bg-page">
            <div className="w-full max-w-[400px] flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-primary">Register</h1>

                {error && <p className="text-[0.875rem] text-[#e1034d] bg-[#e1034d]/10 border border-[#e1034d]/25 rounded-lg px-3 py-2 m-0 animate-fadeIn">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className={labelClasses}>Username</label>
                        <input
                            className={inputClasses}
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name='username' placeholder='Enter username' autoComplete="username" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className={labelClasses}>Email</label>
                        <input
                            className={inputClasses}
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter email address' autoComplete="email" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className={labelClasses}>Password</label>
                        <input
                            className={inputClasses}
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Enter password' autoComplete="new-password" />
                    </div>

                    <button
                        className={`${buttonClasses} ${submitting ? buttonLoadingClasses : ''}`}
                        disabled={submitting}
                    >
                        Register
                    </button>

                </form>

                <p className="text-secondary text-sm text-center">Already have an account? <Link to={"/login"} className={linkClasses}>Login</Link> </p>

                <div className="flex items-center gap-3 m-0 before:content-[''] before:flex-1 before:h-[1px] before:bg-white/10 after:content-[''] after:flex-1 after:h-[1px] after:bg-white/10">
                    <span className="text-[0.8rem] text-muted uppercase tracking-[1px] font-medium">OR</span>
                </div>

                <button
                    type="button"
                    className="flex items-center justify-center gap-2.5 w-full min-h-[2.75rem] px-4 py-2.5 border border-white/15 rounded-xl bg-white/5 text-[#ddd] text-[0.95rem] font-medium cursor-pointer transition-all hover:bg-white/10 hover:border-white/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => googleSignup()}
                    disabled={submitting}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign up with Google
                </button>
            </div>
        </main>
    )
}

export default Register