import api from "../../../lib/api";

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "Registration failed. Please try again."
        throw new Error(message)
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        if (err?.response?.status === 403 && err?.response?.data?.status === 'unverified') {
            const error = new Error(err.response.data.message);
            error.status = 'unverified';
            throw error;
        }
        const message = err?.response?.data?.message || "Invalid email or password."
        throw new Error(message)
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        // Silently fail logout
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        if (err.response?.status !== 401) {
            console.error(err)
        }
        return { user: null }
    }
}

export async function verifyOtp({ email, otp }) {
    try {
        const response = await api.post('/api/auth/verify-otp', {
            email, otp
        })
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "OTP verification failed. Please try again."
        throw new Error(message)
    }
}

export async function resendOtp({ email }) {
    try {
        const response = await api.post('/api/auth/resend-otp', { email })
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "Failed to resend OTP. Please try again."
        throw new Error(message)
    }
}

export async function googleAuth({ code }) {
    try {
        const response = await api.post('/api/auth/google', { code })
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "Google authentication failed. Please try again."
        throw new Error(message)
    }
}

export async function forgotPasswordOtp({ email }) {
    try {
        const response = await api.post('/api/auth/forgot-password-otp', { email })
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "Failed to send OTP. Please try again."
        throw new Error(message)
    }
}

export async function verifyResetOtp({ email, otp }) {
    try {
        const response = await api.post('/api/auth/verify-reset-otp', { email, otp })
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "Invalid or expired OTP. Please try again."
        throw new Error(message)
    }
}

export async function resetPassword({ email, otp, newPassword }) {
    try {
        const response = await api.post('/api/auth/reset-password', { email, otp, newPassword })
        return response.data
    } catch (err) {
        const message = err?.response?.data?.message || "Failed to reset password. Please try again."
        throw new Error(message)
    }
}