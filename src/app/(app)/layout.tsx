import React from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink valo-tactical-grid">
      {children}
    </div>
  );
}
