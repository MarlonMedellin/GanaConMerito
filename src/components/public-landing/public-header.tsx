"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const links = [
    { href: "/como-funciona", label: "Cómo funciona" },
    { href: "/preguntas-verificadas", label: "Qué puedes hacer" },
    { href: "/tutor-gcm-ia", label: "Tutor GCM IA" },
    { href: "/?#faq", label: "Preguntas frecuentes" },
  ];

  return (
    <nav className="bg-[#FFF8F4]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#c4c5d5]/30 w-full transition-transform duration-100 motion-reduce:transition-none">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1200px] mx-auto">
        <Link href="/" className="text-xl font-bold text-[#1E40AF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-md">
          GanaConMérito
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-[#1e1b18] hover:text-[#1E40AF] transition-colors motion-reduce:transition-none font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-md p-1">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:block">
          <Link href="/login" className="inline-flex items-center justify-center px-6 py-2 bg-[#1E40AF] text-white hover:bg-[#1E40AF]/90 transition-all duration-200 motion-reduce:transition-none rounded-lg font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E40AF]">
            Ingresar
          </Link>
        </div>
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#1e1b18] hover:bg-[#e9e1db] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Cerrar menú principal" : "Abrir menú principal"}
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
      
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-[#FFF8F4] border-b border-[#c4c5d5]/30 px-6 py-4 space-y-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setIsMobileMenuOpen(false)} className="block text-[#1e1b18] hover:text-[#1E40AF] font-semibold text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-md py-2 min-h-[44px] flex items-center">
              {l.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link href="/login" className="inline-flex items-center justify-center w-full px-6 py-3 min-h-[44px] bg-[#1E40AF] text-white hover:bg-[#1E40AF]/90 transition-colors motion-reduce:transition-none rounded-lg font-semibold text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E40AF]">
              Ingresar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
