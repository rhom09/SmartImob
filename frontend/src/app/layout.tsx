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
        <div className="lg:pl-sidebar flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 pt-24 p-4 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
