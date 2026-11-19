'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  CalendarDays,
  Briefcase,
  Settings,
  Inbox,
  RefreshCw,
  LogOut,
  Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Lead = {
  id: string | number;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  status?: string;
  created_at?: string;
  zip_code?: string;
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('demo');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setSubmitting(true);
    setAuthMessage(null);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthMessage({ type: 'error', text: error.message });
      } else if (data.user && !data.session) {
        setAuthMessage({
          type: 'success',
          text: 'Регистрация успешна! Проверьте почту для подтверждения аккаунта.',
        });
      } else {
        setAuthMessage({ type: 'success', text: 'Аккаунт создан! Выполняется вход...' });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthMessage({ type: 'error', text: error.message });
      }
    }

    setSubmitting(false);
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  async function load() {
    setLoading(true);
    if (supabase) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error) {
        setLeads(data || []);
        setMode('supabase');
      } else {
        setMode('demo-fallback');
        setLeads(JSON.parse(localStorage.getItem('northstar_demo_leads') || '[]'));
      }
    } else {
      setMode('demo');
      setLeads(JSON.parse(localStorage.getItem('northstar_demo_leads') || '[]'));
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="muted">Проверка сессии...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: '#f5f7f9',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#ffffff',
            padding: 32,
            borderRadius: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Lock size={18} />
            <span className="eyebrow">NORTHSTAR ADMIN</span>
          </div>
          <h1 style={{ fontSize: 26, margin: '8px 0 6px' }}>
            {isSignUp ? 'Регистрация' : 'Вход в систему'}
          </h1>
          <p className="muted" style={{ fontSize: 13, marginBottom: 22 }}>
            {isSignUp
              ? 'Создайте учетную запись администратора'
              : 'Введите данные для доступа к панели управления'}
          </p>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@northstar.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #d5dce4',
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Пароль</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #d5dce4',
                  fontSize: 14,
                }}
              />
            </div>

            {authMessage && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  background: authMessage.type === 'error' ? '#fdecea' : '#e8f7ef',
                  color: authMessage.type === 'error' ? '#b71c1c' : '#176b43',
                }}
              >
                {authMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-dark"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {submitting ? 'Подождите...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #edf1f5', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthMessage(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#1e293b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>

          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: 12, color: '#64748b' }}>
              ← Вернуться на сайт
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/" className="brand" style={{ color: 'white' }}>
          NORTHSTAR
          <small style={{ color: '#9eacba' }}>ADMIN CONSOLE</small>
        </Link>
        <div style={{ margin: '40px 0 12px', fontSize: 10, letterSpacing: '.15em', color: '#78899a' }}>
          WORKSPACE
        </div>
        <a href="#overview">
          <LayoutDashboard size={15} style={{ display: 'inline', marginRight: 10 }} />
          Overview
        </a>
        <a href="#leads">
          <Inbox size={15} style={{ display: 'inline', marginRight: 10 }} />
          Leads
        </a>
        <a href="#appointments">
          <CalendarDays size={15} style={{ display: 'inline', marginRight: 10 }} />
          Appointments
        </a>
        <a href="#customers">
          <Users size={15} style={{ display: 'inline', marginRight: 10 }} />
          Customers
        </a>
        <a href="/projects">
          <Briefcase size={15} style={{ display: 'inline', marginRight: 10 }} />
          Projects
        </a>
        <a href="#settings">
          <Settings size={15} style={{ display: 'inline', marginRight: 10 }} />
          Settings
        </a>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 40,
            background: 'none',
            border: 'none',
            color: '#f87171',
            cursor: 'pointer',
            padding: 0,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <LogOut size={15} style={{ display: 'inline', marginRight: 10 }} />
          Sign out
        </button>

        <Link href="/" style={{ marginTop: 16 }}>
          <ArrowLeft size={15} style={{ display: 'inline', marginRight: 10 }} />
          Back to website
        </Link>
      </aside>

      <main className="admin-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="eyebrow">NORTHSTAR / ADMIN · {user.email}</div>
            <h1 style={{ fontSize: 34, margin: '8px 0' }}>Good afternoon.</h1>
            <p className="muted" style={{ fontSize: 13 }}>
              Here’s what’s happening with your service requests.
            </p>
          </div>
          <button className="btn btn-dark" onClick={load}>
            <RefreshCw size={15} /> Refresh data
          </button>
        </div>

        <div
          style={{
            margin: '22px 0',
            padding: 13,
            background: mode === 'supabase' ? '#e8f7ef' : '#fff4e8',
            color: mode === 'supabase' ? '#176b43' : '#99531f',
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {mode === 'supabase'
            ? 'Connected to Supabase database'
            : mode === 'demo-fallback'
            ? 'Supabase query unavailable — showing local demo data'
            : 'Demo mode · Connect Supabase to enable shared, persistent records'}
        </div>

        <section id="overview" className="admin-cards">
          <div className="stat">
            <small>Total Leads</small>
            <strong>{leads.length}</strong>
            <small>All captured requests</small>
          </div>
          <div className="stat">
            <small>New Requests</small>
            <strong>{leads.filter((x) => (x.status || 'new').toLowerCase() === 'new').length}</strong>
            <small>Awaiting follow-up</small>
          </div>
          <div className="stat">
            <small>Service Categories</small>
            <strong>6</strong>
            <small>Active service lines</small>
          </div>
          <div className="stat">
            <small>Appointments</small>
            <strong>—</strong>
            <small>Booking module setup next</small>
          </div>
        </section>

        <section id="leads" style={{ marginTop: 34 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <div>
              <h2 style={{ fontSize: 23, margin: 0 }}>Recent leads</h2>
              <p className="muted" style={{ fontSize: 12 }}>
                Requests submitted through the estimate form.
              </p>
            </div>
            <span className="pill">{leads.length} records</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>ZIP</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>Loading…</td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 28, textAlign: 'center', color: '#7b8997' }}>
                      No leads yet. Submit a test estimate request on the website to see it here.
                    </td>
                  </tr>
                ) : (
                  leads.map((x) => (
                    <tr key={x.id}>
                      <td>
                        <strong>{x.full_name || x.name || 'New customer'}</strong>
                      </td>
                      <td>{x.service || '—'}</td>
                      <td>{x.zip_code || '—'}</td>
                      <td>{x.email || x.phone || '—'}</td>
                      <td>
                        <span className="pill">{x.status || 'New'}</span>
                      </td>
                      <td>{x.created_at ? new Date(x.created_at).toLocaleDateString('en-US') : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section id="appointments" style={{ marginTop: 34 }}>
          <h2 style={{ fontSize: 23 }}>Appointments</h2>
          <div className="stat">
            <p className="muted" style={{ fontSize: 13 }}>
              Appointment calendar and availability management are defined in the database plan. Connect a scheduling
              provider and configure team availability before accepting real bookings.
            </p>
          </div>
        </section>

        <section id="settings" style={{ marginTop: 34 }}>
          <h2 style={{ fontSize: 23 }}>Workspace settings</h2>
          <div className="stat">
            <p style={{ fontSize: 13 }}>Brand: NORTHSTAR HOME SERVICES · Market: Austin, TX · Locale: English (US)</p>
            <p className="muted" style={{ fontSize: 12 }}>
              This admin screen is a starter dashboard. Production access control and the remaining content-management
              modules must be enabled with your Supabase project and admin account.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}