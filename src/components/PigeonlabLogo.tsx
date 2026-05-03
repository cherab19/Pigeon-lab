type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { box: string; text: string; icon: string }> = {
  sm: { box: "w-8 h-8", text: "text-lg", icon: "w-5 h-5" },
  md: { box: "w-9 h-9", text: "text-xl", icon: "w-6 h-6" },
  lg: { box: "w-12 h-12", text: "text-3xl", icon: "w-8 h-8" },
};

interface PigeonlabLogoProps {
  size?: Size;
  /** When true, render only the logo mark (no wordmark) */
  iconOnly?: boolean;
  /** Override text color class for the wordmark */
  textClassName?: string;
}

/**
 * Pigeonlab logo: a science-lab inspired mark.
 * A stylized Erlenmeyer flask with bubbling liquid, topped by a
 * small pigeon standing on the flask's neck — symbolizing knowledge
 * (pigeon/dove) rising from science (the lab flask).
 */
export default function PigeonlabLogo({
  size = "sm",
  iconOnly = false,
  textClassName = "",
}: PigeonlabLogoProps) {
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
          {/* Pigeon perched on top of the flask — enlarged for prominence */}
          <g>
            {/* Body */}
            <ellipse cx="15.5" cy="6.2" rx="5" ry="3.2" fill="white" />
            {/* Tail */}
            <path d="M10.5 6.2 L7 4.8 L9.2 7.4 Z" fill="white" />
            {/* Head */}
            <circle cx="20" cy="3.8" r="2.3" fill="white" />
            {/* Beak */}
            <path d="M22.2 3.9 L24.2 4.4 L22.2 5.0 Z" fill="hsl(var(--primary))" />
            {/* Eye */}
            <circle cx="20.7" cy="3.5" r="0.38" fill="hsl(var(--primary))" />
            {/* Wing */}
            <path
              d="M12.5 5.6 Q15.5 3.6 19 6.2 Q15.8 8 12.5 7 Z"
              fill="hsl(var(--primary))"
              fillOpacity="0.45"
            />
            {/* Feet on flask neck */}
            <path
              d="M14 9.4 v1.1 M16.8 9.4 v1.1"
              stroke="hsl(var(--primary))"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
          </g>

          {/* Flask neck */}
          <path
            d="M13 11.5h6"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Flask body outline */}
          <path
            d="M14 12.5v3L8.5 24.4A1.8 1.8 0 0 0 10.1 27h11.8a1.8 1.8 0 0 0 1.6-2.6L18 15.5v-3"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Liquid fill */}
          <path
            d="M11.6 20h8.8l2.6 4.5A1 1 0 0 1 22.1 26H9.9a1 1 0 0 1-0.9-1.5L11.6 20Z"
            fill="white"
            fillOpacity="0.9"
          />
          {/* Bubbles */}
          <circle cx="14" cy="23" r="0.7" fill="hsl(var(--primary))" />
          <circle cx="17.5" cy="24" r="0.55" fill="hsl(var(--primary))" />
          <circle cx="19.5" cy="22" r="0.4" fill="hsl(var(--primary))" />
        </svg>
      </span>
      {!iconOnly && (
        <span className={`font-display font-bold ${s.text} ${textClassName}`}>
          Pigeonlab
        </span>
      )}
    </span>
  );
}
