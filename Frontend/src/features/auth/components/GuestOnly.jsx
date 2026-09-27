import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'

// Redirects already-authenticated users away from login/register pages
const GuestOnly = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return null // stay silent while the auth state resolves
    }

    if (user) {
        return <Navigate to={'/home'} replace />
    }

    return children
}

export default GuestOnly
