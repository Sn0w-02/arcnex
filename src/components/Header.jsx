import { NavLink, useNavigate } from 'react-router-dom';
import { UserRound, Upload, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Header() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) { window.alert(`로그아웃 실패: ${error.message}`); return; }
        navigate('/login');
    };
    return <header className="header">
        <div className="container header-inner">
            <h1 className="logo">
                <NavLink to="/">ARCNEX<span>.</span></NavLink></h1>
            <nav className="gnb" aria-label="주요 메뉴">
                <NavLink to="/" end>HOME</NavLink>
                <NavLink to="/gallery">GALLERY</NavLink>
                <NavLink to="/models">3D MODELS</NavLink>
            </nav>
            <div className="header-user">
                <NavLink to="/upload" className="upload-link"><Upload size={17} /><span>UPLOAD</span></NavLink>
                <NavLink to={user ? '/mypage' : '/login'} aria-label={user ? '마이페이지' : '로그인'}><UserRound size={20} /></NavLink>

                {user && <button type="button" onClick={logout} title="로그아웃" aria-label="로그아웃" style={{ display: 'flex', alignItems: 'center', border: 0, background: 'none', cursor: 'pointer', color: '#4c4741' }}><LogOut size={19} /></button>}
            </div>
        </div></header>;
}
