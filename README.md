# Small Shop Inventory & Sales System (React + Express + MySQL)

## 1. Setup (local)
Requires Node.js 18+ and MySQL 8.
```bash
# Database
mysql -u root -p < backend/schema.sql

# Backend
cd backend
cp .env.example .env        # edit DB_PASSWORD, JWT_SECRET, SHOP_NAME
npm install
npm run seed                # creates users + 15 sample products
npm run dev                 # API on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                 # App on http://localhost:5173
```
Logins: `owner / owner123` and `cashier / cashier123`. **Change these passwords** in the Users page before real use.

## 2. Design choices
- **Transactions + SELECT ... FOR UPDATE** (routes/sales.js): rows are locked while a sale is saved, so two cashiers can't oversell.
- **Prices come from the database**, never the browser, so a modified client can't change prices.
- **sale_items stores sell and buy price at the time of sale**, so profit stays right after price changes.
- **Deleting a sold product deactivates it** so history is never broken.
- **Cashiers never receive buying prices** from the API.
- **Stock quantity is changed only by sales, restock or adjustment**, each logged in stock_movements.
- **All UI text uses t('...')** (src/i18n.js): add a Kinyarwanda dictionary later without touching pages.

## 3. Testing checklist
- [ ] Login works; wrong password shows an error; cashier is redirected away from /products, /reports, /users.
- [ ] Cashier calls `GET /api/reports/dashboard` -> 403.
- [ ] Add product; duplicate barcode -> error; negative price -> error.
- [ ] POS: search, Enter adds item, quantity can't exceed stock, empty cart blocked, cash less than total blocked.
- [ ] Sale reduces stock; a row appears in stock_movements (type sale, negative qty).
- [ ] Two browsers sell the last unit at the same time: one succeeds, one gets "Not enough stock".
- [ ] Restock adds stock and logs a movement; adjustment can't go below 0.
- [ ] Product below minimum stock appears on Dashboard.
- [ ] Change a product's selling price, then check old sales/profit are unchanged.
- [ ] Delete a product with sales -> deactivated; without sales -> removed.
- [ ] Print receipt shows only the receipt.
- [ ] Reports: daily/weekly/monthly, best sellers, per-cashier totals match history.

## 4. Deployment
**Local shop server (simplest):** install Node + MySQL on one PC, run `npm run build` in frontend, serve `frontend/dist` with any static server (or `npx serve -s dist`), run the backend with `pm2 start server.js`. Other PCs/phones on the same Wi-Fi open `http://<server-ip>:5173` (set `VITE_API_URL=http://<server-ip>:5000/api` before building, and `CORS_ORIGIN` in backend .env).

**Railway / Render:**
1. Create a MySQL database (Railway MySQL plugin) and run schema.sql, then `npm run seed`.
2. Backend as a Node web service (root `backend`, start `npm start`). Set env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET (long random), SHOP_NAME, CORS_ORIGIN (your frontend URL).
3. Frontend as a Static Site (root `frontend`, build `npm run build`, publish `dist`). Set `VITE_API_URL` to `https://<backend-url>/api`. Add a rewrite rule `/* -> /index.html` for React Router.
4. Use HTTPS, change default passwords, back up the database regularly.

## 5. Not built yet (later features)
Customer credit tracking, suppliers/purchase orders, expiry dates, camera barcode scanning, offline mode, Excel/PDF export, multi-shop.
(Credit is available as a payment method, but debts are not tracked or collected yet.)
