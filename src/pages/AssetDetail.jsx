import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Box, Download, Heart, Image as ImageIcon, Info, Maximize2, X } from 'lucide-react';
import '@google/model-viewer';
import { useAuth } from '../context/AuthContext';
import { fetchAsset, fetchAssets, fetchFavoriteIds, setFavorite } from '../lib/assetApi';
import '../css/asset-detail.css';

const formatNumber = value => typeof value === 'number' ? value.toLocaleString('ko-KR') : '—';

export default function AssetDetail({ type = 'image' }) {
    const { id } = useParams();
    const { user } = useAuth();
    const isModel = type === 'model';
    const backPath = isModel ? '/models' : '/gallery';
    const backLabel = isModel ? '3D Models' : 'Gallery';
    const [asset, setAsset] = useState(null);
    const [related, setRelated] = useState([]);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        setAsset(null);
        setLightboxOpen(false);
        Promise.all([fetchAsset(type, id), fetchAssets(type), fetchFavoriteIds(type, user?.id)])
            .then(([item, items, favorites]) => {
                if (!active) return;
                setAsset(item);
                setRelated(items.filter(other => other.id !== id).slice(0, 4));
                setLiked(favorites.includes(id));
            })
            .catch(err => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [type, id, user?.id]);

    useEffect(() => {
        if (!lightboxOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = event => { if (event.key === 'Escape') setLightboxOpen(false); };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [lightboxOpen]);

    const toggleLike = async () => {
        if (!user) { setError('에셋을 저장하려면 로그인해주세요.'); return; }
        if (!asset || saving) return;
        setSaving(true);
        setError('');
        try {
            await setFavorite(type, user.id, asset.id, !liked);
            setLiked(value => !value);
        } catch (err) { setError(`저장 처리 실패: ${err.message}`); }
        finally { setSaving(false); }
    };

    if (loading) return <section className="container asset-detail__missing"><p>에셋 정보를 불러오는 중입니다...</p></section>;
    if (!asset) return <section className="container asset-detail__missing">
        <span className="asset-detail__eyebrow">ARCNEX / NOT FOUND</span>
        <h1>에셋을 찾을 수 없습니다.</h1>
        <p>{error || '주소가 올바른지 확인하거나 목록으로 돌아가 주세요.'}</p>
        <Link to={backPath} className="asset-detail__back"><ArrowLeft size={17} /> {backLabel} 돌아가기</Link>
    </section>;

    const canDownload = Boolean(asset.downloadUrl);
    return (
        <div className="asset-detail">
            <div className="container asset-detail__inner">
                <nav className="asset-detail__breadcrumb" aria-label="현재 위치">
                    <Link to={backPath}>{backLabel}</Link><span aria-hidden="true">/</span><span aria-current="page">{asset.title}</span>
                </nav>
                <div className="asset-detail__layout">
                    <section className="asset-detail__media" aria-label="에셋 미리보기">
                        <div className={`asset-detail__stage ${isModel ? 'asset-detail__stage--model' : ''}`}>
                            {isModel && asset.modelUrl ? (
                                <model-viewer key={asset.modelUrl} class="asset-detail__model-viewer" src={asset.modelUrl}
                                    poster={asset.imageUrl || undefined} alt={`${asset.title} 3D 모델`}
                                    camera-controls auto-rotate shadow-intensity="1" exposure="1" interaction-prompt="auto" />
                            ) : asset.imageUrl ? (
                                <img src={asset.imageUrl} alt={asset.title} />
                            ) : isModel ? <Box size={56} /> : <ImageIcon size={56} />}
                            <span className="asset-detail__media-tag">{isModel ? '3D MODEL' : 'IMAGE'}</span>
                            {!isModel && asset.imageUrl && <button type="button" className="asset-detail__expand" onClick={() => setLightboxOpen(true)}>
                                <Maximize2 size={18} /> 확대 보기</button>}
                            {isModel && !asset.modelUrl && <div className="asset-detail__model-notice"><Box size={19} />3D 모델 파일을 찾을 수 없습니다.</div>}
                        </div>
                        {isModel && <div className="asset-detail__preview-tools"><span>3D VIEWER</span>
                            <span className="asset-detail__preview-status">마우스 드래그: 회전 · 휠: 확대/축소</span></div>}
                        <p className="asset-detail__media-caption">{isModel ? '등록된 GLB 모델 미리보기' : '등록된 이미지 원본 미리보기'}</p>
                    </section>
                    <aside className="asset-detail__info" aria-label="에셋 정보">
                        <div className="asset-detail__heading"><span className="asset-detail__eyebrow">ARCNEX / {isModel ? '3D ASSET' : 'IMAGE ASSET'}</span>
                            <h1>{asset.title}</h1><p className="asset-detail__category">{asset.category}</p></div>
                        <p className="asset-detail__description">{asset.description || '등록된 설명이 없습니다.'}</p>
                        <div className="asset-detail__stats">
                            <div><span>LIKES</span><strong>{formatNumber(asset.likes)}</strong></div>
                            <div><span>DOWNLOADS</span><strong>{formatNumber(asset.downloads)}</strong></div>
                        </div>
                        <dl className="asset-detail__specs">
                            <div><dt>Category</dt><dd>{asset.category}</dd></div>
                            <div><dt>Asset Type</dt><dd>{isModel ? '3D Model' : 'Image'}</dd></div>
                            {isModel && <><div><dt>Format</dt><dd>{asset.format || '미정'}</dd></div>
                                <div><dt>Polygons</dt><dd>{asset.polygons == null ? '미등록' : formatNumber(asset.polygons)}</dd></div></>}
                            <div><dt>Availability</dt><dd>{canDownload ? '다운로드 파일 연결됨' : '미리보기 전용'}</dd></div>
                        </dl>
                        <div className="asset-detail__actions">
                            {canDownload ? <a className="asset-detail__download" href={asset.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Download size={18} /> 파일 열기 / 다운로드</a>
                                : <button className="asset-detail__download" type="button" disabled><Download size={18} /> 파일 없음</button>}
                            <button className={`asset-detail__like ${liked ? 'is-liked' : ''}`} type="button" disabled={saving}
                                aria-pressed={liked} onClick={toggleLike}><Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                                {liked ? '저장 취소' : '저장하기'}</button>
                        </div>
                        {error && <p className="asset-fetch-error" role="alert">{error}</p>}
                        <p className="asset-detail__disclaimer"><Info size={15} /> 저장하기는 계정별로 보관됩니다. 다운로드 횟수는 현재 DB에 저장된 값입니다.</p>
                    </aside>
                </div>
                {related.length > 0 && <section className="asset-detail__related" aria-labelledby="related-title">
                    <div className="asset-detail__related-heading"><div><span className="asset-detail__eyebrow">DISCOVER MORE</span>
                        <h2 id="related-title">More {isModel ? '3D Models' : 'Images'}</h2></div>
                        <Link to={backPath}>전체 보기 <ArrowUpRight size={17} /></Link></div>
                    <div className="asset-detail__related-grid">{related.map(item => <Link key={item.id} to={`${backPath}/${item.id}`}
                        className="asset-detail__related-card"><div className="asset-detail__related-image">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.title} loading="lazy" /> : <Box size={32} />}
                        </div><strong>{item.title}</strong><span>{item.category}</span></Link>)}</div>
                </section>}
            </div>
            {lightboxOpen && !isModel && <div className="asset-detail__lightbox" role="dialog" aria-modal="true"
                aria-label={`${asset.title} 이미지 확대`} onClick={() => setLightboxOpen(false)}>
                <button type="button" className="asset-detail__lightbox-close" aria-label="확대 보기 닫기" onClick={() => setLightboxOpen(false)}><X size={24} /></button>
                <img src={asset.imageUrl} alt={asset.title} onClick={event => event.stopPropagation()} />
            </div>}
        </div>
    );
}
