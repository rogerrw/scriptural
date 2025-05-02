'use server';
import { auth } from '@/auth';

const VerseSetsPage = async () => {
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) {
    return <div>Loading...</div>;
  }

  return <div></div>;
};

export default VerseSetsPage;
