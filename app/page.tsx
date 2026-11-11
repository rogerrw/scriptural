import { auth } from '@/auth';
import prisma from '@/prisma';

const HomePage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Home rendered without session.user.id');
  }

  const [practicedVerses, completedReviewSessions] = await Promise.all([
    prisma.userVerse.count({ where: { userId, userVerseReviews: { some: {} } } }),
    prisma.reviewSession.count({ where: { userId } }),
  ]);

  return (
    <div className="fadein mx-8">
      <p>Practiced verses: {practicedVerses}</p>
      <p>Completed review sessions: {completedReviewSessions}</p>
    </div>
  );
};

export default HomePage;
