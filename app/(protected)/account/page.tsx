import { loadAccountSettings } from '@/actions/loadAccount';
import AccountSections from './AccountSections';

const AccountPage = async () => {
  const account = await loadAccountSettings();
  return <AccountSections reviewLimit={account.reviewLimit} timezone={account.timezone} />;
};

export default AccountPage;
