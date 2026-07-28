import logoImg from "@/assets/pigeonlab-logo.png";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { img: string; text: string }> = {
  sm: { img: "w-9 h-9 sm:w-10 sm:h-10", text: "text-base sm:text-lg" },
  md: { img: "w-10 h-10 sm:w-12 sm:h-12", text: "text-lg sm:text-xl" },
  lg: { img: "w-16 h-16 sm:w-20 sm:h-20", text: "text-2xl sm:text-3xl" },
};

interface PigeonlabLogoProps {
  size?: Size;
  iconOnly?: boolean;
  textClassName?: string;
  /** Hide wordmark on small screens (<sm) automatically */
  responsiveText?: boolean;
}

/**
 * Pigeonlab logo: pigeon perched on a science flask emblem.
 */
export default function PigeonlabLogo({
  size = "sm",
  iconOnly = false,
  textClassName = "",
  responsiveText = false,
}: PigeonlabLogoProps) {
  const s = sizeMap[size];
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <img
        src={logoImg.src}
        alt="Pigeonlab logo"
        width={1024}
        height={1024}
        loading="lazy"
        draggable={false}
        className={`${s.img} object-contain select-none drop-shadow-sm shrink-0`}
      />
      {!iconOnly && (
        <span
          className={`font-display font-bold ${s.text} ${textClassName} truncate`}
        >
          Pigeonlab
        </span>
      )}
    </span>
  );
}
