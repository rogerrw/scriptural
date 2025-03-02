import { auth, signOut } from '@/auth';
import { Button } from '@/component-library/button';
import Link from 'next/link';

const DashboardPage = async () => {
  const session = await auth();
  return (
    <div className="fadein">
      {`session ${JSON.stringify(session)}`}

      <form
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <Button className="gap-2">
          <Link href="/user">User</Link>
        </Button>
        <Button type="submit">Log out</Button>
      </form>
    </div>
  );
};

export default DashboardPage;
