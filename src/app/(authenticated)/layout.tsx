import type { ReactNode } from "react";
import { AppNav } from "@/components/navigation/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireAuthenticatedUser } from "@/lib/supabase/guards";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAuthenticatedUser();

  return (
    <div className="auth-layout-shell">
      <header className="product-topbar">
        <div className="brand-lockup">
          <span className="brand-dot" aria-hidden="true" />
          <span>GanaConMérito</span>
        </div>
        <AppNav />
        <div className="topbar-session-actions">
          <span className="subtle topbar-email">{user.email ?? "Sesión activa"}</span>
          <SignOutButton />
        </div>
      </header>

      <div className="auth-main-shell">
        <main className="app-shell app-shell-auth">
          <div className="content-stack">{children}</div>
        </main>
      </div>
    </div>
  );
}
