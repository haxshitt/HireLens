import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { user } = useAuth();

    // Hide navbar on Interview details pages
    if (location.pathname.startsWith('/interview/')) {
        return null;
    }

    const navLinkClass = ({ isActive }) => 
        `no-underline font-sans text-[0.9rem] px-4 py-2 rounded-full transition-all bg-transparent border-none cursor-pointer ${
            isActive 
            ? "text-white bg-white/10 font-semibold" 
            : "text-secondary font-medium hover:text-white hover:bg-white/5"
        }`;

    return (
        <div className="fixed top-6 left-0 w-full flex justify-center z-[1000] px-6 pointer-events-none">
            <nav className="bg-[#0e121a]/85 backdrop-blur-md border border-white/5 rounded-[3rem] flex items-center justify-between py-2 px-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full max-w-[900px] pointer-events-auto">
                <div className="font-sans text-xl font-extrabold text-accent tracking-[0.5px] cursor-pointer flex items-center" onClick={() => navigate('/home')}>
                    InterviewSprint
                </div>
                
                <div className="hidden md:flex items-center gap-2">
                    <NavLink to="/home" className={navLinkClass}>
                        Home
                    </NavLink>
                    
                    <NavLink to="/create-resume" className={navLinkClass}>
                        Create Resume
                    </NavLink>
                    <NavLink to="/history" className={navLinkClass}>
                        History
                    </NavLink>

                    <NavLink to="/profile" className={navLinkClass}>
                        Profile
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
