type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { box: string; text: string; letter: string }> = {
  sm: { box: "w-8 h-8", text: "text-lg", letter: "text-base" },
  md: { box: "w-9 h-9", text: "text-xl", letter: "text-lg" },
  lg: { box: "w-12 h-12", text: "text-3xl", letter: "text-2xl" },
};

interface AxislabLogoProps {
  size?: Size;
  /** When true, render only the logo mark (no wordmark) */
  iconOnly?: boolean;
  /** Override text color class for the wordmark */
  textClassName?: string;
}

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
        <span className={`font-display font-bold text-white ${s.letter}`}>A</span>
      </span>
      {!iconOnly && (
        <span className={`font-display font-bold ${s.text} ${textClassName}`}>
          Axislab
        </span>
      )}
    </span>
  );
}
