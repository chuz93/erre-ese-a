import type { ReactNode } from "react";

export const metadata = { title: "RSA: the Marine, the Cyberdemon and the Imp" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
