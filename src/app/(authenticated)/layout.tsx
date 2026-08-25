import type { ReactNode } from "react";
import { AppNav } from "@/components/navigation/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ReleaseStamp } from "@/components/release/release-stamp";
import { requireAuthenticatedUser } from "@/lib/supabase/guards";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  await requireAuthenticatedUser();

  return (
    <div className="auth-layout-shell">
      <header className="topbar">
        <div className="brand">
          <i aria-hidden="true" />
          GanaConMérito
        </div>
        <div className="topbar-actions">
          <AppNav />
          <SignOutButton />
        </div>
      </header>
      <main className="app-shell app-shell-auth">{children}</main>
      <ReleaseStamp />
    </div>
  );
}
