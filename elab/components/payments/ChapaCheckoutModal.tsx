import { useEffect, useMemo, useState } from "react";
import { Loader2, CreditCard, ExternalLink, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const PRICE_PER_SEAT = 30;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTeacherSeats?: number;
  defaultStudentSeats?: number;
  reason?: string;
  onPaymentSuccess?: () => void;
}

export default function ChapaCheckoutModal({
  open, onOpenChange,
  defaultTeacherSeats = 0,
  defaultStudentSeats = 0,
  reason,
  onPaymentSuccess,
}: Props) {
  const { t } = useLanguage();
  const [teacherSeats, setTeacherSeats] = useState(defaultTeacherSeats);
  const [studentSeats, setStudentSeats] = useState(defaultStudentSeats);
  const [loading, setLoading] = useState(false);
  const [pendingTxRef, setPendingTxRef] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (open) {
      setTeacherSeats(defaultTeacherSeats);
      setStudentSeats(defaultStudentSeats);
      setPendingTxRef(null);
    }
  }, [open, defaultTeacherSeats, defaultStudentSeats]);

  const total = teacherSeats + studentSeats;
  const amount = useMemo(() => total * PRICE_PER_SEAT, [total]);

  const handlePay = async () => {
    if (total <= 0) {
      toast.error(t("pay.atLeastOne") || "Select at least 1 seat");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/chapa/initiate-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          teacher_seats: teacherSeats,
          student_seats: studentSeats,
          return_url: `${window.location.origin}/subscribe`,
        }) });
      const data = await response.json();
      if (!response.ok || !data?.checkout_url) {
        toast.error(data?.error || "Failed to start payment");
        return;
      }
      setPendingTxRef(data.tx_ref);
      window.open(data.checkout_url, "_blank", "noopener,noreferrer");
      // Begin polling
      pollStatus(data.tx_ref);
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async (tx_ref: string) => {
    setPolling(true);
    const start = Date.now();
    const TIMEOUT = 5 * 60 * 1000; // 5 minutes
    while (Date.now() - start < TIMEOUT) {
      await new Promise(r => setTimeout(r, 4000));
      const response = await fetch("/api/chapa/verify-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tx_ref }) });
      const data = await response.json();
      if (data?.status === "success") {
        toast.success(t("pay.success") || "Payment confirmed — seats added!");
        setPolling(false);
        onPaymentSuccess?.();
        onOpenChange(false);
        return;
      }
    }
    setPolling(false);
    toast.message(t("pay.timeout") || "Still waiting for confirmation. Refresh later.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {t("pay.title") || "Buy seats"}
          </DialogTitle>
          <DialogDescription>
            {reason || t("pay.desc") || "Standard plan — 30 ETB per seat / month."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("common.teachers")}</Label>
              <Input type="number" min={0} value={teacherSeats}
                onChange={e => setTeacherSeats(Math.max(0, parseInt(e.target.value || "0", 10)))} />
            </div>
            <div>
              <Label className="text-xs">{t("common.students")}</Label>
              <Input type="number" min={0} value={studentSeats}
                onChange={e => setStudentSeats(Math.max(0, parseInt(e.target.value || "0", 10)))} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>{t("pay.totalSeats") || "Total seats"}</span><span className="font-medium">{total}</span></div>
            <div className="flex justify-between"><span>{t("pay.unitPrice") || "Price / seat"}</span><span>30 ETB</span></div>
            <div className="flex justify-between text-base pt-1 border-t border-border"><span className="font-medium">{t("pay.totalAmount") || "Total"}</span><span className="font-display font-bold text-primary">{amount} ETB</span></div>
          </div>

          {pendingTxRef && (
            <div className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
              {polling ? <Loader2 className="w-4 h-4 animate-spin shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>
                {t("pay.waiting") || "Complete the payment in the new tab. We'll confirm automatically."}
                <span className="block opacity-70 mt-1">Ref: {pendingTxRef}</span>
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={polling}>{t("common.cancel")}</Button>
          <Button onClick={handlePay} disabled={loading || polling || total <= 0} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            {loading ? (t("pay.starting") || "Starting…") : `${t("pay.payCta") || "Pay with Chapa"} — ${amount} ETB`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
