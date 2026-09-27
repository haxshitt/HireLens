import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth';

const Profile = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const onLogout = async () => {
        await handleLogout();
        navigate('/login');
    };

    const firstLetter = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center pt-28 px-4 pb-12 overflow-x-hidden relative bg-page">
            <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-[1.25rem] px-8 py-12 w-full max-w-[500px] flex flex-col items-center shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                <div className="w-20 h-20 rounded-full bg-[#ff2d78] flex items-center justify-center text-[2.5rem] font-extrabold text-white mb-6 shadow-[0_4px_15px_rgba(255,45,120,0.3)]">
                    {firstLetter}
                </div>

                <h2 className="text-2xl m-0 mb-2 font-bold text-primary">
                    {user?.username || 'User'}
                </h2>
                <p className="text-[#b0b8c4] m-0 mb-8">
                    {user?.email || 'No email provided'}
                </p>

                <button 
                    onClick={onLogout} 
                    className="w-full p-4 rounded-xl border border-[#ff4d4d] bg-[#ff4d4d]/10 text-[#ff4d4d] text-base font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[#ff4d4d]/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                </button>
            </div>

            <div className="absolute bottom-8 flex gap-6">
                <a href="https://github.com/haxshitt" className="text-[#b0b8c4] no-underline text-sm hover:text-white transition-colors">Github</a>
                <a href="https://www.instagram.com/haxshitt__" className="text-[#b0b8c4] no-underline text-sm hover:text-white transition-colors">Instagram</a>
                <a href="mailto:haxshiitpathak@gmail.com" className="text-[#b0b8c4] no-underline text-sm hover:text-white transition-colors">Mail</a>
            </div>
        </div>
    );
};

export default Profile;
