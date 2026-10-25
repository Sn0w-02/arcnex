import React from 'react'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="footer-logo">ARCNEX.</p>

        <p>
          JavaScript + React + Supabase 기반 개인 포트폴리오 프로젝트
        </p>

        <p>&copy; {new Date().getFullYear()} ARCNEX</p>
      </div>
    </footer>
  )
}

export default Footer