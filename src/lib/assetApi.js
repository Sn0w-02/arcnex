import { supabase } from './supabase';

export const assetTable = (type) => type === 'model' ? 'model_assets' : 'gallery_assets';
export const favoriteColumn = (type) => type === 'model' ? 'model_asset_id' : 'gallery_asset_id';

export const storageUrl = (bucket, path) => {
    if (!path) return '';
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

export const normalizeAsset = (row, type) => ({
    ...row,
    type,
    imageUrl: storageUrl(type === 'model' ? 'asset-thumbnails' : 'gallery-images', type === 'model' ? row.thumbnail_path : row.image_path),
    modelUrl: type === 'model' ? storageUrl('model-files', row.model_path) : '',
    downloadUrl: storageUrl(type === 'model' ? 'model-files' : 'gallery-images', type === 'model' ? row.model_path : row.image_path),
    likes: row.like_count ?? 0,
    downloads: row.download_count ?? 0,
    format: type === 'model' ? (row.file_format ?? 'glb').toUpperCase() : '',
    polygons: row.polygon_count,
});

export async function fetchAssets(type) {
    const { data, error } = await supabase.from(assetTable(type)).select('*').order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    return (data ?? []).map(row => normalizeAsset(row, type));
}

export async function fetchAsset(type, id) {
    const { data, error } = await supabase.from(assetTable(type)).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? normalizeAsset(data, type) : null;
}

export async function fetchFavoriteIds(type, userId) {
    if (!userId) return [];
    const column = favoriteColumn(type);
    const { data, error } = await supabase.from('favorites').select(column).eq('user_id', userId).not(column, 'is', null);
    if (error) throw error;
    return (data ?? []).map(row => row[column]);
}

export async function setFavorite(type, userId, assetId, enabled) {
    const column = favoriteColumn(type);
    if (enabled) {
        const { error } = await supabase.from('favorites').insert({ user_id: userId, [column]: assetId });
        if (error && error.code !== '23505') throw error;
    } else {
        const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq(column, assetId);
        if (error) throw error;
    }
}
