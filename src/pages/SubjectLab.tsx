import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { labData, subjectMeta, getUnits } from "@/data/labActivities";
import { simulationRegistry } from "@/components/lab/simulations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Beaker, Atom, Microscope, FlaskConical } from "lucide-react";
import LabAssistant from "@/components/lab/LabAssistant";

const subjectIcons: Record<string, typeof Beaker> = { physics: Atom, chemistry: FlaskConical, biology: Microscope };

export default function SubjectLab() {
  const { subject } = useParams<{ subject: string }>();
  const [grade, setGrade] = useState<string>("");
  const [unitNum, setUnitNum] = useState<string>("");
  const [labId, setLabId] = useState<string>("");

  if (!subject || !labData[subject]) {
    return <div className="min-h-screen flex items-center justify-center"><p>Subject not found. <Link to="/" className="text-primary underline">Go back</Link></p></div>;
  }

  const meta = subjectMeta[subject];
  const Icon = subjectIcons[subject] || Beaker;
  const grades = Object.keys(labData[subject]).map(Number);
  const allLabs = grade ? labData[subject][Number(grade)] || [] : [];
  const units = grade ? getUnits(allLabs) : [];
  const unitLabs = unitNum ? allLabs.filter(l => l.unit === Number(unitNum)) : [];
  const selectedLab = unitLabs.find(l => l.id === labId);
  const SimComponent = selectedLab ? simulationRegistry[selectedLab.id] : null;

  const handleGradeChange = (g: string) => { setGrade(g); setUnitNum(""); setLabId(""); };
  const handleUnitChange = (u: string) => { setUnitNum(u); setLabId(""); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container mx-auto flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Home</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-lg">{meta.name} Laboratory</h1>
          </div>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <Select value={grade} onValueChange={handleGradeChange}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map(g => (
                  <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {grade && (
              <Select value={unitNum} onValueChange={handleUnitChange}>
                <SelectTrigger className="w-[220px] h-9">
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u.unit} value={String(u.unit)}>Unit {u.unit}: {u.unitName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {unitNum && (
              <Select value={labId} onValueChange={setLabId}>
                <SelectTrigger className="w-[260px] h-9">
                  <SelectValue placeholder="Select Lab Activity" />
                </SelectTrigger>
                <SelectContent>
                  {unitLabs.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {!grade && (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center space-y-4">
              <Icon className="w-16 h-16 text-primary/30 mx-auto" />
              <h2 className="text-xl font-display font-bold text-muted-foreground">Select a Grade to Begin</h2>
              <p className="text-sm text-muted-foreground">Choose a grade level (9–12) from the dropdown above</p>
            </div>
          </div>
        )}
        {grade && !unitNum && (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-lg font-display font-bold mb-4">Grade {grade} — {meta.name} Units</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map(u => (
                <button key={u.unit} onClick={() => handleUnitChange(String(u.unit))} className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all">
                  <h3 className="font-display font-semibold text-sm mb-1">Unit {u.unit}: {u.unitName}</h3>
                  <p className="text-xs text-muted-foreground">{allLabs.filter(l => l.unit === u.unit).length} lab activities</p>
                </button>
              ))}
            </div>
          </div>
        )}
        {unitNum && !labId && (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-lg font-display font-bold mb-4">Unit {unitNum}: {units.find(u => u.unit === Number(unitNum))?.unitName} — Labs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unitLabs.map(l => (
                <button key={l.id} onClick={() => setLabId(l.id)} className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all">
                  <h3 className="font-display font-semibold text-sm mb-1">{l.title}</h3>
                  <p className="text-xs text-muted-foreground">{l.objective}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        {SimComponent && <SimComponent />}
      </div>
    </div>
  );
}
