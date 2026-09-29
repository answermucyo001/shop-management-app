import { useEffect, useState } from 'react';
import api from '../api.js';
import { t, fmt, errMsg } from '../i18n.js';
export default function Reports() {
  const [period, setPeriod] = useState('daily'); const [range, setRange] = useState({ from: '', to: '' });
  const [data, setData] = useState(null); const [err, setErr] = useState('');
  useEffect(() => {
    setData(null);
    Promise.all([api.get('/reports/sales', { params: { period, ...range } }), api.get('/reports/top-products', { params: range }), api.get('/reports/cashiers', { params: range })])
      .then(([s, p, c]) => { setData({ sales: s.data, top: p.data, cashiers: c.data }); setErr(''); }).catch((e) => setErr(errMsg(e)));
  }, [period, range]);
  const Table = ({ head, rows }) => rows.length === 0 ? <p>{t('No data for this range.')}</p> : (
    <div className="scroll"><table><thead><tr>{head.map((h, i) => <th key={h} className={i ? 'r' : ''}>{t(h)}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j ? 'r' : ''}>{c}</td>)}</tr>)}</tbody></table></div>);
  return (
    <>
      <h2>{t('Reports')}</h2>
      {err && <div className="err">{err}</div>}
      <div className="row">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}><option value="daily">{t('Daily')}</option><option value="weekly">{t('Weekly')}</option><option value="monthly">{t('Monthly')}</option></select>
        <label className="inline">{t('From')} <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
        <label className="inline">{t('To')} <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
      </div>
      <small>{t('Default range: last 30 days')}</small>
      {!data ? <p>{t('Loading...')}</p> : (
        <>
          <h3>{t('Sales and profit')}</h3>
          <Table head={['Period', 'Sales', 'Revenue', 'Profit']} rows={data.sales.map((r) => [r.period, r.sales_count, fmt(r.revenue), fmt(r.profit)])} />
          <h3>{t('Best-selling products')}</h3>
          <Table head={['Product', 'Units sold', 'Revenue', 'Profit']} rows={data.top.map((r) => [r.name, r.units, fmt(r.revenue), fmt(r.profit)])} />
          <h3>{t('Sales per cashier')}</h3>
          <Table head={['Cashier', 'Sales', 'Revenue', 'Profit']} rows={data.cashiers.map((r) => [r.cashier, r.sales_count, fmt(r.revenue), fmt(r.profit)])} />
        </>
      )}
    </>
  );
}
