# 🚗 Smart Vehicle Identity & SOS Response System (SVIERN)

A premium, production-ready SaaS application for vehicle identity management, QR-based contact discovery, and real-time emergency response. Built with **Next.js 14**, **Supabase**, and **Framer Motion**.

---

## ⚡ Revolutionary Architecture

- **Serverless Core**: Powered by Next.js App Router and Supabase SSR. No external backend required.
- **Real-time Telemetry**: Live dashboard updates via Supabase Realtime subscriptions.
- **AI-Driven Security**: Client-side anomaly detection identifying suspicious rapid-scan activity.
- **Premium Aesthetics**: Dark glassmorphism UI with cinematic animations and responsive SOS protocols.
- **Vercel Optimized**: Clean root structure ready for instant deployment.

---

## 🚀 Key Features

- **Auth 2.0**: Secure authentication with direct Supabase Auth integration.
- **Identity Hub**: Manage your vehicle fleet, generate high-resolution QR identity cards, and track scan telemetry.
- **SOS Protocol**: One-tap emergency broadcast system alerting owners via dashboard and family via WhatsApp.
- **Dynamic QR Cards**: Custom-themed, printable identity cards that act as the physical-to-digital bridge.
- **Public Profile**: Verified public pages for vehicles displaying emergency contact and medical info.
- **Global Monitor**: Real-time activity feed tracking scans and security alerts across the infrastructure.

---

## 🛠️ Stack & Technologies

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide icons.
- **Animations**: Framer Motion for premium micro-interactions.
- **Database/Auth**: Supabase (PostgreSQL + Auth + Realtime).
- **Deployment**: Vercel (Auto-optimized for Edge).

---

## ⚙️ Environment Configuration

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 📥 Getting Started

1. **Database Setup**: Run the [database/schema.sql](database/schema.sql) in your Supabase SQL Editor to initialize tables, RLS policies, and real-time triggers.
2. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```
3. **Identity Verification**: Sign up and register your first vehicle to generate your secure QR Identity.

---

## 📦 Deployment to Vercel

1. Connect your repository to Vercel.
2. The project will auto-detect the Next.js framework.
3. Add your Supabase environment variables in the Vercel dashboard.
4. **Deployed!** The architecture is optimized for cold-starts and low-latency edge rendering.

---

## 📜 Architecture History

This project was migrated from a legacy Node.js/Express monorepo structure to a streamlined, pure Next.js/Supabase architecture in April 2026. The `backend/` directory and legacy API dependencies have been eliminated to ensure maximum performance and security.

---

*Secured by ScanMyCar Protocol v3.0*
