"use client";

import Image from "next/image";
import { useState } from "react";

export function PublicLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#1e1b18] font-body-lg antialiased">
      <nav className="bg-[#FFF8F4]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#c4c5d5]/30 w-full transition-transform duration-100">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1200px] mx-auto">
          <div className="text-xl font-bold text-[#1E40AF]">
            GanaConMérito
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a className="text-[#1e1b18] hover:text-[#1E40AF] transition-colors font-semibold text-sm" href="#como-funciona">Cómo funciona</a>
            <a className="text-[#1e1b18] hover:text-[#1E40AF] transition-colors font-semibold text-sm" href="#que-puedes-hacer">Qué puedes hacer</a>
            <a className="text-[#1e1b18] hover:text-[#1E40AF] transition-colors font-semibold text-sm" href="#tutor">Tutor GCM IA</a>
            <a className="text-[#1e1b18] hover:text-[#1E40AF] transition-colors font-semibold text-sm" href="#faq">Preguntas frecuentes</a>
          </div>
          <div className="hidden md:block">
            <a className="inline-flex items-center justify-center px-6 py-2 bg-[#1E40AF] text-white hover:bg-[#1E40AF]/90 transition-all duration-200 rounded-lg font-semibold text-sm" href="/login">
              Ingresar
            </a>
          </div>
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#1e1b18] hover:bg-[#e9e1db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              aria-expanded={isMobileMenuOpen}
              aria-label="Abrir menú principal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#FFF8F4] border-b border-[#c4c5d5]/30 px-6 py-4 space-y-4">
            <a className="block text-[#1e1b18] hover:text-[#1E40AF] font-semibold text-base" href="#como-funciona" onClick={() => setIsMobileMenuOpen(false)}>Cómo funciona</a>
            <a className="block text-[#1e1b18] hover:text-[#1E40AF] font-semibold text-base" href="#que-puedes-hacer" onClick={() => setIsMobileMenuOpen(false)}>Qué puedes hacer</a>
            <a className="block text-[#1e1b18] hover:text-[#1E40AF] font-semibold text-base" href="#tutor" onClick={() => setIsMobileMenuOpen(false)}>Tutor GCM IA</a>
            <a className="block text-[#1e1b18] hover:text-[#1E40AF] font-semibold text-base" href="#faq" onClick={() => setIsMobileMenuOpen(false)}>Preguntas frecuentes</a>
            <div className="pt-2">
              <a className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#1E40AF] text-white hover:bg-[#1E40AF]/90 transition-colors rounded-lg font-semibold text-base" href="/login">
                Ingresar
              </a>
            </div>
          </div>
        )}
      </nav>

      <section className="w-full py-12 md:py-20 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <p className="font-semibold text-sm text-[#10B981] uppercase tracking-wider">Tu preparación necesita algo más que acumular respuestas.</p>
            <h1 className="font-bold text-4xl md:text-5xl lg:text-[56px] leading-[1.1] text-[#1e1b18] tracking-tight">No practiques más. Practica mejor.</h1>
            <p className="text-lg text-[#444653] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Cada respuesta se convierte en una señal para decidir qué reforzar después, con preguntas diseñadas para acompañar tu proceso, feedback explicativo y un Tutor GCM IA que acompaña tu comprensión sin regalarte la respuesta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <a className="inline-flex items-center justify-center px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-semibold text-base hover:bg-[#1E40AF]/90 transition-colors shadow-sm" href="/login">
                Comenzar mi preparación
              </a>
              <a className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1e1b18] hover:bg-[#e9e1db] border border-[#c4c5d5]/50 rounded-lg font-semibold text-base transition-colors shadow-sm" href="#como-funciona">
                Ver cómo funciona
              </a>
            </div>
            <p className="text-sm text-[#757684] flex items-center justify-center lg:justify-start gap-2 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Acceso seguro con Google.
            </p>
          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative mt-8 lg:mt-0">
            <div className="bg-white rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)] relative z-10 w-full overflow-hidden border border-[#D6D3D1]/30 aspect-[4/3] sm:aspect-[16/10]">
              <Image alt="Interfaz de GanaConMérito" src="/hero-image.png" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
            </div>
            <div className="absolute -top-4 -right-4 md:-top-10 md:-right-8 w-24 h-24 md:w-32 md:h-32 bg-[#10B981] rounded-full mix-blend-multiply filter blur-3xl opacity-20" aria-hidden="true"></div>
            <div className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 w-32 h-32 md:w-40 md:h-40 bg-[#1E40AF] rounded-full mix-blend-multiply filter blur-3xl opacity-20" aria-hidden="true"></div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 px-6 bg-white" id="como-funciona">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-3xl md:text-4xl text-[#1e1b18]">Cómo funciona</h2>
            <p className="text-lg text-[#444653] mt-3">El ciclo de aprendizaje estructurado paso a paso.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FFF8F4] rounded-2xl border border-[#c4c5d5]/30 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#1E40AF]/10 text-[#1E40AF] rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-xl text-[#1e1b18] mb-3">1. Practica</h3>
              <p className="text-base text-[#444653]">Preguntas de opción múltiple con única respuesta organizadas por áreas de desempeño.</p>
            </div>
            <div className="p-8 bg-[#FFF8F4] rounded-2xl border border-[#c4c5d5]/30 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-xl text-[#1e1b18] mb-3">2. Comprende</h3>
              <p className="text-base text-[#444653]">Explicaciones de cada pregunta para apoyar tu comprensión y análisis del concepto evaluado.</p>
            </div>
            <div className="p-8 bg-[#FFF8F4] rounded-2xl border border-[#c4c5d5]/30 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#1E40AF]/10 text-[#1E40AF] rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-xl text-[#1e1b18] mb-3">3. Refuerza</h3>
              <p className="text-base text-[#444653]">Revisa tu desempeño por áreas para guiar tu estudio y enfocar tus esfuerzos.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 px-6 bg-[#FFF8F4]" id="que-puedes-hacer">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-semibold text-3xl md:text-4xl text-[#1e1b18]">Qué puedes hacer</h2>
            <p className="text-lg text-[#444653] mt-3">Funcionalidades diseñadas para analizar y orientar tu desempeño.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <div className="space-y-5 order-2 lg:order-1">
              <h3 className="font-semibold text-2xl text-[#1e1b18]">Banco de preguntas y Feedback</h3>
              <p className="text-base text-[#444653] leading-relaxed">
                Preguntas fundamentadas en teorías y lineamientos educativos, acompañadas de feedback para comprender el razonamiento de las opciones.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Preguntas fundamentadas en la normativa o teoría vigente.</span>
                </li>
                <li className="flex items-start text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Explicaciones al responder para facilitar el análisis.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-sm border border-[#D6D3D1]/30 order-1 lg:order-2">
              <div className="bg-[#f0fdf4] text-[#166534] p-5 rounded-lg border border-[#bbf7d0] mb-5">
                <div className="font-bold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Respuesta Correcta
                </div>
                <p className="text-sm leading-relaxed">La mediación docente promueve la construcción autónoma del aprendizaje a partir de saberes previos, favoreciendo el aprendizaje significativo.</p>
              </div>
              <div className="bg-[#eff6ff] text-[#1e40af] p-5 rounded-lg border border-[#bfdbfe]">
                <div className="font-bold mb-1 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Justificación
                </div>
                <p className="text-sm mt-1 opacity-90">El aprendizaje significativo requiere anclaje con conocimientos previos.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24" id="tutor">
            <div className="space-y-5 lg:order-2">
              <h3 className="font-semibold text-2xl text-[#1e1b18]">Tutor GCM IA</h3>
              <p className="text-base text-[#444653] leading-relaxed">
                El Tutor GCM IA apoya la comprensión de cada pregunta mediante pistas y preguntas orientadoras, sin revelar directamente la respuesta.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Análisis de opciones sin dar la respuesta correcta.</span>
                </li>
                <li className="flex items-start text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Método socrático de aprendizaje.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-sm border border-[#D6D3D1]/30 lg:order-1">
              <div className="flex flex-col gap-5">
                <div className="bg-[#f3f4f6] p-4 rounded-xl text-sm text-[#374151] self-end max-w-[90%] shadow-sm">
                  No comprendo la diferencia entre evaluación formativa y evaluación sumativa.
                </div>
                <div className="bg-[#10B981] p-4 rounded-xl text-sm text-white self-start max-w-[90%] shadow-sm">
                  ¡Hola! Piénsalo de esta manera: imagina que una evalúa el proceso mientras se desarrolla y la otra evalúa el resultado final para certificarlo. ¿Cuál de las dos crees que permite ajustar las estrategias de enseñanza sobre la marcha?
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-5 order-2 lg:order-1">
              <h3 className="font-semibold text-2xl text-[#1e1b18]">Métricas de desempeño</h3>
              <p className="text-base text-[#444653] leading-relaxed">
                Visualiza tu dominio por grandes áreas (Lectura Crítica, Razonamiento Cuantitativo, Conocimientos Pedagógicos, etc.) mediante reportes de aciertos.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Información agrupada por áreas.</span>
                </li>
                <li className="flex items-start text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Seguimiento de aciertos sobre respuestas totales.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-sm border border-[#D6D3D1]/30 flex items-center justify-center aspect-video lg:aspect-square order-1 lg:order-2">
              <div className="text-center text-[#9ca3af]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-base font-medium">Panel de progreso e indicadores de dominio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full py-20 px-6 bg-[#1E40AF] text-white text-center">
        <div className="max-w-[800px] mx-auto space-y-6">
          <h2 className="font-bold text-3xl md:text-4xl">Convierte cada respuesta en tu siguiente paso.</h2>
          <p className="text-lg text-white/90 md:text-xl font-light max-w-2xl mx-auto">
            Practica con foco, comprende el razonamiento y decide qué reforzar después.
          </p>
          <div className="pt-4">
            <a className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#1E40AF] hover:bg-gray-100 rounded-lg font-bold text-lg transition-colors shadow-lg" href="/login">
              Comenzar mi preparación
            </a>
          </div>
        </div>
      </section>

      <section className="w-full py-20 px-6 bg-white" id="faq">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-3xl md:text-4xl text-[#1e1b18]">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-6">
            <div className="p-6 md:p-8 bg-[#faf2ec] rounded-2xl border border-[#e9e1db]">
              <h3 className="font-semibold text-lg md:text-xl text-[#1e1b18] mb-3">¿Qué es GanaConMérito?</h3>
              <p className="text-base text-[#444653] leading-relaxed">GanaConMérito es una plataforma de apoyo al estudio y práctica para concursos de méritos docentes y directivos docentes.</p>
            </div>
            <div className="p-6 md:p-8 bg-[#faf2ec] rounded-2xl border border-[#e9e1db]">
              <h3 className="font-semibold text-lg md:text-xl text-[#1e1b18] mb-3">¿Cómo funciona el Tutor GCM IA?</h3>
              <p className="text-base text-[#444653] leading-relaxed">El Tutor GCM IA está diseñado para apoyar tu razonamiento. No te da la respuesta directa, sino que te hace preguntas orientadoras y te proporciona pistas basadas en el contexto de la pregunta para que llegues a la conclusión por ti mismo.</p>
            </div>
            <div className="p-6 md:p-8 bg-[#faf2ec] rounded-2xl border border-[#e9e1db]">
              <h3 className="font-semibold text-lg md:text-xl text-[#1e1b18] mb-3">¿De dónde provienen las preguntas?</h3>
              <p className="text-base text-[#444653] leading-relaxed">Las preguntas son construidas por el equipo de GanaConMérito fundamentadas en teorías pedagógicas, lineamientos y normatividad vigente.</p>
            </div>
            <div className="p-6 md:p-8 bg-[#faf2ec] rounded-2xl border border-[#e9e1db]">
              <h3 className="font-semibold text-lg md:text-xl text-[#1e1b18] mb-3">¿Qué información puedo consultar sobre mi progreso?</h3>
              <p className="text-base text-[#444653] leading-relaxed">Puedes ver la cantidad de preguntas que has respondido y tu porcentaje de aciertos, organizado por grandes áreas evaluadas.</p>
            </div>
            <div className="p-6 md:p-8 bg-[#faf2ec] rounded-2xl border border-[#e9e1db]">
              <h3 className="font-semibold text-lg md:text-xl text-[#1e1b18] mb-3">¿Cómo ingreso?</h3>
              <p className="text-base text-[#444653] leading-relaxed">A través del botón "Ingresar" utilizando tu cuenta de Google.</p>
            </div>
            <div className="p-6 md:p-8 bg-[#faf2ec] rounded-2xl border border-[#e9e1db]">
              <h3 className="font-semibold text-lg md:text-xl text-[#1e1b18] mb-3">¿GanaConMérito garantiza que aprobaré?</h3>
              <p className="text-base text-[#444653] leading-relaxed">No. GanaConMérito acompaña tu preparación, pero no garantiza aprobación, selección ni resultados específicos en el concurso.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full py-10 px-6 bg-[#eee7e1] border-t border-[#d6d3d1]/30">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#757684]">
          <div className="font-bold text-lg text-[#1e1b18]">GanaConMérito</div>
          <div className="flex flex-wrap justify-center gap-6 font-medium">
            <a href="/login" className="hover:text-[#1E40AF] transition-colors">Acceso</a>
          </div>
          <div>© {year} GanaConMérito. Todos los derechos reservados.</div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-8 text-center text-sm text-[#757684] opacity-80 leading-relaxed font-medium bg-[#e4dbd4] p-4 rounded-lg">
          GanaConMérito acompaña tu preparación, pero no garantiza aprobación, selección ni resultados específicos.
        </div>
      </footer>
    </div>
  );
}
