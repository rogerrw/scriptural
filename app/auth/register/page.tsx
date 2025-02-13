import { FaApple, FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/component-library/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/component-library/card';
import LoginForm from './registerForm';
import Link from 'next/link';

const RegisterPage = () => {
  return (
    <div className="fadein flex justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create a new account</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardContent>
          <div>
            <Link href="/auth/signin">Already have an account?</Link>
          </div>
          <br />
          <Button className="w-full">
            <FcGoogle />
            Register with Google
          </Button>
        </CardContent>
        <CardContent>
          <Button className="w-full">
            <FaFacebook />
            Register with Facebook
          </Button>
        </CardContent>
        <CardContent>
          <Button className="w-full">
            <FaApple />
            Register with Apple
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
