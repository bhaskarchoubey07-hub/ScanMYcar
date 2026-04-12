import "./globals.css";

export const metadata = {
  title: "Smart Vehicle Identity & Emergency Response System",
  description: "Dynamic vehicle QR identity, emergency response, and admin analytics powered by Next.js and Supabase."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
