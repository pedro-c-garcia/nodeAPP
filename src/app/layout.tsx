import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { NavUser } from "./nav-user";
import { MenuAutoClose } from "./menu-autoclose";

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
          <MenuAutoClose />
          <div className="container">
            <nav className="nav">
              <Link href="/">NodeApp</Link>
              <div>
                <Link href="/quotes">Cotações</Link>
                <Link href="/weather">Meteorologia</Link>
                <details className="menu">
                  <summary className="menu-label">Filmes</summary>
                  <div className="menu-panel">
                    <Link className="menu-item" href="/films">
                      Mostra Filmes
                    </Link>
                  </div>
                </details>
                <details className="menu">
                  <summary className="menu-label">vCard</summary>
                  <div className="menu-panel">
                    <Link className="menu-item" href="/vcard">
                      Criar vCard
                    </Link>
                    <Link className="menu-item" href="/vcard/contacts">
                      Consultar contactos
                    </Link>
                  </div>
                </details>
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
