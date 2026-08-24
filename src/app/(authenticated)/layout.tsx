import type { ReactNode } from "react";
import { AppNav } from "@/components/navigation/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireAuthenticatedUser } from "@/lib/supabase/guards";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAuthenticatedUser();

  return (
    <div className="auth-layout-shell">
      <div className="auth-main-shell">
        <div className="topbar-wrap auth-topbar-mobile">
          <header className="topbar">
            <div className="topbar-meta">
              <div>
                <div className="topbar-title">GanaConMérito</div>
                <div className="subtle">{user.email ?? "Sesión activa"}</div>
              </div>
            </div>
            <div className="inline-cluster">
              <AppNav />
              <SignOutButton />
            </div>
          </header>
        </div>
        <main className="app-shell app-shell-auth">
          <div className="content-stack">{children}</div>
        </main>
        <div className="mobile-nav-container">
          <AppNav />
        </div>
      </div>
    </div>
  );
}
