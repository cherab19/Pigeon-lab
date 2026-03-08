import type { QuizQuestion } from "@/components/lab/LabQuiz";

// Quiz questions keyed by experiment ID
export const quizBank: Record<string, { pre: QuizQuestion[]; post: QuizQuestion[] }> = {
  "p9-6": {
    pre: [
      { question: "What does Newton's Second Law state?", options: ["F = ma", "F = mv", "F = m/a", "F = a/m"], correctIndex: 0, explanation: "Newton's Second Law: Net force = mass × acceleration." },
      { question: "If mass doubles and force stays the same, acceleration:", options: ["Doubles", "Halves", "Stays same", "Triples"], correctIndex: 1, explanation: "a = F/m. If m doubles, a halves." },
      { question: "The SI unit of force is:", options: ["Joule", "Newton", "Watt", "Pascal"], correctIndex: 1, explanation: "Force is measured in Newtons (N)." },
    ],
    post: [
      { question: "In the simulation, increasing force while keeping mass constant caused:", options: ["Greater acceleration", "Less acceleration", "No change", "Object stopped"], correctIndex: 0, explanation: "More force → more acceleration (F=ma)." },
      { question: "What was the relationship between force and acceleration?", options: ["Inversely proportional", "Directly proportional", "Exponential", "No relationship"], correctIndex: 1, explanation: "F and a are directly proportional when m is constant." },
      { question: "A 2 kg object with 10 N force has acceleration of:", options: ["5 m/s²", "20 m/s²", "0.2 m/s²", "12 m/s²"], correctIndex: 0, explanation: "a = F/m = 10/2 = 5 m/s²." },
    ],
  },
  "p9-8": {
    pre: [
      { question: "Hooke's Law states:", options: ["F = kx", "F = ma", "E = mc²", "P = mv"], correctIndex: 0, explanation: "Hooke's Law: Force = spring constant × extension." },
      { question: "What does 'k' represent in Hooke's Law?", options: ["Mass", "Spring constant", "Acceleration", "Displacement"], correctIndex: 1, explanation: "k is the spring constant, measuring stiffness." },
      { question: "Beyond the elastic limit, a spring:", options: ["Returns to original", "Permanently deforms", "Gets stiffer", "Breaks instantly"], correctIndex: 1, explanation: "Beyond elastic limit, deformation is permanent." },
    ],
    post: [
      { question: "The F vs x graph was:", options: ["Curved", "Straight line", "Exponential", "Random"], correctIndex: 1, explanation: "In the elastic region, F vs x is linear." },
      { question: "A stiffer spring has:", options: ["Lower k", "Higher k", "Same k", "k = 0"], correctIndex: 1, explanation: "Higher k means more force needed per unit extension." },
      { question: "Doubling the hanging mass on a spring:", options: ["Halves extension", "Doubles extension", "No change", "Triples extension"], correctIndex: 1, explanation: "F = kx: double F → double x (in elastic region)." },
    ],
  },
  "p9-11": {
    pre: [
      { question: "What determines a pendulum's period?", options: ["Mass only", "Length and gravity", "Color", "Material"], correctIndex: 1, explanation: "T = 2π√(L/g). Period depends on length and gravity." },
      { question: "Increasing pendulum length will:", options: ["Decrease period", "Increase period", "No change", "Stop swinging"], correctIndex: 1, explanation: "Longer pendulum → longer period." },
      { question: "The formula for pendulum period is:", options: ["T = 2π√(L/g)", "T = 2πLg", "T = L/g", "T = √(g/L)"], correctIndex: 0, explanation: "T = 2π√(L/g) relates period to length and gravity." },
    ],
    post: [
      { question: "In the simulation, changing mass affected the period:", options: ["Yes, greatly", "No, not at all", "Only at high mass", "Only at low mass"], correctIndex: 1, explanation: "Period is independent of mass." },
      { question: "Quadrupling the length changes the period by a factor of:", options: ["4", "2", "1/2", "1/4"], correctIndex: 1, explanation: "T ∝ √L, so 4× length → 2× period." },
      { question: "What was the purpose of timing multiple swings?", options: ["More fun", "Reduce random error", "Increase speed", "Change gravity"], correctIndex: 1, explanation: "Multiple trials reduce random measurement error." },
    ],
  },
  // Generic quiz for experiments without specific questions
  default: {
    pre: [
      { question: "What is the purpose of a hypothesis in an experiment?", options: ["A testable prediction", "The final answer", "A random guess", "The equipment list"], correctIndex: 0, explanation: "A hypothesis is a testable prediction based on prior knowledge." },
      { question: "Why do we use controlled variables?", options: ["To make it harder", "To ensure fair testing", "No reason", "To save time"], correctIndex: 1, explanation: "Controlled variables ensure only the independent variable affects results." },
      { question: "What is a dependent variable?", options: ["What you change", "What you measure", "What stays same", "The equipment"], correctIndex: 1, explanation: "The dependent variable is what you measure/observe." },
    ],
    post: [
      { question: "Did your results support or refute the theory?", options: ["Results matched theory", "Results contradicted theory", "No conclusion possible", "Theory was wrong"], correctIndex: 0, explanation: "Good experiments aim to verify or refute theoretical predictions." },
      { question: "What would improve the accuracy of this experiment?", options: ["More trials", "Less equipment", "Shorter time", "Guessing"], correctIndex: 0, explanation: "More trials reduce random error and improve accuracy." },
      { question: "Why is it important to record observations?", options: ["For fun", "For analysis and conclusions", "Not important", "To fill time"], correctIndex: 1, explanation: "Recorded data enables analysis and drawing valid conclusions." },
    ],
  },
};

export function getQuiz(experimentId: string): { pre: QuizQuestion[]; post: QuizQuestion[] } {
  return quizBank[experimentId] || quizBank.default;
}
