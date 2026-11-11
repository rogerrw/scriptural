-- The review table has no writers yet. Replace the unused accuracy blob
-- with the attempt that VerseTyper records.
ALTER TABLE "user_verse_reviews" DROP COLUMN "accuracy";
ALTER TABLE "user_verse_reviews" DROP COLUMN "detailedResults";

ALTER TABLE "user_verse_reviews" ADD COLUMN "attemptId" TEXT NOT NULL;
ALTER TABLE "user_verse_reviews" ADD COLUMN "grade" DOUBLE PRECISION NOT NULL;
ALTER TABLE "user_verse_reviews" ADD COLUMN "errorCount" INTEGER NOT NULL;
ALTER TABLE "user_verse_reviews" ADD COLUMN "elapsedMs" INTEGER NOT NULL;
ALTER TABLE "user_verse_reviews" ADD COLUMN "cpm" DOUBLE PRECISION NOT NULL;
ALTER TABLE "user_verse_reviews" ADD COLUMN "keystrokes" JSONB NOT NULL;

CREATE UNIQUE INDEX "user_verse_reviews_attemptId_key" ON "user_verse_reviews"("attemptId");
CREATE INDEX "user_verse_reviews_userVerseId_idx" ON "user_verse_reviews"("userVerseId");
