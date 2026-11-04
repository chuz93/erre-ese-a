import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "RSA: el Marine, el Cyberdemon y el Imp" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
