import logoUrl from "@/assets/dovelab-logo.png";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { box: string; text: string }> = {
  sm: { box: "w-8 h-8", text: "text-lg" },
  md: { box: "w-9 h-9", text: "text-xl" },
  lg: { box: "w-12 h-12", text: "text-3xl" },
};

interface DovelabLogoProps {
  size?: Size;
  /** When true, render only the logo image (no wordmark) */
  iconOnly?: boolean;
  /** Override text color class for the wordmark */
  textClassName?: string;
}

export default function DovelabLogo({
  size = "sm",
  iconOnly = false,
  textClassName = "",
}: DovelabLogoProps) {
  const s = sizeMap[size];
  return (
    <span className="flex items-center gap-2">
      <span
        className={`${s.box} rounded-lg bg-gradient-hero flex items-center justify-center overflow-hidden shadow-sm`}
        aria-hidden="true"
      >
        <img
          src={logoUrl}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          className="w-full h-full object-contain p-0.5"
        />
      </span>
      {!iconOnly && (
        <span className={`font-display font-bold ${s.text} ${textClassName}`}>
          Dovelab
        </span>
      )}
    </span>
  );
}
