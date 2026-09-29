import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { t, fmt, errMsg } from '../i18n.js';
export default function Dashboard() {
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/reports/dashboard').then((r) => setD(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  if (err) return <div className="err">{err}</div>;
  if (!d) return <p>{t('Loading...')}</p>;
  return (
    <>
      <h2>{t('Today')}</h2>
      <div className="stats">
        <div className="card"><small>{t('Sales')}</small><b>{d.today.sales_count}</b></div>
        <div className="card"><small>{t('Revenue')}</small><b>{fmt(d.today.revenue)}</b></div>
        <div className="card"><small>{t('Profit')}</small><b>{fmt(d.today.profit)}</b></div>
      </div>
      <h2>{t('Low stock')}</h2>
      {d.low_stock.length === 0 ? <p>{t('All products have enough stock.')}</p> : (
        <>
          <div className="warn">{d.low_stock.length} {t('product(s) need restocking')}. <Link to="/products">{t('Go to Products')}</Link></div>
          <table><thead><tr><th>{t('Product')}</th><th className="r">{t('In stock')}</th><th className="r">{t('Minimum')}</th></tr></thead>
            <tbody>{d.low_stock.map((p) => <tr key={p.id}><td>{p.name}</td><td className="r low">{p.quantity}</td><td className="r">{p.min_stock}</td></tr>)}</tbody></table>
        </>
      )}
    </>
  );
}
