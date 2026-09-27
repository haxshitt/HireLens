import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe, verifyOtp, resendOtp, googleAuth, forgotPasswordOtp, resetPassword, verifyResetOtp } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return { success: true }
        } catch (err) {
            return { success: false, message: err.message, status: err.status }
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        try {
            const data = await register({ username, email, password })
            return { success: true, email: data.email }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    const handleVerifyOtp = async ({ email, otp }) => {
        try {
            await verifyOtp({ email, otp })
            // verify-otp sets the cookie, so fetch full user profile
            const meData = await getMe()
            setUser(meData.user || { email })
            return { success: true }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    const handleResendOtp = async ({ email }) => {
        try {
            const data = await resendOtp({ email })
            return { success: true, message: data.message }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            console.error("Logout failed", err)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async ({ code }) => {
        try {
            const data = await googleAuth({ code })
            setUser(data.user)
            return { success: true }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    const handleForgotPasswordOtp = async ({ email }) => {
        try {
            const data = await forgotPasswordOtp({ email })
            return { success: true, message: data.message }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    const handleVerifyResetOtp = async ({ email, otp }) => {
        try {
            const data = await verifyResetOtp({ email, otp })
            return { success: true, message: data.message }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    const handleResetPassword = async ({ email, otp, newPassword }) => {
        try {
            const data = await resetPassword({ email, otp, newPassword })
            setUser(data.user)
            return { success: true }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout, handleVerifyOtp, handleResendOtp, handleGoogleAuth, handleForgotPasswordOtp, handleVerifyResetOtp, handleResetPassword }
}