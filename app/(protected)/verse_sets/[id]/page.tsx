// import { useRouter } from 'next/router';
import { fetchVerseSet } from '@/actions/fetchVerseSet';

const VerseSetPage = async ({ params }: { params: { id: string } }) => {
  const verseSet = await fetchVerseSet(params.id);
  return <h1>{JSON.stringify(verseSet)}</h1>;
};

export default VerseSetPage;
