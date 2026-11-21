import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bookmark, FolderOpen, Image as ImageIcon, Box, UserRound, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import '../css/mypage.css';

const categories = {
    image: ['Photography', 'Illustration', 'Digital Art', 'Architecture', 'Nature', 'Other'],
    model: ['Furniture', 'Architecture', 'Props', 'Character', 'Abstract', 'Other'],
};
const emptyForm = { title: '', category: '', description: '', tags: '' };

export default function MyPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState('uploads');
    const [profile, setProfile] = useState(null);
    const [images, setImages] = useState([]);
    const [models, setModels] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState('');
    const [profileNotice, setProfileNotice] = useState('');
    const [profileEditing, setProfileEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [editingAsset, setEditingAsset] = useState(null);
    const [assetForm, setAssetForm] = useState(emptyForm);

    const load = useCallback(async () => {
        if (!user) { setLoading(false); return; }
        setLoading(true);
        const [account, gallery, model, saved] = await Promise.all([
            supabase.from('accounts').select('username').eq('id', user.id).maybeSingle(),
            supabase.from('gallery_assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('model_assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('favorites').select('id,gallery_asset_id,model_asset_id').eq('user_id', user.id),
        ]);
        const errors = [account, gallery, model, saved].filter((result) => result.error).map((result) => result.error.message);
        if (errors.length) setNotice(`데이터 조회 실패: ${errors.join(' / ')}`);
        setProfile(account.data);
        setImages(gallery.data ?? []);
        setModels(model.data ?? []);
        setFavorites(saved.data ?? []);
        setLoading(false);
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const saveProfile = async (event) => {
        event.preventDefault();
        if (!user || saving) return;
        const next = nickname.trim();
        if (next.length < 2 || next.length > 30) { setProfileNotice('닉네임은 2~30자로 입력해주세요.'); return; }
        if (next === profile?.username) { setProfileEditing(false); return; }
        setSaving(true);
        setProfileNotice('');
        // accounts.username에 UNIQUE 인덱스가 있어야 동시 요청에서도 중복이 방지됩니다.
        const { data, error } = await supabase.from('accounts')
            .update({ username: next }).eq('id', user.id).select('username').single();
        if (error) {
            setProfileNotice(error.code === '23505' ? '이미 사용 중인 닉네임입니다.' : `닉네임 변경 실패: ${error.message}`);
        } else {
            setProfile(data);
            setProfileEditing(false);
            setProfileNotice('닉네임이 변경되었습니다.');
        }
        setSaving(false);
    };

    const startAssetEdit = (item) => {
        setEditingAsset(item);
        setAssetForm({
            title: item.title ?? '',
            category: item.category ?? '',
            description: item.description ?? '',
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
        });
        setNotice('');
    };

    const saveAsset = async (event) => {
        event.preventDefault();
        if (!user || !editingAsset || saving) return;
        const title = assetForm.title.trim();
        if (!title || !categories[editingAsset.kind].includes(assetForm.category)) {
            setNotice('제목과 카테고리를 확인해주세요.');
            return;
        }
        setSaving(true);
        setNotice('');
        const table = editingAsset.kind === 'image' ? 'gallery_assets' : 'model_assets';
        const payload = {
            title,
            category: assetForm.category,
            description: assetForm.description.trim(),
            tags: [...new Set(assetForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean))],
        };
        const { data, error } = await supabase.from(table).update(payload)
            .eq('id', editingAsset.id).eq('user_id', user.id).select('id').maybeSingle();
        if (error || !data) {
            setNotice(`작품 수정 실패: ${error?.message ?? '수정 권한 또는 대상 작품을 확인해주세요.'}`);
        } else {
            setEditingAsset(null);
            await load();
            setNotice('작품 정보가 수정되었습니다.');
        }
        setSaving(false);
    };

    const removeAsset = async (item) => {
        if (!user || saving || !window.confirm(`'${item.title}' 작품을 삭제할까요? 삭제 후 복구할 수 없습니다.`)) return;
        setSaving(true);
        setNotice('');
        const table = item.kind === 'image' ? 'gallery_assets' : 'model_assets';
        const bucket = item.kind === 'image' ? 'gallery-images' : 'model-files';
        const path = item.kind === 'image' ? item.image_path : item.model_path;
        const { data, error } = await supabase.from(table).delete()
            .eq('id', item.id).eq('user_id', user.id).select('id').maybeSingle();
        if (error || !data) {
            setNotice(`삭제 실패: ${error?.message ?? '삭제 권한 또는 대상 작품을 확인해주세요.'}`);
            setSaving(false);
            return;
        }
        const cleanupErrors = [];
        if (path) {
            const { error: fileError } = await supabase.storage.from(bucket).remove([path]);
            if (fileError) cleanupErrors.push(fileError.message);
        }
        if (item.kind === 'model' && item.thumbnail_path) {
            const { error: thumbError } = await supabase.storage.from('asset-thumbnails').remove([item.thumbnail_path]);
            if (thumbError) cleanupErrors.push(thumbError.message);
        }
        await load();
        setNotice(cleanupErrors.length ? `DB에서는 삭제됐지만 파일 정리가 필요합니다: ${cleanupErrors.join(' / ')}` : '작품이 삭제되었습니다.');
        setSaving(false);
    };

    const removeFavorite = async (id) => {
        if (!user || saving) return;
        setSaving(true);
        const { error } = await supabase.from('favorites').delete().eq('id', id).eq('user_id', user.id);
        if (error) setNotice(`저장 취소 실패: ${error.message}`);
        else { await load(); setNotice('저장을 취소했습니다.'); }
        setSaving(false);
    };

    const uploads = [...images.map((item) => ({ ...item, kind: 'image' })), ...models.map((item) => ({ ...item, kind: 'model' }))]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const thumbnailUrl = (item) => {
        const bucket = item.kind === 'image' ? 'gallery-images' : 'asset-thumbnails';
        const path = item.kind === 'image' ? item.image_path : item.thumbnail_path;
        return path ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : '';
    };

    return (
        <section className="mypage-page">
            <div className="mypage-container">
                <div className="mypage-heading">
                    <span>PERSONAL ARCHIVE</span>
                    <h1>마이페이지</h1>
                    <p>내 에셋과 저장한 컬렉션을 한눈에 관리하세요.</p>
                </div>

                <div className="mypage-profile">
                    <div className="mypage-avatar"><UserRound size={35} /></div>
                    <div className="mypage-profile-main">
                        <small>ARCNEX MEMBER</small>
                        <h2>나의 아카이브</h2>
                        {profileEditing ? (
                            <form className="mypage-edit-form" onSubmit={saveProfile}>
                                <label htmlFor="mypage-nickname">닉네임</label>
                                <input id="mypage-nickname" autoFocus maxLength={30} value={nickname}
                                    onChange={(e) => setNickname(e.target.value)} placeholder={profile?.username || '현재 닉네임'} />
                                <small>2~30자 · 현재 닉네임은 연한 글씨로 표시됩니다.</small>
                                <div className="mypage-edit-actions">
                                    <button type="button" disabled={saving} onClick={() => { setProfileEditing(false); setNickname(''); setProfileNotice(''); }}>취소</button>
                                    <button type="submit" disabled={saving}>{saving ? '저장 중...' : '변경사항 저장'}</button>
                                </div>
                            </form>
                        ) : (
                            <p>{profile?.username || user?.email || 'ARCNEX 회원'}</p>
                        )}
                        {profileNotice && (
                            <p className="mypage-notice mypage-profile-notice" role="status">
                                {profileNotice}
                            </p>
                        )}
                    </div>
                    {!profileEditing && (
                        <button type="button" className="mypage-profile-edit" onClick={() => { setNickname(''); setProfileNotice(''); setProfileEditing(true); }}>
                            <Pencil size={15} /> 프로필 수정
                        </button>
                    )}
                </div>

                <div className="mypage-stats">
                    <div><ImageIcon size={20} /><strong>{loading ? '—' : images.length}</strong><span>등록한 이미지</span></div>
                    <div><Box size={20} /><strong>{loading ? '—' : models.length}</strong><span>등록한 3D 모델</span></div>
                    <div><Bookmark size={20} /><strong>{loading ? '—' : favorites.length}</strong><span>저장한 에셋</span></div>
                </div>

                <div className="mypage-library">
                    <div className="mypage-library-top">
                        <div><h2>내 라이브러리</h2><p>내가 등록하고 저장한 에셋을 확인하세요.</p></div>
                        <Link to="/upload">새 에셋 등록 <ArrowUpRight size={16} /></Link>
                    </div>
                    <div className="mypage-tabs" role="tablist" aria-label="라이브러리 메뉴">
                        <button role="tab" type="button" aria-selected={tab === 'uploads'} className={tab === 'uploads' ? 'active' : ''} onClick={() => { setTab('uploads'); setEditingAsset(null); }}>내 업로드</button>
                        <button role="tab" type="button" aria-selected={tab === 'saved'} className={tab === 'saved' ? 'active' : ''} onClick={() => { setTab('saved'); setEditingAsset(null); }}>저장한 에셋</button>
                    </div>
                    {notice && <p className="mypage-notice" role="status">{notice}</p>}
                    {loading ? (
                        <div className="mypage-empty"><p>라이브러리를 불러오는 중입니다...</p></div>
                    ) : editingAsset ? (
                        <form className="mypage-asset-edit" onSubmit={saveAsset}>
                            <h3>{editingAsset.kind === 'image' ? '이미지' : '3D 모델'} 작품 수정</h3>
                            <p>등록한 작품 정보를 변경합니다. 원본 파일은 유지됩니다.</p>
                            <label>제목 *<input required maxLength={150} value={assetForm.title} onChange={(e) => setAssetForm((p) => ({ ...p, title: e.target.value }))} /></label>
                            <label>카테고리 *<select required value={assetForm.category} onChange={(e) => setAssetForm((p) => ({ ...p, category: e.target.value }))}>
                                <option value="">카테고리 선택</option>
                                {categories[editingAsset.kind].map((category) => <option key={category} value={category}>{category}</option>)}
                            </select></label>
                            <label>설명<textarea rows={5} value={assetForm.description} onChange={(e) => setAssetForm((p) => ({ ...p, description: e.target.value }))} /></label>
                            <label>태그<input value={assetForm.tags} onChange={(e) => setAssetForm((p) => ({ ...p, tags: e.target.value }))} placeholder="쉼표로 구분 (예: minimal, interior)" /></label>
                            <div className="mypage-edit-actions">
                                <button type="button" disabled={saving} onClick={() => { setEditingAsset(null); setNotice(''); }}>취소</button>
                                <button type="submit" disabled={saving}>{saving ? '저장 중...' : '변경사항 저장'}</button>
                            </div>
                        </form>
                    ) : tab === 'uploads' && uploads.length ? (
                        <div className="mypage-asset-grid">
                            {uploads.map((item) => {
                                const url = thumbnailUrl(item);
                                return (
                                    <article className="mypage-asset-card" key={`${item.kind}-${item.id}`}>
                                        <div className="mypage-asset-thumbnail">
                                            {url ? <img src={url} alt={item.title} loading="lazy" /> : item.kind === 'image' ? <ImageIcon size={32} /> : <Box size={32} />}
                                        </div>
                                        <div className="mypage-asset-info">
                                            <span>{item.kind === 'image' ? 'IMAGE' : '3D MODEL'}</span>
                                            <h3>{item.title}</h3><p>{item.category || '미분류'}</p>
                                            <div className="mypage-card-actions">
                                                <button type="button" disabled={saving} onClick={() => startAssetEdit(item)}><Pencil size={15} /> 수정</button>
                                                <button type="button" disabled={saving} onClick={() => removeAsset(item)}><Trash2 size={15} /> 삭제</button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : tab === 'saved' && favorites.length ? (
                        <div className="mypage-saved-list">
                            {favorites.map((item) => <div className="mypage-saved-item" key={item.id}>
                                <Bookmark size={18} /><span>저장한 에셋</span>
                                <button type="button" disabled={saving} onClick={() => removeFavorite(item.id)}>저장 취소</button>
                            </div>)}
                        </div>
                    ) : (
                        <div className="mypage-empty">
                            <FolderOpen size={38} />
                            <h3>{tab === 'uploads' ? '아직 등록한 에셋이 없습니다' : '아직 저장한 에셋이 없습니다'}</h3>
                            <p>{tab === 'uploads' ? '첫 번째 에셋을 등록해 보세요.' : '마음에 드는 에셋을 저장해 보세요.'}</p>
                            <Link to={tab === 'uploads' ? '/upload' : '/gallery'}>{tab === 'uploads' ? '에셋 업로드 화면으로' : '갤러리 둘러보기'} <ArrowUpRight size={16} /></Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
