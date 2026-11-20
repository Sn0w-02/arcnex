import { useState } from 'react'
import '@google/model-viewer'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Box, Download, Heart, Info, Maximize2, X } from 'lucide-react'
import { galleryAssets } from '../data/galleryData'
import { modelAssets } from '../data/modelsData'
import '../css/asset-detail.css'

const formatNumber = value => typeof value === 'number' ? value.toLocaleString('ko-KR') : '—'

export default function AssetDetail({ type = 'image' }) {
    const { id } = useParams()
    const isModel = type === 'model'
    const collection = isModel ? modelAssets : galleryAssets
    const asset = collection.find(item => String(item.id) === String(id))
    const backPath = isModel ? '/models' : '/gallery'
    const backLabel = isModel ? '3D Models' : 'Gallery'
    const [liked, setLiked] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [modelError, setModelError] = useState(false)

    if (!asset) {
        return (
            <section className="container asset-detail__missing">
                <span className="asset-detail__eyebrow">ARCNEX / NOT FOUND</span>
                <h1>에셋을 찾을 수 없습니다.</h1>
                <p>주소가 올바른지 확인하거나 목록으로 돌아가 주세요.</p>
                <Link to={backPath} className="asset-detail__back"><ArrowLeft size={17} /> {backLabel} 돌아가기</Link>
            </section>
        )
    }

    const hasRealModel = isModel && Boolean(asset.modelUrl)
    const modelSrc = hasRealModel ? `${import.meta.env.BASE_URL}${asset.modelUrl.replace(/^\//, '')}` : null
    const canDownload = Boolean(asset.downloadUrl)
    const related = collection.filter(item => item.id !== asset.id).slice(0, 4)

    return (
        <div className="asset-detail">
            <div className="container asset-detail__inner">
                <nav className="asset-detail__breadcrumb" aria-label="현재 위치">
                    <Link to={backPath}>{backLabel}</Link><span aria-hidden="true">/</span><span aria-current="page">{asset.title}</span>
                </nav>

                <div className="asset-detail__layout">
                    <section className="asset-detail__media" aria-label="에셋 미리보기">
                        <div className={`asset-detail__stage ${isModel ? 'asset-detail__stage--model' : ''}`}>
                            {hasRealModel && !modelError ? (
                                <model-viewer
                                    key={asset.id}
                                    src={modelSrc}
                                    alt={`${asset.title} 3D 모델`}
                                    camera-controls
                                    touch-action="pan-y"
                                    shadow-intensity="1"
                                    exposure="1"
                                    auto-rotate
                                    interaction-prompt="auto"
                                    onError={() => setModelError(true)}
                                    className="asset-detail__model-viewer"
                                />
                            ) : (
                                <img src={asset.imageUrl} alt={isModel ? `${asset.title} 임시 썸네일` : asset.title} />
                            )}
                            <span className="asset-detail__media-tag">{isModel ? '3D MODEL' : 'IMAGE'}</span>
                            {!isModel && (
                                <button type="button" className="asset-detail__expand" onClick={() => setLightboxOpen(true)} aria-label="이미지 크게 보기">
                                    <Maximize2 size={18} /> 확대 보기
                                </button>
                            )}
                            {isModel && (
                                <div className="asset-detail__model-notice" role="status">
                                    <Box size={19} />
                                    <span>{modelError ? '모델 파일을 불러오지 못했습니다. public/models/low_poly_chair.glb 경로를 확인해 주세요.' : hasRealModel ? '드래그하여 회전 · 휠로 확대/축소 · 자동 회전' : '이 에셋은 아직 실제 3D 파일이 연결되지 않아 썸네일만 표시됩니다.'}</span>
                                </div>
                            )}
                        </div>
                        {isModel && (
                            <div className="asset-detail__preview-tools" aria-label="3D 미리보기 기능 안내">
                                <span>3D VIEWER</span>
                                <span className="asset-detail__preview-status">{hasRealModel && !modelError ? '마우스 드래그: 회전 · 휠: 확대/축소' : '3D 파일 미연결'}</span>
                            </div>
                        )}
                        <p className="asset-detail__media-caption">{isModel ? (hasRealModel && !modelError ? '실제 GLB 3D 모델 미리보기' : '샘플 이미지 · 실제 3D 모델 미리보기 아님') : 'Unsplash 기반 샘플 이미지'}</p>
                    </section>

                    <aside className="asset-detail__info" aria-label="에셋 정보">
                        <div className="asset-detail__heading">
                            <span className="asset-detail__eyebrow">ARCNEX / {isModel ? '3D ASSET' : 'IMAGE ASSET'}</span>
                            <h1>{asset.title}</h1>
                            <p className="asset-detail__category">{asset.category}</p>
                        </div>
                        <p className="asset-detail__description">
                            {asset.description || (isModel
                                ? '디지털 에셋 라이브러리의 3D 모델 샘플입니다. 현재 상세 정보는 UI 확인용 데이터이며 일부 에셋에만 실제 모델 파일이 연결되어 있습니다.'
                                : 'ARCNEX 이미지 갤러리의 샘플 에셋입니다. 이미지를 미리 보고 관련 정보를 확인할 수 있습니다.')}
                        </p>
                        <div className="asset-detail__stats">
                            <div><span>LIKES</span><strong>{formatNumber(asset.likes + Number(liked))}</strong></div>
                            <div><span>DOWNLOADS</span><strong>{formatNumber(asset.downloads)}</strong></div>
                        </div>
                        <dl className="asset-detail__specs">
                            <div><dt>Category</dt><dd>{asset.category}</dd></div>
                            <div><dt>Asset Type</dt><dd>{isModel ? '3D Model' : 'Image'}</dd></div>
                            {isModel && <>
                                <div><dt>Format</dt><dd>{asset.format || '미정'} <small>· 샘플 데이터</small></dd></div>
                                <div><dt>Polygons</dt><dd>{asset.polygons || '미정'} <small>· 샘플 데이터</small></dd></div>
                            </>}
                            <div><dt>Availability</dt><dd>{canDownload ? '다운로드 파일 연결됨' : '미리보기 전용'}</dd></div>
                        </dl>
                        <div className="asset-detail__actions">
                            {canDownload ? (
                                <a className="asset-detail__download" href={asset.downloadUrl} download><Download size={18} /> 파일 다운로드</a>
                            ) : (
                                <button className="asset-detail__download" type="button" disabled title="다운로드 파일이 아직 연결되지 않았습니다"><Download size={18} /> 다운로드 준비 중</button>
                            )}
                            <button className={`asset-detail__like ${liked ? 'is-liked' : ''}`} type="button" aria-pressed={liked} onClick={() => setLiked(value => !value)}>
                                <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {liked ? '좋아요 취소' : '좋아요'}
                            </button>
                        </div>
                        <p className="asset-detail__disclaimer"><Info size={15} /> 샘플 데이터입니다. 좋아요는 현재 페이지에서만 반영되며 저장되지 않습니다.</p>
                    </aside>
                </div>

                <section className="asset-detail__related" aria-labelledby="related-title">
                    <div className="asset-detail__related-heading"><div><span className="asset-detail__eyebrow">DISCOVER MORE</span><h2 id="related-title">More {isModel ? '3D Models' : 'Images'}</h2></div><Link to={backPath}>전체 보기 <ArrowUpRight size={17} /></Link></div>
                    <div className="asset-detail__related-grid">
                        {related.map(item => <Link key={item.id} to={`${backPath}/${item.id}`} className="asset-detail__related-card">
                            <div className="asset-detail__related-image"><img src={item.imageUrl} alt={item.title} loading="lazy" /></div>
                            <strong>{item.title}</strong><span>{item.category}</span>
                        </Link>)}
                    </div>
                </section>
            </div>
            {lightboxOpen && !isModel && (
                <div className="asset-detail__lightbox" role="dialog" aria-modal="true" aria-label={`${asset.title} 이미지 확대`} onClick={() => setLightboxOpen(false)}>
                    <button type="button" className="asset-detail__lightbox-close" aria-label="확대 보기 닫기" onClick={() => setLightboxOpen(false)}><X size={24} /></button>
                    <img src={asset.imageUrl} alt={asset.title} onClick={event => event.stopPropagation()} />
                </div>
            )}
        </div>
    )
}
