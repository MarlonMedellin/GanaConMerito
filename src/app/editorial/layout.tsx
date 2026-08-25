import type { ReactNode } from "react";
import { AppNav } from "@/components/navigation/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireAuthenticatedUser } from "@/lib/supabase/guards";

function getInitial(email?: string | null) {
  if (!email) return "G";
  return email.slice(0, 1).toUpperCase();
}

export default async function EditorialLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAuthenticatedUser();

  return (
    <>
      <div className="topbar-wrap">
        <header className="topbar">
          <div className="topbar-meta">
            <div className="avatar-chip" aria-hidden="true">
              {getInitial(user.email)}
            </div>
            <div>
              <div className="topbar-title">GanaConMérito</div>
              <div className="subtle">Biblioteca curada</div>
            </div>
          </div>
          <div className="inline-cluster">
            <AppNav />
            <SignOutButton />
          </div>
        </header>
      </div>
      <main className="app-shell">
        <div className="content-stack">{children}</div>
      </main>
    </>
  );
}
