import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CDRRMO | CCTV Log System",
  description: "Official CCTV logging and incident management system for CDRRMO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-center"
          expand={false}
          richColors={false}
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '99px',
              width: 'fit-content',
              minWidth: '180px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              textAlign: 'center',
            },
          }}
        />
      </body>
    </html>
  );
}
