import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        supabase.auth.getSession().then(({ data, error }) => {
            if (!active) return;
            if (error) console.error('세션 조회 실패:', error);
            setSession(data?.session ?? null);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (active) {
                setSession(nextSession);
                setLoading(false);
            }
        });
        return () => { active = false; subscription.unsubscribe(); };
    }, []);

    return <AuthContext.Provider value={{ user: session?.user ?? null, session, loading }}>
        {children}
    </AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('AuthProvider 내부에서 useAuth를 사용해야 합니다.');
    return context;
}
