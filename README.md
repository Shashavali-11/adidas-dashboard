# Adidas Sales & E-Commerce Dashboard (MERN)

Analytics dashboard + small shop built with **MongoDB, Express, React (Vite), Node.js**, Tailwind CSS and Recharts.
Everything runs locally. All numbers on screen come from MongoDB through the Express API (nothing is hard-coded in React).

Data source: the **"Adidas data"** sheet of `EXCEL PROJECT.xlsx` (9,648 invoices, Jan 2020 - Dec 2021, 6 product lines, 6 retailers, 5 regions), converted to `backend/data/adidas_sales.csv`.

## Run it (3 steps)

Requirements: Node.js 18+ and internet on the very first run only (npm packages + an embedded MongoDB binary, about 800 MB, are downloaded once).

```bash
cd adidas-dashboard
npm run setup     # installs root, backend and frontend dependencies (once)
npm start         # starts API on :5000 and the React app on :5173
```

Then open **http://localhost:5173** and sign in with the demo account **admin@adidas.com / Admin@123** (or click *Use demo account*; you can also sign up for your own account). On Windows you can simply double-click `start.bat` (it does the setup automatically).

On every start the backend launches an embedded MongoDB and imports the CSV automatically (takes a few seconds). No MongoDB installation is needed. Orders placed in the shop live in this embedded database until you stop the app; to keep them use your own MongoDB (`MONGO_URI`) or set `EMBEDDED_DB_PERSIST=true` in `backend/.env`.

### Using your own MongoDB / Atlas instead
Edit `backend/.env` and set `MONGO_URI`, e.g. `mongodb://127.0.0.1:27017/adidas_dashboard` or your Atlas connection string. If it is empty (or unreachable) the embedded database is used.

### Re-importing / changing the dataset
1. Put a CSV with these columns at `backend/data/adidas_sales.csv` (the Kaggle "Adidas US Sales Datasets" file works as-is; dates can be `YYYY-MM-DD` or `M/D/YYYY`):
   `Retailer, Retailer ID, Invoice Date, Region, State, City, Product, Price per Unit, Units Sold, Total Sales, Operating Profit, Operating Margin, Sales Method`
2. Restart the app. With the embedded DB the import is automatic; with your own MongoDB run `npm run seed` (wipes and reloads sales + products).
3. To regenerate the CSV from the Excel file: `cd backend && npm run convert -- "path/to/EXCEL PROJECT Zayeem.xlsx"`.

## Features
| Page | What it does |
|---|---|
| Dashboard | 7 KPI cards + "latest month" card with change vs previous period, Day/Week/Month/Quarter/Year switch, date range + presets, region/retailer/category filters, revenue & profit area chart, category donut, units by product line, revenue vs profit by retailer, regional summary, channel split, top sellers, alerts, recent sales |
| Sales | Full invoice table: search, status filter, sortable columns, pagination, **CSV export** |
| Products | Catalog cards with price, stock, units, revenue, profit; search, category/gender/stock filters, sorting, pagination, detail modal with monthly history and regional chart |
| Inventory | Stock levels, low/out-of-stock warnings, stock value |
| Cart | Add / remove, quantity +/- (capped at stock), live subtotal and total, checkout form, order confirmation |
| Orders | Orders saved in MongoDB |
| Settings | Profile (prefills checkout), light/dark mode |
| Header | Refresh, dark mode, notification bell (low stock + unusual regional sales swings), cart badge |

Checkout stores an `Order`, **decrements product stock atomically** (overselling returns HTTP 409) and adds sale rows (dated today, channel "Online") so the analytics include it. The default date range is the dataset's last year (2021); pick the **All** preset or a 2026 date range to see live orders.

## Architecture
```
adidas-dashboard/
  backend/  src/{config,models,controllers,routes,services,middleware,utils}, seed.js, data/adidas_sales.csv
  frontend/ src/{components,pages,context,hooks,utils}
```
Routes -> controllers (thin) -> services (aggregation pipelines / business logic) -> Mongoose models. Central error handler returns `{ error }` JSON with proper status codes (400 validation, 404, 409 stock, 500).

