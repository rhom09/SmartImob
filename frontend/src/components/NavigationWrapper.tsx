"use client";

import { usePathname } from "next/navigation";
import { Sidebar, Header } from "@/components/Navigation";

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <div className="lg:pl-sidebar flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-24 p-4 md:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
