import type { ReactNode } from "react";
import "./globals.css";
import "./public-landing.css";


export const metadata = {
  title: "GanaConMérito",
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

