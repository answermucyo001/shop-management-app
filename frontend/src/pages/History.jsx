import { useEffect, useState } from 'react';
import api from '../api.js';
import Receipt from '../Receipt.jsx';
import { useAuth } from '../App.jsx';
import { t, fmt, errMsg, METHODS } from '../i18n.js';
export default function History() {
  const { user } = useAuth();
  const [f, setF] = useState({ from: '', to: '', cashier_id: '' });
  const [rows, setRows] = useState([]); const [users, setUsers] = useState([]);
  const [sale, setSale] = useState(null); const [err, setErr] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { if (user.role === 'owner') api.get('/users').then((r) => setUsers(r.data)).catch(() => {}); }, [user.role]);
  useEffect(() => {
    setLoading(true);
    api.get('/sales', { params: f }).then((r) => { setRows(r.data); setErr(''); }).catch((e) => setErr(errMsg(e))).finally(() => setLoading(false));
  }, [f]);
  const view = (id) => api.get('/sales/' + id).then((r) => setSale(r.data)).catch((e) => setErr(errMsg(e)));
  return (
    <>
      <h2>{t('Sales History')}</h2>
      {err && <div className="err">{err}</div>}
      <div className="row">
        <label className="inline">{t('From')} <input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></label>
        <label className="inline">{t('To')} <input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></label>
        {user.role === 'owner' && <select value={f.cashier_id} onChange={(e) => setF({ ...f, cashier_id: e.target.value })}><option value="">{t('All cashiers')}</option>{users.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select>}
      </div>
      {loading ? <p>{t('Loading...')}</p> : rows.length === 0 ? <p>{t('No sales found.')}</p> : (
        <div className="scroll"><table>
          <thead><tr><th>{t('Receipt')}</th><th>{t('Date')}</th><th>{t('Cashier')}</th><th>{t('Payment')}</th><th className="r">{t('Total')}</th><th></th></tr></thead>
          <tbody>{rows.map((s) => <tr key={s.id}><td>{s.receipt_no}</td><td>{new Date(s.created_at).toLocaleString()}</td><td>{s.cashier}</td><td>{METHODS[s.payment_method]}</td><td className="r">{fmt(s.total)}</td>
            <td><button className="btn sm" onClick={() => view(s.id)}>{t('View receipt')}</button></td></tr>)}</tbody></table></div>
      )}
      {sale && <Receipt sale={sale} onClose={() => setSale(null)} />}
    </>
  );
}
