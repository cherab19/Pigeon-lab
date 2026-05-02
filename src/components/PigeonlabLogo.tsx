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
          {/* Pigeon perched on top of the flask neck */}
          <g>
            {/* Body */}
            <ellipse cx="16" cy="3.6" rx="2.6" ry="1.7" fill="white" />
            {/* Head */}
            <circle cx="18.4" cy="2.4" r="1.15" fill="white" />
            {/* Beak */}
            <path d="M19.5 2.4 L20.7 2.7 L19.5 3.0 Z" fill="hsl(var(--primary))" />
            {/* Eye */}
            <circle cx="18.7" cy="2.3" r="0.18" fill="hsl(var(--primary))" />
            {/* Wing */}
            <path
              d="M14.8 3.2 Q16 2.2 17.6 3.4 Q16.2 4.1 14.8 3.7 Z"
              fill="hsl(var(--primary))"
              fillOpacity="0.35"
            />
            {/* Feet on flask neck */}
            <path
              d="M15.2 4.9 v0.6 M16.6 4.9 v0.6"
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </g>

          {/* Flask neck (shortened slightly to seat the bird) */}
          <path
            d="M13 7h6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Flask body outline */}
          <path
            d="M14 8v6L7.5 24.2A2 2 0 0 0 9.2 27h13.6a2 2 0 0 0 1.7-2.8L18 14V8"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Liquid fill */}
          <path
            d="M11.2 19h9.6l3 5.2A1.2 1.2 0 0 1 22.7 26H9.3a1.2 1.2 0 0 1-1.05-1.8L11.2 19Z"
            fill="white"
            fillOpacity="0.9"
          />
          {/* Bubbles */}
          <circle cx="14" cy="22.5" r="0.9" fill="hsl(var(--primary))" />
          <circle cx="17.5" cy="23.5" r="0.7" fill="hsl(var(--primary))" />
          <circle cx="19.5" cy="21.5" r="0.5" fill="hsl(var(--primary))" />
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
