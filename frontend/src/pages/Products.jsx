import { useEffect, useState, useCallback } from 'react';
import api from '../api.js';
import { t, fmt, errMsg } from '../i18n.js';
const empty = { name: '', category: 'General', barcode: '', buy_price: '', sell_price: '', quantity: 0, min_stock: 5, active: true };
export default function Products() {
  const [rows, setRows] = useState([]); const [cats, setCats] = useState([]);
  const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [inactive, setInactive] = useState(false);
  const [form, setForm] = useState(null); const [stock, setStock] = useState(null);
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.get('/products', { params: { q, category: cat, include_inactive: inactive ? 1 : 0 } }), api.get('/products/categories')]);
      setRows(p.data); setCats(c.data); setErr('');
    } catch (e) { setErr(errMsg(e)); } finally { setLoading(false); }
  }, [q, cat, inactive]);
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    try { form.id ? await api.put('/products/' + form.id, form) : await api.post('/products', form); setForm(null); load(); }
    catch (x) { setErr(errMsg(x)); }
  };
  const remove = async (p) => {
    if (!confirm(`${t('Delete')} "${p.name}"? ${t('If it has sales history it will be deactivated instead.')}`)) return;
    try { const { data } = await api.delete('/products/' + p.id); if (data.deactivated) alert(t('Product has sales history, so it was deactivated.')); load(); }
    catch (x) { setErr(errMsg(x)); }
  };
  const saveStock = async (e) => {
    e.preventDefault();
    try { await api.post(`/products/${stock.id}/stock`, { type: stock.type, quantity: Number(stock.qty), note: stock.note }); setStock(null); load(); }
    catch (x) { setErr(errMsg(x)); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <div className="row"><h2>{t('Products')}</h2><button className="btn" onClick={() => setForm(empty)}>+ {t('Add product')}</button></div>
      {err && <div className="err">{err}</div>}
      <div className="row">
        <input placeholder={t('Search name or barcode')} value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={cat} onChange={(e) => setCat(e.target.value)}><option value="">{t('All categories')}</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        <label className="inline"><input type="checkbox" checked={inactive} onChange={(e) => setInactive(e.target.checked)} /> {t('Show inactive')}</label>
      </div>
      {loading ? <p>{t('Loading...')}</p> : rows.length === 0 ? <p>{t('No products found. Add your first product.')}</p> : (
        <div className="scroll"><table>
          <thead><tr><th>{t('Name')}</th><th>{t('Category')}</th><th>{t('Barcode')}</th><th className="r">{t('Buy')}</th><th className="r">{t('Sell')}</th><th className="r">{t('Stock')}</th><th></th></tr></thead>
          <tbody>{rows.map((p) => (
            <tr key={p.id} className={p.active ? '' : 'off'}>
              <td>{p.name}{!p.active && ` (${t('inactive')})`}</td><td>{p.category}</td><td>{p.barcode}</td>
              <td className="r">{fmt(p.buy_price)}</td><td className="r">{fmt(p.sell_price)}</td>
              <td className={'r ' + (p.quantity <= p.min_stock ? 'low' : '')}>{p.quantity}</td>
              <td className="acts">
                <button className="btn sm" onClick={() => setStock({ id: p.id, name: p.name, type: 'restock', qty: '', note: '' })}>{t('Restock')}</button>
                <button className="btn sm ghost" onClick={() => setForm(p)}>{t('Edit')}</button>
                <button className="btn sm danger" onClick={() => remove(p)}>{t('Delete')}</button>
              </td>
            </tr>))}</tbody></table></div>
      )}
      {form && (
        <div className="modal-bg"><form className="modal" onSubmit={save}>
          <h3>{form.id ? t('Edit product') : t('Add product')}</h3>
          <label>{t('Name')}<input required value={form.name} onChange={set('name')} /></label>
          <label>{t('Category')}<input list="cats" value={form.category} onChange={set('category')} /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></label>
          <label>{t('Barcode')} ({t('optional')})<input value={form.barcode || ''} onChange={set('barcode')} /></label>
          <div className="grid2">
            <label>{t('Buying price')}<input type="number" min="0" required value={form.buy_price} onChange={set('buy_price')} /></label>
            <label>{t('Selling price')}<input type="number" min="0" required value={form.sell_price} onChange={set('sell_price')} /></label>
            {!form.id && <label>{t('Quantity')}<input type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} /></label>}
            <label>{t('Minimum stock')}<input type="number" min="0" step="1" value={form.min_stock} onChange={set('min_stock')} /></label>
          </div>
          {form.id && <label className="inline"><input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> {t('Active (can be sold)')}</label>}
          <div className="row"><button className="btn big">{t('Save')}</button><button type="button" className="btn ghost big" onClick={() => setForm(null)}>{t('Cancel')}</button></div>
        </form></div>
      )}
      {stock && (
        <div className="modal-bg"><form className="modal" onSubmit={saveStock}>
          <h3>{stock.name}</h3>
          <label>{t('Type')}<select value={stock.type} onChange={(e) => setStock({ ...stock, type: e.target.value })}><option value="restock">{t('Restock (add stock)')}</option><option value="adjustment">{t('Adjustment (+ or -)')}</option></select></label>
          <label>{t('Quantity')}<input type="number" step="1" required autoFocus value={stock.qty} onChange={(e) => setStock({ ...stock, qty: e.target.value })} /></label>
          <label>{t('Note')}<input value={stock.note} onChange={(e) => setStock({ ...stock, note: e.target.value })} /></label>
          <div className="row"><button className="btn big">{t('Save')}</button><button type="button" className="btn ghost big" onClick={() => setStock(null)}>{t('Cancel')}</button></div>
        </form></div>
      )}
    </>
  );
}
