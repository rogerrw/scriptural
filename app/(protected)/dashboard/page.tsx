import { auth } from '@/auth';
import prisma from '@/prisma';

const DashboardPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Dashboard rendered without session.user.id');
  }

  const [practicedVerses, completedReviewSessions] = await Promise.all([
    prisma.userVerse.count({ where: { userId, userVerseReviews: { some: {} } } }),
    prisma.reviewSession.count({ where: { userId } }),
  ]);

  return (
    <div className="fadein">
      <p>Practiced verses: {practicedVerses}</p>
      <p>Completed review sessions: {completedReviewSessions}</p>
    </div>
  );
};

export default DashboardPage;
