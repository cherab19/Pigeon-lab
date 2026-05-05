import logoImg from "@/assets/pigeonlab-logo.png";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { img: string; text: string }> = {
  sm: { img: "w-10 h-10", text: "text-lg" },
  md: { img: "w-12 h-12", text: "text-xl" },
  lg: { img: "w-20 h-20", text: "text-3xl" },
};

interface PigeonlabLogoProps {
  size?: Size;
  iconOnly?: boolean;
  textClassName?: string;
}

/**
 * Pigeonlab logo: pigeon perched on a science flask emblem.
 */
export default function PigeonlabLogo({
  size = "sm",
  iconOnly = false,
  textClassName = "",
}: PigeonlabLogoProps) {
  const s = sizeMap[size];
  return (
    <span className="inline-flex items-center gap-2">
      <img
        src={logoImg}
        alt="Pigeonlab logo"
        width={1024}
        height={1024}
        loading="lazy"
        draggable={false}
        className={`${s.img} object-contain select-none drop-shadow-sm`}
      />
      {!iconOnly && (
        <span className={`font-display font-bold ${s.text} ${textClassName}`}>
          Pigeonlab
        </span>
      )}
    </span>
  );
}
