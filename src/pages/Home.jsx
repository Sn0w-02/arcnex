import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Image, Box, Upload } from 'lucide-react'
import '../css/home.css'

function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="container">
          <p className="hero-label">DIGITAL ASSET ARCHIVE</p>

          <h2>
            Explore creative
            <br />
            <span>assets.</span>
          </h2>

          <p className="hero-description">
            이미지부터 3D 모델까지,
            <br />
            다양한 디지털 에셋을 탐색하고 공유하는 공간
          </p>

          <div className="hero-buttons">
            <Link to="/gallery" className="btn-primary">
              Explore Gallery
              <ArrowRight size={18} />
            </Link>

            <Link to="/models" className="btn-outline">
              Browse 3D Models
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="hero-bottom">
            <span>DISCOVER · COLLECT · SHARE</span>
            <span>IMAGE &amp; 3D ASSETS</span>
          </div>
        </div>
      </section>

      <section className="home-explore">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="section-label">EXPLORE ARCNEX</p>
              <h2>Discover assets</h2>
            </div>

            <p>
              다양한 형태의 디지털 콘텐츠를
              <br />
              원하는 카테고리에서 찾아보세요.
            </p>
          </div>

          <div className="explore-list">
            <Link to="/gallery" className="explore-card">
              <div className="explore-icon">
                <Image size={32} strokeWidth={1.5} />
              </div>

              <div className="explore-info">
                <span>01 / IMAGE</span>
                <h3>Image Gallery</h3>
                <p>다양한 이미지와 시각적 영감을 탐색하세요.</p>
              </div>

              <ArrowRight className="explore-arrow" size={24} />
            </Link>

            <Link to="/models" className="explore-card">
              <div className="explore-icon">
                <Box size={32} strokeWidth={1.5} />
              </div>

              <div className="explore-info">
                <span>02 / 3D</span>
                <h3>3D Models</h3>
                <p>디지털 오브젝트와 3D 에셋을 살펴보세요.</p>
              </div>

              <ArrowRight className="explore-arrow" size={24} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-share">
        <div className="container share-inner">
          <div>
            <p className="section-label">SHARE YOUR ASSETS</p>
            <h2>Your work, our archive.</h2>

            <p>
              직접 제작한 이미지와 3D 모델을 등록하고
              <br />
              다른 사용자와 공유해 보세요.
            </p>
          </div>

          <Link to="/upload" className="btn-primary">
            <Upload size={18} />
            Upload Asset
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home