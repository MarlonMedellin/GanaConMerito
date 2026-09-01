import { redirect } from "next/navigation";
import { getAuthenticatedLandingPath } from "@/lib/onboarding/routing";
import { isTestAuthBypassEnabled } from "@/lib/auth/test-bypass";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function RootPage() {
  if (isTestAuthBypassEnabled()) {
    redirect("/home");
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(await getAuthenticatedLandingPath(supabase, user.id));
  }

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#1e1b18] overflow-x-hidden font-body-lg antialiased">
      <nav className="bg-[#FFF8F4]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#c4c5d5]/30 w-full transition-transform duration-100">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1200px] mx-auto">
          <div className="text-[20px] font-bold text-[#1E40AF]">
            GanaConMérito
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a className="text-[#1e1b18] hover:text-[#1E40AF] transition-colors font-semibold text-[14px]" href="#como-funciona">Cómo funciona</a>
            <a className="text-[#1e1b18] hover:text-[#1E40AF] transition-colors font-semibold text-[14px]" href="#que-puedes-hacer">Qué puedes hacer</a>
            <a className="text-[#1e1b18] hover:text-[#1E40AF] transition-colors font-semibold text-[14px]" href="#faq">FAQ</a>
          </div>
          <div>
            <a className="inline-flex items-center justify-center px-6 py-2 bg-[#1E40AF] text-white hover:bg-[#1E40AF]/90 transition-all duration-200 rounded-lg font-semibold text-[14px]" href="/login">
              Ingresar
            </a>
          </div>
        </div>
      </nav>

      <section className="w-full pt-16 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <p className="font-semibold text-[14px] text-[#10B981] uppercase tracking-wider">Tu preparación necesita algo más que acumular respuestas.</p>
            <h1 className="font-bold text-[48px] leading-[1.2] text-[#1e1b18] tracking-tight">No practiques más. Practica mejor.</h1>
            <p className="text-[18px] text-[#444653] max-w-2xl leading-[1.6]">
              Cada respuesta se convierte en una señal para decidir qué reforzar después, con preguntas verificadas, feedback explicativo y un Tutor GCM IA que acompaña tu comprensión sin regalarte la respuesta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a className="inline-flex items-center justify-center px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-semibold text-[16px] hover:bg-[#1E40AF]/90 transition-colors shadow-sm" href="/login">
                Comenzar mi preparación
              </a>
              <a className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1e1b18] hover:bg-[#e9e1db] border border-[#c4c5d5]/50 rounded-lg font-semibold text-[16px] transition-colors shadow-sm" href="#como-funciona">
                Ver cómo funciona
              </a>
            </div>
            <p className="text-[14px] text-[#757684] flex items-center gap-2 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Acceso seguro con Google.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="bg-white rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)] relative z-10 w-full overflow-hidden border border-[#D6D3D1]/30">
              <img alt="Plataforma GanaConMérito" className="w-full h-auto object-cover" src="/hero-image.png" />
            </div>
            <div className="absolute top-10 -right-4 w-32 h-32 bg-[#10B981] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-[#1E40AF] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 px-6 bg-white" id="como-funciona">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-semibold text-[31px] text-[#1e1b18]">Cómo funciona</h2>
            <p className="text-[18px] text-[#444653] mt-2">El ciclo de aprendizaje estructurado paso a paso.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#FFF8F4] rounded-xl border border-[#c4c5d5]/30 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#1E40AF]/10 text-[#1E40AF] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-[20px] text-[#1e1b18] mb-2">1. Practica</h3>
              <p className="text-[16px] text-[#444653]">Enfréntate a preguntas reales y verificadas diseñadas específicamente para tu examen.</p>
            </div>
            <div className="p-6 bg-[#FFF8F4] rounded-xl border border-[#c4c5d5]/30 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[20px] text-[#1e1b18] mb-2">2. Comprende</h3>
              <p className="text-[16px] text-[#444653]">Recibe feedback detallado y usa nuestro Tutor GCM IA para apoyar la comprensión de cada pregunta.</p>
            </div>
            <div className="p-6 bg-[#FFF8F4] rounded-xl border border-[#c4c5d5]/30 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#1E40AF]/10 text-[#1E40AF] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-[20px] text-[#1e1b18] mb-2">3. Refuerza</h3>
              <p className="text-[16px] text-[#444653]">Visualiza tu progreso y descubre exactamente qué áreas necesitan más atención antes del examen.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 px-6 bg-[#FFF8F4]" id="que-puedes-hacer">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-semibold text-[31px] text-[#1e1b18]">Qué puedes hacer</h2>
            <p className="text-[18px] text-[#444653] mt-2">Funcionalidades diseñadas para analizar y orientar tu desempeño.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-4">
              <h3 className="font-semibold text-[25px] text-[#1e1b18]">Preguntas verificadas y Feedback explicativo</h3>
              <p className="text-[16px] text-[#444653]">
                Banco de preguntas verificadas con criterios técnicos y feedback explicativo para comprender por qué una respuesta es correcta y qué debes reforzar después.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Banco de preguntas basado en la normativa actual
                </li>
                <li className="flex items-center text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Explicaciones detalladas por pregunta
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-[16px] shadow-sm border border-[#D6D3D1]/30">
              <div className="bg-[#f0fdf4] text-[#166534] p-4 rounded-lg border border-[#bbf7d0] mb-4">
                <div className="font-bold mb-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Respuesta Correcta
                </div>
                <p className="text-[14px]">¡Correcto! El uso de preguntas orientadoras promueve el aprendizaje significativo y autónomo en los estudiantes.</p>
              </div>
              <div className="bg-[#eff6ff] text-[#1e40af] p-4 rounded-lg border border-[#bfdbfe]">
                <div className="font-bold mb-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Concepto Clave: Aprendizaje significativo.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-row-reverse mb-16">
            <div className="md:order-2 space-y-4">
              <h3 className="font-semibold text-[25px] text-[#1e1b18]">Tutor GCM IA</h3>
              <p className="text-[16px] text-[#444653]">
                El Tutor GCM IA apoya la comprensión de cada pregunta mediante pistas, preguntas orientadoras y explicaciones contextuales, sin revelar directamente la respuesta.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Ayuda contextual en tiempo real
                </li>
                <li className="flex items-center text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Método socrático de aprendizaje
                </li>
              </ul>
            </div>
            <div className="md:order-1 bg-white p-6 rounded-[16px] shadow-sm border border-[#D6D3D1]/30">
              <div className="flex flex-col gap-4">
                <div className="bg-[#f3f4f6] p-3 rounded-lg text-[14px] text-[#374151] self-end max-w-[85%]">
                  No estoy seguro de la diferencia entre evaluación formativa y sumativa.
                </div>
                <div className="bg-[#10B981] p-3 rounded-lg text-[14px] text-white self-start max-w-[85%]">
                  ¡Hola! Piénsalo de esta manera: la evaluación formativa busca mejorar el aprendizaje durante el proceso. ¿Te ayuda esto a identificar la diferencia clave?
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h3 className="font-semibold text-[25px] text-[#1e1b18]">Métricas y Recomendaciones</h3>
              <p className="text-[16px] text-[#444653]">
                Visualiza tu dominio por habilidades mediante gráficas claras y mantén la constancia en tu estudio.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Gráficos de rendimiento detallados
                </li>
                <li className="flex items-center text-[#444653]">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Seguimiento de progreso diario
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-[16px] shadow-sm border border-[#D6D3D1]/30 flex items-center justify-center min-h-[200px]">
              <div className="text-center text-[#9ca3af]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-[14px] font-medium">Panel de progreso e indicadores de dominio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 px-6 bg-white" id="faq">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-semibold text-[31px] text-[#1e1b18]">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-[#faf2ec] rounded-xl border border-[#e9e1db]">
              <h4 className="font-semibold text-[18px] text-[#1e1b18] mb-2">¿Cómo funciona el Tutor GCM IA?</h4>
              <p className="text-[16px] text-[#444653]">El Tutor GCM IA está diseñado para guiarte sin darte la respuesta directa. Utiliza un enfoque socrático, haciendo preguntas y dando pistas basadas en el contexto de la pregunta actual para ayudarte a llegar a la conclusión por ti mismo.</p>
            </div>
            <div className="p-6 bg-[#faf2ec] rounded-xl border border-[#e9e1db]">
              <h4 className="font-semibold text-[18px] text-[#1e1b18] mb-2">¿De dónde provienen las preguntas?</h4>
              <p className="text-[16px] text-[#444653]">Nuestro banco de preguntas se basa en los lineamientos de los concursos docentes y directivos docentes para asegurar que tu preparación sea enfocada y realista.</p>
            </div>
            <div className="p-6 bg-[#faf2ec] rounded-xl border border-[#e9e1db]">
              <h4 className="font-semibold text-[18px] text-[#1e1b18] mb-2">¿Puedo ver mi progreso a lo largo del tiempo?</h4>
              <p className="text-[16px] text-[#444653]">Absolutamente. El panel de progreso incluye métricas detalladas por área para que puedas mantener el registro de tu estudio.</p>
            </div>
            <div className="p-6 bg-[#faf2ec] rounded-xl border border-[#e9e1db]">
              <h4 className="font-semibold text-[18px] text-[#1e1b18] mb-2">¿Es seguro iniciar sesión con Google?</h4>
              <p className="text-[16px] text-[#444653]">Sí, utilizamos la autenticación oficial de Google, lo que significa que no almacenamos tu contraseña. Es el método más rápido y seguro para acceder a tu cuenta.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 px-6 bg-[#eee7e1] border-t border-[#d6d3d1]/30">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[14px] text-[#757684]">
          <div className="font-semibold text-[#1e1b18]">GanaConMérito</div>
          <div className="flex gap-4">
            <a href="/login" className="hover:text-[#1E40AF]">Acceso</a>
          </div>
          <div>© {year} GanaConMérito. Todos los derechos reservados.</div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-6 text-center text-[12px] text-[#757684] opacity-80">
          La plataforma acompaña la preparación; el resultado depende de la constancia y del proceso oficial al que te presentas. GanaConMérito no garantiza la aprobación ni resultados específicos.
        </div>
      </footer>
    </div>
  );
}
