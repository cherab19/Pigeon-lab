import pigeonImg from "@/assets/pigeon.png";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, {
  wrapper: string;
  box: string;
  text: string;
  icon: string;
  pigeon: string;
}> = {
  sm: { wrapper: "pt-6", box: "w-8 h-8", text: "text-lg", icon: "w-5 h-5", pigeon: "w-7 h-7" },
  md: { wrapper: "pt-8", box: "w-10 h-10", text: "text-xl", icon: "w-6 h-6", pigeon: "w-9 h-9" },
  lg: { wrapper: "pt-12", box: "w-14 h-14", text: "text-3xl", icon: "w-9 h-9", pigeon: "w-14 h-14" },
};

interface PigeonlabLogoProps {
  size?: Size;
  iconOnly?: boolean;
  textClassName?: string;
}

/**
 * Pigeonlab logo: a pigeon standing on top of a science flask badge.
 */
export default function PigeonlabLogo({
  size = "sm",
  iconOnly = false,
  textClassName = "",
}: PigeonlabLogoProps) {
  const s = sizeMap[size];
  return (
    <span className="flex items-center gap-2">
      <span className={`relative inline-flex flex-col items-center ${s.wrapper}`}>
        {/* Pigeon standing on top of the flask */}
        <img
          src={pigeonImg}
          alt=""
          aria-hidden="true"
          className={`absolute left-1/2 -translate-x-1/2 bottom-full ${s.pigeon} object-contain drop-shadow-md pointer-events-none select-none`}
          draggable={false}
        />

        {/* Flask badge */}
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
            <path d="M12 7h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M13 7v4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M19 7v4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            <path
              d="M13 11L6.8 23.6A2 2 0 0 0 8.6 26.5h14.8a2 2 0 0 0 1.8-2.9L19 11"
              stroke="white"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M10 18.5h12l3 5.2A1.1 1.1 0 0 1 24 25.5H8a1.1 1.1 0 0 1-1-1.8L10 18.5Z"
              fill="white"
              fillOpacity="0.9"
            />
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
