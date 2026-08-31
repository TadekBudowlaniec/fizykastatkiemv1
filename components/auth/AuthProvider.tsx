'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase/client';

type Enrollment = { course_id: number; access_granted: boolean };

type AuthState = {
  user: User | null;
  loading: boolean;
  accessLoading: boolean;
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
  // true dopóki nie wczytamy dostępu zalogowanego usera — zapobiega migotaniu
  // ekranu „zablokowane"/„0/16" zanim enrollments dojadą.
  const [accessLoading, setAccessLoading] = useState(true);

  // --- 1) Śledzenie sesji ---
  // WAŻNE: w callbacku onAuthStateChange NIE wolno wywoływać funkcji Supabase
  // (getUser / getSession / from(...)), bo klient używa Web Locks do tokenu i
  // dochodzi do zakleszczenia (logowanie „wisi”). Callback tylko ustawia usera;
  // dane dostępu ładujemy w osobnym efekcie poniżej.
  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // --- 2) Ładowanie dostępu (poza callbackiem auth) ---
  const loadAccess = useCallback(
    async (uid: string) => {
      setAccessLoading(true);
      try {
        const [{ data: userRow }, { data: enr }] = await Promise.all([
          supabase.from('users').select('is_admin').eq('id', uid).maybeSingle(),
          supabase
            .from('enrollments')
            .select('course_id, access_granted')
            .eq('user_id', uid)
            .eq('access_granted', true),
        ]);
        setIsAdmin(
          Boolean((userRow as { is_admin?: boolean } | null)?.is_admin)
        );
        setEnrollments((enr as Enrollment[] | null) ?? []);
      } catch {
        // brak dostępu do danych nie może blokować logowania
        setIsAdmin(false);
        setEnrollments([]);
      } finally {
        setAccessLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (user?.id) {
      loadAccess(user.id);
    } else {
      setIsAdmin(false);
      setEnrollments([]);
      setAccessLoading(false); // brak usera — nie ma czego ładować
    }
  }, [user?.id, loadAccess]);

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
    if (u?.id) await loadAccess(u.id);
  }, [supabase, loadAccess]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // onAuthStateChange ustawi usera, a efekt załaduje dostęp — bez blokowania.
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
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
    accessLoading,
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
