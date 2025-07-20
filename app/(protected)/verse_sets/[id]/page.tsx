import { fetchVerseSet } from '@/actions/fetchVerseSet';
import VerseSetContent from './VerseSetContent';

const VerseSetPage = async ({ params }: { params: { id: string } }) => {
  const verseSet = await fetchVerseSet(params.id);

  if (verseSet.error) {
    return <div>{verseSet.error}</div>;
  }

  return <VerseSetContent params={params} verseSet={verseSet} />;
};

export default VerseSetPage;
console.log();
