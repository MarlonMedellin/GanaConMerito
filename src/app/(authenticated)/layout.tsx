import type { ReactNode } from "react";
import { AppNav } from "@/components/navigation/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireAuthenticatedUser } from "@/lib/supabase/guards";

function getInitial(email?: string | null) {
  if (!email) return "G";
  return email.slice(0, 1).toUpperCase();
}

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAuthenticatedUser();

  return (
    <div className="auth-layout-shell">
      <aside className="auth-sidebar" aria-label="Navegación principal">
        <div className="brand-mark" aria-hidden="true">
          <div className="brand-dot" />
        </div>
        <div>
          <div className="topbar-title">GanaConMerito</div>
          <p className="subtle m-0">Workspace autenticado</p>
        </div>
        <div className="sidebar-user-card">
          <div className="avatar-chip" aria-hidden="true">{getInitial(user.email)}</div>
          <div>
            <p className="m-0"><strong>{user.email?.split("@")[0] ?? "Usuario"}</strong></p>
            <p className="subtle m-0">{user.email ?? "Sesión activa"}</p>
          </div>
        </div>
        <AppNav />
        <SignOutButton />
      </aside>

      <div className="auth-main-shell">
        <div className="topbar-wrap auth-topbar-mobile">
          <header className="topbar">
            <div className="topbar-meta">
              <div className="avatar-chip" aria-hidden="true">{getInitial(user.email)}</div>
              <div>
                <div className="topbar-title">GanaConMerito</div>
                <div className="subtle">{user.email ?? "Sesión activa"}</div>
              </div>
            </div>
            <div className="inline-cluster">
              <SignOutButton />
            </div>
          </header>
        </div>
        <main className="app-shell app-shell-auth">
          <div className="content-stack">{children}</div>
        </main>
      </div>
    </div>
  );
}
