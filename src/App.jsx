import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import Gallery from './pages/Gallery'
import AssetDetail from './pages/AssetDetail'
import Models from './pages/Models'
import Upload from './pages/Upload'
import Login from './pages/Login'
import MyPage from './pages/MyPage'

import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

import './css/common.css'

function App() {
  return (
    <AuthProvider>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:id" element={<AssetDetail type="image" />} />
          <Route path="/models" element={<Models />} />
          <Route path="/models/:id" element={<AssetDetail type="model" />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>

      <Footer />
    </AuthProvider>
  )
}

export default App