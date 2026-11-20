import { fetchUserVerses } from '@/actions/fetchUserVerses';
import AllVersesContent from './AllVersesContent';

const VerseSetsPage = async () => {
  const verses = await fetchUserVerses();
  return <AllVersesContent verses={verses} />;
};

export default VerseSetsPage;
