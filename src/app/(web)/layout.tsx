import React from "react";
import { WebHeader } from "@/components/layout/WebHeader";
import { WebFooter } from "@/components/layout/WebFooter";
import { SmoothScrollProvider } from "@/components/public/SmoothScrollProvider";

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen flex flex-col bg-surface text-ink valo-tactical-grid">
        <WebHeader />
        <main className="flex-1 w-full animate-page-enter">
          {children}
        </main>
        <WebFooter />
      </div>
    </SmoothScrollProvider>
  );
}
