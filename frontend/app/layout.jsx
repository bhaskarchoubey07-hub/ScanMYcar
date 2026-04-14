import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Smart Vehicle Identity & Emergency Response System",
  description: "Dynamic vehicle QR identity, emergency response, and admin analytics powered by Next.js and Supabase."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' } }} />
        {children}
      </body>
    </html>
  );
}
