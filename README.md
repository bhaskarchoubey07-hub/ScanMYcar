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
- Persist `backend/public/qr` if you deploy generated sticker images to containers
- Do not commit `.env` files, generated QR images, or `backend/data/dev-db.json`
