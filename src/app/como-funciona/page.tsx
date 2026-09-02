import { PublicHeader } from "@/components/public-landing/public-header";
import { PublicFooter } from "@/components/public-landing/public-footer";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo funciona | GanaConMérito",
  description: "Descubre el ciclo de aprendizaje estructurado: practica, comprende y refuerza tu preparación para concursos docentes.",
};

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#1e1b18] font-body-lg antialiased flex flex-col">
      <PublicHeader />
      <main className="flex-1 w-full max-w-[800px] mx-auto px-6 py-16 space-y-12">
        <h1 className="text-4xl font-bold text-[#1e1b18]">Cómo funciona GanaConMérito</h1>
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">1. Practica</h2>
          <p className="text-lg text-[#444653] leading-relaxed">
            Resuelve preguntas de opción múltiple con única respuesta. Cada pregunta está clasificada según las áreas de desempeño evaluadas en los concursos. Esto te permite familiarizarte con el formato y contenido de la prueba real.
          </p>
        </section>
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">2. Comprende</h2>
          <p className="text-lg text-[#444653] leading-relaxed">
            No basta con memorizar respuestas. Inmediatamente después de contestar, recibirás explicaciones detalladas que te ayudarán a entender el razonamiento detrás de la opción correcta, apoyándote en el análisis pedagógico o normativo.
          </p>
        </section>
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">3. Refuerza</h2>
          <p className="text-lg text-[#444653] leading-relaxed">
            Utiliza el panel de métricas para visualizar tu desempeño. Podrás identificar en qué áreas tienes mayor dominio y cuáles requieren más atención, permitiéndote optimizar tu tiempo de estudio.
          </p>
        </section>
        <div className="pt-8 text-center">
          <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 min-h-[44px] bg-[#1E40AF] text-white hover:bg-[#1E40AF]/90 rounded-lg font-bold text-lg transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E40AF]">
            Comenzar mi preparación
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
