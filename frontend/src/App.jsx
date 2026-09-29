import { createContext, useContext, useState } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { t } from './i18n.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import POS from './pages/POS.jsx';
import History from './pages/History.jsx';
import Reports from './pages/Reports.jsx';
import Users from './pages/Users.jsx';

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

// Blocks pages when logged out or when the role is not allowed
function Guard({ owner }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (owner && user.role !== 'owner') return <Navigate to="/sales" replace />;
  return <Outlet />;
}

function Layout() {
  const { user, logout } = useAuth();
  const links = user.role === 'owner'
    ? [['/', 'Dashboard'], ['/sales', 'Sales'], ['/history', 'Sales History'], ['/products', 'Products'], ['/reports', 'Reports'], ['/users', 'Users']]
    : [['/sales', 'Sales'], ['/history', 'Sales History']];
  return (
    <>
      <header className="top no-print">
        <strong className="brand">Shop</strong>
        <nav>{links.map(([to, l]) => <NavLink key={to} to={to} end>{t(l)}</NavLink>)}</nav>
        <span className="who">{user.name}</span>
        <button className="btn ghost" onClick={logout}>{t('Log out')}</button>
      </header>
      <main><Outlet /></main>
    </>
  );
}

export default function App() {
  const nav = useNavigate();
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const login = (token, u) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(u)); setUser(u); nav(u.role === 'owner' ? '/' : '/sales'); };
  const logout = () => { localStorage.clear(); setUser(null); nav('/login'); };
  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Guard />}>
          <Route element={<Layout />}>
            <Route path="/sales" element={<POS />} />
            <Route path="/history" element={<History />} />
            <Route element={<Guard owner />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthCtx.Provider>
  );
}
