import { useEffect, useState, useCallback } from 'react';
import api from '../api.js';
import { t, errMsg } from '../i18n.js';
const empty = { username: '', full_name: '', password: '', role: 'cashier', active: true };
export default function Users() {
  const [rows, setRows] = useState([]); const [form, setForm] = useState(null); const [err, setErr] = useState('');
  const load = useCallback(() => api.get('/users').then((r) => setRows(r.data)).catch((e) => setErr(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);
  const save = async (e) => {
    e.preventDefault(); setErr('');
    try { form.id ? await api.put('/users/' + form.id, form) : await api.post('/users', form); setForm(null); load(); }
    catch (x) { setErr(errMsg(x)); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <>
      <div className="row"><h2>{t('Users')}</h2><button className="btn" onClick={() => setForm(empty)}>+ {t('Add user')}</button></div>
      {err && <div className="err">{err}</div>}
      <div className="scroll"><table>
        <thead><tr><th>{t('Username')}</th><th>{t('Full name')}</th><th>{t('Role')}</th><th>{t('Status')}</th><th></th></tr></thead>
        <tbody>{rows.map((u) => <tr key={u.id} className={u.active ? '' : 'off'}><td>{u.username}</td><td>{u.full_name}</td><td>{t(u.role)}</td><td>{u.active ? t('Active') : t('Inactive')}</td>
          <td><button className="btn sm ghost" onClick={() => setForm({ ...u, password: '' })}>{t('Edit')}</button></td></tr>)}</tbody></table></div>
      {form && (
        <div className="modal-bg"><form className="modal" onSubmit={save}>
          <h3>{form.id ? t('Edit user') : t('Add user')}</h3>
          {!form.id && <label>{t('Username')}<input required value={form.username} onChange={set('username')} /></label>}
          <label>{t('Full name')}<input required value={form.full_name} onChange={set('full_name')} /></label>
          <label>{form.id ? t('New password (leave empty to keep)') : t('Password')}<input type="password" minLength={form.id ? 0 : 6} required={!form.id} value={form.password} onChange={set('password')} /></label>
          <label>{t('Role')}<select value={form.role} onChange={set('role')}><option value="cashier">{t('cashier')}</option><option value="owner">{t('owner')}</option></select></label>
          {form.id && <label className="inline"><input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> {t('Active')}</label>}
          <div className="row"><button className="btn big">{t('Save')}</button><button type="button" className="btn ghost big" onClick={() => setForm(null)}>{t('Cancel')}</button></div>
        </form></div>
      )}
    </>
  );
}
