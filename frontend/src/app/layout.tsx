import type { Metadata } from "next";
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/hanken-grotesk/600.css";
import "@fontsource/hanken-grotesk/700.css";
import "./globals.css";
import { Sidebar, Header } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "SmartImob - Gestão Imobiliária",
  description: "Sistema completo de gestão imobiliária",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-background text-on-background" suppressHydrationWarning>
        <Sidebar />
        <div className="pl-sidebar">
          <Header />
          <main className="pt-16 p-8 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
