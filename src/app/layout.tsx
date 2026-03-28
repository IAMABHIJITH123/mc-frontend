import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MC Analytics | Server Intelligence",
  description: "Real-time analytics for Primex Anarchy and Spadikam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-50 antialiased selection:bg-cyan-500/30`}>
        {children}
      </body>
    </html>
  );
}
