import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bookmark, FolderOpen, Image as ImageIcon, Box, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import '../css/mypage.css';

export default function MyPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState('uploads');
    const [profile, setProfile] = useState(null);
    const [images, setImages] = useState([]);
    const [models, setModels] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState('');
    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true); setNotice('');
        const [account, gallery, model, saved] = await Promise.all([
            supabase.from('accounts').select('username').eq('id', user.id).maybeSingle(),
            supabase.from('gallery_assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('model_assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('favorites').select('id,gallery_asset_id,model_asset_id').eq('user_id', user.id),
        ]);
        const error = [account, gallery, model, saved].find((r) => r.error)?.error;
        if (error) setNotice(`데이터 조회 실패: ${error.message}`);
        setProfile(account.data); setImages(gallery.data ?? []); setModels(model.data ?? []); setFavorites(saved.data ?? []);
        setLoading(false);
    }, [user]);
    useEffect(() => { load(); }, [load]);

    const removeAsset = async (item, kind) => {
        if (!window.confirm(`'${item.title}' 에셋을 삭제할까요?`)) return;
        const table = kind === 'image' ? 'gallery_assets' : 'model_assets';
        const bucket = kind === 'image' ? 'gallery-images' : 'model-files';
        const path = kind === 'image' ? item.image_path : item.model_path;
        // DB를 먼저 삭제한 뒤 Storage 파일을 정리합니다. 파일 정리 실패 시 경고합니다.
        const { error } = await supabase.from(table).delete().eq('id', item.id).eq('user_id', user.id);
        if (error) { setNotice(`삭제 실패: ${error.message}`); return; }
        if (path) {
            const { error: storageError } = await supabase.storage.from(bucket).remove([path]);
            if (storageError) setNotice(`목록에서는 삭제됐지만 파일 정리가 필요합니다: ${storageError.message}`);
        }
        await load();
    };
    const removeFavorite = async (id) => {
        const { error } = await supabase.from('favorites').delete().eq('id', id).eq('user_id', user.id);
        if (error) setNotice(`저장 취소 실패: ${error.message}`);
        else await load();
    };
    const uploads = [...images.map((a) => ({ ...a, kind: 'image' })), ...models.map((a) => ({ ...a, kind: 'model' }))]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <section className="mypage-page">
            <div className="mypage-container">
                <div className="mypage-heading">
                    <span>PERSONAL ARCHIVE</span>
                    <h1>마이페이지</h1>
                    <p>내 에셋과 저장한 컬렉션을 한눈에 관리하세요.</p>
                </div>
                <div className="mypage-profile">
                    <div className="mypage-avatar">
                        <UserRound size={35} />
                    </div>
                    <div>
                        <small>ARCNEX MEMBER</small>
                        <h2>나의 아카이브</h2>
                        <p>로그인 후 프로필 정보를 표시할 예정입니다.</p>
                    </div>
                    <Link to="/login">
                        로그인하기 <ArrowUpRight size={17} />
                    </Link>
                </div>
                <div className="mypage-stats">
                    <div>
                        <ImageIcon size={20} />
                        <strong>—</strong>
                        <span>등록한 이미지</span>
                    </div>
                    <div>
                        <Box size={20} />
                        <strong>—</strong>
                        <span>등록한 3D 모델</span>
                    </div>
                    <div>
                        <Bookmark size={20} />
                        <strong>—</strong>
                        <span>저장한 에셋</span>
                    </div>
                </div>
                <div className="mypage-library">
                    <div className="mypage-library-top">
                        <div>
                            <h2>내 라이브러리</h2>
                            <p>내가 등록하고 저장한 에셋을 확인하세요.</p>
                        </div>
                        <Link to="/upload">
                            새 에셋 등록 <ArrowUpRight size={16} />
                        </Link>
                    </div>
                    <div className="mypage-tabs" role="tablist" aria-label="라이브러리 메뉴">
                        <button
                            role="tab"
                            type="button"
                            aria-selected={tab === "uploads"}
                            className={tab === "uploads" ? "active" : ""}
                            onClick={() => setTab("uploads")}
                        >
                            내 업로드
                        </button>
                        <button
                            role="tab"
                            type="button"
                            aria-selected={tab === "saved"}
                            className={tab === "saved" ? "active" : ""}
                            onClick={() => setTab("saved")}
                        >
                            저장한 에셋
                        </button>
                    </div>
                    <div className="mypage-empty">
                        <FolderOpen size={38} />
                        <h3>{tab === "uploads" ? "아직 등록한 에셋이 없습니다" : "아직 저장한 에셋이 없습니다"}</h3>
                        <p>Supabase 연동 후 계정별 에셋 목록이 이곳에 표시됩니다.</p>
                        <Link to={tab === "uploads" ? "/upload" : "/gallery"}>
                            {tab === "uploads" ? "에셋 업로드 화면으로" : "갤러리 둘러보기"} <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
