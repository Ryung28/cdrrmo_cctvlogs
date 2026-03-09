import "@/lib/env"; // Senior Skill: Validate environment variables on startup
import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import "./tactical.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-center"
          expand={false}
          richColors={false}
          toastOptions={{
            // Styling is now primarily managed via globals.css for maximum precision
            style: {
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
            },
          }}
        />
      </body>
    </html>
  );
}
