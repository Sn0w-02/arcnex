import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import Gallery from './pages/Gallery'
import ImageDetail from './pages/ImageDetail'
import Models from './pages/Models'
import ModelDetail from './pages/ModelDetail'
import Upload from './pages/Upload'
import Login from './pages/Login'
import MyPage from './pages/MyPage'

import './css/common.css'

function App() {
  return (
    <>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:id" element={<ImageDetail />} />
          <Route path="/models" element={<Models />} />
          <Route path="/models/:id" element={<ModelDetail />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}

export default App