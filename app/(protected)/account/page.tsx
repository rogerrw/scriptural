import { auth } from '@/auth';
import prisma from '@/prisma';
import AccountSections from './AccountSections';

const AccountPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Account settings rendered without session.user.id');
  }

  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { reviewLimit: true, timezone: true },
  });
  if (!account) {
    throw new Error('Account settings rendered without an account');
  }

  return <AccountSections reviewLimit={account.reviewLimit} timezone={account.timezone} />;
};

export default AccountPage;
