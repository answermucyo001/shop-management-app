// All UI text goes through t(). To translate, add a rw = { 'Products': 'Ibicuruzwa', ... }
// dictionary and switch `dict` to it. Unknown keys fall back to the English text.
const rw = {};
let dict = rw;
export const t = (key) => dict[key] || key;
export const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('en-US') + ' RWF';
export const METHODS = { cash: 'Cash', mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', credit: 'Credit' };
export const errMsg = (e) => e.response?.data?.error || 'Something went wrong. Check your connection and try again.';
