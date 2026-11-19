import { auth } from '@/auth';
import StoreBrowserTimezone from '@/app/StoreBrowserTimezone';
import { ReviewStreak } from '@/component-library/review-streak';
import { ReviewYearHeatmap } from '@/component-library/review-year-grid';
import { reviewStreakQuery } from '@/lib/review-streak';
import { accountTimeZone } from '@/lib/reviewSettings';
import prisma from '@/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/component-library/card';

const HomePage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Home rendered without session.user.id');
  }

  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const streakQuery = reviewStreakQuery(accountTimeZone(account?.timezone ?? null), new Date());

  const [practicedVerses, completedReviewSessions, completedSessions] = await Promise.all([
    prisma.userVerse.count({
      where: { userId, userVerseReviews: { some: { reviewedAt: { not: null } } } },
    }),
    prisma.reviewSession.count({ where: { userId, endedAt: { not: null } } }),
    prisma.reviewSession.findMany({
      where: {
        userId,
        endedAt: { gte: streakQuery.start, lt: streakQuery.end },
      },
      select: { planned: true, endedAt: true },
    }),
  ]);

  const streak = streakQuery.build(
    completedSessions.flatMap((reviewSession) =>
      reviewSession.endedAt === null
        ? []
        : [{ daily: reviewSession.planned, endedAt: reviewSession.endedAt }],
    ),
  );

  return (
    <div className="fadein mx-8">
      <StoreBrowserTimezone stored={account?.timezone ?? null} />
      <p>Practiced verses: {practicedVerses}</p>
      <p>Completed review sessions: {completedReviewSessions}</p>
      <Card className="mt-8 border-none bg-transparent text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        <CardHeader>
          <CardTitle>Daily Review</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewStreak days={streak.days} />
        </CardContent>
      </Card>
      <Card className="mt-8 border-none bg-transparent text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        <CardHeader>
          <CardTitle>Verses Reviewed</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewYearHeatmap />
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
