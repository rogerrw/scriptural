import { Card, CardContent, CardHeader, CardTitle } from '@/component-library/card';
import LoginForm from './loginForm';
import Link from 'next/link';
import GoogleLogin from '../googleLogin';

const SignInPage = () => {
  return (
    <div className="fadein flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardContent>
          <Link href="/auth/register">Don't have an account yet?</Link>
        </CardContent>
        <CardContent>
          <GoogleLogin />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
