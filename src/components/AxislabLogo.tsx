type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { box: string; text: string; icon: string }> = {
  sm: { box: "w-8 h-8", text: "text-lg", icon: "w-5 h-5" },
  md: { box: "w-9 h-9", text: "text-xl", icon: "w-6 h-6" },
  lg: { box: "w-12 h-12", text: "text-3xl", icon: "w-8 h-8" },
};

interface AxislabLogoProps {
  size?: Size;
  /** When true, render only the logo mark (no wordmark) */
  iconOnly?: boolean;
  /** Override text color class for the wordmark */
  textClassName?: string;
}

/**
 * Axislab logo: a science-lab inspired mark.
 * A stylized Erlenmeyer flask with a bubbling liquid line,
 * crossed by a subtle X axis to nod at "Axis"-lab.
 */
export default function AxislabLogo({
  size = "sm",
  iconOnly = false,
  textClassName = "",
}: AxislabLogoProps) {
  const s = sizeMap[size];
  return (
    <span className="flex items-center gap-2">
      <span
        className={`${s.box} rounded-lg bg-gradient-hero flex items-center justify-center shadow-sm`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={s.icon}
        >
          {/* Flask neck */}
          <path
            d="M13 5h6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Flask body outline */}
          <path
            d="M14 6v6L7.5 23.2A2 2 0 0 0 9.2 26h13.6a2 2 0 0 0 1.7-2.8L18 12V6"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Liquid fill */}
          <path
            d="M11.2 18h9.6l3 5.2A1.2 1.2 0 0 1 22.7 25H9.3a1.2 1.2 0 0 1-1.05-1.8L11.2 18Z"
            fill="white"
            fillOpacity="0.9"
          />
          {/* Bubbles */}
          <circle cx="14" cy="21.5" r="0.9" fill="hsl(var(--primary))" />
          <circle cx="17.5" cy="22.5" r="0.7" fill="hsl(var(--primary))" />
          <circle cx="19.5" cy="20.5" r="0.5" fill="hsl(var(--primary))" />
        </svg>
      </span>
      {!iconOnly && (
        <span className={`font-display font-bold ${s.text} ${textClassName}`}>
          Axislab
        </span>
      )}
    </span>
  );
}
