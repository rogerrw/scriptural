ALTER TABLE "user_verses" ADD COLUMN "lastReviewedAt" TIMESTAMP(3);
ALTER TABLE "user_verses" ADD COLUMN "mostRecentScore" DOUBLE PRECISION;
ALTER TABLE "user_verses" ADD COLUMN "highestScore" DOUBLE PRECISION;

ALTER TABLE "review_sessions" ADD COLUMN "planned" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "user_verse_reviews" ALTER COLUMN "attemptId" DROP NOT NULL;
ALTER TABLE "user_verse_reviews" ALTER COLUMN "reviewedAt" DROP NOT NULL;
ALTER TABLE "user_verse_reviews" ALTER COLUMN "grade" DROP NOT NULL;
ALTER TABLE "user_verse_reviews" ALTER COLUMN "errorCount" DROP NOT NULL;
ALTER TABLE "user_verse_reviews" ALTER COLUMN "elapsedMs" DROP NOT NULL;
ALTER TABLE "user_verse_reviews" ALTER COLUMN "cpm" DROP NOT NULL;
ALTER TABLE "user_verse_reviews" ALTER COLUMN "keystrokes" DROP NOT NULL;

UPDATE "user_verses" AS verse
SET
  "highestScore" = scored.max_grade,
  "mostRecentScore" = scored.latest_grade,
  "lastReviewedAt" = scored.latest_at
FROM (
  SELECT
    "userVerseId",
    MAX("grade") AS max_grade,
    (ARRAY_AGG("grade" ORDER BY "reviewedAt" DESC, "id" DESC))[1] AS latest_grade,
    MAX("reviewedAt") AS latest_at
  FROM "user_verse_reviews"
  WHERE "reviewedAt" IS NOT NULL AND "grade" IS NOT NULL
  GROUP BY "userVerseId"
) AS scored
WHERE verse."id" = scored."userVerseId";
