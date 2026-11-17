'use server';
import { auth } from '@/auth';
import { fetchUserVerses } from '@/actions/fetchUserVerses';
import AllVersesContent from './AllVersesContent';

const VerseSetsPage = async () => {
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) {
    return <div>Loading...</div>;
  }

  const verses = await fetchUserVerses(userId);

  return <AllVersesContent verses={verses} />;
};

export default VerseSetsPage;
