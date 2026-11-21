import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Upload } from 'lucide-react'
import '../css/home.css'

const panels = [
    { id: 'gallery', path: '/gallery', number: '01', title: 'GALLERY', subtitle: 'VISUAL ASSET COLLECTION', description: '다양한 스타일의 이미지 에셋을 탐색하고, 영감이 되는 비주얼 아카이브를 만나보세요.' },
    { id: 'models', path: '/models', number: '02', title: '3D MODELS', subtitle: '3D ASSET LIBRARY', description: '입체적인 디지털 오브젝트와 3D 모델을 발견하고, 새로운 창작의 가능성을 탐색하세요.' },
]

export default function Home() {
    const [active, setActive] = useState(null)
    return (
        <div className="home">
            <section className={`split-hero ${active ? `split-hero--${active}` : ''}`} onMouseLeave={() => setActive(null)} aria-label="ARCNEX 에셋 탐색">
                {panels.map(panel => (
                    <Link
                        key={panel.id}
                        to={panel.path}
                        className={`split-panel split-panel--${panel.id} ${active === panel.id ? 'is-active' : ''}`}
                        onMouseEnter={() => setActive(panel.id)}
                        onFocus={() => setActive(panel.id)}
                        onBlur={() => setActive(null)}
                        aria-label={`${panel.title} 페이지로 이동`}
                    >
                        <div className="split-panel__image" aria-hidden="true" />
                        <div className="split-panel__shade" aria-hidden="true" />
                        <div className="split-panel__content">
                            <div className="split-panel__expanded">
                                <p className="split-panel__number">{panel.number} <span /></p>
                                <h1>{panel.title}</h1>
                                <p className="split-panel__subtitle">{panel.subtitle}</p>
                                <p className="split-panel__description">{panel.description}</p>
                                <span className="split-panel__explore">EXPLORE <ArrowUpRight size={19} /></span>
                            </div>
                            <div className="split-panel__collapsed" aria-hidden="true"><span>{panel.title}</span></div>
                        </div>
                    </Link>
                ))}
                <div className="split-hero__divider" aria-hidden="true" />
            </section>
            <section className="home-share">
                <div className="container share-inner">
                    <div>
                        <p className="section-label">SHARE YOUR ASSETS</p>
                        <h2>Your work, our archive.</h2>
                        <p>직접 제작한 이미지와 3D 모델을 등록하고<br />다른 사용자와 공유해 보세요.</p>
                    </div>
                    <Link to="/upload" className="btn-primary"><Upload size={18} />Upload Asset</Link>
                </div>
            </section>
        </div>
    )
}
