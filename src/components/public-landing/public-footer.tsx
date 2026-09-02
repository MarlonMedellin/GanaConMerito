import Link from "next/link";
import styles from "./public-landing.module.css";

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} GanaConMérito. Todos los derechos reservados.
        </p>
        <div className={styles.footerLinks}>
          <Link href="/como-funciona" className={styles.navLink}>
            Cómo funciona
          </Link>
          <Link href="/preguntas-verificadas" className={styles.navLink}>
            Preguntas verificadas
          </Link>
          <Link href="/tutor-gcm-ia" className={styles.navLink}>
            Tutor GCM IA
          </Link>
        </div>
      </div>
    </footer>
  );
}
