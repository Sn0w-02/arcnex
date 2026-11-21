import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, Image as ImageIcon, Search, SlidersHorizontal } from 'lucide-react';
import { useAssetList } from '../lib/useAssetList';
import '../css/gallery.css';

const compact = value => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value ?? 0);

export default function Gallery() {
    const { visible, categories, category, setCategory, query, setQuery, sort, setSort,
        liked, toggleLike, loading, error, busy } = useAssetList('image');

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
                        {categories.map(item => <button key={item} type="button" className={category === item ? 'is-selected' : ''}
                            aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
                    </div>
                    <div className="gallery-tools">
                        <label className="gallery-search"><Search size={17} aria-hidden="true" />
                            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="에셋 검색" aria-label="에셋 검색" />
                        </label>
                        <label className="gallery-sort"><SlidersHorizontal size={16} aria-hidden="true" />
                            <select value={sort} onChange={event => setSort(event.target.value)} aria-label="정렬 방식">
                                <option value="latest">최신순</option><option value="popular">인기순</option><option value="downloads">다운로드순</option>
                            </select>
                        </label>
                    </div>
                </div>
                <p className="gallery-count">{loading ? '—' : visible.length} assets <span>· ARCNEX 등록 이미지</span></p>
                {error && <p className="asset-fetch-error" role="alert">{error}</p>}
                {loading ? <div className="gallery-empty">이미지 목록을 불러오는 중입니다...</div> : visible.length ? (
                    <div className="gallery-grid">
                        {visible.map(asset => {
                            const isLiked = liked.includes(asset.id);
                            return <article className="gallery-card" key={asset.id}>
                                <Link className="gallery-card__preview" to={`/gallery/${asset.id}`} aria-label={`${asset.title} 상세 보기`}>
                                    {asset.imageUrl ? <img src={asset.imageUrl} alt={asset.title} loading="lazy" /> : <ImageIcon size={36} />}
                                    <span className="gallery-card__view">VIEW ASSET <ArrowUpRight size={16} /></span>
                                </Link>
                                <div className="gallery-card__meta">
                                    <div><h2>{asset.title}</h2><p>{asset.category} · ↓ {compact(asset.downloads)}</p></div>
                                    <button type="button" disabled={busy === asset.id} className={isLiked ? 'is-liked' : ''}
                                        aria-label={`${asset.title} 저장 ${isLiked ? '취소' : '추가'}`} aria-pressed={isLiked} onClick={() => toggleLike(asset.id)}>
                                        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />{compact(asset.likes)}
                                    </button>
                                </div>
                            </article>;
                        })}
                    </div>
                ) : <div className="gallery-empty">{error ? '목록을 불러오지 못했습니다.' : '검색 결과가 없습니다. 다른 검색어나 카테고리를 선택해 주세요.'}</div>}
            </section>
        </div>
    );
}
