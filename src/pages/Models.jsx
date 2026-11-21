import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Box, Heart, Search, SlidersHorizontal } from "lucide-react";
import { modelAssets } from "../data/modelsData";
import "../css/models.css";

const categories = ["All", "Abstract", "Architecture", "Objects", "Furniture"];
const compact = (value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value));

export default function Models() {
    const [category, setCategory] = useState("All");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("latest");
    const [liked, setLiked] = useState([]);

    const visible = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        const filtered = modelAssets.filter(
            (asset) =>
                (category === "All" || asset.category === category) &&
                (!keyword || `${asset.title} ${asset.category} ${asset.format}`.toLowerCase().includes(keyword)),
        );
        if (sort === "popular") return [...filtered].sort((a, b) => b.likes - a.likes);
        if (sort === "downloads") return [...filtered].sort((a, b) => b.downloads - a.downloads);
        return filtered;
    }, [category, query, sort]);

    const toggleLike = (id) => setLiked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

    return (
        <div className="models-page">
            <section className="models-hero">
                <div className="container models-hero__inner">
                    <p className="models-eyebrow">ARCNEX / 3D ASSETS</p>
                    <h1>3D Models</h1>
                    <p>
                        형태와 공간의 가능성을 탐색하세요.
                        <br />
                        다양한 디지털 오브젝트를 만나보세요.
                    </p>
                </div>
                <Box className="models-hero__symbol" size={250} strokeWidth={0.45} aria-hidden="true" />
            </section>

            <section className="container models-main" aria-label="3D 에셋 목록">
                <div className="models-toolbar">
                    <div className="models-categories" aria-label="카테고리 필터">
                        {categories.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className={category === item ? "is-selected" : ""}
                                aria-pressed={category === item}
                                onClick={() => setCategory(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="models-tools">
                        <label className="models-search">
                            <Search size={17} aria-hidden="true" />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="모델 검색"
                                aria-label="모델 검색"
                            />
                        </label>
                        <label className="models-sort">
                            <SlidersHorizontal size={16} aria-hidden="true" />
                            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="정렬 방식">
                                <option value="latest">최신순</option>
                                <option value="popular">인기순</option>
                                <option value="downloads">다운로드순</option>
                            </select>
                        </label>
                    </div>
                </div>

                <p className="models-count">
                    {visible.length} models <span>· UI 확인용 샘플 (실제 3D 파일 미연결)</span>
                </p>
                {visible.length ? (
                    <div className="models-grid">
                        {visible.map((asset) => {
                            const isLiked = liked.includes(asset.id);
                            return (
                                <article className="models-card" key={asset.id}>
                                    <Link
                                        to={`/models/${asset.id}`}
                                        className="models-card__preview"
                                        aria-label={`${asset.title} 상세 보기`}
                                    >
                                        <img src={asset.imageUrl} alt={`${asset.title} 샘플 썸네일`} loading="lazy" />
                                        <span className="models-card__format">{asset.format}</span>
                                        <span className="models-card__view">
                                            VIEW MODEL <ArrowUpRight size={16} />
                                        </span>
                                    </Link>
                                    <div className="models-card__meta">
                                        <div className="models-card__info">
                                            <h2>{asset.title}</h2>
                                            <p>
                                                {asset.category} <span>·</span> {asset.polygons} polys <span>·</span> ↓{" "}
                                                {compact(asset.downloads)}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className={`models-card__like ${isLiked ? "is-liked" : ""}`}
                                            aria-label={`${asset.title} 좋아요 ${isLiked ? "취소" : "추가"}`}
                                            aria-pressed={isLiked}
                                            onClick={() => toggleLike(asset.id)}
                                        >
                                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                                            {asset.likes + Number(isLiked)}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="models-empty">
                        <Box size={28} />
                        <p>검색 결과가 없습니다.</p>
                        <button
                            type="button"
                            onClick={() => {
                                setCategory("All");
                                setQuery("");
                            }}
                        >
                            필터 초기화
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
