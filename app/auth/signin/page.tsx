import { FaApple, FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/component-library/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/component-library/card';
import LoginForm from './loginForm';
import Link from 'next/link';

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
          <div>
            <Link href="/auth/register">Don't have an account yet?</Link>
          </div>
          <br />
          <Button className="w-full">
            <FcGoogle />
            Login with Google
          </Button>
        </CardContent>
        <CardContent>
          <Button className="w-full">
            <FaFacebook />
            Login with Facebook
          </Button>
        </CardContent>
        <CardContent>
          <Button className="w-full">
            <FaApple />
            Login with Apple
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
