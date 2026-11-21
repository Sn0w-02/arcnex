import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, FileBox, Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import '../css/upload.css';

const categories = {
    image: ['Photography', 'Illustration', 'Digital Art', 'Architecture', 'Nature', 'Other'],
    model: ['Furniture', 'Architecture', 'Props', 'Character', 'Abstract', 'Other'],
};
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];

export default function Upload() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [kind, setKind] = useState('image');
    const [form, setForm] = useState({ title: '', category: '', description: '', tags: '' });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [notice, setNotice] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    const selectFile = (selected) => {
        if (!selected) return;
        const isImage = kind === 'image';
        const valid = isImage ? imageTypes.includes(selected.type) : /\.glb$/i.test(selected.name);
        const max = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        if (!valid) { setNotice(isImage ? 'JPG, PNG, WEBP 파일만 가능합니다.' : 'GLB 파일만 가능합니다.'); return; }
        if (selected.size > max) { setNotice(isImage ? '이미지는 10MB 이하여야 합니다.' : 'GLB는 50MB 이하여야 합니다.'); return; }
        setFile(selected);
        setPreview(isImage ? URL.createObjectURL(selected) : '');
        setNotice('');
    };
    const changeKind = (next) => {
        setKind(next); setFile(null); setPreview(''); setNotice('');
        setForm((prev) => ({ ...prev, category: '' }));
        if (inputRef.current) inputRef.current.value = '';
    };
    const submit = async (event) => {
        event.preventDefault();
        if (saving) return;
        if (!file) { setNotice('에셋 파일을 먼저 선택해주세요.'); return; }
        if (!user) { navigate('/login'); return; }
        setSaving(true); setNotice('');
        const isImage = kind === 'image';
        const bucket = isImage ? 'gallery-images' : 'model-files';
        const extension = isImage ? file.name.split('.').pop().toLowerCase() : 'glb';
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        let uploaded = false;
        try {
            const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
                contentType: isImage ? file.type : 'model/gltf-binary', upsert: false,
            });
            if (uploadError) throw uploadError;
            uploaded = true;
            const common = {
                user_id: user.id, title: form.title.trim(), category: form.category,
                description: form.description.trim(),
                tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
            };
            const payload = isImage ? { ...common, image_path: path } : {
                ...common, model_path: path, file_format: 'glb',
            };
            const table = isImage ? 'gallery_assets' : 'model_assets';
            const { error: dbError } = await supabase.from(table).insert(payload);
            if (dbError) throw dbError;
            navigate('/mypage', { replace: true });
        } catch (error) {
            // DB 등록 실패 시 업로드한 파일 정리를 시도합니다.
            if (uploaded) {
                const { error: cleanupError } = await supabase.storage.from(bucket).remove([path]);
                if (cleanupError) console.warn('실패한 업로드 파일 정리 필요:', path, cleanupError);
            }
            setNotice(`업로드 실패: ${error.message}`);
        } finally { setSaving(false); }
    };

    return <section className="upload-page">
        <div className="upload-container">
            <div className="upload-heading">
                <span className="upload-eyebrow">CONTRIBUTE TO ARCNEX</span>
                <h1>에셋 업로드</h1>
                <p>나만의 이미지와 3D 에셋을 아카이브에 추가하세요.</p>
            </div>
            <div className="upload-layout">
                <form className="upload-form" onSubmit={submit}>
                    <div className="upload-section-title">
                        <span>01</span>
                        <div>
                            <h2>에셋 유형</h2>
                            <p>등록할 에셋의 종류를 선택해주세요.</p>
                        </div></div><div className="upload-kind-group">
                        <button type="button" className={kind === 'image' ? 'selected' : ''} onClick={() => changeKind('image')}>
                            <ImageIcon size={23} />
                            <strong>이미지</strong>
                            <small>JPG, PNG, WEBP</small>
                        </button>
                        <button type="button" className={kind === 'model' ? 'selected' : ''} onClick={() => changeKind('model')}>
                            <FileBox size={23} />
                            <strong>3D 모델</strong>
                            <small>GLB, GLTF</small>
                        </button>
                    </div>
                    <div className="upload-section-title">
                        <span>02</span>
                        <div>
                            <h2>파일 선택</h2>
                            <p>파일을 선택하면 오른쪽에서 미리 확인할 수 있습니다.</p>
                        </div>
                    </div>
                    <div className="upload-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0]) }}>
                        <UploadCloud size={30} />
                        <strong>파일을 이곳에 끌어다 놓거나</strong>
                        <button type="button" onClick={() => inputRef.current?.click()}>파일 찾아보기 <ArrowUpRight size={16} />
                        </button>
                        <small>{kind === 'image' ? 'JPG · PNG · WEBP 등 이미지 형식' : 'GLB · GLTF 모델 형식'}</small>
                        <input ref={inputRef} type="file" hidden accept={kind === 'image' ? 'image/*' : '.glb,.gltf,model/gltf-binary,model/gltf+json'} onChange={(e) => selectFile(e.target.files?.[0])} />
                    </div>
                    <div className="upload-section-title">
                        <span>03</span>
                        <div>
                            <h2>에셋 정보</h2>
                            <p>다른 사용자가 쉽게 발견할 수 있도록 설명해주세요.</p>
                        </div>
                    </div>
                    <div className="upload-fields">
                        <label>제목
                            <span>*</span><input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="에셋 이름을 입력하세요" />
                        </label>
                        <label>카테고리
                            <span>*</span>
                            <select required value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                                <option value="">카테고리를 선택하세요</option>{categories[kind].map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </label>
                        <label>설명
                            <textarea rows={5} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="에셋에 대해 간단히 소개해주세요" />

                        </label>
                        <label>태그
                            <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="예: minimal, interior, blue" />
                        </label>
                    </div>{notice && <p className="upload-notice" role="status">{notice}</p>}
                    <button type="submit" className="upload-submit">에셋 등록하기 <ArrowUpRight size={19} />
                    </button>
                </form>
                <aside className="upload-sidebar">
                    <div className="upload-preview">
                        <div className="upload-preview-head">
                            <h2>미리보기</h2>{file && <button type="button" onClick={() => { if (preview) URL.revokeObjectURL(preview); setFile(null); setPreview(''); if (inputRef.current) inputRef.current.value = '' }} aria-label="파일 제거"><X size={18} /></button>}
                        </div>
                        <div className="upload-preview-stage">{preview ? <img src={preview} alt="선택한 이미지 미리보기" /> : <div>{kind === 'model' ? <FileBox size={36} /> : <ImageIcon size={36} />}
                            <span>{file ? '3D 파일이 선택되었습니다' : '선택한 파일이 여기에 표시됩니다'}</span>
                        </div>}
                        </div>
                        <h3>{form.title || '에셋 제목'}</h3>
                        <p>{form.category || '카테고리 미지정'} · {kind === 'image' ? 'IMAGE' : '3D MODEL'}</p>{file && <small>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</small>}
                    </div>
                    <p className="upload-sidebar-tip">현재는 화면 구현 단계입니다. 파일은 서버에 전송되지 않으며, 3D 모델은 파일명만 미리 표시됩니다.</p>
                </aside>
            </div>
        </div>
    </section>
}
