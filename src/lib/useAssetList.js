
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from './supabase';
import { fetchAssets, fetchFavoriteIds, setFavorite } from './assetApi';

export function useAssetList(type) {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [liked, setLiked] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [category, setCategory] = useState('All');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('latest');
    const [busy, setBusy] = useState(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        const key = type === 'image' ? 'gallery_asset_id' : 'model_asset_id';
        Promise.all([
            fetchAssets(type), fetchFavoriteIds(type, user?.id),
            supabase.from('favorites').select(key).not(key, 'is', null)
        ])
            .then(([items, ids, counts]) => {
                if (counts.error) throw counts.error;
                const totals = {};
                (counts.data ?? []).forEach(row => { if (row[key]) totals[row[key]] = (totals[row[key]] || 0) + 1; });
                if (active) { setAssets(items.map(asset => ({ ...asset, likes: totals[asset.id] || 0 }))); setLiked(ids); }
            })
            .catch(err => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [type, user?.id]);

    const categories = useMemo(() => ['All', ...new Set(assets.map(a => a.category).filter(Boolean))], [assets]);
    const visible = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        const items = assets.filter(a => (category === 'All' || a.category === category) &&
            (!keyword || [a.title, a.category, a.description, ...(a.tags ?? [])].join(' ').toLowerCase().includes(keyword)));
        if (sort === 'popular') return [...items].sort((a, b) => b.likes - a.likes);
        if (sort === 'downloads') return [...items].sort((a, b) => b.downloads - a.downloads);
        return items;
    }, [assets, category, query, sort]);

    const toggleLike = async (id) => {
        if (!user) { setError('에셋을 저장하려면 로그인해주세요.'); return; }
        if (busy) return;
        const enabled = !liked.includes(id);
        setBusy(id);
        setError('');
        try {
            await setFavorite(type, user.id, id, enabled);
            setLiked(current => enabled ? [...current, id] : current.filter(item => item !== id));
            setAssets(current => current.map(asset => asset.id === id
                ? { ...asset, likes: Math.max(0, (Number(asset.likes) || 0) + (enabled ? 1 : -1)) }
                : asset));
        } catch (err) { setError(`저장 처리 실패: ${err.message}`); }
        finally { setBusy(null); }
    };

    return {
        assets, visible, categories, category, setCategory, query, setQuery, sort, setSort,
        liked, toggleLike, loading, error, busy
    };
}
