-- Match the source classroom display name, which is maintained by Postgres.
ALTER TABLE "classrooms" ADD COLUMN "name" TEXT GENERATED ALWAYS AS (
  'Grade ' || "grade" || "section" || ' - ' || initcap("subject")
) STORED;

-- Persisted AI-generated textbook quizzes and student attempts.
CREATE TABLE "chapter_quizzes" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "generated_by_ai" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "chapter_quizzes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chapter_quiz_results" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '[]',
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chapter_quiz_results_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "chapter_quizzes_chapter_id_key" ON "chapter_quizzes"("chapter_id");
ALTER TABLE "chapter_quizzes" ADD CONSTRAINT "chapter_quizzes_chapter_id_fkey"
  FOREIGN KEY ("chapter_id") REFERENCES "textbook_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chapter_quiz_results" ADD CONSTRAINT "chapter_quiz_results_chapter_id_fkey"
  FOREIGN KEY ("chapter_id") REFERENCES "textbook_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
