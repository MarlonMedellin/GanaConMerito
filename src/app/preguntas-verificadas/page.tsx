import { PublicHeader } from "@/components/public-landing/public-header";
import { PublicFooter } from "@/components/public-landing/public-footer";
import Link from "next/link";
import styles from "@/components/public-landing/public-landing.module.css";

export default function PreguntasVerificadasPage() {
  return (
    <div className={styles.shell}>
      <PublicHeader />
      <main className={styles.section} style={{ flex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 className={styles.sectionTitle}>Preguntas Verificadas</h1>
          <p className={styles.sectionSubtitle}>
            Banco de reactivos diseñados bajo rigurosos criterios pedagógicos y normativos.
          </p>
          <div className={styles.card} style={{ marginBottom: 24 }}>
            <h2 className={styles.cardTitle}>Alineación a Convocatorias CNSC</h2>
            <p className={styles.cardText}>
              Cada reactivo evalúa competencias funcionales y comportamentales con base en el marco normativo docente.
            </p>
          </div>
          <div className={styles.card} style={{ marginBottom: 32 }}>
            <h2 className={styles.cardTitle}>Retroalimentación Fundamentada</h2>
            <p className={styles.cardText}>
              Todas las preguntas incluyen justificación de la opción correcta y análisis del error en las opciones distractoras.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/login" className={styles.btnPrimary}>
              Explorar Banco
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
