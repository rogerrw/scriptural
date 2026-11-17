ALTER TABLE "users" ADD COLUMN "reviewLimit" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "users" ADD COLUMN "timezone" TEXT;

ALTER TABLE "user_verses" ADD COLUMN "nextReviewAt" TIMESTAMPTZ(3);

ALTER TABLE "review_sessions" ADD COLUMN "endedAt" TIMESTAMP(3);
UPDATE "review_sessions" SET "endedAt" = "updatedAt";

CREATE INDEX "review_sessions_userId_createdAt_idx" ON "review_sessions"("userId", "createdAt");
