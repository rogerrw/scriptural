import { auth } from '@/auth';
import StoreBrowserTimezone from '@/app/StoreBrowserTimezone';
import { ReviewYearHeatmap } from '@/component-library/review-year-grid';
import prisma from '@/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/component-library/card';

const HomePage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Home rendered without session.user.id');
  }

  const [account, practicedVerses, completedReviewSessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } }),
    prisma.userVerse.count({
      where: { userId, userVerseReviews: { some: { reviewedAt: { not: null } } } },
    }),
    prisma.reviewSession.count({ where: { userId, endedAt: { not: null } } }),
  ]);

  return (
    <div className="fadein mx-8">
      <StoreBrowserTimezone stored={account?.timezone ?? null} />
      <p>Practiced verses: {practicedVerses}</p>
      <p>Completed review sessions: {completedReviewSessions}</p>
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
