import { useEffect, useRef, useState } from 'react';
import api from '../api.js';
import Receipt from '../Receipt.jsx';
import { t, fmt, errMsg, METHODS } from '../i18n.js';
export default function POS() {
  const [q, setQ] = useState(''); const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]); const [method, setMethod] = useState('cash'); const [paid, setPaid] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [sale, setSale] = useState(null);
  const searchRef = useRef();
  useEffect(() => { searchRef.current?.focus(); }, [sale]);
  useEffect(() => {
    const id = setTimeout(() => api.get('/products', { params: { q } }).then((r) => setResults(r.data)).catch((e) => setErr(errMsg(e))), 200);
    return () => clearTimeout(id);
  }, [q, sale]);

  const add = (p) => {
    if (p.quantity <= 0) return setErr(`${p.name}: ${t('out of stock')}`);
    setErr('');
    setCart((c) => {
      const line = c.find((l) => l.id === p.id);
      if (line) return c.map((l) => l.id === p.id ? { ...l, qty: Math.min(l.qty + 1, p.quantity) } : l);
      return [...c, { id: p.id, name: p.name, price: p.sell_price, max: p.quantity, qty: 1 }];
    });
  };
  // Enter in the search box: exact barcode match, or the only result, gets added
  const onEnter = (e) => {
    if (e.key !== 'Enter') return;
    const hit = results.find((p) => p.barcode && p.barcode === q.trim()) || (results.length === 1 ? results[0] : null);
    if (hit) { add(hit); setQ(''); }
  };
  const setQty = (id, v) => setCart((c) => c.map((l) => l.id === id ? { ...l, qty: Math.max(1, Math.min(l.max, parseInt(v) || 1)) } : l));
  const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const change = method === 'cash' ? Math.max(0, Number(paid || 0) - total) : 0;
  const cashShort = method === 'cash' && Number(paid || 0) < total;

  const finish = async () => {
    setErr('');
    if (!cart.length) return setErr(t('Cart is empty'));
    if (cashShort) return setErr(t('Amount paid is less than the total'));
    setBusy(true);
    try {
      const { data } = await api.post('/sales', { items: cart.map((l) => ({ product_id: l.id, quantity: l.qty })), payment_method: method, amount_paid: method === 'cash' || method === 'credit' ? Number(paid || 0) : total });
      setSale(data); setCart([]); setPaid(''); setQ('');
    } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="pos">
      <section>
        <input ref={searchRef} className="big-input" placeholder={t('Search product name or scan barcode, then press Enter')} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onEnter} />
        <div className="tiles">
          {results.map((p) => (
            <button key={p.id} className="tile" disabled={p.quantity <= 0} onClick={() => add(p)}>
              <b>{p.name}</b><span>{fmt(p.sell_price)}</span><small>{p.quantity} {t('left')}</small>
            </button>))}
          {results.length === 0 && <p>{t('No products found.')}</p>}
        </div>
      </section>
      <section className="card cart">
        <h2>{t('Cart')}</h2>
        {err && <div className="err">{err}</div>}
        {cart.length === 0 ? <p>{t('Cart is empty')}</p> : (
          <table><tbody>{cart.map((l) => (
            <tr key={l.id}>
              <td>{l.name}<br /><small>{fmt(l.price)}</small></td>
              <td><input className="qty" type="number" min="1" max={l.max} value={l.qty} onChange={(e) => setQty(l.id, e.target.value)} /></td>
              <td className="r">{fmt(l.price * l.qty)}</td>
              <td><button className="btn sm danger" onClick={() => setCart(cart.filter((x) => x.id !== l.id))} aria-label="Remove">x</button></td>
            </tr>))}</tbody></table>
        )}
        <div className="total">{t('Total')}: <b>{fmt(total)}</b></div>
        <div className="methods">{Object.entries(METHODS).map(([k, v]) => <button key={k} className={'btn ' + (method === k ? '' : 'ghost')} onClick={() => setMethod(k)}>{v}</button>)}</div>
        {(method === 'cash' || method === 'credit') && <label>{method === 'cash' ? t('Amount paid') : t('Deposit paid now (optional)')}<input type="number" min="0" className="big-input" value={paid} onChange={(e) => setPaid(e.target.value)} /></label>}
        {method === 'cash' && <div className="total">{t('Change')}: <b>{fmt(change)}</b></div>}
        <button className="btn big full" disabled={busy || !cart.length} onClick={finish}>{busy ? t('Saving...') : t('Complete sale')}</button>
      </section>
      {sale && <Receipt sale={sale} onClose={() => setSale(null)} />}
    </div>
  );
}
