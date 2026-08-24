import type { ReactNode } from "react";
import "./globals.css";
import "./template-v2.css";

export const metadata = {
  title: "GanaConMerito",
  description: "Práctica guiada y evaluación adaptativa para avanzar con foco.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="app-root">{children}</div>
      </body>
    </html>
  );
}
