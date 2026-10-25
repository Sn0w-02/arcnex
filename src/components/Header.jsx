import React from 'react'
import { NavLink } from 'react-router-dom'
import { UserRound, Upload } from 'lucide-react'

function Header() {
    return (
        <header className="header">
            <div className="container header-inner">
                <h1 className="logo">
                    <NavLink to="/">ARCNEX<span>.</span></NavLink>
                </h1>

                <nav className="gnb" aria-label="주요 메뉴">
                    <NavLink to="/" end>HOME</NavLink>
                    <NavLink to="/gallery">GALLERY</NavLink>
                    <NavLink to="/models">3D MODELS</NavLink>
                </nav>

                <div className="header-user">
                    <NavLink to="/upload" className="upload-link">
                        <Upload size={17} />
                        <span>UPLOAD</span>
                    </NavLink>

                    <NavLink to="/login" aria-label="로그인">
                        <UserRound size={20} />
                    </NavLink>
                </div>
            </div>
        </header>
    )
}

export default Header