import { Card, CardContent, CardHeader, CardTitle } from '@/component-library/card';
import Link from 'next/link';

const AuthErrorPage = () => {
  return (
    <div className="fadein flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>An error occurred</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/auth/signin">Return to login page</Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthErrorPage;
