import Link from 'next/link';

import { auth } from '@/auth';
import { logout } from '@/actions/auth';
import { Button } from '@/component-library/button';

const DashboardPage = async () => {
  const session = await auth();
  console.log('session', session);
  return (
    <div className="fadein">
      {`session ${JSON.stringify(session)}`}

      <form action={logout}>
        <Button className="gap-2">
          <Link href="/user">User</Link>
        </Button>
        <Button type="submit">Log out</Button>
      </form>
    </div>
  );
};

export default DashboardPage;
