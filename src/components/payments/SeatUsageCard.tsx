import { Users, GraduationCap, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { SeatQuota } from "@/hooks/useSeatQuota";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  quota: SeatQuota | null;
  loading?: boolean;
  onBuyMore?: () => void;
}

export default function SeatUsageCard({ quota, loading, onBuyMore }: Props) {
  const { t } = useLanguage();
  if (loading || !quota) {
    return (
      <Card><CardContent className="p-5 text-sm text-muted-foreground">{t("common.loading")}</CardContent></Card>
    );
  }

  const teacherPct = quota.teacher_seats > 0 ? Math.round((quota.used_teachers / quota.teacher_seats) * 100) : 0;
  const studentPct = quota.student_seats > 0 ? Math.round((quota.used_students / quota.student_seats) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-base">{t("pay.seatUsage") || "Seat usage"}</CardTitle>
        {onBuyMore && (
          <Button size="sm" variant="outline" onClick={onBuyMore} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> {t("pay.buyMore") || "Buy more"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-secondary" /> {t("common.teachers")}</span>
            <span className="font-medium">{quota.used_teachers} / {quota.teacher_seats}</span>
          </div>
          <Progress value={teacherPct} />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> {t("common.students")}</span>
            <span className="font-medium">{quota.used_students} / {quota.student_seats}</span>
          </div>
          <Progress value={studentPct} />
        </div>
      </CardContent>
    </Card>
  );
}
