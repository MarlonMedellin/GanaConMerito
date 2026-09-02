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
        <rect width="500" height="400" rx="16" fill="#FFFFFF" />
        <rect x="20" y="20" width="460" height="50" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
        <circle cx="50" cy="45" r="10" fill="#10B981" />
        <rect x="75" y="40" width="120" height="10" rx="4" fill="#cbd5e1" />
        <rect x="360" y="35" width="100" height="20" rx="4" fill="#1E40AF" />
        
        <rect x="20" y="90" width="460" height="280" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        
        <rect x="40" y="120" width="420" height="14" rx="4" fill="#1E1B18" />
        <rect x="40" y="145" width="300" height="10" rx="4" fill="#757684" />
        
        <rect x="40" y="180" width="420" height="44" rx="8" fill="#F0FDF4" stroke="#10B981" strokeWidth="2" />
        <circle cx="65" cy="202" r="8" fill="#10B981" />
        <rect x="85" y="197" width="200" height="10" rx="4" fill="#166534" />
        
        <rect x="40" y="236" width="420" height="44" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="65" cy="258" r="8" fill="#CBD5E1" />
        <rect x="85" y="253" width="180" height="10" rx="4" fill="#64748B" />

        <rect x="40" y="292" width="420" height="44" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="65" cy="314" r="8" fill="#CBD5E1" />
        <rect x="85" y="309" width="220" height="10" rx="4" fill="#64748B" />
      </svg>
    </div>
  );
}
