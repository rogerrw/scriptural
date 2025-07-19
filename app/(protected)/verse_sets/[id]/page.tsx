import { fetchVerseSet } from '@/actions/fetchVerseSet';
import VerseSetContent from './VerseSetContent';

const VerseSetPage = async ({ params }: { params: { id: string } }) => {
  const verseSet = await fetchVerseSet(params.id);

  if (verseSet.error) {
    return <div>{verseSet.error}</div>;
  }

  const verses = verseSet?.verses;
  return <VerseSetContent params={params} verses={verses} verseSet={verseSet} />;
};

export default VerseSetPage;
console.log();
