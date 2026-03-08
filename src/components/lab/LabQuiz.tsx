import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSafeUser } from "@/lib/safeAuth";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface LabQuizProps {
  experimentId: string;
  quizType: "pre" | "post";
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}

export default function LabQuiz({ experimentId, quizType, questions, onComplete }: LabQuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ questionIndex: number; selectedIndex: number; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];
  const isCorrect = selected === q?.correctIndex;
  const score = answers.filter(a => a.correct).length;

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    setAnswers(prev => [...prev, { questionIndex: currentQ, selectedIndex: idx, correct: idx === q.correctIndex }]);
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
      const finalScore = answers.filter(a => a.correct).length;
      // Save to DB
      const user = await getSafeUser();
      if (user) {
        await supabase.from("quiz_results").insert({
          user_id: user.id,
          experiment_id: experimentId,
          quiz_type: quizType,
          score: finalScore,
          total_questions: questions.length,
          answers: JSON.stringify(answers),
        });
      }
      onComplete(finalScore, questions.length);
    }
  };

  if (!q) return null;

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${pct >= 70 ? "bg-primary/10" : "bg-destructive/10"}`}>
          {pct >= 70 ? <CheckCircle className="w-8 h-8 text-primary" /> : <XCircle className="w-8 h-8 text-destructive" />}
        </div>
        <h3 className="text-xl font-display font-bold mb-1">{pct >= 70 ? "Great job!" : "Keep practicing!"}</h3>
        <p className="text-muted-foreground text-sm">You scored {score}/{questions.length} ({pct}%)</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {quizType === "pre" ? "Pre-Lab" : "Post-Lab"} Quiz
        </span>
        <span className="text-xs text-muted-foreground">{currentQ + 1} / {questions.length}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 mb-6">
        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>
      <h3 className="font-display font-semibold mb-4">{q.question}</h3>
      <div className="space-y-2 mb-4">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={showResult}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
              showResult && idx === q.correctIndex
                ? "border-primary bg-primary/10 text-foreground"
                : showResult && idx === selected && !isCorrect
                ? "border-destructive bg-destructive/10 text-foreground"
                : selected === idx
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {showResult && q.explanation && (
        <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3 mb-4">{q.explanation}</p>
      )}
      {showResult && (
        <Button onClick={handleNext} size="sm" className="w-full">
          {currentQ < questions.length - 1 ? "Next Question" : "See Results"} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
