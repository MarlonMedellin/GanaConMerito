'use client';

import { useState } from "react";
import Link from "next/link";
import styles from "./public-landing.module.css";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerNav}>
        <Link href="/" className={styles.brand}>
          GanaConMérito
        </Link>

        <nav className={styles.desktopNav} aria-label="Navegación principal">
          <Link href="/como-funciona" className={styles.navLink}>
            Cómo funciona
          </Link>
          <Link href="/preguntas-verificadas" className={styles.navLink}>
            Qué puedes hacer
          </Link>
          <Link href="/tutor-gcm-ia" className={styles.navLink}>
            Tutor GCM IA
          </Link>
          <Link href="/#faq" className={styles.navLink}>
            Preguntas frecuentes
          </Link>
          <Link href="/login" className={styles.btnPrimary}>
            Ingresar
          </Link>
        </nav>

        <button
          type="button"
          className={styles.menuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <svg className="w-6 h-6" style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/como-funciona" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            Cómo funciona
          </Link>
          <Link href="/preguntas-verificadas" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            Qué puedes hacer
          </Link>
          <Link href="/tutor-gcm-ia" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            Tutor GCM IA
          </Link>
          <Link href="/#faq" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            Preguntas frecuentes
          </Link>
          <Link href="/login" className={styles.btnPrimary} onClick={() => setMobileMenuOpen(false)}>
            Ingresar
          </Link>
        </div>
      )}
    </header>
  );
}
