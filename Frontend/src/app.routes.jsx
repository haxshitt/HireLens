import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import GuestOnly from "./features/auth/components/GuestOnly";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import CreateResume from "./features/interview/pages/CreateResume";
import History from "./features/interview/pages/History";
import Profile from "./features/interview/pages/Profile";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <GuestOnly><Login /></GuestOnly>
    },
    {
        path: "/register",
        element: <GuestOnly><Register /></GuestOnly>
    },
    {
        path: "/home",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/",
        element: <Navigate to="/home" replace />
    },
    {
        path:"/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
    {
        path: "/create-resume",
        element: <Protected><CreateResume /></Protected>
    },
    {
        path: "/history",
        element: <Protected><History /></Protected>
    },
    {
        path: "/profile",
        element: <Protected><Profile /></Protected>
    },
    {
        path: "*",
        element: <Navigate to="/home" replace />
    }
])