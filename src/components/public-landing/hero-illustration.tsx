import styles from "./public-landing.module.css";

export function HeroIllustration() {
  return (
    <div className={styles.heroVisual}>
      <svg
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.heroSvg}
        aria-label="Ilustración representativa de interfaz interactiva de evaluación adaptativa y acompañamiento docente"
        role="img"
      >
        {/* Outer Card Shell */}
        <rect width="500" height="400" rx="24" fill="#FFFFFF" stroke="#DFE4DD" strokeWidth="2" />
        
        {/* Top Header Bar */}
        <rect x="20" y="20" width="460" height="52" rx="14" fill="#F7F8F4" stroke="#DFE4DD" strokeWidth="1.5" />
        <circle cx="50" cy="46" r="10" fill="#153F32" />
        <rect x="75" y="41" width="130" height="10" rx="5" fill="#17231E" />
        <rect x="350" y="34" width="110" height="24" rx="8" fill="#153F32" />
        
        {/* Main Content Area */}
        <rect x="20" y="90" width="460" height="285" rx="18" fill="#FFFFFF" stroke="#DFE4DD" strokeWidth="1.5" />
        
        {/* Stem Title & Meta */}
        <rect x="40" y="118" width="420" height="14" rx="4" fill="#17231E" />
        <rect x="40" y="140" width="280" height="10" rx="4" fill="#66716C" />
        
        {/* Correct Option (Selected) - Lime Green Theme */}
        <rect x="40" y="172" width="420" height="46" rx="12" fill="#EDF7D4" stroke="#D2E59E" strokeWidth="2" />
        <circle cx="65" cy="195" r="8" fill="#153F32" />
        <rect x="85" y="190" width="230" height="10" rx="4" fill="#153F32" />
        
        {/* Option B */}
        <rect x="40" y="228" width="420" height="46" rx="12" fill="#F7F8F4" stroke="#DFE4DD" strokeWidth="1" />
        <circle cx="65" cy="251" r="8" fill="#DFE4DD" />
        <rect x="85" y="246" width="190" height="10" rx="4" fill="#66716C" />

        {/* Option C */}
        <rect x="40" y="284" width="420" height="46" rx="12" fill="#F7F8F4" stroke="#DFE4DD" strokeWidth="1" />
        <circle cx="65" cy="307" r="8" fill="#DFE4DD" />
        <rect x="85" y="302" width="210" height="10" rx="4" fill="#66716C" />
      </svg>
    </div>
  );
}
