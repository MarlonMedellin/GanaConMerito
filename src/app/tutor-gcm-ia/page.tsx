import { PublicHeader } from "@/components/public-landing/public-header";
import { PublicFooter } from "@/components/public-landing/public-footer";
import Link from "next/link";
import styles from "@/components/public-landing/public-landing.module.css";

export default function TutorGcmIaPage() {
  return (
    <div className={styles.shell}>
      <PublicHeader />
      <main className={styles.section} style={{ flex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 className={styles.sectionTitle}>Tutor GCM IA</h1>
          <p className={styles.sectionSubtitle}>
            Un asistente pedagógico diseñado para fortalecer el razonamiento crítico sin dar respuestas directas.
          </p>
          <div className={styles.card} style={{ marginBottom: 24 }}>
            <h2 className={styles.cardTitle}>Guía Socrática</h2>
            <p className={styles.cardText}>
              El Tutor te orienta a través de preguntas reflexivas para que identifiques el principio pedagógico detrás de cada caso.
            </p>
          </div>
          <div className={styles.card} style={{ marginBottom: 32 }}>
            <h2 className={styles.cardTitle}>Enfoque en Aprendizaje Accionable</h2>
            <p className={styles.cardText}>
              Te ayuda a relacionar la teoría normativa con situaciones reales del aula y la gestión directiva.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/login" className={styles.btnPrimary}>
              Probar Tutor
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
