import { PublicHeader } from "./public-header";
import { PublicFooter } from "./public-footer";
import { HeroIllustration } from "./hero-illustration";
import Link from "next/link";
import styles from "./public-landing.module.css";

export function PublicLanding() {
  return (
    <div className={styles.shell}>
      <PublicHeader />

      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>
              Tu preparación necesita algo más que acumular respuestas.
            </span>
            <h1 className={styles.title}>
              No practiques más. Practica mejor.
            </h1>
            <p className={styles.subtitle}>
              Cada respuesta se convierte en una señal para decidir qué reforzar después, con preguntas diseñadas para acompañar tu proceso, feedback explicativo y un Tutor GCM IA que acompaña tu comprensión sin regalarte la respuesta.
            </p>
            <div className={styles.actions}>
              <Link href="/login" className={styles.btnPrimary}>
                Comenzar mi preparación
              </Link>
              <Link href="/como-funciona" className={styles.btnSecondary}>
                Ver cómo funciona
              </Link>
            </div>
            <p className={styles.securityNote}>
              <svg className={styles.securityIcon} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Acceso seguro con Google.
            </p>
          </div>
          <HeroIllustration />
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <h2 className={styles.sectionTitle}>Diseñado para el mérito docente</h2>
        <p className={styles.sectionSubtitle}>
          Herramientas enfocadas en la estructura oficial de evaluación y acompañamiento formativo.
        </p>
        <div className={styles.grid3}>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.iconGreen}`}>
              <svg style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Preguntas Verificadas</h3>
            <p className={styles.cardText}>
              Casos de estudio alineados a la estructura oficial de la CNSC y guías de evaluación docente.
            </p>
          </div>

          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.iconBlue}`}>
              <svg style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Tutor GCM IA</h3>
            <p className={styles.cardText}>
              Explicaciones paso a paso que identifican el constructo evaluado y te guían hacia el razonamiento correcto.
            </p>
          </div>

          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.iconGreen}`}>
              <svg style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Diagnóstico y Progreso</h3>
            <p className={styles.cardText}>
              Métricas claras sobre tus fortalezas y áreas que requieren mayor atención antes del examen.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
