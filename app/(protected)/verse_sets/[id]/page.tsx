import { fetchVerseSet } from '@/actions/fetchVerseSet';
import VerseSetContent from './VerseSetContent';

const VerseSetPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const verseSet = await fetchVerseSet(id);

  if ('error' in verseSet) {
    return <div>{verseSet.error}</div>;
  }

  return <VerseSetContent verseSetId={id} verseSet={verseSet} />;
};

export default VerseSetPage;
