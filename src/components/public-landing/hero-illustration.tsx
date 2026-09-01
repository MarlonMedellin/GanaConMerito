export function HeroIllustration() {
  return (
    <div className="w-full h-full bg-[#f8fafc] rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)] relative z-10 overflow-hidden border border-[#D6D3D1]/30 p-6 flex flex-col gap-6" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e2e8f0]"></div>
          <div className="h-4 w-32 bg-[#e2e8f0] rounded"></div>
        </div>
        <div className="h-8 w-24 bg-[#1E40AF]/10 rounded-full flex items-center justify-center">
          <div className="h-3 w-16 bg-[#1E40AF]/40 rounded"></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="space-y-2">
          <div className="h-4 w-full bg-[#cbd5e1] rounded"></div>
          <div className="h-4 w-[80%] bg-[#cbd5e1] rounded"></div>
        </div>

        <div className="space-y-3 mt-4">
          <div className="p-4 rounded-lg border border-[#e2e8f0] flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#cbd5e1]"></div>
            <div className="h-3 w-[70%] bg-[#e2e8f0] rounded"></div>
          </div>
          <div className="p-4 rounded-lg border-2 border-[#10B981] bg-[#10B981]/5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="h-3 w-[65%] bg-[#cbd5e1] rounded"></div>
            </div>
            <div className="mt-2 p-3 bg-white rounded-md border border-[#10B981]/20 flex items-start gap-2">
              <div className="w-4 h-4 text-[#10B981] mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-2 w-[90%] bg-[#cbd5e1] rounded"></div>
                <div className="h-2 w-[60%] bg-[#cbd5e1] rounded"></div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-[#e2e8f0] flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#cbd5e1]"></div>
            <div className="h-3 w-[80%] bg-[#e2e8f0] rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
