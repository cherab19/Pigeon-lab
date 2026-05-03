type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, {
  box: string;
  text: string;
  icon: string;
  pigeon: string;
  pigeonOffset: string;
}> = {
  sm: { box: "w-8 h-8", text: "text-lg", icon: "w-5 h-5", pigeon: "w-7 h-7", pigeonOffset: "-top-4" },
  md: { box: "w-9 h-9", text: "text-xl", icon: "w-6 h-6", pigeon: "w-9 h-9", pigeonOffset: "-top-5" },
  lg: { box: "w-12 h-12", text: "text-3xl", icon: "w-8 h-8", pigeon: "w-12 h-12", pigeonOffset: "-top-7" },
};

interface PigeonlabLogoProps {
  size?: Size;
  iconOnly?: boolean;
  textClassName?: string;
}

/**
 * Pigeonlab logo: a science-lab inspired mark.
 * A stylized Erlenmeyer flask inside the badge, with a large flying
 * pigeon hovering ABOVE the badge (outside its container) — symbolizing
 * knowledge soaring up from science.
 */
export default function PigeonlabLogo({
  size = "sm",
  iconOnly = false,
  textClassName = "",
}: PigeonlabLogoProps) {
  const s = sizeMap[size];
  return (
    <span className="flex items-center gap-2">
      <span className="relative inline-flex items-center justify-center">
        {/* Large flying pigeon above the container */}
        <svg
          viewBox="0 0 64 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute ${s.pigeonOffset} left-1/2 -translate-x-1/2 ${s.pigeon} drop-shadow-md pointer-events-none`}
          aria-hidden="true"
        >
          {/* Body */}
          <ellipse cx="32" cy="24" rx="13" ry="7" fill="white" stroke="hsl(var(--primary))" strokeWidth="1.2" />
          {/* Tail */}
          <path d="M19 24 L8 20 L12 28 Z" fill="white" stroke="hsl(var(--primary))" strokeWidth="1.2" strokeLinejoin="round" />
          {/* Head */}
          <circle cx="44" cy="17" r="6" fill="white" stroke="hsl(var(--primary))" strokeWidth="1.2" />
          {/* Beak */}
          <path d="M50 17 L56 18 L50 20 Z" fill="hsl(var(--accent, var(--primary)))" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeLinejoin="round" />
          {/* Eye */}
          <circle cx="46" cy="15.5" r="0.9" fill="hsl(var(--primary))" />
          {/* Upper wing (raised, in flight) */}
          <path
            d="M24 22 Q30 4 44 10 Q38 18 28 22 Z"
            fill="white"
            stroke="hsl(var(--primary))"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Wing detail lines */}
          <path d="M28 20 Q34 12 40 12" stroke="hsl(var(--primary))" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M30 22 Q35 16 41 15" stroke="hsl(var(--primary))" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          {/* Lower wing hint */}
          <path
            d="M26 26 Q32 34 42 30"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Logo container with flask */}
        <span
          className={`${s.box} rounded-lg bg-gradient-hero flex items-center justify-center shadow-sm relative`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={s.icon}
          >
            {/* Flask neck */}
            <path d="M12 7h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M13 7v4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M19 7v4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            {/* Flask body */}
            <path
              d="M13 11L6.8 23.6A2 2 0 0 0 8.6 26.5h14.8a2 2 0 0 0 1.8-2.9L19 11"
              stroke="white"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Liquid */}
            <path
              d="M10 18.5h12l3 5.2A1.1 1.1 0 0 1 24 25.5H8a1.1 1.1 0 0 1-1-1.8L10 18.5Z"
              fill="white"
              fillOpacity="0.9"
            />
            {/* Bubbles */}
            <circle cx="13" cy="22" r="0.8" fill="hsl(var(--primary))" />
            <circle cx="17" cy="23" r="0.6" fill="hsl(var(--primary))" />
            <circle cx="20" cy="21" r="0.5" fill="hsl(var(--primary))" />
          </svg>
        </span>
      </span>
      {!iconOnly && (
        <span className={`font-display font-bold ${s.text} ${textClassName}`}>
          Pigeonlab
        </span>
      )}
    </span>
  );
}
