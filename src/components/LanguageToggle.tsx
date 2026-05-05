import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const isEn = language === "en";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(isEn ? "am" : "en")}
      aria-label={isEn ? "Switch to Amharic" : "Switch to English"}
      title={isEn ? "Switch to Amharic" : "Switch to English"}
      className="gap-1.5 px-2 sm:px-3 h-9 text-muted-foreground hover:text-foreground shrink-0"
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-medium">{isEn ? "አማ" : "EN"}</span>
    </Button>
  );
}
