import { PublicHeader } from "@/components/public-landing/public-header";
import { PublicFooter } from "@/components/public-landing/public-footer";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tutor GCM IA | GanaConMérito",
  description: "Conoce cómo el Tutor GCM IA apoya tu comprensión mediante el método socrático sin revelar las respuestas directas.",
};

export default function TutorPage() {
  return (
    <div className="public-site public-page min-h-screen bg-[#FFF8F4] text-[#1e1b18] font-body-lg antialiased flex flex-col">
      <PublicHeader />
      <main className="public-page__main flex-1 w-full max-w-[800px] mx-auto px-6 py-16 space-y-12">
        <h1 className="public-page__title text-4xl font-bold text-[#1e1b18]">Tutor GCM IA</h1>
        <section className="public-page__section space-y-6">
          <p className="text-lg text-[#444653] leading-relaxed">
            El Tutor GCM IA es una herramienta diseñada para acompañar tu proceso de análisis y comprensión de cada pregunta. En lugar de entregarte respuestas directas, utiliza principios del método socrático para guiarte.
          </p>
        </section>
        <section className="public-page__section space-y-6">
          <h2 className="text-2xl font-semibold">Apoyo contextual</h2>
          <p className="text-lg text-[#444653] leading-relaxed">
            Si tienes dudas sobre una alternativa o el enfoque de una pregunta, el Tutor puede proporcionarte pistas basadas en el contexto específico de esa situación, ayudándote a identificar la información clave sin resolver el problema por ti.
          </p>
        </section>
        <section className="public-page__section space-y-6">
          <h2 className="text-2xl font-semibold">Preguntas orientadoras</h2>
          <p className="text-lg text-[#444653] leading-relaxed">
            Ante la duda, el Tutor te devolverá preguntas orientadoras (por ejemplo: "¿Qué evidencia de la pregunta respalda mejor tu elección?"). Este enfoque promueve el razonamiento crítico, una habilidad fundamental tanto para el concurso como para tu labor profesional.
          </p>
        </section>
        <div className="pt-8 text-center">
          <Link href="/login" prefetch={false} className="public-button public-button--primary inline-flex items-center justify-center px-8 py-4 min-h-[44px] bg-[#1E40AF] text-white hover:bg-[#1E40AF]/90 rounded-lg font-bold text-lg transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E40AF]">
            Comenzar mi preparación
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
