import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Search, SlidersHorizontal, ArrowUpRight } from 'lucide-react'
import '../css/gallery.css'

import { galleryAssets as assets } from '../data/galleryData'

const categories = ['All', 'Nature', 'Architecture', 'Abstract', 'Art', 'People']
const compact = value => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)

export default function Gallery() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('latest')
  const [liked, setLiked] = useState([])

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = assets.filter(asset =>
      (category === 'All' || asset.category === category) &&
      (!normalized || `${asset.title} ${asset.category}`.toLowerCase().includes(normalized))
    )
    if (sort === 'popular') return [...filtered].sort((a, b) => b.likes - a.likes)
    if (sort === 'downloads') return [...filtered].sort((a, b) => b.downloads - a.downloads)
    return filtered
  }, [category, query, sort])

  const toggleLike = id => setLiked(previous => previous.includes(id)
    ? previous.filter(item => item !== id)
    : [...previous, id])

  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <div className="container gallery-hero__inner">
          <p className="gallery-eyebrow">GALLERY / IMAGE ASSETS</p>
          <h1>Image Gallery</h1>
          <p>다양한 이미지 에셋을 탐색하고<br />영감을 얻어보세요.</p>
        </div>
        <div className="gallery-hero__art" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="container gallery-main" aria-label="이미지 에셋 목록">
        <div className="gallery-toolbar">
          <div className="gallery-categories" aria-label="카테고리 필터">
            {categories.map(item => (
              <button key={item} type="button" className={category === item ? 'is-selected' : ''}
                aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
          <div className="gallery-tools">
            <label className="gallery-search">
              <Search size={17} aria-hidden="true" />
              <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="에셋 검색" aria-label="에셋 검색" />
            </label>
            <label className="gallery-sort">
              <SlidersHorizontal size={16} aria-hidden="true" />
              <select value={sort} onChange={event => setSort(event.target.value)} aria-label="정렬 방식">
                <option value="latest">최신순</option>
                <option value="popular">인기순</option>
                <option value="downloads">다운로드순</option>
              </select>
            </label>
          </div>
        </div>
        <p className="gallery-count">{visible.length} assets <span>· Unsplash 이미지 샘플</span></p>
        {visible.length ? (
          <div className="gallery-grid">
            {visible.map(asset => (
              <article className="gallery-card" key={asset.id}>
                <Link className="gallery-card__preview" to={`/gallery/${asset.id}`} aria-label={`${asset.title} 상세 보기`}>
                  <img src={asset.imageUrl} alt={asset.title} loading="lazy" />
                  <span className="gallery-card__view">VIEW ASSET <ArrowUpRight size={16} /></span>
                </Link>
                <div className="gallery-card__meta">
                  <div><h2>{asset.title}</h2><p>{asset.category} · ↓ {compact(asset.downloads)}</p></div>
                  <button type="button" className={liked.includes(asset.id) ? 'is-liked' : ''}
                    aria-label={`${asset.title} 좋아요 ${liked.includes(asset.id) ? '취소' : '추가'}`}
                    aria-pressed={liked.includes(asset.id)} onClick={() => toggleLike(asset.id)}>
                    <Heart size={16} fill={liked.includes(asset.id) ? 'currentColor' : 'none'} />
                    {asset.likes + Number(liked.includes(asset.id))}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="gallery-empty">검색 결과가 없습니다. 다른 검색어나 카테고리를 선택해 주세요.</div>}
      </section>
    </div>
  )
}
