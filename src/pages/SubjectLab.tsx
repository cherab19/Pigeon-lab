import { useState, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { labData, subjectMeta, getUnits } from "@/data/labActivities";
import { simulationRegistry } from "@/components/lab/simulations";
import { fallback2DRegistry } from "@/components/lab/simulations/fallback2DRegistry";
import SimulationErrorBoundary from "@/components/lab/SimulationErrorBoundary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Beaker, Atom, Microscope, FlaskConical, CheckCircle, Lock } from "lucide-react";
import LabAssistant from "@/components/lab/LabAssistant";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import { toast } from "@/hooks/use-toast";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const subjectIcons: Record<string, typeof Beaker> = { physics: Atom, chemistry: FlaskConical, biology: Microscope };

export default function SubjectLab() {
  const { t } = useLanguage();
  const { hasAccess, loading: accessLoading } = useSubscriptionAccess();
  const { subject } = useParams<{ subject: string }>();
  const [grade, setGrade] = useState<string>("");
  const [unitNum, setUnitNum] = useState<string>("");
  const [labId, setLabId] = useState<string>("");
  const [use2D, setUse2D] = useState(false);

  const trackerSubject = subject && labData[subject] ? subject : undefined;
  const { markComplete } = useProgressTracker(labId || undefined, trackerSubject, grade || undefined);

  if (accessLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">{t("lab.checkingAccess")}</p></div>;
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-display font-bold">{t("lab.subscriptionRequired")}</h2>
        <p className="text-muted-foreground max-w-md">{t("lab.subscriptionDesc")}</p>
        <Button asChild variant="outline">
          <Link to="/dashboard">{t("lab.backToDashboard")}</Link>
        </Button>
      </div>
    );
  }

  if (!subject || !labData[subject]) {
    return <div className="min-h-screen flex items-center justify-center"><p>Subject not found. <Link to="/" className="text-primary underline">{t("nav.home")}</Link></p></div>;
  }

  const meta = subjectMeta[subject];
  const Icon = subjectIcons[subject] || Beaker;
  const grades = Object.keys(labData[subject]).map(Number);
  const allLabs = grade ? labData[subject][Number(grade)] || [] : [];
  const units = grade ? getUnits(allLabs) : [];
  const unitLabs = unitNum ? allLabs.filter(l => l.unit === Number(unitNum)) : [];
  const selectedLab = unitLabs.find(l => l.id === labId);
  const SimComponent3D = selectedLab ? simulationRegistry[selectedLab.id] : null;
  const SimComponent2D = selectedLab ? fallback2DRegistry[selectedLab.id] : null;
  const SimComponent = use2D ? SimComponent2D : SimComponent3D;

  const handleGradeChange = (g: string) => { setGrade(g); setUnitNum(""); setLabId(""); };
  const handleUnitChange = (u: string) => { setUnitNum(u); setLabId(""); };
  const handleLabSelect = (id: string) => { setLabId(id); setUse2D(false); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container mx-auto flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> {t("nav.home")}</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-lg">{t(`subject.${subject}`)} {t("lab.laboratory")}</h1>
          </div>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <LanguageToggle />
            <Select value={grade} onValueChange={handleGradeChange}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder={t("lab.selectGrade")} /></SelectTrigger>
              <SelectContent>
                {grades.map(g => (<SelectItem key={g} value={String(g)}>{t("common.grade")} {g}</SelectItem>))}
              </SelectContent>
            </Select>
            {grade && (
              <Select value={unitNum} onValueChange={handleUnitChange}>
                <SelectTrigger className="w-[220px] h-9"><SelectValue placeholder={t("lab.selectUnit")} /></SelectTrigger>
                <SelectContent>
                  {units.map(u => (<SelectItem key={u.unit} value={String(u.unit)}>Unit {u.unit}: {u.unitName}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
            {unitNum && (
              <Select value={labId} onValueChange={handleLabSelect}>
                <SelectTrigger className="w-[260px] h-9"><SelectValue placeholder={t("lab.selectLab")} /></SelectTrigger>
                <SelectContent>
                  {unitLabs.map(l => (<SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {!grade && (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center space-y-4">
              <Icon className="w-16 h-16 text-primary/30 mx-auto" />
              <h2 className="text-xl font-display font-bold text-muted-foreground">{t("lab.selectGradeToBegin")}</h2>
              <p className="text-sm text-muted-foreground">{t("lab.selectGradeDesc")}</p>
            </div>
          </div>
        )}
        {grade && !unitNum && (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-lg font-display font-bold mb-4">{t("common.grade")} {grade} — {meta.name} {t("lab.units")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map(u => (
                <button key={u.unit} onClick={() => handleUnitChange(String(u.unit))} className="text-left p-4 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-elevated transition-all">
                  <h3 className="font-display font-semibold text-sm mb-1">Unit {u.unit}: {u.unitName}</h3>
                  <p className="text-xs text-muted-foreground">{allLabs.filter(l => l.unit === u.unit).length} {t("lab.labActivities")}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        {unitNum && !labId && (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-lg font-display font-bold mb-4">Unit {unitNum}: {units.find(u => u.unit === Number(unitNum))?.unitName} — {t("lab.labs")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unitLabs.map(l => (
                <button key={l.id} onClick={() => handleLabSelect(l.id)} className="text-left p-4 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-elevated transition-all">
                  <h3 className="font-display font-semibold text-sm mb-1">{l.title}</h3>
                  <p className="text-xs text-muted-foreground">{l.objective}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {labId && SimComponent && (
          <SimulationErrorBoundary onFallback={() => setUse2D(true)} fallback={
            use2D && SimComponent2D ? (
              <Suspense fallback={<div className="flex items-center justify-center min-h-[300px]"><p className="text-muted-foreground">{t("common.loading")}</p></div>}>
                <SimComponent2D />
              </Suspense>
            ) : undefined
          }>
            <SimComponent />
          </SimulationErrorBoundary>
        )}

        {labId && SimComponent && (
          <div className="container mx-auto px-4 py-4 flex justify-center">
            <Button size="sm" onClick={async () => { await markComplete(); toast({ title: t("lab.experimentCompleted") }); }}>
              <CheckCircle className="w-4 h-4 mr-1" /> {t("lab.markComplete")}
            </Button>
          </div>
        )}
      </div>

      <LabAssistant context={{ subject, grade: grade ? `Grade ${grade}` : undefined, experiment: selectedLab?.title, step: selectedLab ? `Step in progress` : undefined }} />
    </div>
  );
}
