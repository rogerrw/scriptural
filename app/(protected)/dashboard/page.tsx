import { auth, signOut } from '@/auth';
import { Button } from '@/component-library/button';

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
        <Button type="submit">Log out</Button>
      </form>
    </div>
  );
};

export default DashboardPage;
