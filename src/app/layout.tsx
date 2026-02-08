import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { NavUser } from "./nav-user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NodeApp - Mercado",
  description: "Portal com autenticação e consulta de índices históricos",
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
        <Providers>
          <div className="container">
            <nav className="nav">
              <Link href="/">NodeApp</Link>
              <div>
                <Link href="/profile">Perfil</Link>
                <Link href="/auth">Autenticação</Link>
                <Link href="/quotes">Cotações</Link>
                <NavUser />
              </div>
            </nav>
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
