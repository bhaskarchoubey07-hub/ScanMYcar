# Smart Vehicle QR Contact System

A production-ready full-stack web application that lets vehicle owners register cars or bikes, generate a QR code sticker, and expose a privacy-safe contact page when the QR is scanned.

## Stack

- Frontend: React, Vite, TailwindCSS, Axios
- Backend: Node.js, Express.js, JWT, bcrypt, QRCode
- Database: MySQL

## Setup

1. Install dependencies from the root:

```bash
npm install
```

2. Create a MySQL database and load the schema:

```bash
mysql -u root -p < database/schema.sql
```

3. Copy environment files:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

4. Update the values in `backend/.env` and `frontend/.env`.
   Use your real MySQL password in `backend/.env`.

5. Start the app:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:5000`.

If MySQL is temporarily unavailable during local development, the backend can fall back to a local file store under `backend/data/`. That file is ignored by Git and should not be used as a production database.

## API Documentation

### `POST /api/auth/register`

Registers a new user.

```json
{
  "name": "Aarav Sharma",
  "phone": "9876543210",
  "email": "aarav@example.com",
  "password": "StrongPass1"
}
```

### `POST /api/auth/login`

Authenticates a user and returns a JWT.

```json
{
  "email": "aarav@example.com",
  "password": "StrongPass1"
}
```

### `POST /api/vehicle/add`

Adds a vehicle and generates a QR code. Requires `Authorization: Bearer <token>`.

```json
{
  "vehicle_number": "KA01AB1234",
  "vehicle_type": "car",
  "owner_name": "Aarav Sharma",
  "contact_phone": "9876543210",
  "emergency_contact": "9988776655"
}
```

### `POST /api/public/scan`

Logs a QR scan with optional location data.

```json
{
  "vehicle_id": 1,
  "latitude": 12.9715987,
  "longitude": 77.5945627
}
```

### Admin routes

- `GET /api/admin/users`
- `GET /api/admin/vehicles`
- `GET /api/admin/scans`

All admin routes require an admin JWT.

## Security

- JWT authentication
- bcrypt password hashing
- request validation with `express-validator`
- rate limiting for auth, API, and public scan endpoints
- public page contact actions use backend redirects instead of embedding the phone number in page HTML

## Optional Extras Included

- Scan analytics
- Optional geolocation logging
- Optional email notification when a QR is scanned

## Admin Access

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. On first backend start, the app seeds that admin user automatically if it does not already exist.

## Production Notes

- Set `PUBLIC_BASE_URL` to the deployed backend domain
- Set `FRONTEND_URL` to the deployed frontend domain
- Set `VITE_API_BASE_URL` in the frontend environment to the deployed backend API URL
- QR codes are now returned as SVG data URLs, so Vercel does not need persistent disk storage for sticker images
- Do not commit `.env` files, generated QR images, or `backend/data/dev-db.json`

## Deployment

### Backend environment

Set these values on your backend hosting platform:

```env
FRONTEND_URL=https://your-frontend-domain.com,https://www.your-frontend-domain.com
PUBLIC_BASE_URL=https://your-backend-domain.com
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
STORAGE_DIR=

DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=vehicle_qr_system
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_admin_password
```

Notes:

- `FRONTEND_URL` can contain one or more comma-separated frontend domains.
- `PUBLIC_BASE_URL` must be the public backend URL because QR codes and redirects use it.
- `STORAGE_DIR` is optional for Vercel. It is only used if the app falls back to the local file store.
- Set `DB_SSL=true` for hosted MySQL providers that require TLS. If the provider uses a self-signed or managed certificate chain that Node cannot verify directly, also set `DB_SSL_REJECT_UNAUTHORIZED=false`.
- Use a managed MySQL database in production. Do not rely on the local file fallback there.

### Deploy backend on Vercel

Create a separate Vercel project with:

- Root Directory: `backend`
- Framework Preset: `Other`
- Install Command: `npm install`

The backend is configured for Vercel Functions using:

- [backend/api/index.js](/c:/Users/bhask/OneDrive/Documents/ScanMyCar/backend/api/index.js)
- [backend/api/[...slug].js](/c:/Users/bhask/OneDrive/Documents/ScanMyCar/backend/api/[...slug].js)
- [backend/v/[vehicleId].js](/c:/Users/bhask/OneDrive/Documents/ScanMyCar/backend/v/[vehicleId].js)
- [backend/vercel.json](/c:/Users/bhask/OneDrive/Documents/ScanMyCar/backend/vercel.json)

Recommended Vercel backend environment values:

```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
PUBLIC_BASE_URL=https://your-backend-project.vercel.app
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
STORAGE_DIR=
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=vehicle_qr_system
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-admin-password
```

### Frontend environment

Set these values on your frontend hosting platform:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_PUBLIC_BASE_URL=https://your-backend-domain.com
```

### Deploy frontend on Vercel

Create a second Vercel project with:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### Deploy order

1. Deploy the MySQL database and import [database/schema.sql](/c:/Users/bhask/OneDrive/Documents/ScanMyCar/database/schema.sql).
2. Deploy the backend on Vercel with the backend environment values above.
3. Deploy the frontend on Vercel with `VITE_API_BASE_URL` pointing at the deployed backend.
4. Update `FRONTEND_URL` on the backend to the final frontend domain if it changes after deployment.
5. Visit `/api/health` on the backend and verify it returns `{"status":"ok","storage":"mysql"}`.

### Files to use

- Backend production template: [backend/.env.production.example](/c:/Users/bhask/OneDrive/Documents/ScanMyCar/backend/.env.production.example)
- Frontend production template: [frontend/.env.production.example](/c:/Users/bhask/OneDrive/Documents/ScanMyCar/frontend/.env.production.example)
