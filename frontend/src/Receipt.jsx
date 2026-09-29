import { fmt, METHODS, t } from './i18n.js';
// Printable receipt. Print CSS (styles.css) hides everything except .receipt.
export default function Receipt({ sale, onClose }) {
  return (
    <div className="modal-bg no-print-bg">
      <div className="modal">
        <div className="receipt">
          <h3>{sale.shop_name}</h3>
          <p>{t('Receipt')} {sale.receipt_no}<br />{new Date(sale.created_at).toLocaleString()}<br />{t('Cashier')}: {sale.cashier}</p>
          <table><tbody>
            {sale.items.map((i, k) => <tr key={k}><td>{i.product_name}<br /><small>{i.quantity} x {fmt(i.price)}</small></td><td className="r">{fmt(i.quantity * i.price)}</td></tr>)}
            <tr className="tot"><td>{t('Total')}</td><td className="r">{fmt(sale.total)}</td></tr>
            <tr><td>{t('Paid')} ({METHODS[sale.payment_method]})</td><td className="r">{fmt(sale.amount_paid)}</td></tr>
            {sale.change_given > 0 && <tr><td>{t('Change')}</td><td className="r">{fmt(sale.change_given)}</td></tr>}
            {sale.payment_method === 'credit' && sale.total > sale.amount_paid && <tr><td>{t('Balance owed')}</td><td className="r">{fmt(sale.total - sale.amount_paid)}</td></tr>}
          </tbody></table>
          <p className="c">{t('Thank you!')}</p>
        </div>
        <div className="row no-print"><button className="btn big" autoFocus onClick={() => window.print()}>{t('Print receipt')}</button><button className="btn ghost big" onClick={onClose}>{t('Close')}</button></div>
      </div>
    </div>
  );
}
