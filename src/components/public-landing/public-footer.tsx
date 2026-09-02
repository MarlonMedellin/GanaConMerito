import Link from "next/link";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-10 px-6 bg-[#eee7e1] border-t border-[#d6d3d1]/30">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#757684]">
        <div className="font-bold text-lg text-[#1e1b18]">GanaConMérito</div>
        <div className="flex flex-wrap justify-center gap-6 font-medium">
          <Link href="/como-funciona" className="hover:text-[#1E40AF] transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-md p-1 min-h-[44px] flex items-center">Cómo funciona</Link>
          <Link href="/tutor-gcm-ia" className="hover:text-[#1E40AF] transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-md p-1 min-h-[44px] flex items-center">Tutor GCM IA</Link>
          <Link href="/preguntas-verificadas" className="hover:text-[#1E40AF] transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-md p-1 min-h-[44px] flex items-center">Preguntas</Link>
          <Link href="/login" className="hover:text-[#1E40AF] transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-md p-1 min-h-[44px] flex items-center">Acceso</Link>
        </div>
        <div>© {year} GanaConMérito. Todos los derechos reservados.</div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-8 text-center text-sm text-[#757684] opacity-80 leading-relaxed font-medium bg-[#e4dbd4] p-4 rounded-lg">
        GanaConMérito acompaña tu preparación, pero no garantiza aprobación, selección ni resultados específicos.
      </div>
    </footer>
  );
}