### Authentication (JWT)
* `POST /auth/register` and `POST /auth/login` return `{ token, user }`. Passwords are hashed with bcrypt and never returned.
* The React app stores the token in `localStorage` and sends `Authorization: Bearer <token>` on every request (`frontend/src/utils/api.js`).
* Every route except `/health`, `/auth/login` and `/auth/register` goes through the `protect` middleware (`backend/src/middleware/auth.js`). Missing/invalid/expired tokens get `401` and the app redirects to `/login`.
* Orders are linked to the user who placed them; `admin` users see all orders, `analyst` users see their own.
* Config in `backend/.env`: `JWT_SECRET` (required - the server refuses to start without it), `JWT_EXPIRES_IN`, `DEMO_EMAIL`, `DEMO_PASSWORD`. Copy `backend/.env.example` to `backend/.env` and set a new random secret.

### Database schema
* **User**: name, email (unique), password (bcrypt hash), role (admin | analyst), region
* **Sale**: orderNumber, retailer, retailerId, invoiceDate, region, state, city, productLine, category, gender, style, productSku, productName, pricePerUnit, unitsSold, totalSales, cost, operatingProfit, operatingMargin, salesMethod, status, source
* **Product**: sku, name, productLine, category, gender, style, price, stock, reorderLevel, color, description
* **Order**: orderNumber, customer{name,email,region,address}, items[{sku,name,unitPrice,quantity,subtotal}], total, status

### API (base `http://localhost:5000/api`)
All endpoints below require the JWT header. Shared filter params: `from`, `to` (YYYY-MM-DD), `region`, `retailer`, `category`, `gender`, `method`.

| Endpoint | Purpose |
|---|---|
| `GET /health` | health check (public) |
| `POST /auth/register`, `POST /auth/login` | create account / sign in -> `{token,user}` (public) |
| `GET /auth/me`, `PUT /auth/me` | current user / update name, region, password |
| `GET /meta` | filter options + date bounds |
| `GET /dashboard/kpis` | totals for the range + previous equal-length range + % changes |
| `GET /dashboard/trend?period=day\|week\|month\|quarter\|year` | time series |
| `GET /dashboard/breakdown/:by` | `category, region, retailer, method, state, gender, line, style` |
| `GET /dashboard/top-products?sortBy=units\|revenue\|profit&limit=` | best sellers |
| `GET /dashboard/performance` | latest month vs previous month |
| `GET /dashboard/alerts` | low-stock + unusual sales alerts |
| `GET /sales` , `GET /sales/export` | paginated table (`search,status,sort,order,page,limit`) / CSV |
| `GET /products` , `GET /products/:sku` | catalog with sales metrics / detail with history |
| `GET /inventory` | stock table + summary |
| `GET /orders` , `POST /orders` | list / create order `{customer:{name,email,region}, items:[{sku,quantity}]}` |

### How the calculations work
* Revenue = sum of `totalSales`; Profit = sum of `operatingProfit`; **Cost = Revenue - Profit** (the dataset has no cost column).
* Orders = number of invoice rows; Average order value = Revenue / Orders; Profit margin = Profit / Revenue x 100.
* Change indicators compare the selected range with the immediately preceding range of the same length (margin change is shown in percentage points). The 2020 data has far fewer invoices than 2021, so year-over-year growth looks large - this comes from the data itself.
* The dataset only has product *lines* (e.g. "Men's Street Footwear"). Each line is expanded into 5 named Adidas models and every invoice is assigned one of them deterministically, so product-level metrics always add up to the line totals. Stock levels are generated (some deliberately low/out of stock to demonstrate alerts).
* Online-order cost is assumed to be 55% of revenue.

## Troubleshooting
* Port in use: change `PORT` in `backend/.env` (and `VITE_API_URL` in `frontend/.env`), or free ports 5000 / 5173.
* First start takes a few minutes while the MongoDB binary downloads; later starts take seconds.

