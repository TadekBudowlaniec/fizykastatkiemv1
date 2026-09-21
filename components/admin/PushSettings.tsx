'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';

type State = 'loading' | 'unsupported' | 'needs_install' | 'denied' | 'off' | 'on';
type ServerInfo = {
  configured: boolean;
  publicKey: string | null;
  devices: number;
  dbError: string | null;
};

const FN = '/.netlify/functions';

/** base64url (VAPID) → Uint8Array dla pushManager.subscribe. */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function authed(path: string, init: RequestInit = {}) {
  const supabase = getSupabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Brak sesji - zaloguj się ponownie.');
  const res = await fetch(`${FN}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error((data.error as string) || `Serwer odpowiedział ${res.status}`);
  return data;
}

export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Powiadomienia push na tym urządzeniu (panel jako PWA). Na iPhonie działa
 * wyłącznie w panelu dodanym na ekran główny (iOS 16.4+); zgoda musi być
 * wywołana kliknięciem użytkownika.
 */
export function PushSettings() {
  const [state, setState] = useState<State>('loading');
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [standalone, setStandalone] = useState(false);

  const loadServer = useCallback(async () => {
    try {
      const data = (await authed('/push-subscribe', { method: 'GET' })) as unknown as ServerInfo;
      setServer(data);
    } catch (e) {
      setServer({
        configured: false,
        publicKey: null,
        devices: 0,
        dbError: e instanceof Error ? e.message : 'błąd',
      });
    }
  }, []);

  useEffect(() => {
    loadServer();
    const sa = isStandaloneApp();
    setStandalone(sa);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setState(isIOS && !sa ? 'needs_install' : 'unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'on' : 'off'))
      .catch(() => setState('unsupported'));
  }, [loadServer]);

  const enable = async () => {
    const key = server?.publicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
    if (!key) {
      setMsg({
        kind: 'err',
        text: 'Serwer nie ma kluczy VAPID. Dodaj NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY i VAPID_SUBJECT w Netlify i zrób redeploy.',
      });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off');
        setMsg({ kind: 'err', text: 'Zgoda na powiadomienia nie została udzielona.' });
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        }));
      await authed('/push-subscribe', { method: 'POST', body: JSON.stringify(sub.toJSON()) });
      setState('on');
      setMsg({ kind: 'ok', text: 'Powiadomienia włączone na tym urządzeniu.' });
      loadServer();
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Nie udało się włączyć powiadomień.' });
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await authed('/push-subscribe', { method: 'DELETE', body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setState('off');
      setMsg({ kind: 'info', text: 'Powiadomienia wyłączone na tym urządzeniu.' });
      loadServer();
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Nie udało się wyłączyć.' });
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const data = await authed('/push-test', { method: 'POST' });
      setMsg({
        kind: 'ok',
        text: `Wysłano testowe powiadomienie na ${data.delivered ?? 0} urządzeń. Powinno pojawić się za chwilę.`,
      });
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Nie udało się wysłać testu.' });
    } finally {
      setBusy(false);
    }
  };

  const alert = (kind: 'ok' | 'err' | 'info', children: React.ReactNode) => (
    <div
      className={cn(
        'rounded-xl px-4 py-3 text-sm [overflow-wrap:anywhere] [&_code]:break-all [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1',
        kind === 'err' && 'border border-red-200 bg-red-50 text-red-700',
        kind === 'ok' && 'border border-emerald-200 bg-emerald-50 text-emerald-700',
        kind === 'info' && 'border border-line bg-cloud text-slate'
      )}
    >
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      {server && !server.configured &&
        alert(
          'err',
          <>
            Serwer nie ma kluczy VAPID. Wygeneruj raz <code>npx web-push generate-vapid-keys</code> i dodaj w
            Netlify: <code>NEXT_PUBLIC_VAPID_PUBLIC_KEY</code>, <code>VAPID_PRIVATE_KEY</code>,{' '}
            <code>VAPID_SUBJECT=mailto:fizykastatkiem@gmail.com</code>, potem „Trigger deploy”.
          </>
        )}
      {server?.dbError &&
        alert(
          'err',
          <>
            Nie mogę odczytać subskrypcji: {server.dbError}. Jeśli to „relation … does not exist”, uruchom{' '}
            <code>supabase/push-subscriptions.sql</code> w Supabase → SQL Editor.
          </>
        )}

      <p className="text-sm text-muted">
        Nowe zamówienie, nowy lead z planera, zwrot lub problem z płatnością trafią na telefon jak zwykłe
        powiadomienie z aplikacji. Zapisanych urządzeń: <strong className="text-ink">{server?.devices ?? '…'}</strong>.
      </p>

      {state === 'loading' && <p className="text-sm text-muted">Sprawdzam obsługę powiadomień…</p>}

      {state === 'needs_install' &&
        alert(
          'info',
          <>
            Na iPhonie powiadomienia działają tylko w panelu dodanym na ekran główny: w Safari otwórz{' '}
            <strong>fizykastatkiem.pl/admin</strong> → Udostępnij → <strong>„Do ekranu początkowego”</strong>, uruchom
            panel z ikony i wróć tutaj.
          </>
        )}

      {state === 'unsupported' &&
        alert('err', 'Ta przeglądarka nie obsługuje Web Push. Na iPhonie potrzebny jest iOS 16.4+ i panel z ekranu głównego.')}

      {state === 'denied' &&
        alert(
          'err',
          'Powiadomienia są zablokowane. iPhone: Ustawienia → Powiadomienia → FS Admin → Zezwalaj. Przeglądarka: kłódka przy adresie → zezwól na powiadomienia.'
        )}

      {(state === 'off' || state === 'on') && (
        <div className="flex flex-wrap items-center gap-3">
          {state === 'off' ? (
            <button
              type="button"
              onClick={enable}
              disabled={busy}
              className="rounded-full bg-[linear-gradient(120deg,#6b4df6,#a855f7,#f43f8f)] px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy ? 'Włączam…' : 'Włącz powiadomienia na tym urządzeniu'}
            </button>
          ) : (
            <>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Włączone na tym urządzeniu
              </span>
              <button
                type="button"
                onClick={sendTest}
                disabled={busy}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-cloud disabled:opacity-60"
              >
                Wyślij testowe
              </button>
              <button
                type="button"
                onClick={disable}
                disabled={busy}
                className="text-xs font-semibold text-muted hover:text-red-600"
              >
                Wyłącz
              </button>
            </>
          )}
          {!standalone && (
            <span className="text-xs text-muted">
              Otwarte w przeglądarce - na telefonie włącz z panelu uruchomionego z ekranu głównego.
            </span>
          )}
        </div>
      )}

      {msg && alert(msg.kind, msg.text)}
    </div>
  );
}
