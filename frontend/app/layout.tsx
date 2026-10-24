import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AuthNav } from "@/components/layout/AuthNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AlgoScope — DSA Visualizer & Learning Platform",
  description:
    "Materialize DSA implementations into interactive visualizations and full-stack mini-apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-slate-100 antialiased`}
      >
        <SessionProvider>
          <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <a href="/" className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/30">
                    AS
                  </span>
                  <span className="text-xl font-bold tracking-tight text-white">
                    Algo<span className="text-indigo-400">Scope</span>
                  </span>
                </a>
              </div>
              <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
                <a
                  href="/"
                  className="transition hover:text-white"
                >
                  Topic Hub
                </a>
                <a href="/dashboard" className="transition hover:text-white">
                  Dashboard
                </a>
                <AuthNav />
              </nav>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
