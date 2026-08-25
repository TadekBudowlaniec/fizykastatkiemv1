'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase/client';

type Enrollment = { course_id: number; access_granted: boolean };

type AuthState = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  enrollments: Enrollment[];
  hasAnyAccess: boolean;
  hasAccessToCourse: (courseId: number | string) => boolean;
  refreshAccess: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const loadAccess = useCallback(
    async (u: User | null) => {
      if (!u) {
        setEnrollments([]);
        setIsAdmin(false);
        return;
      }
      const [{ data: userRow }, { data: enr }] = await Promise.all([
        supabase.from('users').select('is_admin').eq('id', u.id).maybeSingle(),
        supabase
          .from('enrollments')
          .select('course_id, access_granted')
          .eq('user_id', u.id)
          .eq('access_granted', true),
      ]);
      setIsAdmin(Boolean((userRow as { is_admin?: boolean } | null)?.is_admin));
      setEnrollments((enr as Enrollment[] | null) ?? []);
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!active) return;
      setUser(u ?? null);
      await loadAccess(u ?? null);
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      const u = session?.user ?? null;
      setUser(u);
      await loadAccess(u);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadAccess]);

  const hasAccessToCourse = useCallback(
    (courseId: number | string) => {
      if (isAdmin) return true;
      if (courseId === 'full_access') return enrollments.length > 0;
      const id = Number(courseId);
      return enrollments.some((e) => Number(e.course_id) === id);
    },
    [isAdmin, enrollments]
  );

  const refreshAccess = useCallback(async () => {
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    setUser(u ?? null);
    await loadAccess(u ?? null);
  }, [supabase, loadAccess]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      await refreshAccess();
    },
    [supabase, refreshAccess]
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      // Zapewnij wiersz w tabeli users (idempotentnie)
      if (data.user) {
        await supabase.from('users').upsert(
          {
            id: data.user.id,
            email,
            full_name: name,
            status: 'active',
            is_admin: false,
          },
          { onConflict: 'id' }
        );
      }
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEnrollments([]);
    setIsAdmin(false);
  }, [supabase]);

  const value: AuthState = {
    user,
    loading,
    isAdmin,
    enrollments,
    hasAnyAccess: isAdmin || enrollments.length > 0,
    hasAccessToCourse,
    refreshAccess,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
