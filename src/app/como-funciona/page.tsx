import { PublicHeader } from "@/components/public-landing/public-header";
import { PublicFooter } from "@/components/public-landing/public-footer";
import Link from "next/link";
import styles from "@/components/public-landing/public-landing.module.css";

export default function ComoFuncionaPage() {
  return (
    <div className={styles.shell}>
      <PublicHeader />
      <main className={styles.section} style={{ flex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 className={styles.sectionTitle}>Cómo funciona GanaConMérito</h1>
          <p className={styles.sectionSubtitle}>
            Un método estructurado para la preparación de concursos docentes y directivos docentes.
          </p>
          <div className={styles.card} style={{ marginBottom: 24 }}>
            <h2 className={styles.cardTitle}>1. Diagnóstico Inicial</h2>
            <p className={styles.cardText}>
              Identificamos tu perfil y evaluamos tu nivel actual con reactivos alineados a la estructura oficial del concurso.
            </p>
          </div>
          <div className={styles.card} style={{ marginBottom: 24 }}>
            <h2 className={styles.cardTitle}>2. Práctica Guiada con Tutor IA</h2>
            <p className={styles.cardText}>
              Resuelve casos prácticos y recibe acompañamiento explicativo en tiempo real para afianzar tus criterios pedagógicos.
            </p>
          </div>
          <div className={styles.card} style={{ marginBottom: 32 }}>
            <h2 className={styles.cardTitle}>3. Trazabilidad y Progreso</h2>
            <p className={styles.cardText}>
              Visualiza tus avances por competencias y prioriza las áreas donde requieres mayor consolidación.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/login" className={styles.btnPrimary}>
              Comenzar ahora
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
