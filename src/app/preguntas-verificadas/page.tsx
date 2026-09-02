import { PublicHeader } from "@/components/public-landing/public-header";
import { PublicFooter } from "@/components/public-landing/public-footer";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Preguntas de Práctica | GanaConMérito",
  description: "Preguntas vinculadas a fuentes normativas o teóricas documentadas para acompañar tu proceso de estudio.",
};

export default function PreguntasVerificadasPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#1e1b18] font-body-lg antialiased flex flex-col">
      <PublicHeader />
      <main className="flex-1 w-full max-w-[800px] mx-auto px-6 py-16 space-y-12">
        <h1 className="text-4xl font-bold text-[#1e1b18]">Preguntas del Banco</h1>
        <section className="space-y-6">
          <p className="text-lg text-[#444653] leading-relaxed">
            El banco reúne preguntas construidas y revisadas con criterios técnicos, diseñadas para que puedas practicar tus conocimientos antes del concurso.
          </p>
        </section>
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Fundamentación documentada</h2>
          <p className="text-lg text-[#444653] leading-relaxed">
            Las preguntas están vinculadas a fuentes normativas, manuales de funciones o teóricas documentadas. Esto asegura que la práctica se base en los lineamientos requeridos para los roles docentes y directivos.
          </p>
        </section>
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Estructura por áreas</h2>
          <p className="text-lg text-[#444653] leading-relaxed">
            El banco organiza las preguntas por áreas de evaluación (Lectura Crítica, Razonamiento Cuantitativo, Conocimientos Pedagógicos, etc.), permitiéndote enfocar tus esfuerzos de estudio según los resultados observados en tu panel.
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
