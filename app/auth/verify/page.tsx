import { Card, CardContent, CardHeader, CardTitle } from '@/component-library/card';
import { auth } from '@/auth';
import { applyVerification, verificationView, worldForToken } from '@/lib/applyVerification';
import VerifyForm from './verifyForm';

const VerifyPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) => {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : null;
  const session = await auth();
  const before = await worldForToken(token);
  const decision = await applyVerification(
    before,
    { kind: 'open-verify', token, alreadySignedIn: !!session?.user },
    Date.now(),
  );

  return (
    <div className="fadein flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Confirm your email</CardTitle>
        </CardHeader>
        <CardContent>
          <VerifyForm token={token} initial={verificationView(decision)} />
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPage;
