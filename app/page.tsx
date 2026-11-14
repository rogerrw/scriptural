import { auth } from '@/auth';
import StoreBrowserTimezone from '@/app/StoreBrowserTimezone';
import { ReviewYearHeatmap } from '@/component-library/review-year-grid';
import prisma from '@/prisma';

const HomePage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Home rendered without session.user.id');
  }

  const [account, practicedVerses, completedReviewSessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } }),
    prisma.userVerse.count({ where: { userId, userVerseReviews: { some: {} } } }),
    prisma.reviewSession.count({ where: { userId, endedAt: { not: null } } }),
  ]);

  return (
    <div className="fadein mx-8">
      <StoreBrowserTimezone stored={account?.timezone ?? null} />
      <p>Practiced verses: {practicedVerses}</p>
      <p>Completed review sessions: {completedReviewSessions}</p>
      <ReviewYearHeatmap />
    </div>
  );
};

export default HomePage;
