import { useState } from 'react';
import api from '../api.js';
import { useAuth } from '../App.jsx';
import { t, errMsg } from '../i18n.js';
export default function Login() {
  const { login } = useAuth();
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const { data } = await api.post('/auth/login', f); login(data.token, data.user); }
    catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <div className="login">
      <form className="card" onSubmit={submit}>
        <h1>{t('Shop Inventory & Sales')}</h1>
        {err && <div className="err">{err}</div>}
        <label>{t('Username')}<input autoFocus value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></label>
        <label>{t('Password')}<input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        <button className="btn big" disabled={busy}>{busy ? t('Signing in...') : t('Log in')}</button>
      </form>
    </div>
  );
}
