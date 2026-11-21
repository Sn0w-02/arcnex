import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import '../css/login.css'

export default function Login() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState('login')
    const [showPassword, setShowPassword] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [notice, setNotice] = useState('')
    const update = (event) => { setForm((prev) => ({ ...prev, [event.target.name]: event.target.value })); setNotice('') }
    const submit = async (event) => {
        event.preventDefault()
        if (loading) return
        if (mode === 'signup' && form.password !== form.confirm) {
            setNotice('비밀번호가 일치하지 않습니다.')
            return
        }
        setLoading(true)
        setNotice('')
        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email: form.email.trim(), password: form.password
                })
                if (error) throw error
                navigate('/mypage', { replace: true })
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email: form.email.trim(), password: form.password,
                    options: { data: { username: form.name.trim() } }
                })
                if (error) throw error
                if (data.session) navigate('/mypage', { replace: true })
                else setNotice('회원가입 요청이 완료되었습니다. 이메일 인증 설정에 따라 인증 후 로그인해 주세요.')
            }
        } catch (error) {
            const message = error?.message || '인증 중 오류가 발생했습니다.'
            setNotice(message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : message === 'Email not confirmed' ? '이메일 인증이 완료되지 않았습니다.' : message)
        } finally {
            setLoading(false)
        }
    }
    return <section className="account-page">
        <div className="account-shell">
            <div className="account-intro">
                <span className="account-eyebrow">YOUR CREATIVE SPACE</span>
                <h1>
                    좋은 아이디어는
                    <br />
                    <em>연결</em>에서 시작됩니다.
                </h1>
                <p>
                    이미지와 3D 에셋을 발견하고, 정리하고, 나만의 아카이브를
                    만들어보세요.
                </p>
                <div className="account-decoration" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
            </div>
            <div className="account-panel">
                <div className="account-tabs" role="tablist" aria-label="계정 메뉴">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "login"}
                        className={mode === "login" ? "active" : ""}
                        onClick={() => {
                            setMode("login");
                            setNotice("");
                        }}
                    >
                        로그인
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "signup"}
                        className={mode === "signup" ? "active" : ""}
                        onClick={() => {
                            setMode("signup");
                            setNotice("");
                        }}
                    >
                        회원가입
                    </button>
                </div>
                <h2>
                    {mode === "login"
                        ? "다시 만나서 반가워요."
                        : "ARCNEX에 오신 것을 환영해요."}
                </h2>
                <p className="account-muted">
                    {mode === "login"
                        ? "계정에 로그인하고 작업을 이어가세요."
                        : "계정을 만들고 에셋을 관리해보세요."}
                </p>
                <form onSubmit={submit} className="account-form">
                    {mode === "signup" && (
                        <label>
                            이름
                            <input
                                required
                                name="name"
                                value={form.name}
                                onChange={update}
                                autoComplete="name"
                                placeholder="이름을 입력하세요"
                            />
                        </label>
                    )}
                    <label>
                        이메일
                        <div className="account-input-icon">
                            <Mail size={18} />
                            <input
                                required
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={update}
                                autoComplete="email"
                                placeholder="example@email.com"
                            />
                        </div>
                    </label>
                    <label>
                        비밀번호
                        <div className="account-input-icon">
                            <LockKeyhole size={18} />
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={update}
                                minLength={6}
                                autoComplete={
                                    mode === "login" ? "current-password" : "new-password"
                                }
                                placeholder="6자 이상 입력하세요"
                            />
                            <button
                                type="button"
                                className="account-eye"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={
                                    showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                                }
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </label>
                    {mode === "signup" && (
                        <label>
                            비밀번호 확인
                            <input
                                required
                                type="password"
                                name="confirm"
                                value={form.confirm}
                                onChange={update}
                                autoComplete="new-password"
                                placeholder="비밀번호를 다시 입력하세요"
                            />
                        </label>
                    )}
                    {notice && (
                        <p className="account-notice" role="status">
                            {notice}
                        </p>
                    )}
                    <button className="account-submit" type="submit">
                        {mode === "login" ? "로그인" : "계정 만들기"}{" "}
                        <ArrowRight size={18} />
                    </button>
                </form>
                <p className="account-footnote">
                    둘러보고 싶다면 <Link to="/gallery">갤러리로 이동</Link>
                </p>
            </div>
        </div>
    </section>
}
